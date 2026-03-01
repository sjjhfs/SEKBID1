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
import { SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { state } = useSidebar();
  const { members, loading, selectMember, resetAllData, deleteAllMembers } = useMembers();
  const [isAdminMode, setIsAdminMode] = useState(false);

  const isCollapsed = state === "collapsed";

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
        <div className="min-h-screen pb-20 pt-10 px-4 md:px-10">
          <main className={cn(
            "w-full flex flex-col transition-all duration-300",
            isCollapsed ? "items-center" : "items-start"
          )}>
            <header className={cn(
              "flex flex-col mb-12 w-full transition-all duration-300",
              isCollapsed ? "items-center text-center max-w-4xl" : "items-start text-left max-w-full"
            )}>
              <div className={cn(
                "w-full flex flex-col gap-6 md:flex-row md:items-center",
                isCollapsed ? "justify-center" : "justify-between"
              )}>
                <div className={cn("flex items-center gap-4", isCollapsed ? "justify-center" : "justify-start")}>
                  <SidebarTrigger className="mt-1 shrink-0" />
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse-subtle shrink-0" />
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight uppercase">DOOR GREETER, SEKBID 1!</h1>
                  </div>
                </div>
                <div className={cn("flex", isCollapsed ? "justify-center" : "justify-end")}>
                  <AdminPanel 
                    onReset={resetAllData} 
                    onDeleteAll={deleteAllMembers}
                    isAdminMode={isAdminMode} 
                    setIsAdminMode={setIsAdminMode} 
                  />
                </div>
              </div>
              <p className={cn(
                "text-muted-foreground text-base md:text-lg mt-6 whitespace-pre-line leading-relaxed",
                isCollapsed ? "text-center mx-auto" : "text-left"
              )}>
                {`Sekbid 1 Haleluya!\nJika terdapat kebingungan jangan malu untuk bertanya\n\nSalam dari Ketua 2025/2026`}
              </p>
            </header>

            {loading && members.length === 0 ? (
              <div className="w-full max-w-6xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
                <div className="space-y-4 flex flex-col items-center">
                  <Skeleton className="h-8 w-32" />
                  <div className="grid gap-3 w-full max-w-[500px]">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                  </div>
                </div>
              </div>
            ) : (
              <div className={cn("w-full transition-all duration-300", isCollapsed ? "max-w-4xl" : "max-w-full")}>
                <div className={cn("mb-12 flex", isCollapsed ? "justify-center" : "justify-start")}>
                  <div className="w-full">
                    <StatsDashboard members={members} alignment={isCollapsed ? 'center' : 'left'} />
                  </div>
                </div>

                <div className={cn(
                  "flex flex-wrap gap-12 xl:gap-8 w-full",
                  isCollapsed ? "justify-center" : "justify-start"
                )}>
                  {/* INTI Section */}
                  <section className="scroll-mt-20 flex flex-col items-center w-full max-w-[500px]" id="inti">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-2 w-full">
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
                      <div className="grid gap-3 w-full">
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
                  <section className="scroll-mt-20 flex flex-col items-center w-full max-w-[500px]" id="anggota">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-2 w-full">
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
                      <div className="grid gap-3 w-full">
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
                  <section className="scroll-mt-20 flex flex-col items-center w-full max-w-[500px]" id="terbatas">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-2 w-full">
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
                      <div className="grid gap-3 w-full">
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
                </div>
              </div>
            )}

            <footer className={cn(
              "mt-24 text-center text-sm text-muted-foreground border-t border-border pt-8 w-full",
              isCollapsed ? "max-w-4xl" : "max-w-full"
            )}>
              <p>© {new Date().getFullYear()} DOOR GREETER, SEKBID 1! • Powered by Firebase Firestore</p>
            </footer>
          </main>
        </div>
      </SidebarInset>
    </div>
  );
}