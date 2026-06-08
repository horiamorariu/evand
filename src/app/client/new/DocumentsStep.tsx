"use client";

import { useState } from "react";
import { DocumentType } from "@/types";

interface Props {
  preSelected: DocumentType[];
  onComplete: (docs: DocumentType[]) => void;
}

const DOCUMENTS: { type: DocumentType; title: string; description: string }[] = [
  { type: "gdpr", title: "Acord GDPR", description: "Consimțământ prelucrare date personale" },
  { type: "mandat", title: "Contract de mandat", description: "Împuternicire agent imobiliar" },
  { type: "fisa_vizionare", title: "Fișă de vizionare", description: "Documentează vizita prin agenție" },
  { type: "exclusivitate", title: "Contract exclusivitate", description: "Proprietarul lucrează doar cu agenția" },
  { type: "bon_rezervare", title: "Bon de rezervare", description: "Rezervare proprietate cu sumă" },
];

export default function DocumentsStep({ preSelected, onComplete }: Props) {
  const [selected, setSelected] = useState<Set<DocumentType>>(new Set(preSelected));

  function toggle(type: DocumentType) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Documente</h2>
        <p className="text-sm text-gray-500">Pre-selectate pe baza scenariului. Poți modifica.</p>
      </div>

      <div className="space-y-3">
        {DOCUMENTS.map(({ type, title, description }) => {
          const isSelected = selected.has(type);
          const isRecommended = preSelected.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggle(type)}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-colors ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{title}</p>
                    {isRecommended && (
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-600 rounded-full px-2 py-0.5">recomandat</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={selected.size === 0}
        onClick={() => onComplete(Array.from(selected))}
        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
      >
        Continuă →
      </button>
    </div>
  );
}
