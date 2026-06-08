"use client";

import { useState, useRef } from "react";
import type { DocumentStatus, DocumentType } from "@/types";

interface DocRow {
  id: string;
  client_name: string;
  client_cnp: string;
  agent_name: string;
  type: DocumentType;
  status: DocumentStatus;
  created_at: string;
  signed_file_data?: string;
}

interface Props {
  documents: DocRow[];
  selectedDate: string;
  onStatusChange: (id: string, status: DocumentStatus) => void;
}

const STATUS_LABELS: Record<DocumentStatus, string> = {
  generat: "Generat",
  printat: "Printat",
  semnat_olograf: "Semnat olograf",
  complet: "Complet",
};

const STATUS_COLORS: Record<DocumentStatus, string> = {
  generat: "bg-blue-100 text-blue-700",
  printat: "bg-amber-100 text-amber-700",
  semnat_olograf: "bg-orange-100 text-orange-700",
  complet: "bg-green-100 text-green-700",
};

const STATUS_NEXT: Record<DocumentStatus, DocumentStatus | null> = {
  generat: "printat",
  printat: "semnat_olograf",
  semnat_olograf: "complet",
  complet: null,
};

export default function DailySummary({ documents, selectedDate, onStatusChange }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const dayDocs = documents.filter((d) => d.created_at.startsWith(selectedDate));

  const dateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString("ro-RO", {
    weekday: "long", day: "numeric", month: "long",
  });

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error("compress failed")), "image/jpeg", 0.75);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async function handleUpload(docId: string, file: File) {
    setUploading(docId);
    try {
      // Comprimă imaginea dacă e prea mare
      let uploadFile: File | Blob = file;
      if (file.type.startsWith("image/") && file.size > 500 * 1024) {
        uploadFile = await compressImage(file);
      }

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((p) => ({ ...p, [docId]: e.target?.result as string }));
      reader.readAsDataURL(uploadFile);

      const formData = new FormData();
      formData.append("file", uploadFile, file.name);
      const res = await fetch(`/api/admin/documents/${docId}/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload esuat");
      }
      onStatusChange(docId, "semnat_olograf");
    } catch (e: unknown) {
      alert((e as Error).message ?? "Upload esuat. Incearca din nou.");
    } finally {
      setUploading(null);
    }
  }

  async function handleStatusNext(doc: DocRow) {
    const next = STATUS_NEXT[doc.status];
    if (!next) return;
    await fetch(`/api/admin/documents/${doc.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    onStatusChange(doc.id, next);
  }

  if (dayDocs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-semibold text-gray-700 capitalize mb-1">{dateLabel}</p>
        <p className="text-sm text-gray-400 mt-6 text-center py-8">Niciun document în această zi.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700 capitalize">{dateLabel}</p>
        <p className="text-xs text-gray-400">{dayDocs.length} document{dayDocs.length !== 1 ? "e" : ""}</p>
      </div>

      <ul className="divide-y divide-gray-50">
        {dayDocs.map((doc) => (
          <li key={doc.id} className="px-4 py-4">
            {/* Linia 1: Client + tip */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-medium text-gray-900 text-sm">{doc.client_name}</p>
                <p className="text-xs text-gray-400">{doc.client_cnp} · {doc.agent_name}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 capitalize">
                  {doc.type === "mandat" ? "Mandat" : "GDPR"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(doc.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${STATUS_COLORS[doc.status]}`}>
                {STATUS_LABELS[doc.status]}
              </span>

              {/* Butoane acțiuni */}
              <div className="flex gap-1.5 ml-auto">
                {/* Print → avansează la "Printat" */}
                {doc.status === "generat" && (
                  <button
                    onClick={() => handleStatusNext(doc)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-2.5 py-1 transition-colors"
                  >
                    🖨 Printat
                  </button>
                )}

                {/* Upload semnat */}
                {(doc.status === "printat" || doc.status === "semnat_olograf") && (
                  <>
                    <input
                      ref={(el) => { fileRefs.current[doc.id] = el; }}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(doc.id, f);
                      }}
                    />
                    <button
                      onClick={() => fileRefs.current[doc.id]?.click()}
                      disabled={uploading === doc.id}
                      className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg px-2.5 py-1 transition-colors disabled:opacity-50"
                    >
                      {uploading === doc.id ? "..." : "📎 Upload semnat"}
                    </button>
                  </>
                )}

                {/* Marchează complet */}
                {doc.status === "semnat_olograf" && (
                  <button
                    onClick={() => handleStatusNext(doc)}
                    className="text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-lg px-2.5 py-1 transition-colors"
                  >
                    ✓ Complet
                  </button>
                )}

                {/* Download semnat */}
                {(doc.status === "semnat_olograf" || doc.status === "complet") && (previews[doc.id] || doc.signed_file_data) && (
                  <a
                    href={previews[doc.id] || doc.signed_file_data}
                    download={`semnat-${doc.client_name}-${doc.type}.jpg`}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg px-2.5 py-1 transition-colors"
                  >
                    ↓ Semnat
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
