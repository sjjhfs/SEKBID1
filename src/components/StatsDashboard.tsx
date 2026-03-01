"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Member } from "@/types/member";
import { TrendingDown, Sigma } from "lucide-react";

export function StatsDashboard({ members }: { members: Member[] }) {
  // Total selection (Sigma of frequencies)
  const totalSelection = members.reduce((acc, m) => acc + m.selectionFrequency, 0);
  
  // Find members with the minimum frequency to show as "Priority"
  // Exclude 'TERBATAS' from the global priority gadget calculation
  const priorityEligibleMembers = members.filter(m => m.type !== 'TERBATAS');
  const minFreq = priorityEligibleMembers.length > 0 ? Math.min(...priorityEligibleMembers.map(m => m.selectionFrequency)) : 0;
  const priorityMembers = priorityEligibleMembers.filter(m => m.selectionFrequency === minFreq);
  
  const priorityDisplay = priorityEligibleMembers.length === 0 
    ? "No Eligible Members" 
    : priorityMembers.length === 1 
      ? priorityMembers[0].name 
      : `${priorityMembers.length} Candidates`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card className="bg-card/50 border-primary/20">
        <CardContent className="pt-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Member in Priority</p>
            <h3 className="text-xl font-bold truncate max-w-[200px]">{priorityDisplay}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-primary/20">
        <CardContent className="pt-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Sigma className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Selection</p>
            <h3 className="text-2xl font-bold">{totalSelection}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}