/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Participant {
  id: string;
  name: string;
  club: string; // Dojo / Kontingen
  gender: 'Laki-laki' | 'Perempuan';
  ageGroup: string; // e.g. "Usia Dini", "Cadet", "Junior", "Senior"
  categoryType: 'Kata' | 'Kumite';
  division: string; // Berat badan atau kelas (e.g. "-55kg", "Bebas", "Perorangan")
  photoUrl: string | null; // Base64 data URL or null (fallback to character badge)
  weight?: string; // Optional weight in kg
  birthDate?: string;
  actualWeight?: number; // Target weight weighed in kg
  isCheckedIn?: boolean; // Absent / Present status
  weighInStatus?: 'Pass' | 'Overweight' | 'Underweight'; // Status pass weigh-in
  paymentProofUrl?: string; // Base64 data URL for payment proof
  paymentStatus?: 'Belum Bayar' | 'Menunggu Verifikasi' | 'Lunas';
  verificationStatus?: 'Menunggu' | 'Terverifikasi' | 'Ditolak';
}

export type BracketType = 'Single' | 'Double' | 'Group' | 'RoundRobin';

export interface PaymentSettings {
  bankName: string;
  accountNumber: string;
  accountName: string;
  feePerClass: number;
}

export interface Category {
  id: string;
  name: string;
  categoryType: 'Kata' | 'Kumite';
  ageGroup: string;
  division: string;
  bracketType: BracketType;
  participantIds: string[];
  isLocked: boolean; // Is brackets generated
}

export interface KaratePenalties {
  c1: number; // Category 1 warnings (Chui, Keikoku, etc. or general points counts)
  c2: number; // Category 2 warnings
  hansoku: boolean; // Disqualification
}

export interface Match {
  id: string;
  categoryId: string;
  bracketType: BracketType;
  round: number; // 1 for first round, 2 for quarter, etc.
  roundName: string; // "Penyisihan", "Semifinal", "Perebutan Juara 3", "Final"
  matchNumber: number; // Display order
  
  // Aka (Red) Athlete
  akaId: string | null;
  akaScore: number;
  akaPenalties: KaratePenalties;
  akaSenshu: boolean; // First key points tie-breaker
  akaHantei: boolean; // Decision award if draw

  // Ao (Blue) Athlete
  aoId: string | null;
  aoScore: number;
  aoPenalties: KaratePenalties;
  aoSenshu: boolean;
  aoHantei: boolean;

  winnerId: string | null;
  isCompleted: boolean;
  
  // Single Elimination links
  nextMatchId: string | null;
  akaSourceMatchId: string | null; // Previous match supplying Aka
  aoSourceMatchId: string | null;  // Previous match supplying Ao
  isBronzeMatch?: boolean;

  // Double Elimination specific
  loserMatchId?: string | null; // Where the loser goes (Losers bracket match)
  isLosersBracket?: boolean;

  // Scheduling & Area Allocation
  tatamiNumber?: number; // Target Tatami Arena e.g., 1, 2, 3, 4
  scheduledTime?: string; // Scheduled hour of the match
}

// For Round Robin
export interface StandingsRow {
  participantId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number; // standard: 3 for win, 1 for draw, 0 for loss (or points score-sum)
  scoreGiven: number; // total points scored by athlete
  scoreReceived: number; // total points scored against athlete
}

export interface GroupStageContainer {
  id: string;
  categoryId: string;
  groupName: string; // Group A, Group B, etc.
  participantIds: string[];
  standings: StandingsRow[];
  matches: Match[];
}
