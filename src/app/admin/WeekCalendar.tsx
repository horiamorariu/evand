"use client";

interface DocEntry {
  id: string;
  created_at: string;
}

interface Props {
  documents: DocEntry[];
  selectedDate: string;
  weekStart: string; // Monday ISO date
  onSelectDate: (date: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const DAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];
const MONTHS = ["ian","feb","mar","apr","mai","iun","iul","aug","sep","oct","nov","dec"];

export default function WeekCalendar({ documents, selectedDate, weekStart, onSelectDate, onPrevWeek, onNextWeek }: Props) {
  const _now = new Date();
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`;

  function toLocalDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  const counts: Record<string, number> = {};
  for (const doc of documents) {
    const day = toLocalDate(doc.created_at);
    counts[day] = (counts[day] ?? 0) + 1;
  }

  function pad(n: number) { return String(n).padStart(2, "0"); }

  const days: { date: string; label: string; monthLabel: string }[] = [];
  const ws = new Date(weekStart + "T00:00:00");
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    days.push({ date: iso, label: String(d.getDate()), monthLabel: MONTHS[d.getMonth()] });
  }

  const rangeLabel = (() => {
    const start = new Date(weekStart + "T00:00:00");
    const end = new Date(weekStart + "T00:00:00");
    end.setDate(end.getDate() + 6);
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}–${end.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${MONTHS[start.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
  })();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrevWeek} className="text-gray-400 hover:text-gray-700 text-xl px-2">‹</button>
        <span className="font-semibold text-gray-900 text-sm capitalize">{rangeLabel}</span>
        <button onClick={onNextWeek} className="text-gray-400 hover:text-gray-700 text-xl px-2">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, label, monthLabel }, i) => {
          const count = counts[date] ?? 0;
          const isSelected = date === selectedDate;
          const isToday = date === today;

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center justify-center rounded-xl py-3 transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : isToday
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className={`text-[10px] mb-0.5 ${isSelected ? "text-blue-200" : "text-gray-400"}`}>
                {DAYS[i]}
              </span>
              <span className="text-sm font-semibold">{label}</span>
              <span className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-200" : "text-gray-400"}`}>
                {monthLabel}
              </span>
              {count > 0 && (
                <span className={`text-xs font-bold mt-1 ${isSelected ? "text-white" : "text-blue-600"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
