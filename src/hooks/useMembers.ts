"use client";

import { useEffect, useState } from 'react';
import { ref, onValue, set, update, increment, runTransaction } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Member } from '@/types/member';
import { INITIAL_MEMBERS } from '@/lib/initial-data';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const membersRef = ref(database, 'members');
    
    const unsubscribe = onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        // Initialize if empty
        const initialMap: Record<string, Member> = {};
        INITIAL_MEMBERS.forEach(m => {
          initialMap[m.id] = m;
        });
        set(membersRef, initialMap);
      } else {
        const memberList = Object.values(data) as Member[];
        setMembers(memberList);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const selectMember = async (id: string) => {
    const memberRef = ref(database, `members/${id}`);
    try {
      await update(memberRef, {
        count: increment(1)
      });
    } catch (error) {
      console.error("Failed to select member:", error);
    }
  };

  const resetAllData = async () => {
    const membersRef = ref(database, 'members');
    try {
      await runTransaction(membersRef, (currentData) => {
        if (currentData) {
          Object.keys(currentData).forEach(key => {
            currentData[key].count = 0;
          });
        }
        return currentData;
      });
    } catch (error) {
      console.error("Failed to reset data:", error);
    }
  };

  return { members, loading, selectMember, resetAllData };
}