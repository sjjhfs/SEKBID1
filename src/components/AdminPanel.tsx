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
import { ShieldAlert, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminPanel({ onReset }: { onReset: () => Promise<void> }) {
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    if (password === "admin123") {
      await onReset();
      toast({
        title: "Success",
        description: "All frequencies have been reset to zero.",
      });
      setOpen(false);
      setPassword("");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid admin password.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive transition-colors">
          <ShieldAlert className="w-4 h-4 mr-2" />
          Admin Reset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Reset All Data
          </DialogTitle>
          <DialogDescription>
            This will set all member selection counts back to zero. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReset()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleReset}>Confirm Reset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}