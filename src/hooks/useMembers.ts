"use client";

import { useMemoFirebase, useCollection, useFirestore } from '@/firebase';
import { collection, doc, writeBatch, increment } from 'firebase/firestore';
import { Member } from '@/types/member';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { INITIAL_MEMBERS } from '@/lib/initial-data';
import { useEffect } from 'react';
import { setDoc } from 'firebase/firestore';

export function useMembers() {
  const firestore = useFirestore();

  const membersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'members');
  }, [firestore]);

  const { data: members, isLoading: loading } = useCollection<Omit<Member, 'id'>>(membersQuery);

  // Initialize data if empty (Seed logic)
  useEffect(() => {
    if (!loading && (!members || members.length === 0) && firestore) {
      const batch = writeBatch(firestore);
      INITIAL_MEMBERS.forEach((m) => {
        const docRef = doc(collection(firestore, 'members'), m.id);
        batch.set(docRef, {
          name: m.name,
          type: m.category,
          selectionFrequency: 0
        });
      });
      batch.commit().catch(console.error);
    }
  }, [loading, members, firestore]);

  const selectMember = async (id: string) => {
    if (!firestore) return;
    const memberRef = doc(firestore, 'members', id);
    updateDocumentNonBlocking(memberRef, {
      selectionFrequency: increment(1)
    });
  };

  const resetAllData = async () => {
    if (!firestore || !members) return;
    const batch = writeBatch(firestore);
    members.forEach((m) => {
      const docRef = doc(firestore, 'members', m.id);
      batch.update(docRef, { selectionFrequency: 0 });
    });
    // We don't await the batch for immediate UI response, though batches don't have a non-blocking helper yet
    // we use the standard promise and handle errors silently or via standard Firebase behavior
    batch.commit().catch(console.error);
  };

  return { 
    members: (members || []) as Member[], 
    loading, 
    selectMember, 
    resetAllData 
  };
}
