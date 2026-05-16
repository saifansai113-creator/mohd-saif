import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfToday } from 'date-fns';
import { cn } from '@/src/lib/utils';

interface CalendarViewProps {
  completions: any[];
  key?: React.Key;
}

export default function CalendarView({ completions }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayCompletions = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    return completions.filter(c => c.date === formatted).length;
  };

  return (
    <div className="space-y-6 px-6 pb-32 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-black">{format(currentDate, 'MMMM yyyy')}</h2>
      </div>

      <div className="rounded-[2.5rem] bg-white p-6 border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-4 grid grid-cols-7 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-[10px] font-bold uppercase tracking-widest opacity-20">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-4">
          {/* Add empty slots for the first week */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map((day) => {
            const completionCount = getDayCompletions(day);
            const isTodayDay = isToday(day);

            return (
              <div key={day.toString()} className="flex flex-col items-center justify-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all",
                    completionCount > 0 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20" 
                      : isTodayDay 
                        ? "border border-indigo-600 text-indigo-600" 
                        : "text-slate-300"
                  )}
                >
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-indigo-50 p-6 dark:bg-indigo-900/20">
        <h3 className="mb-2 font-display font-bold text-indigo-900 dark:text-indigo-100">Monthly Insight</h3>
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          You've completed {completions.filter(c => isSameMonth(new Date(c.date), currentDate)).length} habit sessions this month. Great job!
        </p>
      </div>
    </div>
  );
}
