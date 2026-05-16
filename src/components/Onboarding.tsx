import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Zap, Trophy, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    title: "Track Your Habits",
    description: "Build a better version of yourself by tracking daily routines.",
    icon: <Zap className="text-amber-500" size={64} />,
    color: "bg-amber-50"
  },
  {
    title: "Simple & Offline",
    description: "Your data stays on your device. Fast, secure, and privacy-focused.",
    icon: <CheckCircle2 className="text-emerald-500" size={64} />,
    color: "bg-emerald-50"
  },
  {
    title: "Keep the Streak",
    description: "Earn badges and keep your 🔥 streak alive to stay motivated.",
    icon: <Trophy className="text-indigo-500" size={64} />,
    color: "bg-indigo-50"
  }
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current === SLIDES.length - 1) {
      onComplete();
    } else {
      setCurrent(current + 1);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-1 flex-col items-center justify-center p-8 text-center"
        >
          <div className={`mb-12 flex h-48 w-48 items-center justify-center rounded-full ${SLIDES[current].color} dark:bg-opacity-10`}>
            {SLIDES[current].icon}
          </div>
          <h1 className="mb-4 font-display text-4xl font-black">{SLIDES[current].title}</h1>
          <p className="max-w-xs text-lg opacity-60">{SLIDES[current].description}</p>
        </motion.div>
      </AnimatePresence>

      <div className="p-8 pb-12">
        <div className="mb-8 flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`}
            />
          ))}
        </div>
        
        <button
          onClick={next}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-5 font-display text-xl font-bold text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20"
        >
          {current === SLIDES.length - 1 ? 'Start Flowing' : 'Continue'}
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
