export type HintLevel = 'none' | 'piece' | 'target' | 'text';

export function hintLevelFromFailures(failures: number, hintAfter: number): HintLevel {
  if (failures < hintAfter) return 'none';
  if (failures === hintAfter) return 'piece';
  if (failures === hintAfter + 1) return 'target';
  return 'text';
}

/** Squares for the next expected player move at `moveIndex` in the solution line. */
export function hintSquaresForMove(
  solutionUci: string[],
  moveIndex: number,
): { from: string; to: string } | null {
  const uci = solutionUci[moveIndex];
  if (!uci || uci.length < 4) return null;
  return { from: uci.slice(0, 2), to: uci.slice(2, 4) };
}

export function formatSquare(square: string): string {
  return square.toUpperCase();
}

/** Banner copy shown above the board for each hint tier. */
export function hintBannerText(
  level: HintLevel,
  move: { from: string; to: string } | null,
  puzzleText: string,
): string {
  if (!move) return '';

  const from = formatSquare(move.from);
  const to = formatSquare(move.to);

  if (level === 'text') {
    return puzzleText || `Play ${from} → ${to}.`;
  }
  if (level === 'target') {
    return `Move ${from} to ${to}.`;
  }
  return `Move the piece on ${from}.`;
}
