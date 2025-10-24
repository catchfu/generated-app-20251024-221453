import * as React from 'react';
import { motion } from 'framer-motion';
import { Share2, Repeat, RefreshCw } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
export function ScoreDisplay() {
const scoreResult = useGameStore(state => state.score);
const startNewGame = useGameStore(state => state.startNewGame);
const tryAgain = useGameStore(state => state.tryAgain);
const gameMode = useGameStore(state => state.gameMode);
  const [progress, setProgress] = React.useState(0);
  const { width, height } = useWindowSize();
  React.useEffect(() => {
    if (scoreResult?.score) {
      const timer = setTimeout(() => setProgress(scoreResult.score), 500);
      return () => clearTimeout(timer);
    }
  }, [scoreResult?.score]);
  if (!scoreResult) return null;
  const { score, matchedWords, totalWords, originalPrompt } = scoreResult;
  const handleShare = () => {
    const shareText = `I scored ${score}% on today's Promptle! 🎨\nI guessed ${matchedWords.length}/${totalWords} words correctly.\nCan you beat my score?\n#PromptleGame`;
    navigator.clipboard.writeText(shareText);
    toast.success('Results copied to clipboard!');
  };  
  return (
    <>
      {score > 75 && <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="text-center shadow-lg border-2 border-brand-purple/10 bg-brand-off-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-4xl font-display text-brand-purple">Your Score</CardTitle>
            <CardDescription className="text-lg">You matched {matchedWords.length} out of {totalWords} unique words!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative h-12">
              <Progress value={progress} className="h-full [&>*]:bg-brand-pink transition-all duration-1000 ease-out" />
              <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white drop-shadow-md">
                {score}%
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-brand-purple">The Original Prompt:</h3>
              <div className="flex flex-wrap justify-center gap-2 p-4 bg-brand-purple/5 rounded-lg">
                {originalPrompt.split(/(\s+|[.,!?;:()"])/).filter(Boolean).map((word, index) => {
                  const normalizedWord = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
                  const isMatched = matchedWords.includes(normalizedWord);
                  return (
                    <span
                      key={index}
                      className={`transition-all duration-300 ${isMatched && normalizedWord ? 'text-brand-pink font-bold' : 'text-muted-foreground'}`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button onClick={tryAgain} variant="outline" className="w-full border-amber-400 text-amber-600 hover:bg-amber-400 hover:text-white transition-transform hover:scale-105 active:scale-95">
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button onClick={handleShare} className="w-full bg-brand-purple hover:bg-brand-purple/90 transition-transform hover:scale-105 active:scale-95">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
{gameMode !== 'daily' && (
  <Button onClick={startNewGame} variant="outline" className="w-full border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white transition-transform hover:scale-105 active:scale-95">
    <Repeat className="mr-2 h-4 w-4" /> Play Daily Challenge
  </Button>
)}
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
}