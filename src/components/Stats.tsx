import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Trophy, Award, Star, Zap } from 'lucide-react';
import { format, subDays, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { type Badge } from '@/src/db/db';
import { cn } from '@/src/lib/utils';

interface StatsProps {
  completions: any[];
  badges: Badge[];
  key?: React.Key;
}

export default function Stats({ completions, badges }: StatsProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = completions.filter(c => c.date === dateStr).length;
    return {
      day: format(date, 'EEE'),
      fullDate: dateStr,
      count
    };
  });

  const badgeIcons: Record<string, any> = {
    'First Step': <Star className="text-amber-500" />,
    'Getting Consistent': <Zap className="text-blue-500" />,
    'Weekly Warrior': <Award className="text-purple-500" />,
    'Habit Master': <Trophy className="text-orange-500" />,
  };

  return (
    <div className="space-y-8 pb-32 pt-6">
      <div className="px-6">
        <h2 className="mb-2 font-display text-3xl font-black">Your Progress</h2>
        <p className="text-sm opacity-50">Keep pushing towards your goals.</p>
      </div>

      <div className="px-6">
        <div className="rounded-[2.5rem] bg-white p-6 border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="mb-6 font-display font-bold">Weekly Activity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', opacity: 0.3 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                  {last7Days.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count > 0 ? '#4f46e5' : '#f1f5f9'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="px-6">
        <h3 className="mb-4 font-display text-base font-bold">Badges Earned</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(badgeIcons).map((type) => {
            const isEarned = badges.some(b => b.type === type);
            return (
              <div
                key={type}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-[2rem] p-6 text-center transition-all border",
                  isEarned 
                    ? "bg-white border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800" 
                    : "bg-slate-100 border-transparent opacity-30 dark:bg-slate-800"
                )}
              >
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800",
                  !isEarned && "grayscale"
                )}>
                  {React.cloneElement(badgeIcons[type], { size: 24 })}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">{type}</h4>
                  {isEarned && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mt-1">Unlocked</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
