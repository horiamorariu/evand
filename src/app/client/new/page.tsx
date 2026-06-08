"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScanStep from "./ScanStep";
import VerifyStep from "./VerifyStep";
import DocumentsStep from "./DocumentsStep";
import ExtraFieldsStep from "./ExtraFieldsStep";
import { BuletinData, DocumentType, MandatExtraFields } from "@/types";

type Step = "scan" | "verify" | "documents" | "extra-fields" | "done";

interface GeneratedDoc {
  type: DocumentType;
  dataUrl: string;
  filename: string;
}

export default function NewClientPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("scan");
  const [buletinData, setBuletinData] = useState<BuletinData | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<DocumentType[]>([]);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flowSteps: Step[] = ["scan", "verify", "documents", "extra-fields"];
  const stepIndex = flowSteps.indexOf(step as never);

  async function handleGenerate(fields: Partial<MandatExtraFields>) {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buletinData, selectedDocs, extraFields: fields }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generare eșuată");
      }
      const data = await res.json();
      setGeneratedDocs(data.documents);
      setStep("done");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  if (step === "done") {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-base font-bold text-gray-900">Evand</h1>
          </div>
        </header>
        <main className="flex-1 px-4 py-10 max-w-2xl mx-auto w-full flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Documente generate!</h2>
            <p className="text-sm text-gray-500">Descarcă și trimite clientului spre semnare.</p>
          </div>

          <div className="w-full space-y-3">
            {generatedDocs.map((doc) => (
              <a
                key={doc.type}
                href={doc.dataUrl}
                download={doc.filename}
                className="flex items-center justify-between w-full bg-white rounded-xl px-4 py-4 shadow-sm border border-gray-100 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <span className="font-medium text-gray-900">
                    {doc.type === "mandat" ? "Contract de mandat" : "Acord GDPR"}
                  </span>
                </div>
                <span className="text-blue-600 text-sm font-medium">Descarcă →</span>
              </a>
            ))}
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Înapoi la dashboard
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => {
              if (stepIndex === 0) router.push("/dashboard");
              else setStep(flowSteps[stepIndex - 1]);
            }}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ‹
          </button>
          <div className="flex-1">
            <div className="flex gap-1">
              {flowSteps.map((s, i) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= stepIndex ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-gray-400">{stepIndex + 1}/{flowSteps.length}</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {step === "scan" && (
          <ScanStep onComplete={(data) => { setBuletinData(data); setStep("verify"); }} />
        )}

        {step === "verify" && buletinData && (
          <VerifyStep
            initialData={buletinData}
            onComplete={(data) => { setBuletinData(data); setStep("documents"); }}
          />
        )}

        {step === "documents" && (
          <DocumentsStep
            selected={selectedDocs}
            onComplete={(docs) => { setSelectedDocs(docs); setStep("extra-fields"); }}
          />
        )}

        {step === "extra-fields" && buletinData && (
          <>
            {error && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
            <ExtraFieldsStep
              buletinData={buletinData}
              selectedDocs={selectedDocs}
              extraFields={{}}
              onComplete={handleGenerate}
            />
            {generating && (
              <div className="fixed inset-0 bg-white/80 flex flex-col items-center justify-center gap-4 z-50">
                <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Se generează documentele...</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
