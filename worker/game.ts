// Levenshtein distance function for fuzzy matching
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
// Hardcoded daily challenges
const dailyChallenges = [
  {
    id: 'day1',
    imageUrl: 'https://promptle.b-cdn.net/astronaut-cat.webp',
    prompt: 'A cute cat astronaut floating in space, whimsical, digital art, vibrant colors, detailed background of stars and galaxies',
  },
  {
    id: 'day2',
    imageUrl: 'https://promptle.b-cdn.net/steampunk-city.webp',
    prompt: 'A sprawling steampunk city at sunset, with airships, intricate clockwork towers, and glowing lights, oil painting, detailed and atmospheric',
  },
  {
    id: 'day3',
    imageUrl: 'https://promptle.b-cdn.net/enchanted-forest.webp',
    prompt: 'An enchanted forest path with glowing mushrooms and mystical creatures, fantasy, hyperrealistic, cinematic lighting, 4K',
  },
  {
    id: 'day4',
    imageUrl: 'https://promptle.b-cdn.net/cyberpunk-diner.webp',
    prompt: 'A lone figure in a rainy, neon-lit cyberpunk alleyway diner, Blade Runner aesthetic, moody, cinematic, photorealistic',
  },
  {
    id: 'day5',
    imageUrl: 'https://promptle.b-cdn.net/underwater-kingdom.webp',
    prompt: 'A majestic underwater kingdom with bioluminescent coral and ancient ruins, schools of fish swimming by, fantasy art, vibrant and detailed',
  },
  {
    id: 'day6',
    imageUrl: 'https://promptle.b-cdn.net/dragon-mountain.webp',
    prompt: 'A majestic dragon perched atop a snowy mountain peak at dawn, epic fantasy, digital painting, breathtaking view, dramatic lighting',
  },
  {
    id: 'day7',
    imageUrl: 'https://promptle.b-cdn.net/sushi-robots.webp',
    prompt: 'Tiny robots preparing intricate sushi on a wooden board, macro photography, detailed, whimsical, high resolution',
  },
];
// Enhanced scoring algorithm with fuzzy matching
export function scoreGuess(
  guess: string,
  originalPrompt: string,
  hintPenalty: number = 0,
  usedHints: string[] = []
): { score: number; matchedWords: string[]; totalWords: number; originalPrompt: string } {
  const normalize = (text: string) => text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/).filter(Boolean);
  const guessWords = [...new Set(normalize(guess))];
  const promptWords = [...new Set(normalize(originalPrompt))];
  const matchedWords = new Set<string>(usedHints.map(h => h.toLowerCase()));
  for (const guessWord of guessWords) {
    for (const promptWord of promptWords) {
      // Allow a Levenshtein distance of 1 for words longer than 3 chars
      const threshold = promptWord.length > 3 ? 1 : 0;
      if (levenshtein(guessWord, promptWord) <= threshold) {
        matchedWords.add(promptWord);
        break; // Move to the next guess word once a match is found
      }
    }
  }
  const baseScore = promptWords.length > 0 ? Math.round((matchedWords.size / promptWords.length) * 100) : 0;
  const finalScore = Math.max(0, baseScore - hintPenalty);
  return {
    score: Math.min(finalScore, 100),
    matchedWords: Array.from(matchedWords),
    totalWords: promptWords.length,
    originalPrompt,
  };
}
const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};
export function getDailyChallenge() {
  const dayOfYear = getDayOfYear();
  const challengeIndex = (dayOfYear - 1) % dailyChallenges.length;
  const challenge = dailyChallenges[challengeIndex];
  return {
    id: challenge.id,
    imageUrl: challenge.imageUrl,
  };
}
export function getChallengePrompt(challengeId: string): string | null {
    const challenge = dailyChallenges.find(c => c.id === challengeId);
    return challenge ? challenge.prompt : null;
}
export function getAllChallenges() {
    const dayOfYear = getDayOfYear();
    const daysElapsed = dayOfYear - 1;
    const challengesToShowCount = Math.min(daysElapsed, dailyChallenges.length);
    return dailyChallenges.slice(0, challengesToShowCount + 1);
}
export function getHintForChallenge(prompt: string, usedHints: string[]): string | null {
  const normalize = (text: string) => text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/).filter(Boolean);
  const promptWords = [...new Set(normalize(prompt))];
  const usedHintsLower = usedHints.map(h => h.toLowerCase());
  const availableHints = promptWords.filter(word => !usedHintsLower.includes(word));
  if (availableHints.length === 0) {
    return null; // No more hints to give
  }
  const randomIndex = Math.floor(Math.random() * availableHints.length);
  return availableHints[randomIndex];
}