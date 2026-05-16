import React, { useState } from 'react';
import { X, Check, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: any) => void;
}

const ICONS = ['🔥', '💧', '🏃', '📚', '🧘', '🍎', '💤', '💊', '💻', '🎸', '🌱', '🧹'];
const COLORS = [
  'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500'
];

export default function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [time, setTime] = useState('08:00');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name,
      icon: selectedIcon,
      color: selectedColor,
      frequency,
      time,
      reminderEnabled,
    });
    setName('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] mx-auto max-w-lg rounded-t-[2.5rem] bg-white p-6 pb-12 card-shadow dark:bg-slate-900"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">New Habit</h2>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium opacity-60">Habit Name</label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Read for 30 mins"
                  className="w-full rounded-2xl bg-slate-100 px-4 py-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium opacity-60">Select Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-xl text-xl transition-all",
                        selectedIcon === icon ? "bg-indigo-600 text-white" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium opacity-60">Select Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        selectedColor === color ? "border-slate-900 scale-110 dark:border-white" : "border-transparent"
                      )}
                    >
                      <div className={cn("h-full w-full rounded-full", color)} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium opacity-60">Frequency</label>
                  <div className="flex gap-2">
                    {(['daily', 'weekly'] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFrequency(freq)}
                        className={cn(
                          "flex-1 rounded-xl py-3 text-xs font-semibold capitalize transition-all",
                          frequency === freq ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800"
                        )}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium opacity-60">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    reminderEnabled ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  )}>
                    {reminderEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">Reminder</p>
                    <p className="text-[10px] font-medium opacity-50">Notify me when it's time</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!reminderEnabled) {
                      const granted = await Notification.requestPermission() === 'granted';
                      if (!granted) {
                        alert("Please enable notifications in your browser first.");
                        return;
                      }
                    }
                    setReminderEnabled(!reminderEnabled);
                  }}
                  className={cn(
                    "h-6 w-12 rounded-full p-1 transition-all",
                    reminderEnabled ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "h-4 w-4 rounded-full bg-white transition-all shadow-sm",
                    reminderEnabled ? "ml-6" : "ml-0"
                  )} />
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 py-4 text-center font-display text-lg font-bold text-white shadow-lg shadow-indigo-200 transition-all active:scale-95 dark:shadow-indigo-900/20"
              >
                Create Habit
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
