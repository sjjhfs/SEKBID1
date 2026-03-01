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
      "member-row-frame group flex items-center justify-between gap-4 w-[500px] flex-shrink-0",
      isLowest && !isTerbatas && "priority-highlight border-destructive/30",
      isLowest && isTerbatas && "terbatas-priority-highlight border-priority/30"
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          "shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
          isLowest 
            ? (isTerbatas ? "bg-priority/20 text-priority" : "bg-destructive/20 text-destructive") 
            : "bg-primary/10 text-primary"
        )}>
          <UserCircle2 className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-base truncate">{member.name}</h4>
            
            {isAdminMode && (
              <Dialog open={editOpen} onOpenChange={(open) => {
                setEditOpen(open);
                if (open) setEditName(member.name);
              }}>
                <DialogTrigger asChild>
                  <button 
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    title="Rename Member"
                  >
                    <Pencil className="w-3.5 h-3.5" />
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
          
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">Frequency:</span>
            <span className={cn(
              "text-xs font-bold px-1.5 py-0.5 rounded",
              isLowest 
                ? (isTerbatas ? "bg-priority/20 text-priority" : "bg-destructive/20 text-destructive") 
                : "bg-muted text-foreground"
            )}>
              {member.selectionFrequency}
            </span>
            {isLowest && (
              <Badge 
                className={cn(
                  "text-[10px] h-4 uppercase px-1",
                  isTerbatas ? "terbatas-priority-badge" : "priority-badge"
                )}
              >
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
