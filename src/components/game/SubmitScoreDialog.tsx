import * as React from 'react';
import { useGameStore } from '@/lib/game-store';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
export function SubmitScoreDialog() {
  const isSubmittingScore = useGameStore(state => state.isSubmittingScore);
  const closeSubmitScoreDialog = useGameStore(state => state.closeSubmitScoreDialog);
  const submitScore = useGameStore(state => state.submitScore);
  const scoreValue = useGameStore(state => state.score?.score);
  const [name, setName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || scoreValue === undefined) return;
    setIsSaving(true);
    try {
      await submitScore(name.trim());
    } finally {
      setIsSaving(false);
      setName('');
    }
  };
  return (
    <Dialog open={isSubmittingScore} onOpenChange={(open) => !open && closeSubmitScoreDialog()}>
      <DialogContent className="sm:max-w-[425px] bg-brand-off-white text-brand-purple">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-display text-center">Great Score!</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground pt-2">
              You scored <span className="font-bold text-brand-pink">{scoreValue}%</span>! Add your name to today's leaderboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Enter your name"
                maxLength={20}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeSubmitScoreDialog}>Skip</Button>
            <Button type="submit" disabled={!name.trim() || isSaving} className="bg-brand-pink hover:bg-brand-pink/90">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit to Leaderboard
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}