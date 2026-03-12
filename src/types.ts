export type GraterMode = 'fine' | 'coarse' | 'zest';

export interface ModeConfig {
  name: string;
  symbol: string;
  description: string;
  holeSize: number;
  holeSpacing: number;
  holeShape: 'circle' | 'slot';
  cheeseColor: string;
  gratedColor: string;
  particleScale: number;
  spawnRate: number;
}

export const MODE_CONFIGS: Record<GraterMode, ModeConfig> = {
  fine: {
    name: 'Fine',
    symbol: '•••',
    description: 'Perfect for Parmesan & hard cheeses',
    holeSize: 8,
    holeSpacing: 16,
    holeShape: 'circle',
    cheeseColor: '#f5c518',
    gratedColor: '#ffe07a',
    particleScale: 0.025,
    spawnRate: 0.03,
  },
  coarse: {
    name: 'Coarse',
    symbol: '◉◉',
    description: 'Great for Cheddar & softer cheeses',
    holeSize: 22,
    holeSpacing: 34,
    holeShape: 'circle',
    cheeseColor: '#e8920a',
    gratedColor: '#f0a030',
    particleScale: 0.07,
    spawnRate: 0.07,
  },
  zest: {
    name: 'Zest',
    symbol: '≡≡',
    description: 'Ideal for citrus zest & chocolate',
    holeSize: 5,
    holeSpacing: 13,
    holeShape: 'slot',
    cheeseColor: '#ffd700',
    gratedColor: '#fff0a0',
    particleScale: 0.02,
    spawnRate: 0.025,
  },
};
