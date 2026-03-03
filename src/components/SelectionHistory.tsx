
"use client";

import { format } from "date-fns";
import { History as HistoryIcon, Calendar, UserCheck, Clock, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SelectionLog {
  id: string;
  memberNames: string[];
  timestamp: any;
}

interface SelectionHistoryProps {
  logs: SelectionLog[];
  isAdminMode?: boolean;
  onDelete?: (id: string) => Promise<void>;
}

export function SelectionHistory({ logs, isAdminMode, onDelete }: SelectionHistoryProps) {
  if (logs.length === 0) return null;

  return (
    <section className="w-full mt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
        <HistoryIcon className="w-6 h-6 text-primary" />
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide">Recent Selection Activity</h2>
      </div>

      <div className="grid gap-4">
        {logs.map((log) => {
          const isBulk = log.memberNames.length > 1;
          
          return (
            <Card key={log.id} className={cn(
              "bg-card/30 border-border/50 overflow-hidden transition-all hover:border-primary/30",
              isBulk ? "border-l-4 border-l-primary" : "border-l-4 border-l-accent"
            )}>
              <CardHeader className="py-2.5 px-4 bg-muted/20 border-b border-border/30 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      {log.timestamp ? format(log.timestamp.toDate(), "eeee, d MMM yyyy") : "Just now"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 border-l border-border/50 pl-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      {log.timestamp ? format(log.timestamp.toDate(), "HH:mm") : "Recording..."}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    "text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0",
                    isBulk ? "border-primary/30 text-primary" : "border-accent/30 text-accent"
                  )}>
                    {isBulk ? "Team Assignment" : "Single Selection"}
                  </Badge>
                  {isAdminMode && onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(log.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="py-4 px-4">
                <div className="flex flex-wrap gap-2">
                  {log.memberNames.map((name, idx) => (
                    <div 
                      key={`${log.id}-${idx}`} 
                      className="flex items-center gap-1.5 bg-background/50 border border-border/40 px-3 py-1 rounded-full animate-in zoom-in-95 duration-300"
                    >
                      <UserCheck className={cn("w-3 h-3", isBulk ? "text-primary" : "text-accent")} />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
