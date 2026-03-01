"use client";

import { useEffect, useState } from "react";
import { useMembers } from "@/hooks/useMembers";
import { StatsDashboard } from "@/components/StatsDashboard";
import { MemberCard } from "@/components/MemberCard";
import { AdminPanel } from "@/components/AdminPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Sparkles, Loader2 } from "lucide-react";
import { useAuth, useUser, initiateAnonymousSignIn } from "@/firebase";

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { members, loading, selectMember, resetAllData } = useMembers();
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Automatically sign in anonymously if not already signed in
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const intiMembers = members
    .filter(m => m.type === 'INTI')
    .sort((a, b) => a.selectionFrequency - b.selectionFrequency);

  const anggotaMembers = members
    .filter(m => m.type === 'ANGGOTA')
    .sort((a, b) => a.selectionFrequency - b.selectionFrequency);

  const minInti = intiMembers.length > 0 ? Math.min(...intiMembers.map(m => m.selectionFrequency)) : 0;
  const minAnggota = anggotaMembers.length > 0 ? Math.min(...anggotaMembers.map(m => m.selectionFrequency)) : 0;

  // Show a simpler loading state while checking authentication
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loading && members.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-6 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
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
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-10 px-4">
      <main className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-6 h-6 text-primary animate-pulse-subtle" />
              <h1 className="text-4xl font-extrabold tracking-tight uppercase">DOOR GREETER, SEKBID 1!</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Ensuring equitable selection for every occasion.
            </p>
          </div>
          <AdminPanel 
            onReset={resetAllData} 
            isAdminMode={isAdminMode} 
            setIsAdminMode={setIsAdminMode} 
          />
        </header>

        {/* Statistics Section */}
        <StatsDashboard members={members} />

        {/* INTI Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              INTI MEMBERS
            </h2>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
              {intiMembers.length}
            </span>
          </div>
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
        </section>

        {/* ANGGOTA Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
            <h2 className="text-2xl font-bold text-accent flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              ANGGOTA MEMBERS
            </h2>
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">
              {anggotaMembers.length}
            </span>
          </div>
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
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DOOR GREETER, SEKBID 1! • Powered by Firebase Firestore</p>
        </footer>
      </main>
    </div>
  );
}
