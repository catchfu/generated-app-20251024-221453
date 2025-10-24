import * as React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Trophy } from 'lucide-react';
export function Leaderboard() {
  const leaderboard = useGameStore(state => state.leaderboard);
  const fetchLeaderboard = useGameStore(state => state.fetchLeaderboard);
  const gameStatus = useGameStore(state => state.gameStatus);
  React.useEffect(() => {
    if (!leaderboard) {
      fetchLeaderboard();
    }
  }, [fetchLeaderboard, leaderboard]);
  const isLoading = gameStatus === 'loading' && !leaderboard;
  const renderLeaderboard = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      );
    }
    if (!leaderboard || leaderboard.length === 0) {
      return (
        <div className="text-center py-10">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No scores submitted for today yet.</p>
          <p className="text-sm text-muted-foreground/80">Be the first to get on the board!</p>
        </div>
      );
    }
    return (
      <ol className="space-y-3">
        {leaderboard.map((entry, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              index === 0 ? 'bg-amber-100' : 'bg-brand-purple/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`font-bold text-lg w-6 text-center ${
                index < 3 ? 'text-amber-500' : 'text-brand-purple/60'
              }`}>
                {index === 0 ? <Crown className="h-6 w-6 mx-auto fill-amber-400 text-amber-500" /> : index + 1}
              </span>
              <span className="font-medium text-brand-purple">{entry.name}</span>
            </div>
            <span className="font-bold text-xl text-brand-pink">{entry.score}%</span>
          </motion.li>
        ))}
      </ol>
    );
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="shadow-lg border-2 border-brand-purple/10 bg-brand-off-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-display text-brand-purple text-center">Today's High Scores</CardTitle>
          <CardDescription className="text-center">See who's at the top of their game!</CardDescription>
        </CardHeader>
        <CardContent>
          {renderLeaderboard()}
        </CardContent>
      </Card>
    </motion.div>
  );
}