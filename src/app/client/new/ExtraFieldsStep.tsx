"use client";

import { useState } from "react";
import { BuletinData, DocumentType, MandatExtraFields } from "@/types";

interface Props {
  buletinData: BuletinData;
  selectedDocs: DocumentType[];
  extraFields: Partial<MandatExtraFields>;
  onComplete: (fields: Partial<MandatExtraFields>) => void;
}

export default function ExtraFieldsStep({ selectedDocs, extraFields: initial, onComplete }: Props) {
  const [fields, setFields] = useState<Partial<MandatExtraFields>>(initial);

  const needsMandat = selectedDocs.includes("mandat");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(fields);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Date suplimentare</h2>
        <p className="text-sm text-gray-500">
          Completează detaliile specifice documentelor selectate.
        </p>
      </div>

      {needsMandat && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Contract de mandat
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresa proprietății
            </label>
            <input
              type="text"
              required
              value={fields.property_address ?? ""}
              onChange={(e) => setFields((p) => ({ ...p, property_address: e.target.value }))}
              placeholder="Str. Exemplu nr. 1, Cluj-Napoca"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tip mandat
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["exclusiv", "neexclusiv"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFields((p) => ({ ...p, mandate_type: type }))}
                  className={`rounded-xl border-2 px-4 py-4 text-sm font-semibold capitalize transition-colors ${
                    fields.mandate_type === type
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comision (%)
            </label>
            <input
              type="number"
              required
              min={0}
              max={100}
              step={0.5}
              value={fields.commission_percent ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setFields((p) => ({ ...p, commission_percent: v === "" ? undefined : parseFloat(v) }));
              }}
              placeholder="3"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durată mandat (luni)
            </label>
            <input
              type="number"
              required
              min={1}
              max={24}
              value={fields.duration_months ?? ""}
              onChange={(e) => setFields((p) => ({ ...p, duration_months: parseInt(e.target.value) }))}
              placeholder="6"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {!needsMandat && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Acordul GDPR nu necesită câmpuri suplimentare.</p>
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Generează documentele →
      </button>
    </form>
  );
}
