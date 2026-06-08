"use client";

import { useState } from "react";
import { BuletinData, DocumentType, TipProprietate, ExtraFields } from "@/types";

interface Props {
  buletinData: BuletinData;
  selectedDocs: DocumentType[];
  tipProprietate: TipProprietate;
  extraFields: ExtraFields;
  onComplete: (fields: ExtraFields) => void;
}

function Input({ label, value, onChange, placeholder, type = "text", required = false, min, max, step }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; required?: boolean; min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input
        type={type} value={value} required={required} min={min} max={max} step={step}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

function ToggleGroup<T extends string>({ label, options, value, onChange }: {
  label: string; options: { value: T; label: string }[]; value: T | undefined; onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className={`grid gap-2 grid-cols-${options.length <= 2 ? 2 : options.length <= 3 ? 3 : 4}`}>
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors ${
              value === o.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ title }: { title: string }) {
  return <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">{title}</p>;
}

export default function ExtraFieldsStep({ selectedDocs, tipProprietate, extraFields: initial, onComplete }: Props) {
  const [f, setF] = useState<ExtraFields>(initial);
  const set = (key: keyof ExtraFields, val: unknown) => setF((p) => ({ ...p, [key]: val }));

  const hasMandat = selectedDocs.includes("mandat") || selectedDocs.includes("exclusivitate");
  const hasFisaVizionare = selectedDocs.includes("fisa_vizionare");
  const hasBonRezervare = selectedDocs.includes("bon_rezervare");
  const needsAddress = hasMandat || hasFisaVizionare || hasBonRezervare;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(f);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Date suplimentare</h2>
        <p className="text-sm text-gray-500">Completează detaliile specifice scenariului.</p>
      </div>

      {/* Adresa proprietății — comună pentru mai multe documente */}
      {needsAddress && (
        <Input label="Adresa proprietății" required value={f.property_address ?? ""}
          onChange={(v) => set("property_address", v)}
          placeholder="Str. Exemplu nr. 1, Cluj-Napoca" />
      )}

      {/* Câmpuri specifice tipului de proprietate */}
      {(hasMandat) && tipProprietate === "apartament" && (
        <>
          <Section title="Detalii apartament" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Etaj" value={f.etaj ?? ""} onChange={(v) => set("etaj", v)} placeholder="3" />
            <Input label="Nr. camere" value={f.nr_camere ?? ""} onChange={(v) => set("nr_camere", v)} placeholder="2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Suprafață utilă (mp)" value={f.suprafata_utila ?? ""} onChange={(v) => set("suprafata_utila", v)} placeholder="65" />
            <Input label="Nr. cadastral" value={f.nr_cadastral ?? ""} onChange={(v) => set("nr_cadastral", v)} placeholder="12345" />
          </div>
          <Input label="Carte funciară" value={f.carte_funciara ?? ""} onChange={(v) => set("carte_funciara", v)} placeholder="CF 123456" />
        </>
      )}

      {(hasMandat) && tipProprietate === "casa" && (
        <>
          <Section title="Detalii casă / vilă" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Suprafață construită (mp)" value={f.suprafata_construita ?? ""} onChange={(v) => set("suprafata_construita", v)} placeholder="120" />
            <Input label="Suprafață teren (mp)" value={f.suprafata_teren ?? ""} onChange={(v) => set("suprafata_teren", v)} placeholder="300" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Regim înălțime" value={f.regim_inaltime ?? ""} onChange={(v) => set("regim_inaltime", v)} placeholder="P+1" />
            <Input label="Nr. cadastral" value={f.nr_cadastral ?? ""} onChange={(v) => set("nr_cadastral", v)} placeholder="12345" />
          </div>
        </>
      )}

      {(hasMandat) && tipProprietate === "teren" && (
        <>
          <Section title="Detalii teren" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Suprafață (mp)" value={f.suprafata_mp ?? ""} onChange={(v) => set("suprafata_mp", v)} placeholder="1000" />
            <Input label="Categorie folosință" value={f.categorie_folosinta ?? ""} onChange={(v) => set("categorie_folosinta", v)} placeholder="arabil" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nr. cadastral" value={f.nr_cadastral ?? ""} onChange={(v) => set("nr_cadastral", v)} placeholder="12345" />
            <Input label="Carte funciară" value={f.carte_funciara ?? ""} onChange={(v) => set("carte_funciara", v)} placeholder="CF 123456" />
          </div>
          <ToggleGroup label="Localizare" value={f.intravilan} onChange={(v) => set("intravilan", v)}
            options={[{ value: "intravilan", label: "Intravilan" }, { value: "extravilan", label: "Extravilan" }]} />
        </>
      )}

      {(hasMandat) && tipProprietate === "comercial" && (
        <>
          <Section title="Detalii spațiu comercial" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Suprafață utilă (mp)" value={f.suprafata_utila ?? ""} onChange={(v) => set("suprafata_utila", v)} placeholder="80" />
            <Input label="Etaj" value={f.etaj ?? ""} onChange={(v) => set("etaj", v)} placeholder="parter" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Destinație" value={f.destinatie ?? ""} onChange={(v) => set("destinatie", v)} placeholder="birou / magazin" />
            <Input label="Nr. cadastral" value={f.nr_cadastral ?? ""} onChange={(v) => set("nr_cadastral", v)} placeholder="12345" />
          </div>
        </>
      )}

      {/* Câmpuri mandat */}
      {hasMandat && (
        <>
          <Section title="Contract de mandat" />
          <ToggleGroup label="Tip mandat" value={f.mandate_type} onChange={(v) => set("mandate_type", v)}
            options={[{ value: "exclusiv", label: "Exclusiv" }, { value: "neexclusiv", label: "Neexclusiv" }]} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Comision (%)" type="number" value={f.commission_percent?.toString() ?? ""} min={0} max={100} step={0.5}
              onChange={(v) => set("commission_percent", v === "" ? undefined : parseFloat(v))} placeholder="3" />
            <Input label="Durată (luni)" type="number" value={f.duration_months?.toString() ?? ""} min={1} max={24}
              onChange={(v) => set("duration_months", parseInt(v))} placeholder="6" />
          </div>
        </>
      )}

      {/* Bon rezervare */}
      {hasBonRezervare && (
        <>
          <Section title="Bon de rezervare" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Sumă rezervare" value={f.suma_rezervare ?? ""} onChange={(v) => set("suma_rezervare", v)} placeholder="1000" />
            <ToggleGroup label="Monedă" value={f.moneda} onChange={(v) => set("moneda", v)}
              options={[{ value: "RON", label: "RON" }, { value: "EUR", label: "EUR" }]} />
          </div>
        </>
      )}

      {!needsAddress && !hasMandat && !hasBonRezervare && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Documentele selectate nu necesită câmpuri suplimentare.</p>
        </div>
      )}

      <button type="submit"
        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-2">
        Generează documentele →
      </button>
    </form>
  );
}
