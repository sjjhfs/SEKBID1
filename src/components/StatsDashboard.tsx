"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Member } from "@/types/member";
import { Users, BarChart3, Star } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";

export function StatsDashboard({ members }: { members: Member[] }) {
  const { globalStats } = useMembers();
  
  // Use global stats from Firestore if available, otherwise fall back to local calculation
  const totalSelections = globalStats?.totalSelectionsMade ?? members.reduce((acc, m) => acc + m.selectionFrequency, 0);
  const selectedCount = members.filter(m => m.selectionFrequency > 0).length;
  const participationRate = members.length > 0 
    ? Math.round((selectedCount / members.length) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="bg-card/50 border-primary/20">
        <CardContent className="pt-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Global Selections</p>
            <h3 className="text-2xl font-bold">{totalSelections}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-primary/20">
        <CardContent className="pt-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-accent/10 text-accent">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Members Selected</p>
            <h3 className="text-2xl font-bold">{selectedCount} <span className="text-sm font-normal text-muted-foreground">/ {members.length}</span></h3>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-primary/20">
        <CardContent className="pt-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Participation Rate</p>
            <h3 className="text-2xl font-bold">{participationRate}%</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
