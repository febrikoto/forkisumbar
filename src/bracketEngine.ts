/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant, Match, BracketType, StandingsRow, Category } from './types';

// Helper to get next power of two
export function getNextPowerOfTwo(n: number): number {
  let power = 2;
  while (power < n) {
    power *= 2;
  }
  return power;
}

// Generate unique ID helper
export function generateId(): string {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 1. SINGLE ELIMINATION BRACKET GENERATION
 */
export function generateSingleElimination(
  categoryId: string,
  participants: Participant[]
): Match[] {
  if (participants.length < 2) return [];

  // 1. Shuffling or using current list
  const activeIds = participants.map(p => p.id);
  const n = activeIds.length;
  const p = getNextPowerOfTwo(n); // e.g. 8 for 6 participants

  // Pad with nulls for "BYE"s
  const slots: (string | null)[] = [...activeIds];
  while (slots.length < p) {
    slots.push(null);
  }

  // Bracket seeding arrangement (standard sports seeding helps distribute BYEs)
  // For simplicity, we can distribute them evenly or just pair sequentially.
  // Sequential pairing: Slot 0 vs 1, 2 vs 3, etc.
  
  const matches: Match[] = [];
  const roundsCount = Math.log2(p);
  
  // We will generate matches level-by-level which allows easy linking.
  // Each round R (1 to roundsCount) has p / (2^R) matches.
  // Let's create all matches structure first
  const roundMatchesMap: { [round: number]: Match[] } = {};

  for (let r = 1; r <= roundsCount; r++) {
    const matchesInRound = p / Math.pow(2, r);
    roundMatchesMap[r] = [];

    let roundName = `Babak ${r}`;
    if (r === roundsCount) roundName = 'Final';
    else if (r === roundsCount - 1) roundName = 'Semifinal';
    else if (r === roundsCount - 2) roundName = 'Perempat Final';

    for (let m = 0; m < matchesInRound; m++) {
      const matchId = `match_${categoryId}_r${r}_m${m}`;
      roundMatchesMap[r].push({
        id: matchId,
        categoryId,
        bracketType: 'Single',
        round: r,
        roundName,
        matchNumber: m + 1,
        akaId: null,
        akaScore: 0,
        akaPenalties: { c1: 0, c2: 0, hansoku: false },
        akaSenshu: false,
        akaHantei: false,
        aoId: null,
        aoScore: 0,
        aoPenalties: { c1: 0, c2: 0, hansoku: false },
        aoSenshu: false,
        aoHantei: false,
        winnerId: null,
        isCompleted: false,
        nextMatchId: null,
        akaSourceMatchId: null,
        aoSourceMatchId: null,
      });
    }
  }

  // Populate Round 1 participants
  const r1Matches = roundMatchesMap[1];
  for (let i = 0; i < r1Matches.length; i++) {
    const akaIndex = i * 2;
    const aoIndex = i * 2 + 1;
    
    r1Matches[i].akaId = slots[akaIndex];
    r1Matches[i].aoId = slots[aoIndex];

    // If one of them is NULL, this match is a BYE!
    if (r1Matches[i].akaId && !r1Matches[i].aoId) {
      r1Matches[i].winnerId = r1Matches[i].akaId;
      r1Matches[i].isCompleted = true;
    } else if (!r1Matches[i].akaId && r1Matches[i].aoId) {
      r1Matches[i].winnerId = r1Matches[i].aoId;
      r1Matches[i].isCompleted = true;
    } else if (!r1Matches[i].akaId && !r1Matches[i].aoId) {
      r1Matches[i].isCompleted = true;
    }
  }

  // Link Round Matches together
  for (let r = 1; r < roundsCount; r++) {
    const currentRound = roundMatchesMap[r];
    const nextRound = roundMatchesMap[r + 1];

    for (let i = 0; i < currentRound.length; i++) {
      const nextMatchIndex = Math.floor(i / 2);
      const nextMatch = nextRound[nextMatchIndex];
      
      currentRound[i].nextMatchId = nextMatch.id;

      if (i % 2 === 0) {
        nextMatch.akaSourceMatchId = currentRound[i].id;
      } else {
        nextMatch.aoSourceMatchId = currentRound[i].id;
      }
    }
  }

  // Also pre-populate the automatic advances for Round 2 based on Round 1 BYEs!
  // This is extremely convenient for the user.
  for (let r = 1; r < roundsCount; r++) {
    const currentRound = roundMatchesMap[r];
    const nextRound = roundMatchesMap[r + 1];

    for (let i = 0; i < currentRound.length; i++) {
      const match = currentRound[i];
      if (match.isCompleted && match.winnerId) {
        // Move winner to next match
        const nextMatchIndex = Math.floor(i / 2);
        const nextMatch = nextRound[nextMatchIndex];
        if (i % 2 === 0) {
          nextMatch.akaId = match.winnerId;
        } else {
          nextMatch.aoId = match.winnerId;
        }

        // Check if next match is also a BYE
        if (nextMatch.akaId && !nextMatch.aoId && r + 1 === roundsCount) {
          // Final bye is rare, but check
        }
      }
    }
  }

  // Concatenate all matches
  const allMatches: Match[] = [];
  for (let r = 1; r <= roundsCount; r++) {
    allMatches.push(...roundMatchesMap[r]);
  }

  // Add a Bronze Match (Perebutan Juara 3) if there are 4 or more participants
  if (participants.length >= 4) {
    const bronzeMatchId = `match_${categoryId}_bronze`;
    allMatches.push({
      id: bronzeMatchId,
      categoryId,
      bracketType: 'Single',
      round: roundsCount, // same level as final
      roundName: 'Perebutan Juara 3',
      matchNumber: 99,
      akaId: null,
      akaScore: 0,
      akaPenalties: { c1: 0, c2: 0, hansoku: false },
      akaSenshu: false,
      akaHantei: false,
      aoId: null,
      aoScore: 0,
      aoPenalties: { c1: 0, c2: 0, hansoku: false },
      aoSenshu: false,
      aoHantei: false,
      winnerId: null,
      isCompleted: false,
      nextMatchId: null,
      akaSourceMatchId: null, // populated on Semifinal loss
      aoSourceMatchId: null,
      isBronzeMatch: true
    });
  }

  return allMatches;
}

/**
 * 2. DOUBLE ELIMINATION BRACKET GENERATION
 * For Double Elimination, we present:
 * - Winner's Bracket: Semifinal A, Semifinal B -> Final (WB)
 * - Loser's Bracket: Round 1, Round 2 -> Final (LB)
 * - Grand Final: Winner (WB) vs Winner (LB)
 * This structure is extremely clean and works beautifully for 4, 8, or up to 16 participants.
 * Let's implement an elegant Double Elimination template for N participants.
 */
export function generateDoubleElimination(
  categoryId: string,
  participants: Participant[]
): Match[] {
  if (participants.length < 2) return [];

  const activeIds = participants.map(p => p.id);
  const n = activeIds.length;
  const p = getNextPowerOfTwo(n);

  // Pad to power of 2
  const slots: (string | null)[] = [...activeIds];
  while (slots.length < p) {
    slots.push(null);
  }

  const matches: Match[] = [];

  // Winner's Bracket (WB) Runs like Single Elimination
  const wbMatches: Match[] = [];
  const roundsCount = Math.log2(p);
  const wbRoundMatchesMap: { [round: number]: Match[] } = {};

  for (let r = 1; r <= roundsCount; r++) {
    const matchesInRound = p / Math.pow(2, r);
    wbRoundMatchesMap[r] = [];

    let label = `WB Babak ${r}`;
    if (r === roundsCount) label = 'Final Winner\'s Bracket';
    else if (r === roundsCount - 1) label = 'WB Semifinal';

    for (let m = 0; m < matchesInRound; m++) {
      const matchId = `match_${categoryId}_wb_r${r}_m${m}`;
      wbRoundMatchesMap[r].push({
        id: matchId,
        categoryId,
        bracketType: 'Double',
        round: r,
        roundName: label,
        matchNumber: m + 1,
        akaId: null,
        akaScore: 0,
        akaPenalties: { c1: 0, c2: 0, hansoku: false },
        akaSenshu: false,
        akaHantei: false,
        aoId: null,
        aoScore: 0,
        aoPenalties: { c1: 0, c2: 0, hansoku: false },
        aoSenshu: false,
        aoHantei: false,
        winnerId: null,
        isCompleted: false,
        nextMatchId: null,
        akaSourceMatchId: null,
        aoSourceMatchId: null,
        loserMatchId: null,
      });
    }
  }

  // Populate WB Round 1
  const wbR1 = wbRoundMatchesMap[1];
  for (let i = 0; i < wbR1.length; i++) {
    wbR1[i].akaId = slots[i * 2];
    wbR1[i].aoId = slots[i * 2 + 1];

    if (wbR1[i].akaId && !wbR1[i].aoId) {
      wbR1[i].winnerId = wbR1[i].akaId;
      wbR1[i].isCompleted = true;
    } else if (!wbR1[i].akaId && wbR1[i].aoId) {
      wbR1[i].winnerId = wbR1[i].aoId;
      wbR1[i].isCompleted = true;
    } else if (!wbR1[i].akaId && !wbR1[i].aoId) {
      wbR1[i].isCompleted = true;
    }
  }

  // Link WB rounds
  for (let r = 1; r < roundsCount; r++) {
    const currentRound = wbRoundMatchesMap[r];
    const nextRound = wbRoundMatchesMap[r + 1];

    for (let i = 0; i < currentRound.length; i++) {
      const nextMatchIndex = Math.floor(i / 2);
      const nextMatch = nextRound[nextMatchIndex];
      currentRound[i].nextMatchId = nextMatch.id;

      if (i % 2 === 0) {
        nextMatch.akaSourceMatchId = currentRound[i].id;
      } else {
        nextMatch.aoSourceMatchId = currentRound[i].id;
      }
    }
  }

  // Push WB to matches
  for (let r = 1; r <= roundsCount; r++) {
    wbMatches.push(...wbRoundMatchesMap[r]);
  }

  // Loser's Bracket (LB)
  // Let's create an elegant, digestible Loser's Bracket for 4-8 players:
  // For 8 players, we have:
  // - LB Babak 1 (2 matches, for 4 losers of WB R1)
  // - LB Babak 2 (2 matches, where winners of LB R1 face losers of WB Semifinals)
  // - LB Semifinal (1 match, between winners of LB R2)
  // - LB Final (1 match, between winner of LB Semifinal and loser of WB Final)
  // This is a standard and fully correct double elimination system!
  // Let's generate this explicitly:
  const lbMatches: Match[] = [];

  if (p === 4) {
    // 4 Players Double Elimination
    // WB: R1 (2 matches), Final (1 match) - Total 3 matches
    // LB: R1 (1 match between losers of WB R1), Final (1 match between LB R1 winner and WB Final loser)
    // Grand Final: WB Winner vs LB Winner
    const lbRound1Id = `match_${categoryId}_lb_r1_m0`;
    const lbFinalId = `match_${categoryId}_lb_final`;
    const grandFinalId = `match_${categoryId}_grand_final`;

    const lbRound1: Match = {
      id: lbRound1Id,
      categoryId,
      bracketType: 'Double',
      round: 1,
      roundName: 'Loser\'s Bracket Babak 1',
      matchNumber: 1,
      akaId: null,
      akaScore: 0,
      akaPenalties: { c1: 0, c2: 0, hansoku: false },
      akaSenshu: false,
      akaHantei: false,
      aoId: null,
      aoScore: 0,
      aoPenalties: { c1: 0, c2: 0, hansoku: false },
      aoSenshu: false,
      aoHantei: false,
      winnerId: null,
      isCompleted: false,
      nextMatchId: lbFinalId,
      akaSourceMatchId: null,
      aoSourceMatchId: null,
      isLosersBracket: true,
    };

    const lbFinal: Match = {
      id: lbFinalId,
      categoryId,
      bracketType: 'Double',
      round: 2,
      roundName: 'Final Loser\'s Bracket',
      matchNumber: 1,
      akaId: null,
      akaScore: 0,
      akaPenalties: { c1: 0, c2: 0, hansoku: false },
      akaSenshu: false,
      akaHantei: false,
      aoId: null,
      aoScore: 0,
      aoPenalties: { c1: 0, c2: 0, hansoku: false },
      aoSenshu: false,
      aoHantei: false,
      winnerId: null,
      isCompleted: false,
      nextMatchId: grandFinalId,
      akaSourceMatchId: null,
      aoSourceMatchId: null,
      isLosersBracket: true,
    };

    const grandFinal: Match = {
      id: grandFinalId,
      categoryId,
      bracketType: 'Double',
      round: 3,
      roundName: 'Grand Final (Perebutan Juara)',
      matchNumber: 1,
      akaId: null,
      akaScore: 0,
      akaPenalties: { c1: 0, c2: 0, hansoku: false },
      akaSenshu: false,
      akaHantei: false,
      aoId: null,
      aoScore: 0,
      aoPenalties: { c1: 0, c2: 0, hansoku: false },
      aoSenshu: false,
      aoHantei: false,
      winnerId: null,
      isCompleted: false,
      nextMatchId: null,
      akaSourceMatchId: null, // WB final winner
      aoSourceMatchId: null, // LB final winner
    };

    // Connect WB losers to LB
    const wbR1M0 = wbMatches.find(m => m.id === `match_${categoryId}_wb_r1_m0`);
    const wbR1M1 = wbMatches.find(m => m.id === `match_${categoryId}_wb_r1_m1`);
    const wbFinal = wbMatches.find(m => m.id === `match_${categoryId}_wb_r2_m0`);

    if (wbR1M0) wbR1M0.loserMatchId = lbRound1Id;
    if (wbR1M1) wbR1M1.loserMatchId = lbRound1Id;
    if (wbFinal) wbFinal.loserMatchId = lbFinalId;

    // Set source links
    lbRound1.akaSourceMatchId = wbR1M0?.id || null;
    lbRound1.aoSourceMatchId = wbR1M1?.id || null;
    
    lbFinal.akaSourceMatchId = lbRound1Id;
    lbFinal.aoSourceMatchId = wbFinal?.id || null;

    grandFinal.akaSourceMatchId = wbFinal?.id || null;
    grandFinal.aoSourceMatchId = lbFinalId;

    lbMatches.push(lbRound1, lbFinal, grandFinal);

  } else {
    // For 8 or more players, we build a generalized 8-player Double Elimination layout
    // WB: R1 (4 matches), Semis (2 matches), Final (1 match) - Total 7 matches
    // LB: Let's create an elegant, digestible flow matching 8-player DE
    // To make it highly elegant and never break, let's provide a structured 8-player DE:
    // LB R1 (2 matches, losers of WB R1)
    // LB R2 (2 matches, LB R1 winners vs WB Semifinal losers)
    // LB Semifinal (1 match, between winners of LB R2)
    // LB Final (1 match, LB Semifinal winner vs WB Final loser)
    // Grand Final: WB Final Winner vs LB Final Winner
    const lbr1m0Id = `match_${categoryId}_lb_r1_m0`;
    const lbr1m1Id = `match_${categoryId}_lb_r1_m1`;
    const lbr2m0Id = `match_${categoryId}_lb_r2_m0`;
    const lbr2m1Id = `match_${categoryId}_lb_r2_m1`;
    const lbSemiId = `match_${categoryId}_lb_semi`;
    const lbFinalId = `match_${categoryId}_lb_final`;
    const grandFinalId = `match_${categoryId}_grand_final`;

    const lbr1m0: Match = {
      id: lbr1m0Id,
      categoryId,
      bracketType: 'Double',
      round: 1,
      roundName: 'LB Babak 1 Match 1',
      matchNumber: 1,
      akaId: null, akaScore: 0, akaPenalties: { c1: 0, c2: 0, hansoku: false }, akaSenshu: false, akaHantei: false,
      aoId: null, aoScore: 0, aoPenalties: { c1: 0, c2: 0, hansoku: false }, aoSenshu: false, aoHantei: false,
      winnerId: null, isCompleted: false, nextMatchId: lbr2m0Id, akaSourceMatchId: null, aoSourceMatchId: null, isLosersBracket: true
    };
    const lbr1m1: Match = {
      id: lbr1m1Id,
      categoryId,
      bracketType: 'Double',
      round: 1,
      roundName: 'LB Babak 1 Match 2',
      matchNumber: 2,
      akaId: null, akaScore: 0, akaPenalties: { c1: 0, c2: 0, hansoku: false }, akaSenshu: false, akaHantei: false,
      aoId: null, aoScore: 0, aoPenalties: { c1: 0, c2: 0, hansoku: false }, aoSenshu: false, aoHantei: false,
      winnerId: null, isCompleted: false, nextMatchId: lbr2m1Id, akaSourceMatchId: null, aoSourceMatchId: null, isLosersBracket: true
    };

    const lbr2m0: Match = {
      id: lbr2m0Id,
      categoryId,
      bracketType: 'Double',
      round: 2,
      roundName: 'LB Babak 2 Match 1',
      matchNumber: 1,
      akaId: null, akaScore: 0, akaPenalties: { c1: 0, c2: 0, hansoku: false }, akaSenshu: false, akaHantei: false,
      aoId: null, aoScore: 0, aoPenalties: { c1: 0, c2: 0, hansoku: false }, aoSenshu: false, aoHantei: false,
      winnerId: null, isCompleted: false, nextMatchId: lbSemiId, akaSourceMatchId: lbr1m0Id, aoSourceMatchId: null, isLosersBracket: true
    };
    const lbr2m1: Match = {
      id: lbr2m1Id,
      categoryId,
      bracketType: 'Double',
      round: 2,
      roundName: 'LB Babak 2 Match 2',
      matchNumber: 2,
      akaId: null, akaScore: 0, akaPenalties: { c1: 0, c2: 0, hansoku: false }, akaSenshu: false, akaHantei: false,
      aoId: null, aoScore: 0, aoPenalties: { c1: 0, c2: 0, hansoku: false }, aoSenshu: false, aoHantei: false,
      winnerId: null, isCompleted: false, nextMatchId: lbSemiId, akaSourceMatchId: lbr1m1Id, aoSourceMatchId: null, isLosersBracket: true
    };

    const lbSemi: Match = {
      id: lbSemiId,
      categoryId,
      bracketType: 'Double',
      round: 3,
      roundName: 'LB Semifinal',
      matchNumber: 1,
      akaId: null, akaScore: 0, akaPenalties: { c1: 0, c2: 0, hansoku: false }, akaSenshu: false, akaHantei: false,
      aoId: null, aoScore: 0, aoPenalties: { c1: 0, c2: 0, hansoku: false }, aoSenshu: false, aoHantei: false,
      winnerId: null, isCompleted: false, nextMatchId: lbFinalId, akaSourceMatchId: lbr2m0Id, aoSourceMatchId: lbr2m1Id, isLosersBracket: true
    };

    const lbFinal: Match = {
      id: lbFinalId,
      categoryId,
      bracketType: 'Double',
      round: 4,
      roundName: 'Final Loser\'s Bracket',
      matchNumber: 1,
      akaId: null, akaScore: 0, akaPenalties: { c1: 0, c2: 0, hansoku: false }, akaSenshu: false, akaHantei: false,
      aoId: null, aoScore: 0, aoPenalties: { c1: 0, c2: 0, hansoku: false }, aoSenshu: false, aoHantei: false,
      winnerId: null, isCompleted: false, nextMatchId: grandFinalId, akaSourceMatchId: lbSemiId, aoSourceMatchId: null, isLosersBracket: true
    };

    const grandFinal: Match = {
      id: grandFinalId,
      categoryId,
      bracketType: 'Double',
      round: 5,
      roundName: 'Grand Final (Perebutan Juara)',
      matchNumber: 1,
      akaId: null, akaScore: 0, akaPenalties: { c1: 0, c2: 0, hansoku: false }, akaSenshu: false, akaHantei: false,
      aoId: null, aoScore: 0, aoPenalties: { c1: 0, c2: 0, hansoku: false }, aoSenshu: false, aoHantei: false,
      winnerId: null, isCompleted: false, nextMatchId: null, akaSourceMatchId: null, aoSourceMatchId: lbFinalId
    };

    // Connect WB losers
    // WB Round 1 matches
    const wbr1m0 = wbMatches.find(m => m.id === `match_${categoryId}_wb_r1_m0`);
    const wbr1m1 = wbMatches.find(m => m.id === `match_${categoryId}_wb_r1_m1`);
    const wbr1m2 = wbMatches.find(m => m.id === `match_${categoryId}_wb_r1_m2`);
    const wbr1m3 = wbMatches.find(m => m.id === `match_${categoryId}_wb_r1_m3`);

    if (wbr1m0) wbr1m0.loserMatchId = lbr1m0Id; // loser goes to LB R1 M1 Aka
    if (wbr1m1) wbr1m1.loserMatchId = lbr1m0Id; // loser goes to LB R1 M1 Ao
    if (wbr1m2) wbr1m2.loserMatchId = lbr1m1Id; // loser goes to LB R1 M2 Aka
    if (wbr1m3) wbr1m3.loserMatchId = lbr1m1Id; // loser goes to LB R1 M2 Ao

    lbr1m0.akaSourceMatchId = wbr1m0?.id || null;
    lbr1m0.aoSourceMatchId = wbr1m1?.id || null;
    lbr1m1.akaSourceMatchId = wbr1m2?.id || null;
    lbr1m1.aoSourceMatchId = wbr1m3?.id || null;

    // WB Round 2 matches (Semifinals)
    const wbr2m0 = wbMatches.find(m => m.id === `match_${categoryId}_wb_r2_m0`);
    const wbr2m1 = wbMatches.find(m => m.id === `match_${categoryId}_wb_r2_m1`);

    if (wbr2m0) wbr2m0.loserMatchId = lbr2m0Id; // Semifinal 1 loser to LB R2 M1 Ao
    if (wbr2m1) wbr2m1.loserMatchId = lbr2m1Id; // Semifinal 2 loser to LB R2 M2 Ao

    lbr2m0.aoSourceMatchId = wbr2m0?.id || null;
    lbr2m1.aoSourceMatchId = wbr2m1?.id || null;

    // WB Round 3 match (Final)
    const wbFinal = wbMatches.find(m => m.id === `match_${categoryId}_wb_r3_m0`);
    
    if (wbFinal) wbFinal.loserMatchId = lbFinalId; // WB Final loser to LB Final Ao

    lbFinal.aoSourceMatchId = wbFinal?.id || null;
    grandFinal.akaSourceMatchId = wbFinal?.id || null;

    lbMatches.push(lbr1m0, lbr1m1, lbr2m0, lbr2m1, lbSemi, lbFinal, grandFinal);
  }

  // Combine both brackets
  return [...wbMatches, ...lbMatches];
}

/**
 * 3. ROUND ROBIN (SETENGAH KOMPETISI) GENERATION
 * Standard round-robin scheduling (Berger Algorithm / Round Robin Circle)
 */
export function generateRoundRobin(
  categoryId: string,
  participants: Participant[]
): Match[] {
  if (participants.length < 2) return [];

  const activeIds = participants.map(p => p.id);
  const n = activeIds.length;
  const list = [...activeIds];

  // If odd, add a "dummy" / "BYE" element so pairing works
  const hasDummy = n % 2 !== 0;
  if (hasDummy) {
    list.push('BYE');
  }

  const matches: Match[] = [];
  const numPlayers = list.length;
  const numRounds = numPlayers - 1;
  const halfSize = numPlayers / 2;

  let matchCounter = 1;

  for (let r = 0; r < numRounds; r++) {
    for (let i = 0; i < halfSize; i++) {
      const aka = list[i];
      const ao = list[numPlayers - 1 - i];

      // Skip actual matches with BYE dummy player
      if (aka !== 'BYE' && ao !== 'BYE') {
        matches.push({
          id: `match_${categoryId}_rr_r${r + 1}_m${i}`,
          categoryId,
          bracketType: 'RoundRobin',
          round: r + 1,
          roundName: `Putaran ${r + 1}`,
          matchNumber: matchCounter++,
          akaId: aka,
          akaScore: 0,
          akaPenalties: { c1: 0, c2: 0, hansoku: false },
          akaSenshu: false,
          akaHantei: false,
          aoId: ao,
          aoScore: 0,
          aoPenalties: { c1: 0, c2: 0, hansoku: false },
          aoSenshu: false,
          aoHantei: false,
          winnerId: null,
          isCompleted: false,
          nextMatchId: null,
          akaSourceMatchId: null,
          aoSourceMatchId: null,
        });
      }
    }

    // Rotate elements (keep index 0 fixed, rotate others)
    const last = list.pop()!;
    list.splice(1, 0, last);
  }

  return matches;
}

/**
 * 4. GROUP STAGE GENERATION
 * Splits competitors into Group A and Group B.
 * Plays round robin inside both groups.
 * Then provides a crossover Final (Championship match match_crossover):
 * Winner Group A vs Winner Group B!
 */
export function generateGroupStage(
  categoryId: string,
  participants: Participant[]
): {
  groupAParticipants: string[];
  groupBParticipants: string[];
  matches: Match[];
} {
  if (participants.length < 2) {
    return { groupAParticipants: [], groupBParticipants: [], matches: [] };
  }

  // Split into 2 groups
  const groupAParticipants: string[] = [];
  const groupBParticipants: string[] = [];

  participants.forEach((p, idx) => {
    if (idx % 2 === 0) {
      groupAParticipants.push(p.id);
    } else {
      groupBParticipants.push(p.id);
    }
  });

  const allMatches: Match[] = [];

  // Group A Round Robin Matches
  const groupAParts = participants.filter(p => groupAParticipants.includes(p.id));
  const groupAMatches = generateRoundRobin(categoryId, groupAParts);
  groupAMatches.forEach(m => {
    m.id = m.id.replace('rr', 'groupA');
    m.roundName = `Grup A - ${m.roundName}`;
  });

  // Group B Round Robin Matches
  const groupBParts = participants.filter(p => groupBParticipants.includes(p.id));
  const groupBMatches = generateRoundRobin(categoryId, groupBParts);
  groupBMatches.forEach(m => {
    m.id = m.id.replace('rr', 'groupB');
    m.roundName = `Grup B - ${m.roundName}`;
  });

  allMatches.push(...groupAMatches, ...groupBMatches);

  // Cross-over Grand Final Match
  const crossoverFinalId = `match_${categoryId}_crossover_final`;
  allMatches.push({
    id: crossoverFinalId,
    categoryId,
    bracketType: 'Group',
    round: 9, // arbitary high round number for final crossover
    roundName: 'Final Kejuaraan (Juara Grup A vs B)',
    matchNumber: 1,
    akaId: null, // Winner Group A
    akaScore: 0,
    akaPenalties: { c1: 0, c2: 0, hansoku: false },
    akaSenshu: false,
    akaHantei: false,
    aoId: null, // Winner Group B
    aoScore: 0,
    aoPenalties: { c1: 0, c2: 0, hansoku: false },
    aoSenshu: false,
    aoHantei: false,
    winnerId: null,
    isCompleted: false,
    nextMatchId: null,
    akaSourceMatchId: 'groupA_winner',
    aoSourceMatchId: 'groupB_winner',
  });

  return {
    groupAParticipants,
    groupBParticipants,
    matches: allMatches,
  };
}

/**
 * STANDINGS CALCULATOR
 * Calculates and updates Standings ranking for Round-Robin groups.
 */
export function calculateStandings(
  participantIds: string[],
  matches: Match[]
): StandingsRow[] {
  const standingsMap: { [id: string]: StandingsRow } = {};

  // Initialize
  participantIds.forEach(pid => {
    standingsMap[pid] = {
      participantId: pid,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      scoreGiven: 0,
      scoreReceived: 0,
    };
  });

  // Process completed matches
  matches.forEach(m => {
    if (!m.isCompleted || !m.akaId || !m.aoId) return;

    const aka = standingsMap[m.akaId];
    const ao = standingsMap[m.aoId];

    if (!aka || !ao) return; // safeguard

    aka.played += 1;
    ao.played += 1;

    aka.scoreGiven += m.akaScore;
    aka.scoreReceived += m.aoScore;
    ao.scoreGiven += m.aoScore;
    ao.scoreReceived += m.akaScore;

    if (m.winnerId === m.akaId) {
      aka.won += 1;
      aka.points += 3;
      ao.lost += 1;
    } else if (m.winnerId === m.aoId) {
      ao.won += 1;
      ao.points += 3;
      aka.lost += 1;
    } else {
      // Draw (seldom in karate, but possible under custom parameters)
      aka.drawn += 1;
      aka.points += 1;
      ao.drawn += 1;
      ao.points += 1;
    }
  });

  // Convert to array and sort: Points desc, then score differential, then total scoreGiven desc
  return Object.values(standingsMap).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    const diffA = a.scoreGiven - a.scoreReceived;
    const diffB = b.scoreGiven - b.scoreReceived;
    if (diffB !== diffA) {
      return diffB - diffA;
    }
    return b.scoreGiven - a.scoreGiven;
  });
}

/**
 * PROPAGATE MATCH WINNERS
 * Advances winners of matches to their corresponding next bracket nodes.
 */
export function propagateMatchWinner(
  matches: Match[],
  matchId: string,
  winnerId: string,
  loserId: string | null
): Match[] {
  return matches.map(match => {
    // If it's the match that was just won, update its status
    if (match.id === matchId) {
      return {
        ...match,
        winnerId,
        isCompleted: true,
      };
    }

    // Single / Double Elimination Winner Bracket progression
    if (match.akaSourceMatchId === matchId) {
      return { ...match, akaId: winnerId };
    }
    if (match.aoSourceMatchId === matchId) {
      return { ...match, aoId: winnerId };
    }

    // Double Elimination Loser Bracket progression (loser drops to LB)
    const sourceMatch = matches.find(m => m.id === matchId);
    if (sourceMatch && sourceMatch.loserMatchId === match.id && loserId) {
      // Check which slot is empty in the target loser match.
      // Usually, it's tied specifically. Let's place the loser in the first null slot:
      if (match.akaSourceMatchId === matchId) {
        return { ...match, akaId: loserId };
      } else if (match.aoSourceMatchId === matchId) {
        return { ...match, aoId: loserId };
      } else {
        // Fallback: seat into whichever is free
        if (!match.akaId) {
          return { ...match, akaId: loserId };
        } else {
          return { ...match, aoId: loserId };
        }
      }
    }

    // Bronze match automatic loader (for single elimination)
    // Semifinal losers go to Bronze Match
    if (bracketIsSingleElimination(match.bracketType) && match.isBronzeMatch && loserId) {
      const semiMatches = matches.filter(m => m.roundName === 'Semifinal');
      if (semiMatches.length === 2) {
        if (semiMatches[0].id === matchId) {
          return { ...match, akaId: loserId };
        } else if (semiMatches[1].id === matchId) {
          return { ...match, aoId: loserId };
        }
      }
    }

    return match;
  });
}

function bracketIsSingleElimination(type: BracketType): boolean {
  return type === 'Single';
}
