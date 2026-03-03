
"use client";

import { format } from "date-fns";
import { History as HistoryIcon, Calendar, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface SelectionLog {
  id: string;
  memberNames: string[];
  timestamp: any;
}

interface SelectionHistoryProps {
  logs: SelectionLog[];
}

export function SelectionHistory({ logs }: SelectionHistoryProps) {
  if (logs.length === 0) return null;

  return (
    <section className="w-full mt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
        <HistoryIcon className="w-6 h-6 text-primary" />
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide">Selection History</h2>
      </div>

      <div className="grid gap-4">
        {logs.map((log) => (
          <Card key={log.id} className="bg-card/30 border-border/50 overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/30 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {log.timestamp ? format(log.timestamp.toDate(), "eeee, d MMM yyyy • HH:mm") : "Just now"}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">
                {log.memberNames.length} Members
              </Badge>
            </CardHeader>
            <CardContent className="py-4 px-4">
              <div className="flex flex-wrap gap-2">
                {log.memberNames.map((name, idx) => (
                  <div 
                    key={`${log.id}-${idx}`} 
                    className="flex items-center gap-1.5 bg-background/50 border border-border/40 px-3 py-1 rounded-full"
                  >
                    <UserCheck className="w-3 h-3 text-accent" />
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
