"use client";

import { useEffect, useState } from "react";
import { useMembers } from "@/hooks/useMembers";
import { StatsDashboard } from "@/components/StatsDashboard";
import { MemberCard } from "@/components/MemberCard";
import { AdminPanel } from "@/components/AdminPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Sparkles, Loader2, UsersRound } from "lucide-react";
import { useAuth, useUser, initiateAnonymousSignIn } from "@/firebase";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { members, loading, selectMember, resetAllData, deleteAllMembers } = useMembers();
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // Group members and sort by frequency
  const intiMembers = members
    .filter(m => m.type === 'INTI')
    .sort((a, b) => a.selectionFrequency - b.selectionFrequency);

  const anggotaMembers = members
    .filter(m => m.type === 'ANGGOTA')
    .sort((a, b) => a.selectionFrequency - b.selectionFrequency);

  const terbatasMembers = members
    .filter(m => m.type === 'TERBATAS')
    .sort((a, b) => a.selectionFrequency - b.selectionFrequency);

  // Calculate local priority (min frequency) for each section
  const minInti = intiMembers.length > 0 ? Math.min(...intiMembers.map(m => m.selectionFrequency)) : 0;
  const minAnggota = anggotaMembers.length > 0 ? Math.min(...anggotaMembers.map(m => m.selectionFrequency)) : 0;
  const minTerbatas = terbatasMembers.length > 0 ? Math.min(...terbatasMembers.map(m => m.selectionFrequency)) : 0;

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen pb-20 pt-10 px-4 flex flex-col items-center">
          <main className="max-w-3xl w-full">
            <header className="flex flex-col items-center gap-6 mb-8 text-center">
              <div className="flex flex-col gap-4 items-center w-full">
                <div className="flex items-center gap-2 self-start md:self-center">
                  <SidebarTrigger className="mt-1 shrink-0" />
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse-subtle" />
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase">DOOR GREETER, SEKBID 1!</h1>
                  </div>
                </div>
                <p className="text-muted-foreground text-lg whitespace-pre-line leading-relaxed max-w-lg">
                  {`Sekbid 1 Haleluya!\nJika terdapat kebingungan jangan malu untuk bertanya\n\nSalam dari Ketua 2025/2026`}
                </p>
              </div>
              <div className="flex justify-center shrink-0 w-full">
                <AdminPanel 
                  onReset={resetAllData} 
                  onDeleteAll={deleteAllMembers}
                  isAdminMode={isAdminMode} 
                  setIsAdminMode={setIsAdminMode} 
                />
              </div>
            </header>

            {loading && members.length === 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <div className="grid gap-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <StatsDashboard members={members} />

                {/* INTI Section */}
                <section className="mb-12 scroll-mt-20" id="inti">
                  <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2 uppercase tracking-wide">
                      <UserPlus className="w-6 h-6" />
                      INTI
                    </h2>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                      {intiMembers.length}
                    </span>
                  </div>
                  {intiMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No members in this category.</p>
                  ) : (
                    <div className="grid gap-3">
                      {intiMembers.map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          isLowest={member.selectionFrequency === minInti}
                          onSelect={selectMember}
                          isAdminMode={isAdminMode}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* ANGGOTA Section */}
                <section className="mb-12 scroll-mt-20" id="anggota">
                  <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
                    <h2 className="text-2xl font-bold text-accent flex items-center gap-2 uppercase tracking-wide">
                      <UserPlus className="w-6 h-6" />
                      ANGGOTA
                    </h2>
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">
                      {anggotaMembers.length}
                    </span>
                  </div>
                  {anggotaMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No members in this category.</p>
                  ) : (
                    <div className="grid gap-3">
                      {anggotaMembers.map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          isLowest={member.selectionFrequency === minAnggota}
                          onSelect={selectMember}
                          isAdminMode={isAdminMode}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* TERBATAS Section */}
                <section className="scroll-mt-20" id="terbatas">
                  <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
                    <h2 className="text-2xl font-bold text-priority flex items-center gap-2 uppercase tracking-wide">
                      <UsersRound className="w-6 h-6" />
                      TERBATAS
                    </h2>
                    <span className="text-xs bg-priority/10 text-priority px-2 py-0.5 rounded-full font-bold">
                      {terbatasMembers.length}
                    </span>
                  </div>
                  {terbatasMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No members in this category.</p>
                  ) : (
                    <div className="grid gap-3">
                      {terbatasMembers.map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          isLowest={member.selectionFrequency === minTerbatas}
                          onSelect={selectMember}
                          isAdminMode={isAdminMode}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            <footer className="mt-16 text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} DOOR GREETER, SEKBID 1! • Powered by Firebase Firestore</p>
            </footer>
          </main>
        </div>
      </SidebarInset>
    </div>
  );
}
