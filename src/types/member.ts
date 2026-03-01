export type MemberCategory = 'INTI' | 'ANGGOTA';

export interface Member {
  id: string;
  name: string;
  category: MemberCategory;
  count: number;
}