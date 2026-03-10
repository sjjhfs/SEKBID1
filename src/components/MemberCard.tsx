
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Member } from "@/types/member";
import { cn } from "@/lib/utils";
import { Check, UserCircle2, Pencil, Trash2, RotateCcw, X } from "lucide-react";
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
  onSelect?: (id: string) => Promise<void>;
  isAdminMode: boolean;
  hideSelect?: boolean;
  onClick?: () => void;
}

export function MemberCard({ member, isLowest, onSelect, isAdminMode, hideSelect = false, onClick }: MemberCardProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(member.name);
  const [showUndoFrame, setShowUndoFrame] = useState(false);
  
  const { updateMember, deleteMember, undoSelection } = useMembers();
  const { toast } = useToast();
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSelect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelect) return;
    setIsSelecting(true);
    await onSelect(member.id);
    setTimeout(() => setIsSelecting(false), 800);
  };

  const handleUndo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (member.selectionFrequency <= 0) {
      toast({ variant: "destructive", title: "Cannot Undo", description: "Frequency is already zero." });
      setShowUndoFrame(false);
      return;
    }
    await undoSelection(member.id);
    toast({ title: "Selection Undone", description: `One selection removed for ${member.name}.` });
    setShowUndoFrame(false);
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

  const startLongPress = () => {
    if (hideSelect) return;
    longPressTimer.current = setTimeout(() => {
      setShowUndoFrame(true);
    }, 1000);
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (hideSelect) return;
    e.preventDefault();
    setShowUndoFrame(true);
  };

  const isTerbatas = member.type === 'TERBATAS';

  return (
    <div 
      onClick={onClick}
      onContextMenu={handleContextMenu}
      onMouseDown={startLongPress}
      onMouseUp={clearLongPress}
      onMouseLeave={clearLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={clearLongPress}
      className={cn(
        "member-row-frame group relative",
        isLowest && !isTerbatas && "priority-highlight border-destructive/30",
        isLowest && isTerbatas && "terbatas-priority-highlight border-priority/30",
        hideSelect && "!min-h-9 sm:!min-h-10 border-dashed bg-card/40 cursor-pointer hover:bg-card/60 px-2 sm:px-3"
      )}
      style={hideSelect ? { gridTemplateColumns: '24px 1fr 35px', gap: '0.25rem' } : undefined}
    >
      {!hideSelect && showUndoFrame && (
        <div className="absolute inset-0 z-10 bg-background/95 flex items-center justify-between px-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">Undo for {member.name}?</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setShowUndoFrame(false); }}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="destructive" className="h-8" onClick={handleUndo}>
              Undo
            </Button>
          </div>
        </div>
      )}

      {/* Column 1: Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isLowest 
          ? (isTerbatas ? "bg-priority/20 text-priority" : "bg-destructive/20 text-destructive") 
          : "bg-primary/10 text-primary",
        hideSelect && "w-6 h-6"
      )}>
        <UserCircle2 className={cn("w-5 h-5", hideSelect && "w-3.5 h-3.5")} />
      </div>

      {/* Column 2: Name */}
      <div className="flex items-center gap-1 min-w-0 pr-2">
        <h4 className={cn("font-semibold text-sm leading-tight break-words", !hideSelect && "sm:text-base")}>
          {member.name}
        </h4>
        {isAdminMode && !hideSelect && (
          <Dialog open={editOpen} onOpenChange={(open) => {
            setEditOpen(open);
            if (open) setEditName(member.name);
          }}>
            <DialogTrigger asChild>
              <button 
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors shrink-0"
                title="Rename Member"
                onClick={(e) => e.stopPropagation()}
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

      {!hideSelect ? (
        <>
          {/* Column 3: Priority Badge */}
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

          {/* Column 4: Frequency & Select Button */}
          <div className="flex items-center justify-end gap-2 ml-auto">
            <span className={cn(
              "text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded tabular-nums shrink-0",
              isLowest 
                ? (isTerbatas ? "bg-priority/20 text-priority" : "bg-destructive/20 text-destructive") 
                : "bg-muted text-foreground"
            )}>
              {member.selectionFrequency}
            </span>
            <Button
              onClick={handleSelect}
              disabled={isSelecting}
              size="sm"
              className={cn(
                "h-7 sm:h-8 w-14 sm:w-16 relative overflow-hidden transition-all duration-300 px-1",
                isSelecting ? "bg-green-600 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
              )}
            >
              <span className={cn(
                "text-[10px] sm:text-xs font-bold",
                isSelecting ? "scale-0 opacity-0" : "scale-100 opacity-100"
              )}>
                Select
              </span>
              {isSelecting && (
                <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-50">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
              )}
            </Button>
          </div>
        </>
      ) : (
        /* Simple Frequency for suggestions view */
        <div className="text-center shrink-0">
          <span className={cn(
            "text-[10px] font-bold px-1 py-0 rounded tabular-nums",
            isLowest 
              ? (isTerbatas ? "bg-priority/20 text-priority" : "bg-destructive/20 text-destructive") 
              : "bg-muted text-foreground"
          )}>
            {member.selectionFrequency}
          </span>
        </div>
      )}
    </div>
  );
}
