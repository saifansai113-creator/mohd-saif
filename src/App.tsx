/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Moon, Sun, Flame } from 'lucide-react';
import { useHabits } from '@/src/hooks/useHabits';
import { format } from 'date-fns';
import Navigation from '@/src/components/Navigation';
import HabitCard from '@/src/components/HabitCard';
import AddHabitModal from '@/src/components/AddHabitModal';
import Onboarding from '@/src/components/Onboarding';
import Stats from '@/src/components/Stats';
import CalendarView from '@/src/components/CalendarView';
import { cn } from '@/src/lib/utils';
import { auth } from '@/src/lib/firebase';

const QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Your habits define your future. Choose them wisely.",
  "Don't stop until you're proud. One step at a time.",
  "Consistency is what transforms average into excellence.",
  "The secret of your future is hidden in your daily routine."
];

export default function App() {
  const [view, setView] = useState<'onboarding' | 'home' | 'stats' | 'calendar' | 'profile'>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('onboarding_completed');
    }
    return true;
  });

  const { 
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
  } = useHabits();

  // Sync user info to Firestore
  useEffect(() => {
    if (user) {
      const syncUser = async () => {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('@/src/lib/firebase');
        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastLogin: Date.now()
        }, { merge: true });
      };
      syncUser();
    }
  }, [user]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastNotified, setLastNotified] = useState<Record<string, string>>({});
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Live Clock & Reminder System
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const timeStr = format(now, 'HH:mm');
      
      habits.forEach(habit => {
        const habitId = habit.id;
        const isTimeMatch = habit.time === timeStr;
        const wasNotifiedThisMinute = lastNotified[habitId] === timeStr;
        const completed = isCompletedToday(habitId);

        if (habit.reminderEnabled && isTimeMatch && !wasNotifiedThisMinute && !completed) {
          if ("Notification" in window && Notification.permission === 'granted') {
            try {
              new Notification(`HabitFlow: ${habit.name}`, {
                body: `It's time for your habit: ${habit.name}!`,
                icon: '/vite.svg'
              });
            } catch (e) {}
          }
          
          setActiveAlert(habit.name);
          setLastNotified(prev => ({ ...prev, [habitId]: timeStr }));
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [habits, completions, lastNotified]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-[#F3F4F6] pb-32 dark:bg-slate-950">
      <header className="flex items-center justify-between px-6 pt-12">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full dark:bg-indigo-900/20">Live</span>
            <p className="text-xs font-bold text-slate-400">{format(currentTime, 'hh:mm:ss a')}</p>
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight">{user ? `Hi, ${user.displayName?.split(' ')[0]}` : "Today's Habits"}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-900"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div 
            onClick={() => setView('profile')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 overflow-hidden cursor-pointer dark:bg-slate-800"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="p" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : "👤"}
          </div>
        </div>
      </header>

      <main className="px-6 pt-8">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="rounded-2xl bg-indigo-600 p-5 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Completion</span>
                  <span className="text-sm font-bold">{Math.round(progressToday)}%</span>
                </div>
                <div className="h-2 w-full bg-indigo-400 rounded-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToday}%` }}
                    className="h-2 bg-white rounded-full transition-all"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-2">Daily Quote</p>
                <p className="text-slate-800 font-serif italic text-base leading-snug dark:text-slate-100">
                  "{quote}"
                </p>
                <p className="text-indigo-500 text-[10px] mt-2 font-bold">— HabitFlow AI</p>
              </div>

              <div className="space-y-3">
                {habits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-white/50 border-2 border-dashed border-slate-200 py-12 text-center dark:bg-slate-900/50 dark:border-slate-800">
                    <div className="mb-3 text-3xl">🌱</div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-30">Plan your first habit</p>
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-4 text-xs font-bold text-indigo-600 underline"
                    >
                      Add Habit
                    </button>
                  </div>
                ) : (
                  habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={isCompletedToday(habit.id)}
                      streak={calculateStreak(habit.id)}
                      onToggle={() => toggleCompletion(habit.id)}
                      onDelete={() => deleteHabit(habit.id)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {view === 'stats' && <Stats key="stats" completions={completions} badges={badges} />}
          {view === 'calendar' && <CalendarView key="calendar" completions={completions} />}
          
          {view === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-12 text-center"
            >
              {user ? (
                <>
                  <div className="mx-auto mb-6 overflow-hidden rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/10 h-24 w-24">
                    <img 
                      src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                      alt="avatar" 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h2 className="mb-1 font-display text-2xl font-bold">{user.displayName || 'User'}</h2>
                  <p className="mb-8 text-sm text-slate-400 font-medium">{user.email}</p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-indigo-50 text-3xl dark:bg-indigo-900/10">
                    👤
                  </div>
                  <h2 className="mb-1 font-display text-2xl font-bold">Offline Mode</h2>
                  <p className="mb-8 text-sm text-slate-400 font-medium truncate px-4">Log in to sync your habits across devices.</p>
                </>
              )}
              
              <div className="space-y-4">
                {user ? (
                  <button 
                    onClick={() => auth.signOut()}
                    className="w-full rounded-2xl bg-rose-50 py-4 text-sm font-bold text-rose-600 shadow-sm dark:bg-rose-900/20"
                  >
                    Log Out
                  </button>
                ) : (
                  <button 
                    onClick={async () => {
                      const { signInWithGoogle } = await import('@/src/lib/firebase');
                      signInWithGoogle();
                    }}
                    className="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20"
                  >
                    Log in with Google
                  </button>
                )}

                <div className="rounded-2xl bg-white p-6 border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4">Reminder Settings</p>
                  <button 
                    onClick={async () => {
                      const permission = await Notification.requestPermission();
                      if (permission === 'granted') {
                        new Notification("HabitFlow", { body: "Alarms are working correctly!" });
                      } else {
                        alert("Permission denied. Please allow notifications in browser settings.");
                      }
                    }}
                    className="w-full rounded-xl bg-indigo-50 py-3 text-sm font-bold text-indigo-600 dark:bg-indigo-900/20"
                  >
                    Test Alarm Notification
                  </button>
                  <p className="mt-3 text-[10px] text-slate-400 leading-relaxed italic">
                    Note: For Alarms to work, please open this app in a <strong>New Tab</strong> and allow notifications when prompted.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    localStorage.removeItem('onboarding_completed');
                    window.location.reload();
                  }}
                  className="w-full rounded-2xl bg-white border border-slate-100 py-4 text-sm font-bold shadow-sm dark:bg-slate-900 dark:border-slate-800 opacity-60"
                >
                  Restart Tour
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Navigation
        currentView={view}
        onViewChange={setView}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addHabit}
      />

      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-6 top-12 z-[100] flex flex-col items-center gap-4 rounded-[2rem] bg-indigo-600 p-6 text-white shadow-2xl"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl">
              ⏰
            </div>
            <div className="text-center">
              <h3 className="font-display text-xl font-bold">Time for {activeAlert}!</h3>
              <p className="text-sm opacity-80">Don't break the streak, complete it now!</p>
            </div>
            <button
              onClick={() => setActiveAlert(null)}
              className="w-full rounded-xl bg-white py-3 font-bold text-indigo-600"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
