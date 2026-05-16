import React from 'react';
import { Home, BarChart2, Calendar, User, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: any) => void;
  onAddClick: () => void;
}

export default function Navigation({ currentView, onViewChange, onAddClick }: NavigationProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'add', icon: Plus, label: 'Add', isAction: true },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white px-4 pb-8 pt-2 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={onAddClick}
                id="nav-add-btn"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 transition-transform active:scale-95 dark:shadow-indigo-900/20"
              >
                <tab.icon size={24} />
              </button>
            );
          }

          const isActive = currentView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id as any)}
              id={`nav-${tab.id}-btn`}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-indigo-600" : "text-slate-300"
              )}
            >
              <tab.icon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
