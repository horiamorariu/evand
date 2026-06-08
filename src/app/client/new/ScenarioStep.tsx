"use client";

import { useState } from "react";
import { TipTranzactie, TipProprietate, ScenarioData } from "@/types";

interface Props {
  onComplete: (data: ScenarioData) => void;
}

const TRANZACTII: { value: TipTranzactie; label: string; icon: string }[] = [
  { value: "vanzare", label: "Vânzare", icon: "🏷️" },
  { value: "inchiriere", label: "Închiriere", icon: "🔑" },
  { value: "vizionare", label: "Vizionare", icon: "👁️" },
  { value: "rezervare", label: "Rezervare", icon: "📌" },
];

const PROPRIETATI: { value: TipProprietate; label: string; icon: string }[] = [
  { value: "apartament", label: "Apartament", icon: "🏢" },
  { value: "casa", label: "Casă / Vilă", icon: "🏡" },
  { value: "teren", label: "Teren", icon: "🌿" },
  { value: "comercial", label: "Comercial", icon: "🏬" },
];

export default function ScenarioStep({ onComplete }: Props) {
  const [tipTranzactie, setTipTranzactie] = useState<TipTranzactie | null>(null);
  const [tipProprietate, setTipProprietate] = useState<TipProprietate | null>(null);

  const canContinue = tipTranzactie !== null && tipProprietate !== null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Tip tranzacție</h2>
        <p className="text-sm text-gray-500">Selectează tipul tranzacției și proprietatea.</p>
      </div>

      {/* Tip tranzacție */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ce tip de tranzacție?</p>
        <div className="grid grid-cols-2 gap-3">
          {TRANZACTII.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTipTranzactie(value)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 transition-colors ${
                tipTranzactie === value
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tip proprietate */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ce tip de proprietate?</p>
        <div className="grid grid-cols-2 gap-3">
          {PROPRIETATI.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTipProprietate(value)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 transition-colors ${
                tipProprietate === value
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={() => onComplete({ tip_tranzactie: tipTranzactie!, tip_proprietate: tipProprietate! })}
        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
      >
        Continuă →
      </button>
    </div>
  );
}
