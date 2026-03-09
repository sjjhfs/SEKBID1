
"use client";

import { useEffect, useState } from "react";
import { useMembers } from "@/hooks/useMembers";
import { StatsDashboard } from "@/components/StatsDashboard";
import { MemberCard } from "@/components/MemberCard";
import { AdminPanel } from "@/components/AdminPanel";
import { SelectionHistory } from "@/components/SelectionHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Sparkles, Loader2, UsersRound, Search, Lightbulb, Copy, CheckCircle2, RotateCcw, HelpCircle, ChevronDown } from "lucide-react";
import { useAuth, useUser, initiateAnonymousSignIn } from "@/firebase";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { 
    members, 
    loading, 
    selectMember, 
    undoSelection, 
    resetAllData, 
    deleteAllMembers,
    selectionHistory,
    addSelectionLog,
    deleteSelectionLog
  } = useMembers();
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastSelectedSuggested, setLastSelectedSuggested] = useState<string[]>([]);
  const [lastBulkLogId, setLastBulkLogId] = useState<string | null>(null);
  const [skippedSuggestions, setSkippedSuggestions] = useState<string[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('lastBulkSelection');
    if (saved) {
      const { ids, logId, date } = JSON.parse(saved);
      const today = new Date().toDateString();
      if (date === today) {
        setLastSelectedSuggested(ids);
        setLastBulkLogId(logId || null);
      } else {
        localStorage.removeItem('lastBulkSelection');
      }
    }
  }, []);

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

  const suggestedInti = intiMembers
    .filter(m => !skippedSuggestions.includes(m.id))
    .slice(0, 2);
    
  const suggestedAnggota = anggotaMembers
    .filter(m => !skippedSuggestions.includes(m.id))
    .slice(0, 6);
    
  const allSuggested = [...suggestedInti, ...suggestedAnggota];

  const minInti = intiMembers.length > 0 ? Math.min(...intiMembers.map(m => m.selectionFrequency)) : 0;
  const minAnggota = anggotaMembers.length > 0 ? Math.min(...anggotaMembers.map(m => m.selectionFrequency)) : 0;
  const minTerbatas = terbatasMembers.length > 0 ? Math.min(...terbatasMembers.map(m => m.selectionFrequency)) : 0;

  const handleCopySuggestions = async () => {
    if (allSuggested.length === 0) return;
    
    const names = allSuggested.map(m => m.name);
    const text = names.map(n => `• ${n}`).join('\n');
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      const ids = allSuggested.map(m => m.id);
      
      ids.forEach(id => selectMember(id, true));
      
      const logId = await addSelectionLog(names);
      
      setLastSelectedSuggested(ids);
      setLastBulkLogId(logId);
      
      localStorage.setItem('lastBulkSelection', JSON.stringify({
        ids,
        logId,
        date: new Date().toDateString()
      }));

      toast({ 
        title: "Copied & Selected!", 
        description: "Suggested list copied and frequencies incremented." 
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ variant: "destructive", title: "Copy Failed" });
    }
  };

  const handleUndoBulk = () => {
    if (lastSelectedSuggested.length === 0) return;
    
    if (lastBulkLogId) {
      deleteSelectionLog(lastBulkLogId);
    }
    
    lastSelectedSuggested.forEach(id => undoSelection(id, true));
    
    setLastSelectedSuggested([]);
    setLastBulkLogId(null);
    localStorage.removeItem('lastBulkSelection');
    toast({ title: "Undo Successful", description: "Previous bulk selection has been reverted." });
  };

  const handleSkipMember = (id: string) => {
    setSkippedSuggestions(prev => [...prev, id]);
    toast({ 
      title: "Member Changed", 
      description: "Suggestion updated with next candidate.",
      duration: 1500
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
          <main className="w-full flex flex-col items-start mx-auto">
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

            {!user ? (
              <div className="w-full py-20 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Authenticating session...</p>
              </div>
            ) : (
              <div className="w-full">
                {/* Help Section */}
                <section id="help" className="mb-8 w-full bg-card/10 border border-primary/20 rounded-2xl overflow-hidden scroll-mt-24">
                  <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center justify-between w-full p-4 hover:bg-primary/5 transition-colors text-left group">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                          <div>
                            <h2 className="text-sm font-bold uppercase tracking-tight">Bingung? coba baca</h2>
                          </div>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isHelpOpen && "rotate-180")} />
                      </button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-b-primary/10">
                          <AccordionTrigger className="text-sm font-bold uppercase py-3 hover:text-primary">Cara Memilih Petugas</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-sm space-y-2">
                            <p>1. Lihat bagian <strong>Suggested for Today</strong>. Sistem secara otomatis menyarankan anggota dengan jumlah tugas (frequency) paling sedikit. Jika petugas kurang pas, bisa di-klik pada nama petugas untuk mengganti satu persatu.</p>
                            <p>2. Klik tombol <strong>Copy List</strong> untuk menyalin nama petugas dan secara otomatis menambah hitungan tugas mereka.</p>
                            <p>3. Jika ingin memilih secara manual, klik tombol <strong>Select</strong> pada baris nama anggota di kategori INTI, ANGGOTA, atau TERBATAS.</p>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-2" className="border-b-primary/10">
                          <AccordionTrigger className="text-sm font-bold uppercase py-3 hover:text-primary">Tentang Fitur "Undo"</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-sm space-y-2">
                            <p>• <strong>Undo Massal:</strong> Jika salah menekan "Copy List", gunakan tombol Undo yang muncul di atas daftar saran.</p>
                            <p>• <strong>Undo Manual:</strong> Tekan dan tahan (long-press) pada baris nama anggota selama 1 detik untuk memunculkan opsi Undo individu.</p>
                            <p>• <strong>Penting:</strong> Tombol Undo massal akan hilang otomatis pada hari berikutnya untuk menjaga keamanan data.</p>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3" className="border-b-primary/10">
                          <AccordionTrigger className="text-sm font-bold uppercase py-3 hover:text-primary">Admin Mode & Password</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-sm space-y-2">
                            <p>Klik <strong>Admin Login</strong> di pojok kanan atas dan masukkan password <code>sekbid1haleluya</code>.</p>
                            <p>Di Admin Mode, Anda bisa:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Menambah anggota baru.</li>
                              <li>Mengubah nama anggota yang sudah ada.</li>
                              <li>Menghapus anggota atau reset seluruh hitungan tugas.</li>
                              <li>Menghapus riwayat (history) di bagian bawah.</li>
                            </ul>
                            <div className="pt-2 border-t border-primary/5 mt-2">
                              <p className="font-semibold text-primary/80">Kategori Anggota:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                <li><strong>INTI:</strong> Anggota Inti.</li>
                                <li><strong>ANGGOTA:</strong> Sekbid 2 sampai 4, dan sebagian sekbid 5.</li>
                                <li><strong>TERBATAS:</strong> Sekbid 1 dan sekbid 5 yang bertugas di mulmed dan story.</li>
                              </ul>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CollapsibleContent>
                  </Collapsible>
                </section>

                {allSuggested.length > 0 && !searchTerm && (
                  <section id="suggestions" className="mb-12 w-full animate-in fade-in slide-in-from-top-4 duration-700 bg-card/20 p-4 sm:p-6 rounded-2xl border border-border/50 scroll-mt-24">
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
                          className="h-8 px-3 text-xs border-primary/20 hover:bg-primary/5 w-[100px]"
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
                            className="h-8 px-3 text-xs animate-in slide-in-from-top-1 duration-200 w-[100px]"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Undo
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                              onClick={() => handleSkipMember(member.id)}
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
                              onClick={() => handleSkipMember(member.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                <div className="mb-12 flex justify-start w-full">
                  <StatsDashboard members={members} alignment="left" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full justify-start items-start">
                  <section className="scroll-mt-20 flex flex-col items-start w-full" id="inti">
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
                      <ScrollArea className="h-auto md:h-[600px] w-full pr-4">
                        <div className="grid gap-3 w-full pb-4">
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
                      </ScrollArea>
                    )}
                  </section>

                  <section className="scroll-mt-20 flex flex-col items-start w-full" id="anggota">
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
                      <ScrollArea className="h-auto md:h-[600px] w-full pr-4">
                        <div className="grid gap-3 w-full pb-4">
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
                      </ScrollArea>
                    )}
                  </section>

                  <section className="scroll-mt-20 flex flex-col items-start w-full" id="terbatas">
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
                      <ScrollArea className="h-auto md:h-[600px] w-full pr-4">
                        <div className="grid gap-3 w-full pb-4">
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
                      </ScrollArea>
                    )}
                  </section>
                </div>

                <div id="history" className="scroll-mt-24 w-full">
                  <SelectionHistory 
                    logs={selectionHistory as any[]} 
                    isAdminMode={isAdminMode}
                    onDelete={deleteSelectionLog}
                  />
                </div>
              </div>
            )}

            <footer className="mt-24 text-left text-sm text-muted-foreground border-t border-border pt-8 w-full">
              <p>© {new Date().getFullYear()} DOOR GREETER, SEKBID 1! • Powered by Firebase Firestore</p>
            </footer>
          </main>
        </div>
      </SidebarInset>
    </div>
  );
}
