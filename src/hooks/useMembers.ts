"use client";

import { useMemoFirebase, useCollection, useFirestore, useDoc, useUser } from '@/firebase';
import { collection, doc, writeBatch, increment, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Member, MemberCategory } from '@/types/member';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { INITIAL_MEMBERS } from '@/lib/initial-data';
import { useEffect, useCallback } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function useMembers() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const membersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'members');
  }, [firestore, user]);

  const statsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'app_statistics', 'globalStats');
  }, [firestore, user]);

  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'selection_history'), orderBy('timestamp', 'desc'), limit(50));
  }, [firestore, user]);

  const { data: members, isLoading: loading } = useCollection<Omit<Member, 'id'>>(membersQuery);
  const { data: globalStats, isLoading: statsLoading } = useDoc(statsRef);
  const { data: selectionHistory, isLoading: historyLoading } = useCollection<{ memberNames: string[], timestamp: any }>(historyQuery);

  // Hardened initialization logic: Only seeds if collection is empty AND stats document doesn't confirm initialization.
  useEffect(() => {
    const isActuallyInitialized = globalStats && (globalStats as any).isInitialized;
    
    if (!loading && !statsLoading && members !== null && members.length === 0 && !isActuallyInitialized && firestore && user) {
      const batch = writeBatch(firestore);
      
      INITIAL_MEMBERS.forEach((m) => {
        const docRef = doc(collection(firestore, 'members'), m.id);
        batch.set(docRef, {
          name: m.name,
          type: m.type,
          selectionFrequency: 0,
          updatedAt: serverTimestamp()
        });
      });

      const sRef = doc(firestore, 'app_statistics', 'globalStats');
      batch.set(sRef, {
        totalSelectionsMade: 0,
        membersSelectedAtLeastOnceCount: 0,
        isInitialized: true
      }, { merge: true });
      
      batch.commit().catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'members',
          operation: 'write',
        }));
      });
    }
  }, [loading, statsLoading, members, globalStats, firestore, user]);

  const addSelectionLog = async (memberNames: string[]) => {
    if (!firestore) return "";
    const logRef = doc(collection(firestore, 'selection_history'));
    const id = logRef.id;
    setDocumentNonBlocking(logRef, {
      memberNames,
      timestamp: serverTimestamp()
    }, { merge: true });
    return id;
  };

  const deleteSelectionLog = async (logId: string) => {
    if (!firestore) return;
    const logRef = doc(firestore, 'selection_history', logId);
    deleteDocumentNonBlocking(logRef);
  };

  const selectMember = async (id: string, skipLog: boolean = false) => {
    if (!firestore) return;
    const memberRef = doc(firestore, 'members', id);
    const sRef = doc(firestore, 'app_statistics', 'globalStats');

    updateDocumentNonBlocking(memberRef, {
      selectionFrequency: increment(1),
      lastSelectedAt: serverTimestamp()
    });

    updateDocumentNonBlocking(sRef, {
      totalSelectionsMade: increment(1)
    });

    if (!skipLog && members) {
      const member = members.find(m => m.id === id);
      if (member) {
        addSelectionLog([member.name]);
      }
    }
  };

  const undoSelection = async (id: string, skipHistoryDelete: boolean = false) => {
    if (!firestore) return;
    const memberRef = doc(firestore, 'members', id);
    const sRef = doc(firestore, 'app_statistics', 'globalStats');

    updateDocumentNonBlocking(memberRef, {
      selectionFrequency: increment(-1),
      updatedAt: serverTimestamp()
    });

    updateDocumentNonBlocking(sRef, {
      totalSelectionsMade: increment(-1)
    });

    if (!skipHistoryDelete && members && selectionHistory) {
      const member = (members as Member[]).find(m => m.id === id);
      if (member) {
        const latestLog = (selectionHistory as any[]).find(log => 
          log.memberNames.includes(member.name)
        );
        if (latestLog) {
          deleteSelectionLog(latestLog.id);
        }
      }
    }
  };

  const addMember = useCallback(async (name: string, type: MemberCategory) => {
    if (!firestore || !members) return;
    
    // Check for duplicates before adding
    const isDuplicate = members.some(m => m.name.toLowerCase() === name.trim().toLowerCase());
    if (isDuplicate) {
      toast({ 
        variant: "destructive", 
        title: "Duplicate Member", 
        description: `Member with name "${name}" already exists.` 
      });
      return;
    }

    const newMemberRef = doc(collection(firestore, 'members'));
    setDocumentNonBlocking(newMemberRef, {
      name: name.trim(),
      type,
      selectionFrequency: 0,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }, [firestore, members, toast]);

  const updateMember = async (id: string, updates: Partial<Member>) => {
    if (!firestore) return;
    const memberRef = doc(firestore, 'members', id);
    updateDocumentNonBlocking(memberRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  };

  const deleteMember = async (id: string) => {
    if (!firestore) return;
    const memberRef = doc(firestore, 'members', id);
    deleteDocumentNonBlocking(memberRef);
  };

  const deleteAllMembers = async () => {
    if (!firestore || !members) return;
    const batch = writeBatch(firestore);
    
    members.forEach((m) => {
      const docRef = doc(firestore, 'members', m.id);
      batch.delete(docRef);
    });

    const sRef = doc(firestore, 'app_statistics', 'globalStats');
    batch.update(sRef, { 
      totalSelectionsMade: 0, 
      membersSelectedAtLeastOnceCount: 0 
    });
    
    batch.commit().catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'members',
        operation: 'delete',
      }));
    });
  };

  const resetAllData = async () => {
    if (!firestore || !members) return;
    const batch = writeBatch(firestore);
    
    members.forEach((m) => {
      const docRef = doc(firestore, 'members', m.id);
      batch.update(docRef, { selectionFrequency: 0, lastSelectedAt: null });
    });

    const sRef = doc(firestore, 'app_statistics', 'globalStats');
    batch.update(sRef, { totalSelectionsMade: 0, membersSelectedAtLeastOnceCount: 0 });
    
    batch.commit().catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'members',
        operation: 'update',
      }));
    });
  };

  return { 
    members: (members || []) as Member[], 
    globalStats,
    selectionHistory: (selectionHistory || []),
    loading: loading || statsLoading || historyLoading, 
    selectMember, 
    undoSelection,
    addMember,
    updateMember,
    deleteMember,
    deleteAllMembers,
    resetAllData,
    addSelectionLog,
    deleteSelectionLog
  };
}