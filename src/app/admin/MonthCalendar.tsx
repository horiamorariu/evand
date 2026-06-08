"use client";

interface DocEntry {
  id: string;
  created_at: string;
}

interface Props {
  documents: DocEntry[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];
const MONTHS = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];

export default function MonthCalendar({ documents, selectedDate, onSelectDate }: Props) {
  const sel = new Date(selectedDate + "T00:00:00");
  const year = sel.getFullYear();
  const month = sel.getMonth();

  // count per day
  const counts: Record<string, number> = {};
  for (const doc of documents) {
    const day = doc.created_at.slice(0, 10);
    counts[day] = (counts[day] ?? 0) + 1;
  }

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday-first offset
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date().toISOString().slice(0, 10);

  function pad(n: number) { return String(n).padStart(2, "0"); }
  function dateStr(d: number) { return `${year}-${pad(month + 1)}-${pad(d)}`; }

  function prevMonth() {
    const d = new Date(year, month - 1, 1);
    onSelectDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`);
  }
  function nextMonth() {
    const d = new Date(year, month + 1, 1);
    onSelectDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {/* Header lună */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="text-gray-400 hover:text-gray-700 text-xl px-2">‹</button>
        <span className="font-semibold text-gray-900 text-sm">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="text-gray-400 hover:text-gray-700 text-xl px-2">›</button>
      </div>

      {/* Zile săptămână */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Grid zile */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ds = dateStr(day);
          const count = counts[ds] ?? 0;
          const isSelected = ds === selectedDate;
          const isToday = ds === today;

          return (
            <button
              key={i}
              onClick={() => onSelectDate(ds)}
              className={`relative flex flex-col items-center justify-center rounded-xl py-1.5 transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : isToday
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className="text-xs font-medium">{day}</span>
              {count > 0 && (
                <span className={`text-[10px] font-bold ${isSelected ? "text-blue-100" : "text-blue-600"}`}>
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
