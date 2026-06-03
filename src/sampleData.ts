/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant, Category } from './types';

// Let's design 4 elegant SVG Karateka icons for Avatar placeholding
export const KARATEKA_AVATARS = [
  // 1. Red Headband Karateka
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23EEF2F6"/><path d="M50 20a15 15 0 1 0 0 30 15 15 0 0 0 0-30z" fill="%23E2E8F0"/><path d="M42 30h16v4H42z" fill="%23EF4444"/><path d="M58 28l6-3v4l-6 1zM42 28l-6-3v4l6 1z" fill="%23EF4444"/><path d="M25 90c0-18 10-25 25-25s25 7 25 25v10H25V90z" fill="%23334155"/><path d="M44 55h12v15H44z" fill="%23E2E8F0"/><path d="M35 72c10 2 20 2 30 0l2 18H33l2-18z" fill="%23FFFFFF"/><path d="M40 76h20v4H40z" fill="%231E293B"/></svg>`,
  // 2. Blue Belt Karateka
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23F1F5F9"/><path d="M50 20a15 15 0 1 0 0 30 15 15 0 0 0 0-30z" fill="%23E2E8F0"/><path d="M25 90c0-18 10-25 25-25s25 7 25 25v10H25V90z" fill="%23475569"/><path d="M44 55h12v15H44z" fill="%23E2E8F0"/><path d="M35 72c10 2 20 2 30 0l2 18H33l2-18z" fill="%23FFFFFF"/><path d="M40 76h20v4H40z" fill="%233B82F6"/></svg>`,
  // 3. Black Belt Cadet
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23EDF2F7"/><path d="M50 20a15 15 0 1 0 0 30 15 15 0 0 0 0-30z" fill="%23CBD5E1"/><path d="M25 90c0-18 10-25 25-25s25 7 25 25v10H25V90z" fill="%231E293B"/><path d="M44 55h12v15H44z" fill="%23CBD5E1"/><path d="M35 72c10 2 20 2 30 0l2 18H33l2-18z" fill="%23FFFFFF"/><path d="M38 75h24v6H38z" fill="%230F172A"/><path d="M45 81l-8 10h4l6-10zm10 0l8 10h-4l-6-10z" fill="%230F172A"/></svg>`,
  // 4. Female Karateka with Red Belt
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23FAF5FF"/><path d="M50 22a14 14 0 1 0 0 28 14 14 0 0 0 0-28z" fill="%23E2E8F0"/><path d="M32 20c0 0 10-8 18-8s18 8 18 8v16c0 0-4-3-18-3S32 36 32 36V20z" fill="%234A5568"/><path d="M25 90c0-18 10-25 25-25s25 7 25 25v10H25V90z" fill="%235B21B6"/><path d="M44 56h12v14H44z" fill="%23E2E8F0"/><path d="M35 73c10 2 20 2 30 0l2 17H33l2-17z" fill="%23FFFFFF"/><path d="M40 77h20v4H40z" fill="%23EF4444"/><path d="M43 81l-3 8h3l2-8zm14 0l3 8h-3l-2-8z" fill="%23EF4444"/></svg>`
];

export const SAMPLE_PARTICIPANTS: Participant[] = [
  {
    id: 'p1',
    name: 'Ahmad Faisal',
    club: 'Inkai Jakarta Pusat',
    gender: 'Laki-laki',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kumite',
    division: '-60kg Putra Senior',
    photoUrl: KARATEKA_AVATARS[0],
    weight: '58'
  },
  {
    id: 'p2',
    name: 'Budi Santoso',
    club: 'KKI Jawa Tengah',
    gender: 'Laki-laki',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kumite',
    division: '-60kg Putra Senior',
    photoUrl: KARATEKA_AVATARS[1],
    weight: '59'
  },
  {
    id: 'p3',
    name: 'Chandra Wijaya',
    club: 'Goju-Ryu Jawa Barat',
    gender: 'Laki-laki',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kumite',
    division: '-60kg Putra Senior',
    photoUrl: KARATEKA_AVATARS[2],
    weight: '60'
  },
  {
    id: 'p4',
    name: 'Dedi Kurniawan',
    club: 'Wadokai Bali',
    gender: 'Laki-laki',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kumite',
    division: '-60kg Putra Senior',
    photoUrl: KARATEKA_AVATARS[3],
    weight: '57'
  },
  {
    id: 'p5',
    name: 'Eko Sulistyo',
    club: 'Lemkari Jawa Timur',
    gender: 'Laki-laki',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kumite',
    division: '-60kg Putra Senior',
    photoUrl: KARATEKA_AVATARS[0],
    weight: '59.5'
  },
  {
    id: 'p6',
    name: 'Fajar Nugraha',
    club: 'Shiroran Sumatera Barat',
    gender: 'Laki-laki',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kumite',
    division: '-60kg Putra Senior',
    photoUrl: KARATEKA_AVATARS[1],
    weight: '58.2'
  },
  {
    id: 'p7',
    name: 'Gilang Ramadhan',
    club: 'Inkanas Sulawesi Selatan',
    gender: 'Laki-laki',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kumite',
    division: '-60kg Putra Senior',
    photoUrl: KARATEKA_AVATARS[2],
    weight: '59.8'
  },
  {
    id: 'p8',
    name: 'Hadi Wibowo',
    club: 'Amura DI Yogyakarta',
    gender: 'Laki-laki',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kumite',
    division: '-60kg Putra Senior',
    photoUrl: KARATEKA_AVATARS[3],
    weight: '56.9'
  },
  {
    id: 'p9',
    name: 'Indah Kusuma',
    club: 'Inkai Jawa Barat',
    gender: 'Perempuan',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kata',
    division: 'Kata Perorangan Putri Senior',
    photoUrl: KARATEKA_AVATARS[3],
    weight: '52'
  },
  {
    id: 'p10',
    name: 'Kartika Sari',
    club: 'KKI DKI Jakarta',
    gender: 'Perempuan',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kata',
    division: 'Kata Perorangan Putri Senior',
    photoUrl: KARATEKA_AVATARS[3],
    weight: '50'
  },
  {
    id: 'p11',
    name: 'Laras Ati',
    club: 'Goju-Ryu Banten',
    gender: 'Perempuan',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kata',
    division: 'Kata Perorangan Putri Senior',
    photoUrl: KARATEKA_AVATARS[3],
    weight: '49'
  },
  {
    id: 'p12',
    name: 'Mega Utami',
    club: 'Lemkari Sumut',
    gender: 'Perempuan',
    ageGroup: 'Senior (18+ Tahun)',
    categoryType: 'Kata',
    division: 'Kata Perorangan Putri Senior',
    photoUrl: KARATEKA_AVATARS[3],
    weight: '54'
  }
];

export const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 'c1',
    name: 'Kumite -60kg Putra Senior (Single Elimination)',
    categoryType: 'Kumite',
    ageGroup: 'Senior (18+ Tahun)',
    division: '-60kg Putra Senior',
    bracketType: 'Single',
    participantIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'],
    isLocked: false
  },
  {
    id: 'c2',
    name: 'Kata Perorangan Putri Senior (Round Robin)',
    categoryType: 'Kata',
    ageGroup: 'Senior (18+ Tahun)',
    division: 'Kata Perorangan Putri Senior',
    bracketType: 'RoundRobin',
    participantIds: ['p9', 'p10', 'p11', 'p12'],
    isLocked: false
  }
];
