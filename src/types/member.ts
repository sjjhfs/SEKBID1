export type MemberCategory = 'INTI' | 'ANGGOTA';

export interface Member {
  id: string;
  name: string;
  type: MemberCategory; // Renamed from category to match backend.json
  selectionFrequency: number; // Renamed from count to match backend.json
}
