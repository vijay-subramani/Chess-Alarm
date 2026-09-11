import { findMoveBetweenFens } from '@/components/board/boardUtils';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('findMoveBetweenFens', () => {
  it('should return e2e4 for the opening pawn push', () => {
    const after = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
    expect(findMoveBetweenFens(START, after)).toEqual({ from: 'e2', to: 'e4' });
  });

  it('should return null when positions match', () => {
    expect(findMoveBetweenFens(START, START)).toBeNull();
  });
});
