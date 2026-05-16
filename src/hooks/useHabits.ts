import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db as localDb, type Habit as LocalHabit, type Completion as LocalCompletion, type Badge as LocalBadge } from '@/src/db/db';
import { db as firestore, auth } from '@/src/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  doc, 
  getDocs
} from 'firebase/firestore';
import { format, startOfToday, subDays } from 'date-fns';
import { useAuthState } from 'react-firebase-hooks/auth';

export function useHabits() {
  const [user] = useAuthState(auth as any);
  const [remoteHabits, setRemoteHabits] = useState<any[]>([]);
  const [remoteCompletions, setRemoteCompletions] = useState<any[]>([]);
  const [remoteBadges, setRemoteBadges] = useState<any[]>([]);

  // Local data for offline/unauthenticated
  const localHabits = useLiveQuery(() => localDb.habits.toArray()) || [];
  const localCompletions = useLiveQuery(() => localDb.completions.toArray()) || [];
  const localBadges = useLiveQuery(() => localDb.badges.toArray()) || [];

  const today = format(startOfToday(), 'yyyy-MM-dd');

  // Sync with Firestore if user is present
  useEffect(() => {
    if (!user) return;

    const habitsRef = collection(firestore, 'habits');
    const qHabits = query(habitsRef, where('userId', '==', user.uid));
    const unsubHabits = onSnapshot(qHabits, (snapshot) => {
      setRemoteHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const completionsRef = collection(firestore, 'completions');
    const qCompletions = query(completionsRef, where('userId', '==', user.uid));
    const unsubCompletions = onSnapshot(qCompletions, (snapshot) => {
      setRemoteCompletions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const badgesRef = collection(firestore, 'badges');
    const qBadges = query(badgesRef, where('userId', '==', user.uid));
    const unsubBadges = onSnapshot(qBadges, (snapshot) => {
      setRemoteBadges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubHabits();
      unsubCompletions();
      unsubBadges();
    };
  }, [user]);

  const habits = user ? remoteHabits : localHabits;
  const completions = user ? remoteCompletions : localCompletions;
  const badges = user ? remoteBadges : localBadges;

  const addHabit = async (habit: any) => {
    if (user) {
      await addDoc(collection(firestore, 'habits'), {
        ...habit,
        userId: user.uid,
        createdAt: Date.now()
      });
    } else {
      await localDb.habits.add({ ...habit, createdAt: Date.now() });
    }
  };

  const deleteHabit = async (id: any) => {
    if (user) {
      await deleteDoc(doc(firestore, 'habits', id));
    } else {
      await localDb.habits.delete(id as number);
      await localDb.completions.where('habitId').equals(id).delete();
    }
  };

  const toggleCompletion = async (habitId: any, date: string = today) => {
    if (user) {
      const q = query(collection(firestore, 'completions'), 
        where('userId', '==', user.uid), 
        where('habitId', '==', habitId), 
        where('date', '==', date)
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        await deleteDoc(doc(firestore, 'completions', existing.docs[0].id));
      } else {
        await addDoc(collection(firestore, 'completions'), {
          userId: user.uid,
          habitId,
          date
        });
        checkAndAwardBadges();
      }
    } else {
      const existing = await localDb.completions.where({ habitId, date }).first();
      if (existing) {
        await localDb.completions.delete(existing.id!);
      } else {
        await localDb.completions.add({ habitId, date });
        checkAndAwardBadges();
      }
    }
  };

  const isCompletedToday = (habitId: any) => {
    return completions.some(c => c.habitId === habitId && c.date === today);
  };

  const calculateStreak = (habitId: any) => {
    const habitCompletions = completions
      .filter(c => c.habitId === habitId)
      .map(c => c.date)
      .sort((a: string, b: string) => b.localeCompare(a));

    if (habitCompletions.length === 0) return 0;

    let streak = 0;
    let currentDate = startOfToday();

    if (habitCompletions[0] !== today) {
      currentDate = subDays(currentDate, 1);
      if (habitCompletions[0] !== format(currentDate, 'yyyy-MM-dd')) return 0;
    }

    for (const dateStr of habitCompletions) {
      if (dateStr === format(currentDate, 'yyyy-MM-dd')) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const checkAndAwardBadges = async () => {
    const totalCompletions = completions.length;
    
    const awardBadge = async (type: string) => {
      const exists = badges.some(b => b.type === type);
      if (!exists) {
        if (user) {
          await addDoc(collection(firestore, 'badges'), { type, userId: user.uid, dateEarned: Date.now() });
        } else {
          await localDb.badges.add({ type, dateEarned: Date.now() });
        }
      }
    };

    if (totalCompletions >= 1) await awardBadge('First Step');
    if (totalCompletions >= 3) await awardBadge('Getting Consistent');
    if (totalCompletions >= 7) await awardBadge('Weekly Warrior');
    if (totalCompletions >= 30) await awardBadge('Habit Master');
  };

  const progressToday = habits.length 
    ? (habits.filter(h => isCompletedToday(h.id)).length / habits.length) * 100 
    : 0;

  return {
    user,
    habits,
    completions,
    badges,
    addHabit,
    deleteHabit,
    toggleCompletion,
    isCompletedToday,
    calculateStreak,
    progressToday,
    today
  };
}
