"use client";

import { useMemoFirebase, useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, doc, writeBatch, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { Member } from '@/types/member';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { INITIAL_MEMBERS } from '@/lib/initial-data';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useMembers() {
  const firestore = useFirestore();

  const membersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'members');
  }, [firestore]);

  const statsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'app_statistics', 'globalStats');
  }, [firestore]);

  const { data: members, isLoading: loading } = useCollection<Omit<Member, 'id'>>(membersQuery);
  const { data: globalStats } = useDoc(statsRef);

  // Initialize data if empty (Seed logic)
  useEffect(() => {
    if (!loading && (!members || members.length === 0) && firestore) {
      const batch = writeBatch(firestore);
      
      // Seed Members
      INITIAL_MEMBERS.forEach((m) => {
        const docRef = doc(collection(firestore, 'members'), m.id);
        batch.set(docRef, {
          name: m.name,
          type: m.type,
          selectionFrequency: 0,
          updatedAt: serverTimestamp()
        });
      });

      // Seed Global Stats
      const sRef = doc(firestore, 'app_statistics', 'globalStats');
      batch.set(sRef, {
        totalSelectionsMade: 0,
        membersSelectedAtLeastOnceCount: 0
      }, { merge: true });
      
      batch.commit().catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'initial_seed',
          operation: 'write',
        }));
      });
    }
  }, [loading, members, firestore]);

  const selectMember = async (id: string) => {
    if (!firestore) return;
    const memberRef = doc(firestore, 'members', id);
    const sRef = doc(firestore, 'app_statistics', 'globalStats');

    // Increment member count
    updateDocumentNonBlocking(memberRef, {
      selectionFrequency: increment(1),
      lastSelectedAt: serverTimestamp()
    });

    // Increment global total
    updateDocumentNonBlocking(sRef, {
      totalSelectionsMade: increment(1)
    });
  };

  const addMember = async (name: string, type: 'INTI' | 'ANGGOTA') => {
    if (!firestore) return;
    const newMemberRef = doc(collection(firestore, 'members'));
    setDocumentNonBlocking(newMemberRef, {
      name,
      type,
      selectionFrequency: 0,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

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

  const resetAllData = async () => {
    if (!firestore || !members) return;
    const batch = writeBatch(firestore);
    
    // Reset individual frequencies
    members.forEach((m) => {
      const docRef = doc(firestore, 'members', m.id);
      batch.update(docRef, { selectionFrequency: 0, lastSelectedAt: null });
    });

    // Reset global stats
    const sRef = doc(firestore, 'app_statistics', 'globalStats');
    batch.update(sRef, { totalSelectionsMade: 0, membersSelectedAtLeastOnceCount: 0 });
    
    batch.commit().catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'members_reset',
        operation: 'update',
      }));
    });
  };

  return { 
    members: (members || []) as Member[], 
    globalStats,
    loading, 
    selectMember, 
    addMember,
    updateMember,
    deleteMember,
    resetAllData 
  };
}
