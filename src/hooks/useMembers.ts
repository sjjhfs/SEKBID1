"use client";

import { useMemoFirebase, useCollection, useFirestore } from '@/firebase';
import { collection, doc, writeBatch, increment } from 'firebase/firestore';
import { Member } from '@/types/member';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
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

  const { data: members, isLoading: loading } = useCollection<Omit<Member, 'id'>>(membersQuery);

  // Initialize data if empty (Seed logic)
  useEffect(() => {
    if (!loading && (!members || members.length === 0) && firestore) {
      const batch = writeBatch(firestore);
      INITIAL_MEMBERS.forEach((m) => {
        const docRef = doc(collection(firestore, 'members'), m.id);
        batch.set(docRef, {
          name: m.name,
          type: m.type,
          selectionFrequency: 0
        });
      });
      
      batch.commit().catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'members',
          operation: 'write',
        }));
      });
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
    
    batch.commit().catch((err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'members',
        operation: 'update',
      }));
    });
  };

  return { 
    members: (members || []) as Member[], 
    loading, 
    selectMember, 
    resetAllData 
  };
}
