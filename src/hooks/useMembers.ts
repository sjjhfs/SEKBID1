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

  useEffect(() => {
    // Robust check for initialization: Only run if statsLoading is finished and isInitialized is definitively false
    if (!loading && !statsLoading && firestore && user) {
      const isActuallyInitialized = globalStats && (globalStats as any).isInitialized;
      
      // We check members length to see if we need to seed, but ONLY if globalStats explicitly tells us it hasn't been initialized yet
      if (members !== null && members.length === 0 && !isActuallyInitialized) {
        const batch = writeBatch(firestore);
        INITIAL_MEMBERS.forEach((m) => {
          const docRef = doc(collection(firestore, 'members'), m.id);
          batch.set(docRef, {
            name: m.name,
            type: m.type,
            selectionFrequency: 0,
            lastSelectedAt: null,
            updatedAt: serverTimestamp()
          });
        });
        const sRef = doc(firestore, 'app_statistics', 'globalStats');
        batch.set(sRef, { totalSelectionsMade: 0, isInitialized: true }, { merge: true });
        batch.commit().catch(() => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'members', operation: 'write' }));
        });
      }
    }
  }, [loading, statsLoading, members, globalStats, firestore, user]);

  const addSelectionLog = async (memberNames: string[]) => {
    if (!firestore) return "";
    const logRef = doc(collection(firestore, 'selection_history'));
    const id = logRef.id;
    setDocumentNonBlocking(logRef, { memberNames, timestamp: serverTimestamp() }, { merge: true });
    return id;
  };

  const deleteSelectionLog = async (logId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'selection_history', logId));
  };

  const selectMember = async (id: string, skipLog: boolean = false) => {
    if (!firestore) return;
    const memberRef = doc(firestore, 'members', id);
    updateDocumentNonBlocking(memberRef, {
      selectionFrequency: increment(1),
      lastSelectedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    updateDocumentNonBlocking(doc(firestore, 'app_statistics', 'globalStats'), { totalSelectionsMade: increment(1) });
    if (!skipLog && members) {
      const member = (members as Member[]).find(m => m.id === id);
      if (member) addSelectionLog([member.name]);
    }
  };

  const undoSelection = async (id: string, skipHistoryDelete: boolean = false) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'members', id), { selectionFrequency: increment(-1), updatedAt: serverTimestamp() });
    updateDocumentNonBlocking(doc(firestore, 'app_statistics', 'globalStats'), { totalSelectionsMade: increment(-1) });
    if (!skipHistoryDelete && members && selectionHistory) {
      const member = (members as Member[]).find(m => m.id === id);
      if (member) {
        const latestLog = (selectionHistory as any[]).find(log => log.memberNames.includes(member.name));
        if (latestLog) deleteSelectionLog(latestLog.id);
      }
    }
  };

  const addMember = useCallback(async (name: string, type: MemberCategory) => {
    if (!firestore || !members) return;
    const isDuplicate = members.some(m => m.name.toLowerCase() === name.trim().toLowerCase());
    if (isDuplicate) {
      toast({ variant: "destructive", title: "Duplicate Member", description: `"${name}" already exists.` });
      return;
    }
    setDocumentNonBlocking(doc(collection(firestore, 'members')), {
      name: name.trim(),
      type,
      selectionFrequency: 0,
      lastSelectedAt: null,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }, [firestore, members, toast]);

  const updateMember = async (id: string, updates: Partial<Member>) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'members', id), { ...updates, updatedAt: serverTimestamp() });
  };

  const deleteMember = async (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'members', id));
  };

  const deleteAllMembers = async () => {
    if (!firestore || !members) return;
    const batch = writeBatch(firestore);
    members.forEach(m => batch.delete(doc(firestore, 'members', m.id)));
    batch.update(doc(firestore, 'app_statistics', 'globalStats'), { totalSelectionsMade: 0 });
    batch.commit();
  };

  const resetAllData = async () => {
    if (!firestore || !members) return;
    const batch = writeBatch(firestore);
    members.forEach(m => batch.update(doc(firestore, 'members', m.id), { selectionFrequency: 0, lastSelectedAt: null }));
    batch.update(doc(firestore, 'app_statistics', 'globalStats'), { totalSelectionsMade: 0 });
    batch.commit();
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
