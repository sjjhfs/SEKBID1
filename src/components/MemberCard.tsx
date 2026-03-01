"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Member } from "@/types/member";
import { cn } from "@/lib/utils";
import { Check, UserCircle2, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMembers } from "@/hooks/useMembers";
import { useToast } from "@/hooks/use-toast";

interface MemberCardProps {
  member: Member;
  isLowest: boolean;
  onSelect: (id: string) => Promise<void>;
  isAdminMode: boolean;
}

export function MemberCard({ member, isLowest, onSelect, isAdminMode }: MemberCardProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(member.name);
  
  const { updateMember, deleteMember } = useMembers();
  const { toast } = useToast();

  const handleSelect = async () => {
    setIsSelecting(true);
    await onSelect(member.id);
    setTimeout(() => setIsSelecting(false), 800);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) return;
    await updateMember(member.id, { name: editName });
    toast({ title: "Name Updated", description: `Changed to ${editName}` });
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await deleteMember(member.id);
    toast({ variant: "destructive", title: "Deleted", description: "Member removed." });
  };

  const isTerbatas = member.type === 'TERBATAS';

  return (
    <div className={cn(
      "member-row-frame group",
      isLowest && !isTerbatas && "priority-highlight border-destructive/30",
      isLowest && isTerbatas && "terbatas-priority-highlight border-priority/30"
    )}>
      {/* COLUMN 1: Avatar */}
      <div className={cn(
        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0",
        isLowest 
          ? (isTerbatas ? "bg-priority/20 text-priority" : "bg-destructive/20 text-destructive") 
          : "bg-primary/10 text-primary"
      )}>
        <UserCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>

      {/* COLUMN 2: Name & Admin Controls */}
      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
        <h4 className="font-semibold text-sm sm:text-base truncate">{member.name}</h4>
        {isAdminMode && (
          <Dialog open={editOpen} onOpenChange={(open) => {
            setEditOpen(open);
            if (open) setEditName(member.name);
          }}>
            <DialogTrigger asChild>
              <button 
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors shrink-0"
                title="Rename Member"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Rename Member</DialogTitle>
              </DialogHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                    autoFocus
                  />
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Current Frequency</p>
                      <p className="text-sm font-bold">{member.selectionFrequency}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Member
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdate}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* COLUMN 3: Frequency */}
      <div className="text-center shrink-0">
        <span className={cn(
          "text-xs sm:text-sm font-bold px-1.5 py-0.5 rounded tabular-nums",
          isLowest 
            ? (isTerbatas ? "bg-priority/20 text-priority" : "bg-destructive/20 text-destructive") 
            : "bg-muted text-foreground"
        )}>
          {member.selectionFrequency}
        </span>
      </div>

      {/* COLUMN 4: Priority Badge */}
      <div className="flex justify-center shrink-0">
        {isLowest && (
          <Badge 
            className={cn(
              "text-[9px] sm:text-[10px] h-4 uppercase px-1 leading-none font-bold",
              isTerbatas ? "terbatas-priority-badge" : "priority-badge"
            )}
          >
            Prio
          </Badge>
        )}
      </div>

      {/* COLUMN 5: Select Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSelect}
          disabled={isSelecting}
          size="sm"
          className={cn(
            "h-8 sm:h-10 w-full relative overflow-hidden transition-all duration-300",
            isSelecting ? "bg-green-600 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
          )}
        >
          <span className={cn(
            "text-xs sm:text-sm font-bold",
            isSelecting ? "scale-0 opacity-0" : "scale-100 opacity-100"
          )}>
            Select
          </span>
          {isSelecting && (
            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-50">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
