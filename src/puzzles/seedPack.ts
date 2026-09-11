import type { Puzzle } from '@/types/puzzle';

/**
 * Bundled puzzle library — 20 puzzles for each mate-in x difficulty bucket, from the Lichess
 * public puzzle database (CC0). Regenerate with `npx tsx scripts/verify-puzzle-sync.ts --emit`.
 *
 * An alarm has to show a puzzle with no usable network. Lichess rate limits per IP and mobile
 * carriers place many subscribers behind a single address, so a fresh install can be throttled
 * by traffic that was never ours — leaving the ring screen with nothing to show.
 */
export const seedPuzzlePack: Puzzle[] = [
  {
    "id": "lichess-3dzu0",
    "fen": "r1bq1rk1/1p2n1b1/p1p1pp2/2p2PN1/4P2Q/2NP4/PPP3PP/R4RK1 w - - 0 14",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "h4h7"
    ],
    "hintPieceSquare": "h4",
    "hintTargetSquare": "h7",
    "hintText": "Find the mate in 1.",
    "rating": 794
  },
  {
    "id": "lichess-6Kkt4",
    "fen": "2r2rk1/p1b2pp1/q3p2p/2Pp4/1P4n1/P1Q2bP1/1B3PBP/R1R3K1 w - - 0 26",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "c3g7"
    ],
    "hintPieceSquare": "c3",
    "hintTargetSquare": "g7",
    "hintText": "Find the mate in 1.",
    "rating": 790
  },
  {
    "id": "lichess-9sZzw",
    "fen": "r1bq2rk/pp4pp/1np2n1N/5p2/3P4/B5P1/P3PPBP/R4RK1 w - - 0 18",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "h6f7"
    ],
    "hintPieceSquare": "h6",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 1.",
    "rating": 790
  },
  {
    "id": "lichess-ayHVw",
    "fen": "k3r2r/1p4pp/p2b1p1n/1NQ2P2/8/4P3/PPP2P1P/2KB3q w - - 0 26",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "c5a7"
    ],
    "hintPieceSquare": "c5",
    "hintTargetSquare": "a7",
    "hintText": "Find the mate in 1.",
    "rating": 986
  },
  {
    "id": "lichess-BkHqy",
    "fen": "3q1b1r/N2kpp2/1p2b1p1/2p1P1p1/8/3P1QP1/PPP3nP/R4RK1 w - - 0 18",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "f3c6"
    ],
    "hintPieceSquare": "f3",
    "hintTargetSquare": "c6",
    "hintText": "Find the mate in 1.",
    "rating": 1007
  },
  {
    "id": "lichess-BSXqI",
    "fen": "r1b1k2r/pp3ppp/2p1p3/7q/2PPp2B/Q3P3/5PPP/2R2RK1 w kq - 2 17",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "a3e7"
    ],
    "hintPieceSquare": "a3",
    "hintTargetSquare": "e7",
    "hintText": "Find the mate in 1.",
    "rating": 740
  },
  {
    "id": "lichess-DBkXS",
    "fen": "8/5pkp/q3pb2/5p2/3P4/1N4PK/2Q2P1P/8 b - - 0 42",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "a6f1"
    ],
    "hintPieceSquare": "a6",
    "hintTargetSquare": "f1",
    "hintText": "Find the mate in 1.",
    "rating": 720
  },
  {
    "id": "lichess-EVkpx",
    "fen": "r1bq1k1r/ppp1n1pp/2np1p2/7B/4P3/1QP2N2/P4PPP/R1B1K2R w KQ - 0 11",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "b3f7"
    ],
    "hintPieceSquare": "b3",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 1.",
    "rating": 721
  },
  {
    "id": "lichess-EWVYT",
    "fen": "rn1q2rk/bb4pp/8/ppp3N1/3P4/P1P5/BP3PPP/R1B3K1 w - - 0 19",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "g5f7"
    ],
    "hintPieceSquare": "g5",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 1.",
    "rating": 707
  },
  {
    "id": "lichess-gOkLW",
    "fen": "6k1/5p2/pr1b4/7R/1P1N4/2PR3P/5PP1/r3N1K1 b - - 2 32",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "a1e1"
    ],
    "hintPieceSquare": "a1",
    "hintTargetSquare": "e1",
    "hintText": "Find the mate in 1.",
    "rating": 741
  },
  {
    "id": "lichess-mbWTy",
    "fen": "3qkn1r/1b2b1pp/p2pP3/4p1P1/1pr1P3/2N1B3/PPP2Q1P/2KRR3 w k - 1 20",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "f2f7"
    ],
    "hintPieceSquare": "f2",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 1.",
    "rating": 996
  },
  {
    "id": "lichess-niE1u",
    "fen": "r2qk2r/1ppb1n1p/p3p3/3pPN1p/5PP1/BP5P/P1PK4/R6R w kq - 0 19",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "f5g7"
    ],
    "hintPieceSquare": "f5",
    "hintTargetSquare": "g7",
    "hintText": "Find the mate in 1.",
    "rating": 796
  },
  {
    "id": "lichess-NSdSC",
    "fen": "r1bR1N2/pp3pkp/4p3/P7/1qP2B2/8/2Q2PPP/6K1 b - - 2 25",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "b4e1"
    ],
    "hintPieceSquare": "b4",
    "hintTargetSquare": "e1",
    "hintText": "Find the mate in 1.",
    "rating": 746
  },
  {
    "id": "lichess-P9Zyv",
    "fen": "r1b1kb1r/pp3ppp/2p3n1/4P1B1/4P3/1PN2N2/P1P2qPP/R2Q3K w kq - 0 14",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "d1d8"
    ],
    "hintPieceSquare": "d1",
    "hintTargetSquare": "d8",
    "hintText": "Find the mate in 1.",
    "rating": 748
  },
  {
    "id": "lichess-RvLHX",
    "fen": "rnb1k2r/p4ppp/2p5/1p1pp3/4PqP1/1B1P1N1K/PPP4P/RN1Q3R b kq - 0 12",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "f4g4"
    ],
    "hintPieceSquare": "f4",
    "hintTargetSquare": "g4",
    "hintText": "Find the mate in 1.",
    "rating": 998
  },
  {
    "id": "lichess-u3WLq",
    "fen": "2Q5/p4k2/6p1/4Bp2/5P2/5r2/6rP/2K5 b - - 0 49",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "f3f1"
    ],
    "hintPieceSquare": "f3",
    "hintTargetSquare": "f1",
    "hintText": "Find the mate in 1.",
    "rating": 786
  },
  {
    "id": "lichess-VKYxM",
    "fen": "1r2k2r/p4ppp/b3p3/1pbqP3/3N1PPn/2PB4/PP2QB1P/R4RK1 b k - 6 17",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "d5g2"
    ],
    "hintPieceSquare": "d5",
    "hintTargetSquare": "g2",
    "hintText": "Find the mate in 1.",
    "rating": 782
  },
  {
    "id": "lichess-VYanJ",
    "fen": "r2q1k2/p2b3p/2pN1p2/1p2rBp1/3N4/1Q2n1PP/PP4P1/3R2K1 w - - 14 27",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "b3f7"
    ],
    "hintPieceSquare": "b3",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 1.",
    "rating": 993
  },
  {
    "id": "lichess-WuPJX",
    "fen": "2kr3r/1pp2p2/p5q1/2Q3pp/R3N3/6P1/PPP3P1/1K3B1R b - - 0 21",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "d8d1"
    ],
    "hintPieceSquare": "d8",
    "hintTargetSquare": "d1",
    "hintText": "Find the mate in 1.",
    "rating": 783
  },
  {
    "id": "lichess-xUzFe",
    "fen": "5rk1/2R4p/3pb1p1/1p5Q/4pq2/PP1pN1RP/3r2PK/8 w - - 0 30",
    "mateIn": 1,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "h5h7"
    ],
    "hintPieceSquare": "h5",
    "hintTargetSquare": "h7",
    "hintText": "Find the mate in 1.",
    "rating": 1008
  },
  {
    "id": "lichess-9ZrhC",
    "fen": "Q4bkr/p2np1pp/3p4/1p5P/3P4/8/P4PP1/1qB3K1 w - - 0 20",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "a8d5",
      "d5e6"
    ],
    "replyUci": [
      "e7e6"
    ],
    "hintPieceSquare": "a8",
    "hintTargetSquare": "d5",
    "hintText": "Find the mate in 2.",
    "rating": 922
  },
  {
    "id": "lichess-c6KWj",
    "fen": "r6k/1pp4p/3p1R2/p2P3q/2P3b1/3r4/PP3Q1P/2K3R1 w - - 0 26",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "f6f8",
      "f2f8"
    ],
    "replyUci": [
      "a8f8"
    ],
    "hintPieceSquare": "f6",
    "hintTargetSquare": "f8",
    "hintText": "Find the mate in 2.",
    "rating": 616
  },
  {
    "id": "lichess-CfpfY",
    "fen": "k7/ppp5/8/1QrP1q2/1K4p1/6P1/8/8 w - - 0 45",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "b5e8",
      "e8c8"
    ],
    "replyUci": [
      "f5c8"
    ],
    "hintPieceSquare": "b5",
    "hintTargetSquare": "e8",
    "hintText": "Find the mate in 2.",
    "rating": 913
  },
  {
    "id": "lichess-cLz0F",
    "fen": "r4r1k/ppp4p/2n1Bqp1/3P2N1/4Q3/2P5/P4PPP/R1B3K1 b - - 0 19",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "f6f2",
      "f2f1"
    ],
    "replyUci": [
      "g1h1"
    ],
    "hintPieceSquare": "f6",
    "hintTargetSquare": "f2",
    "hintText": "Find the mate in 2.",
    "rating": 642
  },
  {
    "id": "lichess-eMzzX",
    "fen": "4K2Q/8/4k3/8/8/8/5q2/8 b - - 3 72",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "f2f7",
      "f7d7"
    ],
    "replyUci": [
      "e8d8"
    ],
    "hintPieceSquare": "f2",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 2.",
    "rating": 948
  },
  {
    "id": "lichess-hBmrq",
    "fen": "r3r1k1/pp1R1pp1/n1p5/2b3pP/5QB1/1P2P1P1/q1P5/2K1R3 w - - 0 22",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "f4f7",
      "f7g7"
    ],
    "replyUci": [
      "g8h8"
    ],
    "hintPieceSquare": "f4",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 2.",
    "rating": 948
  },
  {
    "id": "lichess-ieVkE",
    "fen": "r3k2r/ppp2pp1/3p4/2b1p3/2BnN1p1/3PB1N1/PPP2PPq/R2QRK2 b kq - 6 13",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "h2h1",
      "h8h1"
    ],
    "replyUci": [
      "g3h1"
    ],
    "hintPieceSquare": "h2",
    "hintTargetSquare": "h1",
    "hintText": "Find the mate in 2.",
    "rating": 917
  },
  {
    "id": "lichess-j7hkk",
    "fen": "B4rk1/5p1p/p2bpp2/2p5/q4P1N/1pPPQ1P1/1P5P/2KRR3 b - - 0 22",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "a4a1",
      "a1b2"
    ],
    "replyUci": [
      "c1d2"
    ],
    "hintPieceSquare": "a4",
    "hintTargetSquare": "a1",
    "hintText": "Find the mate in 2.",
    "rating": 931
  },
  {
    "id": "lichess-JcRus",
    "fen": "r3r1k1/ppq2Rp1/8/6Q1/2p5/1B1P2bP/PPP3P1/R1B4K b - - 0 21",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "e8e1",
      "e1f1"
    ],
    "replyUci": [
      "f7f1"
    ],
    "hintPieceSquare": "e8",
    "hintTargetSquare": "e1",
    "hintText": "Find the mate in 2.",
    "rating": 948
  },
  {
    "id": "lichess-o2FqE",
    "fen": "6k1/pp3pp1/2p2n1p/3p4/1P1P2QP/P2B1P1K/2P2q2/8 w - - 2 27",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "g4c8",
      "c8e8"
    ],
    "replyUci": [
      "f6e8"
    ],
    "hintPieceSquare": "g4",
    "hintTargetSquare": "c8",
    "hintText": "Find the mate in 2.",
    "rating": 949
  },
  {
    "id": "lichess-OFOv0",
    "fen": "r3k2r/1p3ppp/p3p3/q2pN1b1/3Pn3/2PK1Q1P/2P2PP1/3R3R w kq - 0 18",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "f3f7",
      "f7d7"
    ],
    "replyUci": [
      "e8d8"
    ],
    "hintPieceSquare": "f3",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 2.",
    "rating": 912
  },
  {
    "id": "lichess-pzUJh",
    "fen": "r2k1r2/q4p1R/2p1PP2/2p5/2Qp1b2/1P6/1BP1P3/3K3R b - - 2 29",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "a7a1",
      "a8a1"
    ],
    "replyUci": [
      "b2a1"
    ],
    "hintPieceSquare": "a7",
    "hintTargetSquare": "a1",
    "hintText": "Find the mate in 2.",
    "rating": 622
  },
  {
    "id": "lichess-RS4T2",
    "fen": "7k/R7/2p1R2p/6p1/2r5/6P1/P4r1P/7K b - - 1 34",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "c4c1",
      "c1e1"
    ],
    "replyUci": [
      "e6e1"
    ],
    "hintPieceSquare": "c4",
    "hintTargetSquare": "c1",
    "hintText": "Find the mate in 2.",
    "rating": 925
  },
  {
    "id": "lichess-VLKvE",
    "fen": "3r2k1/p4p1p/2pr1Qp1/1p6/8/P1P1R2P/3q1PP1/4R1K1 w - - 6 34",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "e3e8",
      "e1e8"
    ],
    "replyUci": [
      "d8e8"
    ],
    "hintPieceSquare": "e3",
    "hintTargetSquare": "e8",
    "hintText": "Find the mate in 2.",
    "rating": 951
  },
  {
    "id": "lichess-VnFJM",
    "fen": "3r1k2/2R4p/1pB1p1p1/2p1P3/8/1Pn5/5PPP/3rRK2 b - - 2 29",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "d1e1",
      "d8d1"
    ],
    "replyUci": [
      "f1e1"
    ],
    "hintPieceSquare": "d1",
    "hintTargetSquare": "e1",
    "hintText": "Find the mate in 2.",
    "rating": 642
  },
  {
    "id": "lichess-vp3pd",
    "fen": "8/8/3R3p/4r3/5Npk/8/6PK/8 b - - 3 52",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "g4g3",
      "e5e1"
    ],
    "replyUci": [
      "h2g1"
    ],
    "hintPieceSquare": "g4",
    "hintTargetSquare": "g3",
    "hintText": "Find the mate in 2.",
    "rating": 924
  },
  {
    "id": "lichess-vZDx5",
    "fen": "8/k7/pq4p1/1P6/7p/3Q3P/2r2PP1/1R4K1 b - - 4 41",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "b6f2",
      "f2g2"
    ],
    "replyUci": [
      "g1h2"
    ],
    "hintPieceSquare": "b6",
    "hintTargetSquare": "f2",
    "hintText": "Find the mate in 2.",
    "rating": 930
  },
  {
    "id": "lichess-y5bAt",
    "fen": "1k3r1r/pp4p1/2p5/2P1q3/4N1Q1/8/P3RPP1/4R1K1 b - - 1 28",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "e5h2",
      "h2h1"
    ],
    "replyUci": [
      "g1f1"
    ],
    "hintPieceSquare": "e5",
    "hintTargetSquare": "h2",
    "hintText": "Find the mate in 2.",
    "rating": 682
  },
  {
    "id": "lichess-Y5QNz",
    "fen": "3q3k/r6p/p2p2pQ/2p1n3/1pB1P1P1/1P6/PP6/2K2R2 w - - 1 25",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "f1f8",
      "h6f8"
    ],
    "replyUci": [
      "d8f8"
    ],
    "hintPieceSquare": "f1",
    "hintTargetSquare": "f8",
    "hintText": "Find the mate in 2.",
    "rating": 936
  },
  {
    "id": "lichess-zgvwP",
    "fen": "3r1k2/p4p2/N1P1pP2/4P3/6p1/4Q1Pp/Prq4P/4R2K w - - 1 39",
    "mateIn": 2,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "e3h6",
      "h6g7"
    ],
    "replyUci": [
      "f8g8"
    ],
    "hintPieceSquare": "e3",
    "hintTargetSquare": "h6",
    "hintText": "Find the mate in 2.",
    "rating": 895
  },
  {
    "id": "lichess-3Y73i",
    "fen": "5r1k/p1pQ2pp/3p1q2/8/8/1P5B/P4RPP/2R3K1 b - - 0 25",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "f6f2",
      "f2f1",
      "f8f1"
    ],
    "replyUci": [
      "g1h1",
      "c1f1"
    ],
    "hintPieceSquare": "f6",
    "hintTargetSquare": "f2",
    "hintText": "Find the mate in 3.",
    "rating": 690
  },
  {
    "id": "lichess-57XdG",
    "fen": "5r1k/q5pp/p7/1p6/4Q3/P1P5/1P3PPP/R5K1 b - - 0 26",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "a7f2",
      "f2f1",
      "f8f1"
    ],
    "replyUci": [
      "g1h1",
      "a1f1"
    ],
    "hintPieceSquare": "a7",
    "hintTargetSquare": "f2",
    "hintText": "Find the mate in 3.",
    "rating": 841
  },
  {
    "id": "lichess-8vpTE",
    "fen": "4r1k1/b1p3pp/p1p1rP2/1q1p4/6P1/1PP2QB1/P2R1P1P/R5K1 b - - 0 24",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "e6e1",
      "e8e1",
      "b5f1"
    ],
    "replyUci": [
      "a1e1",
      "g1g2"
    ],
    "hintPieceSquare": "e6",
    "hintTargetSquare": "e1",
    "hintText": "Find the mate in 3.",
    "rating": 910
  },
  {
    "id": "lichess-95KOH",
    "fen": "3R4/2B2ppk/1P3n1p/8/7P/1r6/6PK/8 b - - 7 42",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "f6g4",
      "b3b1",
      "b1d1"
    ],
    "replyUci": [
      "h2g1",
      "d8d1"
    ],
    "hintPieceSquare": "f6",
    "hintTargetSquare": "g4",
    "hintText": "Find the mate in 3.",
    "rating": 860
  },
  {
    "id": "lichess-CLtsY",
    "fen": "2r3k1/Q4ppp/2p5/2p1r3/P2q4/1P4PP/8/1R3R1K w - - 0 39",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "a7f7",
      "f7f8",
      "f1f8"
    ],
    "replyUci": [
      "g8h8",
      "c8f8"
    ],
    "hintPieceSquare": "a7",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 3.",
    "rating": 895
  },
  {
    "id": "lichess-clxpo",
    "fen": "2r3k1/5ppp/pq2p3/3pb3/6P1/1N3Q1P/PP4K1/5R2 w - - 0 31",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "f3f7",
      "f7f8",
      "f1f8"
    ],
    "replyUci": [
      "g8h8",
      "c8f8"
    ],
    "hintPieceSquare": "f3",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 3.",
    "rating": 798
  },
  {
    "id": "lichess-FdkrZ",
    "fen": "r6k/p5p1/6rp/2p1Rp2/3p1P2/1QPP4/PP3P1q/3KR3 w - - 0 27",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "e5e8",
      "e1e8",
      "b3g8"
    ],
    "replyUci": [
      "a8e8",
      "h8h7"
    ],
    "hintPieceSquare": "e5",
    "hintTargetSquare": "e8",
    "hintText": "Find the mate in 3.",
    "rating": 944
  },
  {
    "id": "lichess-I4CSO",
    "fen": "6k1/p5p1/1p4p1/2p5/3r4/5R2/r4PK1/4R3 w - - 0 37",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "e1e8",
      "f3h3",
      "h3h4"
    ],
    "replyUci": [
      "g8h7",
      "d4h4"
    ],
    "hintPieceSquare": "e1",
    "hintTargetSquare": "e8",
    "hintText": "Find the mate in 3.",
    "rating": 837
  },
  {
    "id": "lichess-LRw2d",
    "fen": "7k/6pp/2r5/2P5/1QN5/P6P/2qr1PP1/6K1 w - - 0 38",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "b4b8",
      "b8c8",
      "c8d8"
    ],
    "replyUci": [
      "c6c8",
      "d2d8"
    ],
    "hintPieceSquare": "b4",
    "hintTargetSquare": "b8",
    "hintText": "Find the mate in 3.",
    "rating": 589
  },
  {
    "id": "lichess-N2hNV",
    "fen": "4r1k1/pp3pp1/2p4p/5P2/2N2n2/1B1r4/P4R1P/3R3K b - - 0 26",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "d3d1",
      "e8e1",
      "e1f1"
    ],
    "replyUci": [
      "b3d1",
      "f2f1"
    ],
    "hintPieceSquare": "d3",
    "hintTargetSquare": "d1",
    "hintText": "Find the mate in 3.",
    "rating": 948
  },
  {
    "id": "lichess-NnNMW",
    "fen": "r1b1nr2/ppp1Nppk/3p4/4P3/2B2P2/8/PPP2q2/2K3R1 w - - 0 20",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "g1h1",
      "h1h3",
      "h3h4"
    ],
    "replyUci": [
      "c8h3",
      "f2h4"
    ],
    "hintPieceSquare": "g1",
    "hintTargetSquare": "h1",
    "hintText": "Find the mate in 3.",
    "rating": 944
  },
  {
    "id": "lichess-nPfMA",
    "fen": "6k1/p3rppp/1p1rp1q1/8/8/1PP2Q2/P4PPP/4R1K1 w - - 0 25",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "f3a8",
      "a8d8",
      "d8e8"
    ],
    "replyUci": [
      "d6d8",
      "e7e8"
    ],
    "hintPieceSquare": "f3",
    "hintTargetSquare": "a8",
    "hintText": "Find the mate in 3.",
    "rating": 929
  },
  {
    "id": "lichess-qVUFX",
    "fen": "2r3k1/p1p2ppp/8/3p2q1/8/PP2rQPP/7K/R4R2 w - - 0 25",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "f3f7",
      "f7f8",
      "f1f8"
    ],
    "replyUci": [
      "g8h8",
      "c8f8"
    ],
    "hintPieceSquare": "f3",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 3.",
    "rating": 784
  },
  {
    "id": "lichess-rcq9u",
    "fen": "r5k1/pp3rpp/8/8/3q4/1Q6/PP4PP/5R1K w - - 0 26",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "b3f7",
      "f7f8",
      "f1f8"
    ],
    "replyUci": [
      "g8h8",
      "a8f8"
    ],
    "hintPieceSquare": "b3",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 3.",
    "rating": 902
  },
  {
    "id": "lichess-sdgIZ",
    "fen": "6k1/5p1p/6pP/pp3b2/2p1r3/P1qp2Q1/6P1/1B2R2K w - - 0 36",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "g3b8",
      "b8c8",
      "e1e8"
    ],
    "replyUci": [
      "f5c8",
      "e4e8"
    ],
    "hintPieceSquare": "g3",
    "hintTargetSquare": "b8",
    "hintText": "Find the mate in 3.",
    "rating": 900
  },
  {
    "id": "lichess-SxcIj",
    "fen": "r4r2/1p5k/p5pp/3p3q/4p1b1/6Q1/PBP3R1/1R4K1 w - - 0 29",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "g3c7",
      "c7d7",
      "d7f7"
    ],
    "replyUci": [
      "g4d7",
      "f8f7"
    ],
    "hintPieceSquare": "g3",
    "hintTargetSquare": "c7",
    "hintText": "Find the mate in 3.",
    "rating": 818
  },
  {
    "id": "lichess-VowcD",
    "fen": "R7/pp3pkp/5qp1/4b3/8/8/PP2QPP1/R6K b - - 0 28",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "f6h4",
      "h4h2",
      "h2h1"
    ],
    "replyUci": [
      "h1g1",
      "g1f1"
    ],
    "hintPieceSquare": "f6",
    "hintTargetSquare": "h4",
    "hintText": "Find the mate in 3.",
    "rating": 923
  },
  {
    "id": "lichess-Vq67N",
    "fen": "8/p5pk/2Q4p/5r2/1PP2q2/8/5RPP/1R4K1 b - - 0 29",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "f4f2",
      "f2f1",
      "f5f1"
    ],
    "replyUci": [
      "g1h1",
      "b1f1"
    ],
    "hintPieceSquare": "f4",
    "hintTargetSquare": "f2",
    "hintText": "Find the mate in 3.",
    "rating": 830
  },
  {
    "id": "lichess-W3IDA",
    "fen": "2r3k1/p3r1pp/1nR1P3/8/1PP5/8/P6P/2KR4 w - - 1 30",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "c6c8",
      "d1d8",
      "d8e8"
    ],
    "replyUci": [
      "b6c8",
      "e7e8"
    ],
    "hintPieceSquare": "c6",
    "hintTargetSquare": "c8",
    "hintText": "Find the mate in 3.",
    "rating": 705
  },
  {
    "id": "lichess-Xjgfk",
    "fen": "2r3k1/p4ppp/8/4rR2/P2p4/1Q1Pq3/2P5/3K4 w - - 0 41",
    "mateIn": 3,
    "difficulty": "beginner",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "b3f7",
      "f7f8",
      "f5f8"
    ],
    "replyUci": [
      "g8h8",
      "c8f8"
    ],
    "hintPieceSquare": "b3",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 3.",
    "rating": 885
  },
  {
    "id": "lichess-2jyJS",
    "fen": "1br2rk1/1pq5/p3p1pp/7P/3pQ3/P1PBP2P/1P6/4RRK1 b - - 0 25",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "c7h2"
    ],
    "hintPieceSquare": "c7",
    "hintTargetSquare": "h2",
    "hintText": "Find the mate in 1.",
    "rating": 1457
  },
  {
    "id": "lichess-2WeT3",
    "fen": "3r1rk1/p4ppp/b7/2p2N2/1bP1n3/4PP2/P3K1PP/RN3B1R b - - 0 17",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "a6c4"
    ],
    "hintPieceSquare": "a6",
    "hintTargetSquare": "c4",
    "hintText": "Find the mate in 1.",
    "rating": 1466
  },
  {
    "id": "lichess-55Oxs",
    "fen": "r2qr1kb/1p1b1p1p/p1n3pB/2p3N1/P2pnP2/3P3P/BPPQ2P1/R4RK1 w - - 0 17",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "a2f7"
    ],
    "hintPieceSquare": "a2",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 1.",
    "rating": 1307
  },
  {
    "id": "lichess-BjvRe",
    "fen": "rn3k1r/ppp2pp1/8/3P3p/2P1R1nq/1N1P4/PP3PP1/RNBQ1K2 b - - 2 15",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "h4f2"
    ],
    "hintPieceSquare": "h4",
    "hintTargetSquare": "f2",
    "hintText": "Find the mate in 1.",
    "rating": 1385
  },
  {
    "id": "lichess-CBKh3",
    "fen": "8/8/2r3p1/7p/2q2Q1P/3k2P1/2p2P1K/2R5 w - - 1 45",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "f4e3"
    ],
    "hintPieceSquare": "f4",
    "hintTargetSquare": "e3",
    "hintText": "Find the mate in 1.",
    "rating": 1472
  },
  {
    "id": "lichess-DJqIM",
    "fen": "r3r1k1/pbp1n1b1/1p1p1nQ1/6N1/3P2q1/P1P1B3/1P2NPP1/R3K2R w KQ - 1 19",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "g6f7"
    ],
    "hintPieceSquare": "g6",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 1.",
    "rating": 1406
  },
  {
    "id": "lichess-E6osR",
    "fen": "r1b1rk2/4pp1Q/2p3p1/2n1bP2/p1B3P1/1p6/qPP5/1NKR2NR w - - 0 23",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "h7f7"
    ],
    "hintPieceSquare": "h7",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 1.",
    "rating": 1361
  },
  {
    "id": "lichess-G8xKR",
    "fen": "8/p7/1p3kp1/2PB1b1p/1P3K2/P6r/3R4/4R3 b - - 5 42",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "g6g5"
    ],
    "hintPieceSquare": "g6",
    "hintTargetSquare": "g5",
    "hintText": "Find the mate in 1.",
    "rating": 1265
  },
  {
    "id": "lichess-GMiAN",
    "fen": "r3r2k/pn2qQ1p/6pB/1p1pN3/3P4/2P5/PPb3PP/R5K1 w - - 3 23",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "h6g7"
    ],
    "hintPieceSquare": "h6",
    "hintTargetSquare": "g7",
    "hintText": "Find the mate in 1.",
    "rating": 1368
  },
  {
    "id": "lichess-h0OTk",
    "fen": "3rk3/p4pp1/p1p1pnp1/2P3Q1/3qN3/7P/PP3PP1/3RK2R b K - 0 18",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "d4d1"
    ],
    "hintPieceSquare": "d4",
    "hintTargetSquare": "d1",
    "hintText": "Find the mate in 1.",
    "rating": 1433
  },
  {
    "id": "lichess-JXcGN",
    "fen": "3r2k1/1bp3pp/p7/1p2pP2/8/P1NP4/1PP1QqPP/R6K b - - 2 20",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "b7g2"
    ],
    "hintPieceSquare": "b7",
    "hintTargetSquare": "g2",
    "hintText": "Find the mate in 1.",
    "rating": 1338
  },
  {
    "id": "lichess-lJZEu",
    "fen": "1k1r4/ppp2p1p/6p1/1Q6/1b1N4/2q1P3/P1P2PBP/2K4R b - - 1 23",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "c3a1"
    ],
    "hintPieceSquare": "c3",
    "hintTargetSquare": "a1",
    "hintText": "Find the mate in 1.",
    "rating": 1479
  },
  {
    "id": "lichess-MKyUr",
    "fen": "r1b2rk1/pp1n2pp/2p1p3/3p1p2/2PP3q/1PN2Pb1/PB2P1B1/R2QRNK1 b - - 3 14",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "g3f2"
    ],
    "hintPieceSquare": "g3",
    "hintTargetSquare": "f2",
    "hintText": "Find the mate in 1.",
    "rating": 1376
  },
  {
    "id": "lichess-n5qQd",
    "fen": "3r1q2/p5k1/6pp/1p1nP3/2pPK3/2P4R/P3Q1P1/7R b - - 0 30",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "f8f4"
    ],
    "hintPieceSquare": "f8",
    "hintTargetSquare": "f4",
    "hintText": "Find the mate in 1.",
    "rating": 1357
  },
  {
    "id": "lichess-NUGWQ",
    "fen": "r1q2r2/pp2bk2/2n4Q/4p3/4p3/6RP/PPP2PP1/5RK1 w - - 3 24",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "h6g6"
    ],
    "hintPieceSquare": "h6",
    "hintTargetSquare": "g6",
    "hintText": "Find the mate in 1.",
    "rating": 1488
  },
  {
    "id": "lichess-syxFq",
    "fen": "3r1k2/p6R/5B2/2p5/3p4/1P1Q1P2/P3rq1P/R6K b - - 0 28",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "f2g2"
    ],
    "hintPieceSquare": "f2",
    "hintTargetSquare": "g2",
    "hintText": "Find the mate in 1.",
    "rating": 1288
  },
  {
    "id": "lichess-vJdXe",
    "fen": "r3k2r/1b1p1ppp/p3p1q1/1pb1P3/2P5/1BN3PP/PPP2B2/R2Q1RK1 b kq - 0 18",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "g6g3"
    ],
    "hintPieceSquare": "g6",
    "hintTargetSquare": "g3",
    "hintText": "Find the mate in 1.",
    "rating": 1394
  },
  {
    "id": "lichess-WkjHW",
    "fen": "8/ppnQ4/k3p1P1/2PpP3/1p1P4/4r3/P2N3q/R1K5 w - - 4 40",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "d7a4"
    ],
    "hintPieceSquare": "d7",
    "hintTargetSquare": "a4",
    "hintText": "Find the mate in 1.",
    "rating": 1361
  },
  {
    "id": "lichess-xflcl",
    "fen": "r1b1qrk1/ppp2pbp/3p1Bp1/3Pp3/2PnP1P1/2N4P/PP2NP2/R2QKB1R b KQ - 0 10",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "d4f3"
    ],
    "hintPieceSquare": "d4",
    "hintTargetSquare": "f3",
    "hintText": "Find the mate in 1.",
    "rating": 1412
  },
  {
    "id": "lichess-XjwHs",
    "fen": "2r3k1/2p2pp1/p6p/1p1bQP2/1P5q/PB5P/1B4P1/7K w - - 0 30",
    "mateIn": 1,
    "difficulty": "club",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "e5g7"
    ],
    "hintPieceSquare": "e5",
    "hintTargetSquare": "g7",
    "hintText": "Find the mate in 1.",
    "rating": 1311
  },
  {
    "id": "lichess-2f6is",
    "fen": "r3N2k/5Qp1/4p2p/3p4/3P4/4PbP1/4qP1P/5RK1 b - - 2 28",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "e2f1",
      "a8a1"
    ],
    "replyUci": [
      "g1f1"
    ],
    "hintPieceSquare": "e2",
    "hintTargetSquare": "f1",
    "hintText": "Find the mate in 2.",
    "rating": 1343
  },
  {
    "id": "lichess-3FrSo",
    "fen": "2r3k1/3p1p1p/6pP/3R4/p3R1P1/P3q3/1P2n1Q1/K7 b - - 0 35",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "c8c1",
      "e3b3"
    ],
    "replyUci": [
      "a1a2"
    ],
    "hintPieceSquare": "c8",
    "hintTargetSquare": "c1",
    "hintText": "Find the mate in 2.",
    "rating": 1493
  },
  {
    "id": "lichess-4UKkX",
    "fen": "2n5/2P3p1/2k1P2p/B2pK1p1/5rP1/7P/8/1R6 b - - 2 58",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "f4e4",
      "c8e7"
    ],
    "replyUci": [
      "e5f5"
    ],
    "hintPieceSquare": "f4",
    "hintTargetSquare": "e4",
    "hintText": "Find the mate in 2.",
    "rating": 1320
  },
  {
    "id": "lichess-CAe6Q",
    "fen": "3Q4/7p/1p4p1/p6k/P7/6P1/P3pq1P/2Q4K b - - 0 42",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "f2f1",
      "e2f1q"
    ],
    "replyUci": [
      "c1f1"
    ],
    "hintPieceSquare": "f2",
    "hintTargetSquare": "f1",
    "hintText": "Find the mate in 2.",
    "rating": 1469
  },
  {
    "id": "lichess-cvtL1",
    "fen": "r5r1/ppQ5/2p2qk1/8/2P4R/4P3/PP6/2K5 w - - 7 37",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "c7h7",
      "h7h5"
    ],
    "replyUci": [
      "g6g5"
    ],
    "hintPieceSquare": "c7",
    "hintTargetSquare": "h7",
    "hintText": "Find the mate in 2.",
    "rating": 1467
  },
  {
    "id": "lichess-f2Crq",
    "fen": "8/pp1k2p1/2q4p/4Q3/8/1B2nrP1/PP5P/4R1K1 b - - 0 25",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "f3f1",
      "c6g2"
    ],
    "replyUci": [
      "e1f1"
    ],
    "hintPieceSquare": "f3",
    "hintTargetSquare": "f1",
    "hintText": "Find the mate in 2.",
    "rating": 1480
  },
  {
    "id": "lichess-FghMn",
    "fen": "3k1r2/2pr2q1/2Q5/P2P1p1p/6p1/1R4P1/6BP/b2K4 w - - 1 37",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "b3b8",
      "c6e6"
    ],
    "replyUci": [
      "d8e7"
    ],
    "hintPieceSquare": "b3",
    "hintTargetSquare": "b8",
    "hintText": "Find the mate in 2.",
    "rating": 1298
  },
  {
    "id": "lichess-GoKob",
    "fen": "8/p1q1p3/2p1bkpQ/3p1r1R/4p3/1BP3P1/PP3r2/R5K1 w - - 3 33",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "h6h8",
      "h5h7"
    ],
    "replyUci": [
      "f6f7"
    ],
    "hintPieceSquare": "h6",
    "hintTargetSquare": "h8",
    "hintText": "Find the mate in 2.",
    "rating": 1284
  },
  {
    "id": "lichess-M554M",
    "fen": "3q1rk1/5p1p/2ppb1P1/2nB4/4P3/6R1/P5PP/Q5K1 w - - 1 25",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "g6h7",
      "a1g7"
    ],
    "replyUci": [
      "g8h7"
    ],
    "hintPieceSquare": "g6",
    "hintTargetSquare": "h7",
    "hintText": "Find the mate in 2.",
    "rating": 1439
  },
  {
    "id": "lichess-nAhLs",
    "fen": "5k2/p4p2/bpB1pQ1p/4P1p1/2Pb4/1P4P1/1q3PKP/8 w - - 4 38",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "f6h8",
      "h8e8"
    ],
    "replyUci": [
      "f8e7"
    ],
    "hintPieceSquare": "f6",
    "hintTargetSquare": "h8",
    "hintText": "Find the mate in 2.",
    "rating": 1299
  },
  {
    "id": "lichess-NmnGD",
    "fen": "3Rb1k1/p6p/4r1p1/2p3Q1/4q3/2P1B3/P4PPP/6K1 b - - 5 33",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "e4b1",
      "e6e1"
    ],
    "replyUci": [
      "e3c1"
    ],
    "hintPieceSquare": "e4",
    "hintTargetSquare": "b1",
    "hintText": "Find the mate in 2.",
    "rating": 1336
  },
  {
    "id": "lichess-qkbJY",
    "fen": "3Rrq1k/4Q1pp/Pp4b1/2p5/7P/6P1/8/6K1 w - - 8 42",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "e7f8",
      "d8f8"
    ],
    "replyUci": [
      "e8f8"
    ],
    "hintPieceSquare": "e7",
    "hintTargetSquare": "f8",
    "hintText": "Find the mate in 2.",
    "rating": 1282
  },
  {
    "id": "lichess-qNa3g",
    "fen": "r1b3rk/1p2BQpp/8/1p6/8/8/Pq4PP/R4R1K w - - 0 26",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "f7g8",
      "f1f8"
    ],
    "replyUci": [
      "h8g8"
    ],
    "hintPieceSquare": "f7",
    "hintTargetSquare": "g8",
    "hintText": "Find the mate in 2.",
    "rating": 1488
  },
  {
    "id": "lichess-rAQ5O",
    "fen": "5Q2/7p/6p1/2PpPp1k/3P1q2/r6P/r5B1/5RRK b - - 5 46",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "a3h3",
      "f4h2"
    ],
    "replyUci": [
      "g2h3"
    ],
    "hintPieceSquare": "a3",
    "hintTargetSquare": "h3",
    "hintText": "Find the mate in 2.",
    "rating": 1488
  },
  {
    "id": "lichess-T5zTF",
    "fen": "5r2/7k/2pp2p1/3q4/2nb1B2/6QP/P1P3RK/1r6 w - - 0 35",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "g3g6",
      "g6h6"
    ],
    "replyUci": [
      "h7h8"
    ],
    "hintPieceSquare": "g3",
    "hintTargetSquare": "g6",
    "hintText": "Find the mate in 2.",
    "rating": 1512
  },
  {
    "id": "lichess-twt2G",
    "fen": "7q/3k3p/1Qp5/p2b2P1/1n6/1P6/P2P1P2/3KR1R1 b - - 3 34",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "d5f3",
      "h8a1"
    ],
    "replyUci": [
      "e1e2"
    ],
    "hintPieceSquare": "d5",
    "hintTargetSquare": "f3",
    "hintText": "Find the mate in 2.",
    "rating": 1496
  },
  {
    "id": "lichess-Uebcd",
    "fen": "5k2/5p1p/5K2/7r/4R3/5P2/6RP/7r w - - 9 51",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "g2g8",
      "e4e8"
    ],
    "replyUci": [
      "f8g8"
    ],
    "hintPieceSquare": "g2",
    "hintTargetSquare": "g8",
    "hintText": "Find the mate in 2.",
    "rating": 1440
  },
  {
    "id": "lichess-uEnvZ",
    "fen": "2k4B/1p2R2p/p1b3pb/2P5/1P6/P5KP/5Pn1/R7 b - - 1 27",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "h6f4",
      "h7h5"
    ],
    "replyUci": [
      "g3g4"
    ],
    "hintPieceSquare": "h6",
    "hintTargetSquare": "f4",
    "hintText": "Find the mate in 2.",
    "rating": 1467
  },
  {
    "id": "lichess-WvAlX",
    "fen": "3r1r1k/pp4pp/1b6/5P2/1PBp2P1/P3nKP1/1B6/3R3R w - - 9 31",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "h1h7",
      "d1h1"
    ],
    "replyUci": [
      "h8h7"
    ],
    "hintPieceSquare": "h1",
    "hintTargetSquare": "h7",
    "hintText": "Find the mate in 2.",
    "rating": 1452
  },
  {
    "id": "lichess-xS924",
    "fen": "7Q/8/8/5pN1/4P3/p7/Kpk3b1/8 b - - 1 43",
    "mateIn": 2,
    "difficulty": "club",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "b2b1q",
      "b1b3"
    ],
    "replyUci": [
      "a2a3"
    ],
    "hintPieceSquare": "b2",
    "hintTargetSquare": "b1",
    "hintText": "Find the mate in 2.",
    "rating": 1510
  },
  {
    "id": "lichess-16Ifr",
    "fen": "r3rk2/ppp2pp1/5nn1/3p2N1/3P4/6PQ/P1Pq1PK1/4R2R w - - 0 21",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "h3h8",
      "h1h8",
      "g5h7"
    ],
    "replyUci": [
      "g6h8",
      "f6g8"
    ],
    "hintPieceSquare": "h3",
    "hintTargetSquare": "h8",
    "hintText": "Find the mate in 3.",
    "rating": 1596
  },
  {
    "id": "lichess-a2dqo",
    "fen": "8/5RP1/2r5/8/8/1k6/3BbP2/1K6 b - - 6 50",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "e2d3",
      "c6a6",
      "a6a5"
    ],
    "replyUci": [
      "b1a1",
      "d2a5"
    ],
    "hintPieceSquare": "e2",
    "hintTargetSquare": "d3",
    "hintText": "Find the mate in 3.",
    "rating": 1282
  },
  {
    "id": "lichess-Bu3m8",
    "fen": "8/1Q4pk/pPp3rp/P1Ppq3/4p2P/4P1P1/2R4K/5R2 b - - 0 35",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "e5g3",
      "g3h3",
      "h3f1"
    ],
    "replyUci": [
      "h2h1",
      "c2h2"
    ],
    "hintPieceSquare": "e5",
    "hintTargetSquare": "g3",
    "hintText": "Find the mate in 3.",
    "rating": 1582
  },
  {
    "id": "lichess-FFrQU",
    "fen": "1k6/2p5/1p2p2p/6p1/QP3p2/4q2P/3r2bK/R7 w - - 2 38",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "a4e8",
      "e8d8",
      "d8a8"
    ],
    "replyUci": [
      "d2d8",
      "b8b7"
    ],
    "hintPieceSquare": "a4",
    "hintTargetSquare": "e8",
    "hintText": "Find the mate in 3.",
    "rating": 1634
  },
  {
    "id": "lichess-Fkc3Z",
    "fen": "8/2Q3pp/4p1k1/P3Pp2/2P2P2/2Br3P/1P2q1PK/6R1 b - - 11 35",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "d3h3",
      "e2g4",
      "g4h4"
    ],
    "replyUci": [
      "h2h3",
      "h3h2"
    ],
    "hintPieceSquare": "d3",
    "hintTargetSquare": "h3",
    "hintText": "Find the mate in 3.",
    "rating": 1651
  },
  {
    "id": "lichess-FrPsu",
    "fen": "r1b2rk1/ppp1Qppp/8/8/3B1P2/8/q1P3PP/2KRR3 w - - 0 20",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "e7f8",
      "d4c5",
      "d1d8"
    ],
    "replyUci": [
      "g8f8",
      "f8g8"
    ],
    "hintPieceSquare": "e7",
    "hintTargetSquare": "f8",
    "hintText": "Find the mate in 3.",
    "rating": 1633
  },
  {
    "id": "lichess-IbYFe",
    "fen": "5Q2/6P1/kpp1b1q1/p2p4/8/1PP5/PK6/8 w - - 4 45",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "f8a8",
      "a2a4",
      "a8f8"
    ],
    "replyUci": [
      "a6b5",
      "b5c5"
    ],
    "hintPieceSquare": "f8",
    "hintTargetSquare": "a8",
    "hintText": "Find the mate in 3.",
    "rating": 1592
  },
  {
    "id": "lichess-kCqLt",
    "fen": "r1b3k1/ppp2pb1/6p1/6Nn/2Q1N2P/P3P3/1qP1KPPR/3r4 w - - 0 22",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "c4f7",
      "f7e8",
      "e8f8"
    ],
    "replyUci": [
      "g8h8",
      "g7f8"
    ],
    "hintPieceSquare": "c4",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 3.",
    "rating": 1291
  },
  {
    "id": "lichess-lyJaZ",
    "fen": "r1bk2nr/1p1p1ppp/p2b1qn1/1N6/5P2/8/PPPBQ1PP/R3KB1R w KQ - 0 14",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "d2a5",
      "a5b6",
      "b6c7"
    ],
    "replyUci": [
      "b7b6",
      "d6c7"
    ],
    "hintPieceSquare": "d2",
    "hintTargetSquare": "a5",
    "hintText": "Find the mate in 3.",
    "rating": 1305
  },
  {
    "id": "lichess-NLg3I",
    "fen": "6rk/r4p2/p2pq2B/1pp1p3/4P3/1P1PRnP1/1PP2PK1/7R w - - 0 34",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "h6f8",
      "h1h2",
      "h2h3"
    ],
    "replyUci": [
      "f3h2",
      "e6h3"
    ],
    "hintPieceSquare": "h6",
    "hintTargetSquare": "f8",
    "hintText": "Find the mate in 3.",
    "rating": 1642
  },
  {
    "id": "lichess-sQjsr",
    "fen": "4r1k1/p1q4p/3n1Qp1/1p4PP/5R2/1P6/P3rR1K/8 w - - 1 36",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "f6f8",
      "f4f8",
      "h5h6"
    ],
    "replyUci": [
      "e8f8",
      "g8g7"
    ],
    "hintPieceSquare": "f6",
    "hintTargetSquare": "f8",
    "hintText": "Find the mate in 3.",
    "rating": 1599
  },
  {
    "id": "lichess-TAfHi",
    "fen": "2k3r1/1p3p2/2p5/Q1Pp4/P2Pp2p/5qNP/1P3P1K/R4R2 b - - 4 33",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "h4g3",
      "f3g3",
      "g3h3"
    ],
    "replyUci": [
      "f2g3",
      "h2h1"
    ],
    "hintPieceSquare": "h4",
    "hintTargetSquare": "g3",
    "hintText": "Find the mate in 3.",
    "rating": 1279
  },
  {
    "id": "lichess-TjbdW",
    "fen": "7r/3k1rp1/8/3p2p1/1Q1Pq2p/7P/P4P2/2R3K1 w - - 2 37",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "b4b7",
      "c1c6",
      "b7f7"
    ],
    "replyUci": [
      "d7e6",
      "e6f5"
    ],
    "hintPieceSquare": "b4",
    "hintTargetSquare": "b7",
    "hintText": "Find the mate in 3.",
    "rating": 1278
  },
  {
    "id": "lichess-TQHmv",
    "fen": "r1b2k2/pp3n1p/2pp2p1/3Pp1q1/2P1P2b/5P2/PPR1N1BK/2Q3R1 b - - 1 27",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "h4g3",
      "g5h4",
      "h4h3"
    ],
    "replyUci": [
      "e2g3",
      "g2h3"
    ],
    "hintPieceSquare": "h4",
    "hintTargetSquare": "g3",
    "hintText": "Find the mate in 3.",
    "rating": 1296
  },
  {
    "id": "lichess-UqfeR",
    "fen": "1k1r4/pp4Qp/4p3/1q1rn3/5B2/8/PP3PPP/2R3K1 w - - 1 23",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "g7c7",
      "c7c8",
      "c1c8"
    ],
    "replyUci": [
      "b8a8",
      "d8c8"
    ],
    "hintPieceSquare": "g7",
    "hintTargetSquare": "c7",
    "hintText": "Find the mate in 3.",
    "rating": 1615
  },
  {
    "id": "lichess-UZhKV",
    "fen": "3r1rk1/2Q3pp/8/8/4q3/2P1R3/PP4PP/4R1K1 b - - 0 26",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "e4e3",
      "d8d1",
      "d1e1"
    ],
    "replyUci": [
      "e1e3",
      "e3e1"
    ],
    "hintPieceSquare": "e4",
    "hintTargetSquare": "e3",
    "hintText": "Find the mate in 3.",
    "rating": 1317
  },
  {
    "id": "lichess-VsDaI",
    "fen": "8/3Q4/2P3kp/8/1P5P/6PK/4rr2/8 b - - 0 48",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "f2h2",
      "h6h5",
      "h2f2"
    ],
    "replyUci": [
      "h3g4",
      "g4f3"
    ],
    "hintPieceSquare": "f2",
    "hintTargetSquare": "h2",
    "hintText": "Find the mate in 3.",
    "rating": 1616
  },
  {
    "id": "lichess-Vxc5U",
    "fen": "r1b5/3p4/p4Q2/q1kNp2P/3nP3/1pPP4/1P3PP1/2KR3R b - - 0 23",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "a5a1",
      "a1b2",
      "b2e2"
    ],
    "replyUci": [
      "c1d2",
      "d2e3"
    ],
    "hintPieceSquare": "a5",
    "hintTargetSquare": "a1",
    "hintText": "Find the mate in 3.",
    "rating": 1272
  },
  {
    "id": "lichess-YC3AM",
    "fen": "2r3k1/Q3Rrpp/4N3/3pp3/P3n3/4P3/P1q2PPP/5RK1 b - - 0 21",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "c2f2",
      "c8c1",
      "c1f1"
    ],
    "replyUci": [
      "f1f2",
      "f2f1"
    ],
    "hintPieceSquare": "c2",
    "hintTargetSquare": "f2",
    "hintText": "Find the mate in 3.",
    "rating": 1607
  },
  {
    "id": "lichess-Zjz22",
    "fen": "2r5/pQ4p1/2r3kp/5p2/3Pp1NP/4PnP1/P4PR1/R4K2 b - - 0 32",
    "mateIn": 3,
    "difficulty": "club",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "c6c1",
      "c8c1",
      "c1e1"
    ],
    "replyUci": [
      "a1c1",
      "f1e2"
    ],
    "hintPieceSquare": "c6",
    "hintTargetSquare": "c1",
    "hintText": "Find the mate in 3.",
    "rating": 1604
  },
  {
    "id": "lichess-3MBPa",
    "fen": "3r1kr1/p1p2p2/2Q1p3/3nN2p/3B3q/2P5/PP3Rp1/R5K1 w - - 8 32",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "f2f7"
    ],
    "hintPieceSquare": "f2",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 1.",
    "rating": 1903
  },
  {
    "id": "lichess-4WNRL",
    "fen": "8/5p1k/R1Q3pp/8/8/5qPP/PP3P1K/4r3 b - - 2 34",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "e1h1"
    ],
    "hintPieceSquare": "e1",
    "hintTargetSquare": "h1",
    "hintText": "Find the mate in 1.",
    "rating": 1540
  },
  {
    "id": "lichess-5CFPm",
    "fen": "6k1/p4p2/5R1p/8/3P1N1N/5Pnp/PP2r3/6K1 b - - 4 32",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "h3h2"
    ],
    "hintPieceSquare": "h3",
    "hintTargetSquare": "h2",
    "hintText": "Find the mate in 1.",
    "rating": 1851
  },
  {
    "id": "lichess-64hFn",
    "fen": "r4r2/2p2kp1/p1Q4p/1p4q1/P4b2/2N5/1PP2PPP/3bR1K1 w - - 0 22",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "c6e6"
    ],
    "hintPieceSquare": "c6",
    "hintTargetSquare": "e6",
    "hintText": "Find the mate in 1.",
    "rating": 1498
  },
  {
    "id": "lichess-7ysfS",
    "fen": "8/1Bn5/2Pk2pp/5p1P/5K2/5PP1/8/8 b - - 0 42",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "c7d5"
    ],
    "hintPieceSquare": "c7",
    "hintTargetSquare": "d5",
    "hintText": "Find the mate in 1.",
    "rating": 1681
  },
  {
    "id": "lichess-aC3DD",
    "fen": "7k/p2B3p/2p2p2/1p2r3/3K1nR1/2P2P2/P1P2P1P/8 b - - 2 25",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "c6c5"
    ],
    "hintPieceSquare": "c6",
    "hintTargetSquare": "c5",
    "hintText": "Find the mate in 1.",
    "rating": 1850
  },
  {
    "id": "lichess-aQbkY",
    "fen": "5k2/R7/4pKBp/8/6P1/1Pn4P/P3r3/8 b - - 2 40",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "c3d5"
    ],
    "hintPieceSquare": "c3",
    "hintTargetSquare": "d5",
    "hintText": "Find the mate in 1.",
    "rating": 1509
  },
  {
    "id": "lichess-Deejc",
    "fen": "2r1kb1r/pp1b1p2/3p1Q2/4q2p/4P3/1B6/PPP2PPP/R4RK1 w k - 1 15",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "b3f7"
    ],
    "hintPieceSquare": "b3",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 1.",
    "rating": 1728
  },
  {
    "id": "lichess-DjyXv",
    "fen": "r3rk2/pp5p/5q2/6Q1/2BP4/1P6/P2N2PP/7K w - - 0 29",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "g5f6"
    ],
    "hintPieceSquare": "g5",
    "hintTargetSquare": "f6",
    "hintText": "Find the mate in 1.",
    "rating": 1655
  },
  {
    "id": "lichess-ec2xk",
    "fen": "3Q4/8/1p3p2/4k3/2P5/2K1P3/8/6q1 w - - 4 55",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "d8d5"
    ],
    "hintPieceSquare": "d8",
    "hintTargetSquare": "d5",
    "hintText": "Find the mate in 1.",
    "rating": 1739
  },
  {
    "id": "lichess-EPPXA",
    "fen": "3R2rk/6b1/3p1p1p/2pq1N2/5PQ1/1p5P/6PK/8 w - - 0 42",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "g4g7"
    ],
    "hintPieceSquare": "g4",
    "hintTargetSquare": "g7",
    "hintText": "Find the mate in 1.",
    "rating": 1578
  },
  {
    "id": "lichess-iRqjG",
    "fen": "8/1N3n2/2KPkp2/5ppp/5P1P/8/8/8 w - - 1 56",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "b7c5"
    ],
    "hintPieceSquare": "b7",
    "hintTargetSquare": "c5",
    "hintText": "Find the mate in 1.",
    "rating": 1742
  },
  {
    "id": "lichess-KJIDg",
    "fen": "8/5RR1/1r1p4/1N2pB2/n3Pk2/4b3/6r1/1K6 w - - 3 39",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "f5h7"
    ],
    "hintPieceSquare": "f5",
    "hintTargetSquare": "h7",
    "hintText": "Find the mate in 1.",
    "rating": 1846
  },
  {
    "id": "lichess-klnZ6",
    "fen": "1Q3b1r/p3pk2/2p2p2/3P2p1/8/2P3Pq/PP1PR2n/RNB3KB b - - 0 18",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "h3f1"
    ],
    "hintPieceSquare": "h3",
    "hintTargetSquare": "f1",
    "hintText": "Find the mate in 1.",
    "rating": 1642
  },
  {
    "id": "lichess-moFpp",
    "fen": "R4R2/5p1k/2K4p/4r1pP/8/8/5PP1/3r4 w - - 0 46",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "f8f7"
    ],
    "hintPieceSquare": "f8",
    "hintTargetSquare": "f7",
    "hintText": "Find the mate in 1.",
    "rating": 1585
  },
  {
    "id": "lichess-mrYpx",
    "fen": "r4r2/pppqNk2/2npb1p1/1Bb1p1BQ/4n3/P7/1PP2PPP/R4RK1 w - - 0 17",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "h5g6"
    ],
    "hintPieceSquare": "h5",
    "hintTargetSquare": "g6",
    "hintText": "Find the mate in 1.",
    "rating": 1689
  },
  {
    "id": "lichess-PNw0l",
    "fen": "6r1/p5k1/2q3p1/2p1Pp2/2Pp1PnQ/1p1P2K1/1P1B4/7R w - - 3 37",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "h4e7"
    ],
    "hintPieceSquare": "h4",
    "hintTargetSquare": "e7",
    "hintText": "Find the mate in 1.",
    "rating": 1725
  },
  {
    "id": "lichess-QVtxR",
    "fen": "8/p2k1rpB/b3p3/2Bp3Q/1p3qn1/7P/PPP3P1/3R3K b - - 0 28",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "Black to move — Mate in 1",
    "solutionUci": [
      "f4h2"
    ],
    "hintPieceSquare": "f4",
    "hintTargetSquare": "h2",
    "hintText": "Find the mate in 1.",
    "rating": 1543
  },
  {
    "id": "lichess-Wc12Y",
    "fen": "2Q2b1r/1q2kppp/p3p3/2n1P3/5P2/P1N5/1r4PP/3RK2R w K - 0 23",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "c8d8"
    ],
    "hintPieceSquare": "c8",
    "hintTargetSquare": "d8",
    "hintText": "Find the mate in 1.",
    "rating": 1537
  },
  {
    "id": "lichess-zNnib",
    "fen": "r1q2r2/p1p1np1Q/1p2pk2/6N1/3P4/2P1R3/PP3PPP/6K1 w - - 5 23",
    "mateIn": 1,
    "difficulty": "master",
    "goal": "White to move — Mate in 1",
    "solutionUci": [
      "g5e4"
    ],
    "hintPieceSquare": "g5",
    "hintTargetSquare": "e4",
    "hintText": "Find the mate in 1.",
    "rating": 1972
  },
  {
    "id": "lichess-037Iw",
    "fen": "3r2r1/1kpq1p1B/pp2b3/4P3/8/2B5/nPP2QPP/1K1RR3 b - - 1 22",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "d7d1",
      "d8d1"
    ],
    "replyUci": [
      "e1d1"
    ],
    "hintPieceSquare": "d7",
    "hintTargetSquare": "d1",
    "hintText": "Find the mate in 2.",
    "rating": 1894
  },
  {
    "id": "lichess-1Jf8O",
    "fen": "r3bk1r/1ppqn1pp/p2bQp2/8/3n3N/1BN4P/PP3PP1/R1B1R1K1 w - - 0 19",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "e6f6",
      "c1h6"
    ],
    "replyUci": [
      "g7f6"
    ],
    "hintPieceSquare": "e6",
    "hintTargetSquare": "f6",
    "hintText": "Find the mate in 2.",
    "rating": 1939
  },
  {
    "id": "lichess-2GxFT",
    "fen": "r3r1k1/q4p1p/2p5/5PBp/1ppPP3/2P5/p6P/R5RK w - - 0 37",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "g5e7",
      "e7f6"
    ],
    "replyUci": [
      "g8h8"
    ],
    "hintPieceSquare": "g5",
    "hintTargetSquare": "e7",
    "hintText": "Find the mate in 2.",
    "rating": 2220
  },
  {
    "id": "lichess-6vcu4",
    "fen": "rnbr2k1/4pp1p/pp4NB/2pP1q2/7P/2n3R1/PPP1BP2/2K2R2 w - - 0 20",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "g6e7",
      "h6g7"
    ],
    "replyUci": [
      "g8h8"
    ],
    "hintPieceSquare": "g6",
    "hintTargetSquare": "e7",
    "hintText": "Find the mate in 2.",
    "rating": 1896
  },
  {
    "id": "lichess-bmxt1",
    "fen": "r2q1rk1/ppp3p1/2np2pp/2bNp1N1/2B1P1bP/P2P4/1PP2nP1/R1B1K2R w KQ - 0 12",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "d5e7",
      "e7g6"
    ],
    "replyUci": [
      "g8h8"
    ],
    "hintPieceSquare": "d5",
    "hintTargetSquare": "e7",
    "hintText": "Find the mate in 2.",
    "rating": 1823
  },
  {
    "id": "lichess-cmlNn",
    "fen": "8/5R1p/6k1/6p1/2Br4/1P4PK/P3RP1P/6r1 b - - 2 32",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "d4h4",
      "g5g4"
    ],
    "replyUci": [
      "g3h4"
    ],
    "hintPieceSquare": "d4",
    "hintTargetSquare": "h4",
    "hintText": "Find the mate in 2.",
    "rating": 1886
  },
  {
    "id": "lichess-eKTae",
    "fen": "r3N3/1p5p/4pBpk/8/2n2P2/8/p6P/7K w - - 0 37",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "f6g5",
      "e8f6"
    ],
    "replyUci": [
      "h6h5"
    ],
    "hintPieceSquare": "f6",
    "hintTargetSquare": "g5",
    "hintText": "Find the mate in 2.",
    "rating": 1965
  },
  {
    "id": "lichess-FNBuH",
    "fen": "r4rk1/p1n2qbp/6pQ/1pp4N/3p1P2/3P4/PPP3R1/2K4R w - - 1 25",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "h6h7",
      "h5f6"
    ],
    "replyUci": [
      "g8h7"
    ],
    "hintPieceSquare": "h6",
    "hintTargetSquare": "h7",
    "hintText": "Find the mate in 2.",
    "rating": 1943
  },
  {
    "id": "lichess-hTRPU",
    "fen": "8/8/R4pk1/6pp/8/PP3N1P/5nPK/4r3 b - - 1 37",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "e1h1",
      "f2e4"
    ],
    "replyUci": [
      "h2g3"
    ],
    "hintPieceSquare": "e1",
    "hintTargetSquare": "h1",
    "hintText": "Find the mate in 2.",
    "rating": 1849
  },
  {
    "id": "lichess-irtVj",
    "fen": "4b2Q/p4p1p/4p1k1/2p5/2P2p1P/1P4P1/P4qBK/8 w - - 0 30",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "h8g8",
      "g8g5"
    ],
    "replyUci": [
      "g6f5"
    ],
    "hintPieceSquare": "h8",
    "hintTargetSquare": "g8",
    "hintText": "Find the mate in 2.",
    "rating": 1816
  },
  {
    "id": "lichess-jOchP",
    "fen": "4r1r1/1ppn2pp/p1kb1n2/5Q2/2P5/2NpB3/P1P2PqP/R3KR2 w Q - 0 18",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "f5b5",
      "c4b5"
    ],
    "replyUci": [
      "a6b5"
    ],
    "hintPieceSquare": "f5",
    "hintTargetSquare": "b5",
    "hintText": "Find the mate in 2.",
    "rating": 2163
  },
  {
    "id": "lichess-RwmDf",
    "fen": "r3kb1r/pp4pp/2p3n1/5n2/2BqNB2/8/PPP2PPP/R3R1K1 w kq - 0 17",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "e4f6",
      "e1e8"
    ],
    "replyUci": [
      "e8d8"
    ],
    "hintPieceSquare": "e4",
    "hintTargetSquare": "f6",
    "hintText": "Find the mate in 2.",
    "rating": 1840
  },
  {
    "id": "lichess-Sp9TM",
    "fen": "3r2k1/p1p2ppp/2p5/2b2b2/4n3/1QP4P/PP2K1P1/1R3B1R b - - 0 22",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "d8d2",
      "d2f2"
    ],
    "replyUci": [
      "e2f3"
    ],
    "hintPieceSquare": "d8",
    "hintTargetSquare": "d2",
    "hintText": "Find the mate in 2.",
    "rating": 1908
  },
  {
    "id": "lichess-TCFCw",
    "fen": "2r1k2r/1q1N1ppp/p3pn2/1p4B1/8/2N3P1/PPQ1Pb1P/R2R1K2 b k - 0 17",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "b7h1",
      "f6g4"
    ],
    "replyUci": [
      "f1f2"
    ],
    "hintPieceSquare": "b7",
    "hintTargetSquare": "h1",
    "hintText": "Find the mate in 2.",
    "rating": 1848
  },
  {
    "id": "lichess-utrzT",
    "fen": "3r4/1p2R2p/5pp1/1P1p1k2/R4n2/4KPQ1/2r4P/5N2 b - - 12 39",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "d5d4",
      "c2e2"
    ],
    "replyUci": [
      "a4d4"
    ],
    "hintPieceSquare": "d5",
    "hintTargetSquare": "d4",
    "hintText": "Find the mate in 2.",
    "rating": 1951
  },
  {
    "id": "lichess-VinCh",
    "fen": "2krr3/pp3ppp/1Pn5/8/1P6/P4bbP/Q3B1P1/R1B2K1R b - - 0 18",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "Black to move — Mate in 2",
    "solutionUci": [
      "d8d1",
      "e8e1"
    ],
    "replyUci": [
      "e2d1"
    ],
    "hintPieceSquare": "d8",
    "hintTargetSquare": "d1",
    "hintText": "Find the mate in 2.",
    "rating": 1910
  },
  {
    "id": "lichess-XPwqx",
    "fen": "r6r/1pqnb1p1/2p1k2p/3n4/p2P1P1P/2PQ2N1/PP1B2P1/1K5R w - - 0 19",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "d3f5",
      "g3e4"
    ],
    "replyUci": [
      "e6d6"
    ],
    "hintPieceSquare": "d3",
    "hintTargetSquare": "f5",
    "hintText": "Find the mate in 2.",
    "rating": 1857
  },
  {
    "id": "lichess-Z3nJS",
    "fen": "3rr1k1/2q2p2/2p5/4b1PQ/1p6/pP5R/P1P4P/B5K1 w - - 2 38",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "h5h8",
      "h3h8"
    ],
    "replyUci": [
      "e5h8"
    ],
    "hintPieceSquare": "h5",
    "hintTargetSquare": "h8",
    "hintText": "Find the mate in 2.",
    "rating": 1907
  },
  {
    "id": "lichess-z5Kep",
    "fen": "5k2/pp3npQ/1bp2p2/8/1P1r3R/6qP/P1P2PP1/4R1K1 w - - 0 26",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "h7g8",
      "e1e8"
    ],
    "replyUci": [
      "f8g8"
    ],
    "hintPieceSquare": "h7",
    "hintTargetSquare": "g8",
    "hintText": "Find the mate in 2.",
    "rating": 2130
  },
  {
    "id": "lichess-Zwz6t",
    "fen": "r3r3/ppq4k/2nR3p/5P2/2p1n1QP/2P1P3/PPp2P2/2K4R w - - 4 25",
    "mateIn": 2,
    "difficulty": "master",
    "goal": "White to move — Mate in 2",
    "solutionUci": [
      "d6h6",
      "g4g6"
    ],
    "replyUci": [
      "h7h6"
    ],
    "hintPieceSquare": "d6",
    "hintTargetSquare": "h6",
    "hintText": "Find the mate in 2.",
    "rating": 2007
  },
  {
    "id": "lichess-0XmOY",
    "fen": "5Q2/1ppk2P1/p2p3n/1P6/PKP5/3q4/1B6/8 b - - 6 50",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "a6a5",
      "d3d2",
      "d2c3"
    ],
    "replyUci": [
      "b4a5",
      "b2c3"
    ],
    "hintPieceSquare": "a6",
    "hintTargetSquare": "a5",
    "hintText": "Find the mate in 3.",
    "rating": 1850
  },
  {
    "id": "lichess-1bjAL",
    "fen": "5k2/p6R/1p6/2pB2pn/2P5/5P2/Pr3P1P/6K1 b - - 0 29",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "b2b1",
      "h5f4",
      "b1g1"
    ],
    "replyUci": [
      "g1g2",
      "g2g3"
    ],
    "hintPieceSquare": "b2",
    "hintTargetSquare": "b1",
    "hintText": "Find the mate in 3.",
    "rating": 1947
  },
  {
    "id": "lichess-1lArk",
    "fen": "7Q/8/ppq1p1p1/2p2k1p/7P/2P2PPK/P7/8 w - - 2 55",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "h8f8",
      "f8f4",
      "c3c4"
    ],
    "replyUci": [
      "f5e5",
      "e5d5"
    ],
    "hintPieceSquare": "h8",
    "hintTargetSquare": "f8",
    "hintText": "Find the mate in 3.",
    "rating": 1949
  },
  {
    "id": "lichess-9ybwp",
    "fen": "r1b1r3/ppq2ppk/3b2Np/2pp4/3P1n2/2P5/PPQ2PPP/R3R1K1 w - - 0 20",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "g6f8",
      "c2h7",
      "h7h8"
    ],
    "replyUci": [
      "h7g8",
      "g8f8"
    ],
    "hintPieceSquare": "g6",
    "hintTargetSquare": "f8",
    "hintText": "Find the mate in 3.",
    "rating": 2020
  },
  {
    "id": "lichess-BQOmt",
    "fen": "2r5/6rk/p3R2p/4P3/1pq1pP1Q/8/PPP4P/2K5 w - - 0 30",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "e6h6",
      "h6h8",
      "h4f6"
    ],
    "replyUci": [
      "h7g8",
      "g8f7"
    ],
    "hintPieceSquare": "e6",
    "hintTargetSquare": "h6",
    "hintText": "Find the mate in 3.",
    "rating": 1858
  },
  {
    "id": "lichess-C7RYh",
    "fen": "8/3R4/3Npk2/6pp/2p1K2P/4P1P1/2r5/4b3 w - - 0 45",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "d6e8",
      "d7g7",
      "h4g5"
    ],
    "replyUci": [
      "f6g6",
      "g6h6"
    ],
    "hintPieceSquare": "d6",
    "hintTargetSquare": "e8",
    "hintText": "Find the mate in 3.",
    "rating": 1943
  },
  {
    "id": "lichess-cWHv1",
    "fen": "2rk3N/6Bp/p1n1B3/1p3p2/4n3/bPP2b2/P1KP3P/4R1R1 b - - 2 24",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "c6b4",
      "e4d2",
      "b4c2"
    ],
    "replyUci": [
      "c2b1",
      "b1a1"
    ],
    "hintPieceSquare": "c6",
    "hintTargetSquare": "b4",
    "hintText": "Find the mate in 3.",
    "rating": 1848
  },
  {
    "id": "lichess-jYL4E",
    "fen": "3r1k1r/pR3pbp/6p1/3q4/8/5Q2/P4PPP/4R1K1 w - - 8 29",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "f3d5",
      "b7b8",
      "b8d8"
    ],
    "replyUci": [
      "d8d5",
      "d5d8"
    ],
    "hintPieceSquare": "f3",
    "hintTargetSquare": "d5",
    "hintText": "Find the mate in 3.",
    "rating": 1842
  },
  {
    "id": "lichess-l1abM",
    "fen": "4Q3/1pp5/3p4/2nP1kp1/2P2p2/2b2P2/r7/3KR2R b - - 0 35",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "a2d2",
      "c5b3",
      "d2b2"
    ],
    "replyUci": [
      "d1c1",
      "c1b1"
    ],
    "hintPieceSquare": "a2",
    "hintTargetSquare": "d2",
    "hintText": "Find the mate in 3.",
    "rating": 1887
  },
  {
    "id": "lichess-LW4Qr",
    "fen": "4r1k1/pq3ppp/3p2P1/8/pP3PPb/P2P4/7P/2RQ1KR1 b - - 0 24",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "e8e1",
      "b7f3",
      "f3f2"
    ],
    "replyUci": [
      "d1e1",
      "e1f2"
    ],
    "hintPieceSquare": "e8",
    "hintTargetSquare": "e1",
    "hintText": "Find the mate in 3.",
    "rating": 1886
  },
  {
    "id": "lichess-N6cDI",
    "fen": "2b1r1k1/p4p1p/1p2p1pB/2p1Q3/2R1N1P1/3q4/PP2nP1P/1R3K2 b - - 1 24",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "e2f4",
      "d3b1",
      "b1c1"
    ],
    "replyUci": [
      "f1g1",
      "c4c1"
    ],
    "hintPieceSquare": "e2",
    "hintTargetSquare": "f4",
    "hintText": "Find the mate in 3.",
    "rating": 2037
  },
  {
    "id": "lichess-qXGCx",
    "fen": "r1bq1b1r/1pp2k1p/p1n2nN1/7Q/3Pp3/8/PPP2PPP/RNB3K1 w - - 0 12",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "g6e5",
      "h5f7",
      "e5c4"
    ],
    "replyUci": [
      "f7e6",
      "e6d6"
    ],
    "hintPieceSquare": "g6",
    "hintTargetSquare": "e5",
    "hintText": "Find the mate in 3.",
    "rating": 2072
  },
  {
    "id": "lichess-svMui",
    "fen": "r4rk1/1b4pR/1pn1pq2/p1pp3B/2P1pP2/PP2P3/1Q1P2P1/2K4R w - - 2 21",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "h7h8",
      "h5f7",
      "h1h4"
    ],
    "replyUci": [
      "g8h8",
      "f6h4"
    ],
    "hintPieceSquare": "h7",
    "hintTargetSquare": "h8",
    "hintText": "Find the mate in 3.",
    "rating": 1875
  },
  {
    "id": "lichess-t8rFU",
    "fen": "3r2k1/pp3pp1/2p4p/4P1q1/4N3/P3Pn1P/1PQ2P2/2R1RK2 b - - 0 24",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "f3h2",
      "g5h5",
      "h5f3"
    ],
    "replyUci": [
      "f1e2",
      "f2f3"
    ],
    "hintPieceSquare": "f3",
    "hintTargetSquare": "h2",
    "hintText": "Find the mate in 3.",
    "rating": 1946
  },
  {
    "id": "lichess-VlKGq",
    "fen": "2rr2k1/1bq2p2/p1n1pPn1/1pp4Q/4pb2/3P2P1/PPP2PK1/R6R w - - 0 23",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "h5h7",
      "h7h8",
      "h1h8"
    ],
    "replyUci": [
      "g8f8",
      "g6h8"
    ],
    "hintPieceSquare": "h5",
    "hintTargetSquare": "h7",
    "hintText": "Find the mate in 3.",
    "rating": 1939
  },
  {
    "id": "lichess-Vrfmu",
    "fen": "3r2k1/5pp1/4p2p/8/Q3N3/b3PP2/P1K2PRP/3r4 b - - 4 30",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "d1c1",
      "d8d3",
      "c1c3"
    ],
    "replyUci": [
      "c2b3",
      "e4c3"
    ],
    "hintPieceSquare": "d1",
    "hintTargetSquare": "c1",
    "hintText": "Find the mate in 3.",
    "rating": 1849
  },
  {
    "id": "lichess-VWh9l",
    "fen": "7k/1R4b1/8/3r1ppp/8/4PKBP/2r2PP1/1R6 b - - 0 35",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "g5g4",
      "h5g4",
      "g7h6"
    ],
    "replyUci": [
      "h3g4",
      "f3f4"
    ],
    "hintPieceSquare": "g5",
    "hintTargetSquare": "g4",
    "hintText": "Find the mate in 3.",
    "rating": 1875
  },
  {
    "id": "lichess-XA7b3",
    "fen": "6r1/pp2kp2/4np2/1Q1p4/3P1q2/7r/PP3PP1/R3RNK1 b - - 2 22",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "g8g2",
      "f4f3",
      "h3h1"
    ],
    "replyUci": [
      "g1g2",
      "g2g1"
    ],
    "hintPieceSquare": "g8",
    "hintTargetSquare": "g2",
    "hintText": "Find the mate in 3.",
    "rating": 1958
  },
  {
    "id": "lichess-yoZ2E",
    "fen": "3Q4/5pk1/5n1p/P7/2r5/4q1PK/6P1/R4R2 b - - 1 38",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "Black to move — Mate in 3",
    "solutionUci": [
      "c4h4",
      "e3g5",
      "g5h5"
    ],
    "replyUci": [
      "h3h4",
      "h4h3"
    ],
    "hintPieceSquare": "c4",
    "hintTargetSquare": "h4",
    "hintText": "Find the mate in 3.",
    "rating": 1897
  },
  {
    "id": "lichess-zGDTk",
    "fen": "2r2rk1/pb3p1p/1p2p1p1/8/2BBqPP1/PP2nR1Q/7P/2R3K1 w - - 0 21",
    "mateIn": 3,
    "difficulty": "master",
    "goal": "White to move — Mate in 3",
    "solutionUci": [
      "h3h7",
      "f3h3",
      "h3h8"
    ],
    "replyUci": [
      "g8h7",
      "h7g8"
    ],
    "hintPieceSquare": "h3",
    "hintTargetSquare": "h7",
    "hintText": "Find the mate in 3.",
    "rating": 1829
  }
];
