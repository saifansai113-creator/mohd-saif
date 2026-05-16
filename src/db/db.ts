import Dexie, { type Table } from 'dexie';

export interface Habit {
  id?: number;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly';
  time?: string; // HH:mm format
  reminderEnabled: boolean;
  createdAt: number;
}

export interface Completion {
  id?: number;
  habitId: number;
  date: string; // YYYY-MM-DD
}

export interface Badge {
  id?: number;
  type: string;
  dateEarned: number;
}

export class HabitFlowDB extends Dexie {
  habits!: Table<Habit>;
  completions!: Table<Completion>;
  badges!: Table<Badge>;

  constructor() {
    super('HabitFlowDB');
    this.version(2).stores({
      habits: '++id, name, frequency',
      completions: '++id, habitId, date, [habitId+date]',
      badges: '++id, type'
    }).upgrade(tx => {
      // Version 2 upgrade logic if needed
    });
  }
}

export const db = new HabitFlowDB();
