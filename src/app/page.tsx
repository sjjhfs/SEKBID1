"use client";

import { useEffect, useState } from "react";
import { useMembers } from "@/hooks/useMembers";
import { StatsDashboard } from "@/components/StatsDashboard";
import { MemberCard } from "@/components/MemberCard";
import { AdminPanel } from "@/components/AdminPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Sparkles, Loader2, UsersRound, Search, Lightbulb, Copy, CheckCircle2, RotateCcw } from "lucide-react";
import { useAuth, useUser, initiateAnonymousSignIn } from "@/firebase";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { members, loading, selectMember, undoSelection, resetAllData, deleteAllMembers } = useMembers();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  // This state is not persisted in localStorage, so it resets on reload as requested.
  const [lastSelectedSuggested, setLastSelectedSuggested] = useState<string[]>([]);
  const { toast } = useToast();

  // Automatically "start" the app by signing in the user anonymously if they aren't already.
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const intiMembers = filteredMembers
    .filter(m => m.type === 'INTI')
    .sort((a, b) => a.selectionFrequency - b.selectionFrequency);

  const anggotaMembers = filteredMembers
    .filter(m => m.type === 'ANGGOTA')
    .sort((a, b) => a.selectionFrequency - b.selectionFrequency);

  const terbatasMembers = filteredMembers
    .filter(m => m.type === 'TERBATAS')
    .sort((a, b) => a.selectionFrequency - b.selectionFrequency);

  // Suggestions: 2 INTI and 6 ANGGOTA with lowest frequency
  const suggestedInti = [...intiMembers].slice(0, 2);
  const suggestedAnggota = [...anggotaMembers].slice(0, 6);
  const allSuggested = [...suggestedInti, ...suggestedAnggota];

  const minInti = intiMembers.length > 0 ? Math.min(...intiMembers.map(m => m.selectionFrequency)) : 0;
  const minAnggota = anggotaMembers.length > 0 ? Math.min(...anggotaMembers.map(m => m.selectionFrequency)) : 0;
  const minTerbatas = terbatasMembers.length > 0 ? Math.min(...terbatasMembers.map(m => m.selectionFrequency)) : 0;

  const handleCopySuggestions = () => {
    if (allSuggested.length === 0) return;
    
    // 1. Copy to clipboard (exactly requested format)
    const text = allSuggested.map(m => `• ${m.name}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      
      // 2. Increment frequencies for all suggested (by 1)
      const ids = allSuggested.map(m => m.id);
      ids.forEach(id => selectMember(id));
      setLastSelectedSuggested(ids);

      toast({ 
        title: "Copied & Selected!", 
        description: "Suggested list copied and frequencies incremented." 
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleUndoBulk = () => {
    if (lastSelectedSuggested.length === 0) return;
    
    lastSelectedSuggested.forEach(id => undoSelection(id));
    setLastSelectedSuggested([]);
    
    toast({ 
      title: "Bulk Undo Successful", 
      description: "Previous bulk selection has been reverted." 
    });
  };

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
      <SidebarTrigger />
      <SidebarInset>
        <div className="min-h-screen pb-20 pt-10 px-4 md:px-10">
          <main className="w-full flex flex-col items-start max-w-6xl mx-auto sm:mx-0">
            <header className="flex flex-col mb-12 w-full items-start text-left">
              <div className="w-full flex flex-col gap-6 md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse-subtle shrink-0" />
                  <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight uppercase">DOOR GREETER, SEKBID 1!</h1>
                </div>
                <div className="flex justify-start">
                  <AdminPanel 
                    onReset={resetAllData} 
                    onDeleteAll={deleteAllMembers}
                    isAdminMode={isAdminMode} 
                    setIsAdminMode={setIsAdminMode} 
                  />
                </div>
              </div>
              <p className="text-muted-foreground text-base md:text-lg mt-6 whitespace-pre-line leading-relaxed max-w-2xl">
                Sekbid 1 Haleluya!
                Jika terdapat kebingungan jangan malu untuk bertanya.
                Salam dari Ketua Sekbid 1 2025/2026
              </p>
            </header>

            {loading && members.length === 0 ? (
              <div className="w-full space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <div className="grid gap-3 w-full max-w-[500px]">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {/* Suggestions Section */}
                {allSuggested.length > 0 && !searchTerm && (
                  <section className="mb-12 w-full max-w-[800px] animate-in fade-in slide-in-from-top-4 duration-700 bg-card/20 p-4 sm:p-6 rounded-2xl border border-border/50">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight">Suggested for Today</h2>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCopySuggestions}
                          className="h-8 px-3 text-xs border-primary/20 hover:bg-primary/5"
                        >
                          {copied ? (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          {copied ? "Copied" : "Copy List"}
                        </Button>
                        {lastSelectedSuggested.length > 0 && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={handleUndoBulk}
                            className="h-8 px-3 text-xs animate-in slide-in-from-top-1 duration-200"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Undo Bulk
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase text-primary tracking-[0.2em] px-1">INTI (Top 2)</p>
                        <div className="grid gap-2">
                          {suggestedInti.map(member => (
                            <MemberCard
                              key={`suggested-${member.id}`}
                              member={member}
                              isLowest={true}
                              isAdminMode={false}
                              hideSelect={true}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase text-accent tracking-[0.2em] px-1">ANGGOTA (Top 6)</p>
                        <div className="grid gap-2">
                          {suggestedAnggota.map(member => (
                            <MemberCard
                              key={`suggested-${member.id}`}
                              member={member}
                              isLowest={true}
                              isAdminMode={false}
                              hideSelect={true}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                <div className="mb-12 flex justify-start">
                  <div className="w-full max-w-2xl sm:max-w-full">
                    <StatsDashboard members={members} alignment="left" />
                  </div>
                </div>

                <div className="w-full flex justify-end mb-8">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      className="pl-9 bg-card border-border/50 focus:ring-primary/50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-12 xl:gap-8 w-full justify-start">
                  <section className="scroll-mt-20 flex flex-col items-start w-full max-w-[500px]" id="inti">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-2 w-full">
                      <h2 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2 uppercase tracking-wide">
                        <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                        INTI
                      </h2>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                        {intiMembers.length}
                      </span>
                    </div>
                    {intiMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic text-left py-4">
                        {searchTerm ? "No matches found." : "No members in this category."}
                      </p>
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

                  <section className="scroll-mt-20 flex flex-col items-start w-full max-w-[500px]" id="anggota">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-2 w-full">
                      <h2 className="text-xl sm:text-2xl font-bold text-accent flex items-center gap-2 uppercase tracking-wide">
                        <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                        ANGGOTA
                      </h2>
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">
                        {anggotaMembers.length}
                      </span>
                    </div>
                    {anggotaMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic text-left py-4">
                        {searchTerm ? "No matches found." : "No members in this category."}
                      </p>
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

                  <section className="scroll-mt-20 flex flex-col items-start w-full max-w-[500px]" id="terbatas">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-2 w-full">
                      <h2 className="text-xl sm:text-2xl font-bold text-priority flex items-center gap-2 uppercase tracking-wide">
                        <UsersRound className="w-5 h-5 sm:w-6 sm:h-6" />
                        TERBATAS
                      </h2>
                      <span className="text-xs bg-priority/10 text-priority px-2 py-0.5 rounded-full font-bold">
                        {terbatasMembers.length}
                      </span>
                    </div>
                    {terbatasMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic text-left py-4">
                        {searchTerm ? "No matches found." : "No members in this category."}
                      </p>
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

            <footer className="mt-24 text-left text-sm text-muted-foreground border-t border-border pt-8 w-full max-w-full">
              <p>© {new Date().getFullYear()} DOOR GREETER, SEKBID 1! • Powered by Firebase Firestore</p>
            </footer>
          </main>
        </div>
      </SidebarInset>
    </div>
  );
}
