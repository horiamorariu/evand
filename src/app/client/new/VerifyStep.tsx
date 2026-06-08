"use client";

import { useState } from "react";
import { BuletinData } from "@/types";

interface Props {
  initialData: BuletinData;
  onComplete: (data: BuletinData) => void;
}

const FIELDS: { key: keyof BuletinData; label: string; type?: string }[] = [
  { key: "last_name", label: "Nume" },
  { key: "first_name", label: "Prenume" },
  { key: "cnp", label: "CNP" },
  { key: "series", label: "Serie buletin" },
  { key: "number", label: "Număr buletin" },
  { key: "address", label: "Adresă domiciliu" },
  { key: "birthdate", label: "Data nașterii", type: "date" },
  { key: "expiry_date", label: "Data expirării", type: "date" },
];

export default function VerifyStep({ initialData, onComplete }: Props) {
  const [data, setData] = useState<BuletinData>(initialData);

  function handleChange(key: keyof BuletinData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Verifică datele</h2>
        <p className="text-sm text-gray-500">
          Corectează dacă ceva nu a fost citit corect.
        </p>
      </div>

      <div className="space-y-3">
        {FIELDS.map(({ key, label, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              type={type ?? "text"}
              required
              value={data[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Datele sunt corecte →
      </button>
    </form>
  );
}
