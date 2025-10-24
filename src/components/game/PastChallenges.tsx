import * as React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Play } from 'lucide-react';
interface PastChallengesProps {
  onPlayChallenge: () => void;
}
export function PastChallenges({ onPlayChallenge }: PastChallengesProps) {
  const pastChallenges = useGameStore((state) => state.pastChallenges);
  const fetchPastChallenges = useGameStore((state) => state.fetchPastChallenges);
  const playPastChallenge = useGameStore((state) => state.playPastChallenge);
  const gameStatus = useGameStore((state) => state.gameStatus);
  React.useEffect(() => {
    if (!pastChallenges) {
      fetchPastChallenges();
    }
  }, [fetchPastChallenges, pastChallenges]);
  const handlePlayClick = (challenge: { id: string; imageUrl: string; prompt: string }) => {
    playPastChallenge(challenge);
    onPlayChallenge();
  };
  const isLoading = gameStatus === 'loading' && !pastChallenges;
  const renderGrid = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <AspectRatio key={i} ratio={1}>
              <Skeleton className="w-full h-full rounded-lg" />
            </AspectRatio>
          ))}
        </div>
      );
    }
    if (!pastChallenges || pastChallenges.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No past challenges available yet. Check back tomorrow!</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pastChallenges.map((challenge, index) => (
          <Dialog key={challenge.id}>
            <DialogTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="cursor-pointer group"
              >
                <AspectRatio ratio={1} className="bg-muted rounded-lg overflow-hidden">
                  <img
                    src={challenge.imageUrl}
                    alt={`Past challenge ${challenge.id}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                </AspectRatio>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-brand-off-white">
              <DialogHeader>
                <DialogTitle className="font-display text-3xl text-brand-purple">Challenge from Day {index + 1}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <img src={challenge.imageUrl} alt={`Past challenge ${challenge.id}`} className="rounded-lg w-full h-auto object-contain" />
                <div>
                  <h3 className="font-semibold text-xl text-brand-purple mb-2">Original Prompt:</h3>
                  <p className="p-4 bg-brand-purple/5 rounded-lg text-brand-purple/90">{challenge.prompt}</p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => handlePlayClick(challenge)} className="bg-brand-pink hover:bg-brand-pink/90">
                  <Play className="mr-2 h-4 w-4" /> Play this Challenge
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    );
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="shadow-lg border-2 border-brand-purple/10 bg-brand-off-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-display text-brand-purple text-center">Past Challenges</CardTitle>
          <CardDescription className="text-center">Browse the gallery of previous daily images.</CardDescription>
        </CardHeader>
        <CardContent>{renderGrid()}</CardContent>
      </Card>
    </motion.div>
  );
}