"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldAlert, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMembers } from "@/hooks/useMembers";
import { MemberCategory } from "@/types/member";

interface AdminPanelProps {
  onReset: () => Promise<void>;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
}

export function AdminPanel({ onReset, isAdminMode, setIsAdminMode }: AdminPanelProps) {
  const [password, setPassword] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<MemberCategory>("ANGGOTA");
  
  const { addMember } = useMembers();
  const { toast } = useToast();

  const handleLogin = () => {
    if (password === "admin123") {
      setIsAdminMode(true);
      toast({ title: "Admin Mode Enabled" });
    } else {
      toast({ variant: "destructive", title: "Invalid Password" });
    }
    setPassword("");
  };

  const handleReset = async () => {
    await onReset();
    toast({ title: "Data Reset", description: "All frequencies cleared." });
    setResetDialogOpen(false);
  };

  const handleAddMember = async () => {
    if (!newName.trim()) return;
    await addMember(newName, newType);
    toast({ title: "Member Added", description: `${newName} added to ${newType}.` });
    setNewName("");
    setAddDialogOpen(false);
  };

  if (!isAdminMode) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Admin Login
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
            <DialogDescription>Enter password to manage members and reset data.</DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <DialogFooter>
            <Button onClick={handleLogin}>Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex gap-2">
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTI">INTI</SelectItem>
                <SelectItem value="ANGGOTA">ANGGOTA</SelectItem>
                <SelectItem value="TERBATAS">TERBATAS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleAddMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Data?</DialogTitle>
            <DialogDescription>This will clear all selection counts. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset}>Confirm Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="ghost" size="sm" onClick={() => setIsAdminMode(false)}>
        Exit Admin
      </Button>
    </div>
  );
}
