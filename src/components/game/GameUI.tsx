import * as React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, Lightbulb } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export function GameUI() {
  const [guess, setGuess] = React.useState('');
  const activeChallenge = useGameStore(state => state.activeChallenge);
  const gameStatus = useGameStore(state => state.gameStatus);
  const submitGuess = useGameStore(state => state.submitGuess);
  const getHint = useGameStore(state => state.getHint);
  const hints = useGameStore(state => state.hints);
  const hintPenalty = useGameStore(state => state.hintPenalty);
  React.useEffect(() => {
    // Clear input when challenge changes or when trying again
    setGuess('');
  }, [activeChallenge, gameStatus]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim() && gameStatus === 'playing') {
      submitGuess(guess.trim());
    }
  };
  const handleHintClick = () => {
    getHint();
  };
  const isLoading = gameStatus === 'loading';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="overflow-hidden shadow-lg border-2 border-brand-purple/10 bg-brand-off-white/80 backdrop-blur-sm">
        <CardHeader>
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
            {activeChallenge?.imageUrl ? (
              <img
                src={activeChallenge.imageUrl}
                alt="AI generated daily challenge"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <Skeleton className="w-full h-full" />
            )}
          </AspectRatio>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <CardTitle className="text-2xl font-sans font-semibold text-center mb-4 text-brand-purple">
              What was the prompt?
            </CardTitle>
            {hints.length > 0 && (
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                <span className="text-sm text-muted-foreground self-center">Hints:</span>
                {hints.map((hint, index) => (
                  <Badge key={index} variant="secondary" className="text-md bg-amber-100 text-amber-800">
                    {hint}
                  </Badge>
                ))}
              </div>
            )}
            <Textarea
              placeholder="e.g., A cute cat astronaut floating in space, whimsical, digital art..."
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={isLoading}
              className="min-h-[100px] text-base ring-offset-background focus-visible:ring-brand-pink"
            />
          </CardContent>
          <CardFooter className="flex-col sm:flex-row gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleHintClick}
                    disabled={isLoading}
                    className="w-full sm:w-auto border-amber-400 text-amber-600 hover:bg-amber-400 hover:text-white"
                  >
                    <Lightbulb className="mr-2 h-5 w-5" /> Get a Hint (-5%)
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reveal a random word from the prompt for a score penalty.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              type="submit"
              disabled={isLoading || !guess.trim()}
              className="w-full sm:flex-1 text-lg font-bold bg-brand-pink hover:bg-brand-pink/90 text-primary-foreground transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              Guess {hintPenalty > 0 && `(-${hintPenalty}%)`}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}