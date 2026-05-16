import React from 'react';
import { Check, Flame, Trash2, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface HabitCardProps {
  habit: any;
  isCompleted: boolean;
  streak: number;
  onToggle: () => void;
  onDelete: () => void;
  key?: React.Key;
}

export default function HabitCard({ habit, isCompleted, streak, onToggle, onDelete }: HabitCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl p-4 transition-all",
        isCompleted 
          ? "bg-slate-50 border border-indigo-100 dark:bg-slate-900/50 dark:border-indigo-900/30" 
          : "bg-slate-50 border border-transparent dark:bg-slate-900/50"
      )}
    >
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
        habit.color.replace('bg-', 'bg-').replace('500', '100'),
        isCompleted ? "opacity-100" : "opacity-60"
      )}>
        {habit.icon}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <h3 className={cn("truncate font-semibold text-sm", isCompleted && "text-slate-400 line-through")}>
          {habit.name}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-40">
          <span>{habit.frequency}</span>
          {habit.time && (
            <>
              <span>•</span>
              <span className="text-indigo-500 font-black">{habit.time}</span>
              {habit.reminderEnabled && (
                <Bell size={10} className="ml-0.5 text-indigo-400" fill="currentColor" />
              )}
            </>
          )}
          <span>•</span>
          <div className="flex items-center gap-1">
            <Flame size={10} fill="currentColor" />
            <span>{streak}d streak</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 opacity-0 transition-all hover:bg-rose-100 group-hover:opacity-100 dark:bg-rose-900/20"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={onToggle}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-all active:scale-90",
            isCompleted 
              ? "bg-indigo-600 border-indigo-600 text-white" 
              : "border-indigo-200 bg-white dark:bg-slate-800 dark:border-slate-700"
          )}
        >
          <Check size={16} strokeWidth={4} className={isCompleted ? "scale-100" : "scale-0"} />
        </button>
      </div>
    </motion.div>
  );
}
