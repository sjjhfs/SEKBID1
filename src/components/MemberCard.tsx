"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Member } from "@/types/member";
import { cn } from "@/lib/utils";
import { Check, UserCircle2 } from "lucide-react";

interface MemberCardProps {
  member: Member;
  isLowest: boolean;
  onSelect: (id: string) => Promise<void>;
}

export function MemberCard({ member, isLowest, onSelect }: MemberCardProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelect = async () => {
    setIsSelecting(true);
    await onSelect(member.id);
    setTimeout(() => setIsSelecting(false), 800);
  };

  return (
    <div className={cn(
      "member-row-frame group flex items-center justify-between gap-4",
      isLowest && "priority-highlight border-destructive/30"
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          "shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
          isLowest ? "bg-destructive/20 text-destructive" : "bg-primary/10 text-primary"
        )}>
          <UserCircle2 className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-base truncate">{member.name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">Frequency:</span>
            <span className={cn(
              "text-xs font-bold px-1.5 py-0.5 rounded",
              isLowest ? "bg-destructive/20 text-destructive" : "bg-muted text-foreground"
            )}>
              {member.count}
            </span>
            {isLowest && (
              <Badge variant="destructive" className="text-[10px] h-4 uppercase px-1 priority-badge">
                Priority
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Button
        onClick={handleSelect}
        disabled={isSelecting}
        size="lg"
        className={cn(
          "relative overflow-hidden transition-all duration-300 min-w-[100px]",
          isSelecting ? "bg-green-600 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
        )}
      >
        <span className={cn(
          "flex items-center gap-2",
          isSelecting ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}>
          Select
        </span>
        {isSelecting && (
          <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-50">
            <Check className="w-5 h-5 text-white" />
          </div>
        )}
      </Button>
    </div>
  );
}