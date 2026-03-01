export type MemberCategory = 'INTI' | 'ANGGOTA' | 'TERBATAS';

export interface Member {
  id: string;
  name: string;
  type: MemberCategory;
  selectionFrequency: number;
  lastSelectedAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}
