"use client";

import { useState, useRef, useCallback } from "react";
import { createCall, getExistingPhones } from "@/lib/actions";
import { Call } from "@/lib/supabase";

type ParsedRow = {
  contact_name: string;
  company: string;
  phone: string;
};

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

  const colIndex = (candidates: string[]) => {
    for (const c of candidates) {
      const idx = headers.indexOf(c);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const nameIdx = colIndex(["contact_name", "name", "contact"]);
  const companyIdx = colIndex(["company"]);
  const phoneIdx = colIndex(["phone", "mobile"]);

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const row: ParsedRow = {
      contact_name: nameIdx !== -1 ? cols[nameIdx] || "" : "",
      company: companyIdx !== -1 ? cols[companyIdx] || "" : "",
      phone: phoneIdx !== -1 ? cols[phoneIdx] || "" : "",
    };
    if (row.contact_name) rows.push(row);
  }
  return rows;
}

export default function ImportPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<{ success: number; error: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a .csv file");
      return;
    }
    setFileName(file.name);
    setRows([]);
    setResult(null);
    setProgress(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      const text = typeof result === 'string' ? result : '';
      const parsed = parseCSV(text);
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    setResult(null);

    // Fetch existing phones to detect duplicates
    const existingPhones = await getExistingPhones();

    let success = 0;
    let error = 0;
    let skipped = 0;
    const importableRows = rows.filter((row) => {
      if (row.phone && existingPhones.has(row.phone)) {
        skipped++;
        return false;
      }
      return true;
    });

    setProgress({ done: 0, total: importableRows.length });

    for (let i = 0; i < importableRows.length; i++) {
      const row = importableRows[i];
      try {
        await createCall({
          contact_name: row.contact_name,
          company: row.company || null,
          phone: row.phone || null,
          outcome: null,
          notes: null,
          follow_up_at: null,
          duration_seconds: null,
          called_at: null,
          outcome_updated_at: null,
          attempt_count: 0,
        } as Omit<Call, "id" | "created_at" | "updated_at">);
        success++;
      } catch {
        error++;
      }
      setProgress({ done: i + 1, total: importableRows.length });
    }

    setImporting(false);
    setResult({ success, error, skipped });
  };

  const previewRows = rows.slice(0, 10);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Import Contacts</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Upload a CSV file to bulk-import contacts. Detected columns: <code className="text-zinc-400">name</code>,{" "}
          <code className="text-zinc-400">company</code>, <code className="text-zinc-400">phone</code>.
          Duplicates (matched by phone number) are skipped automatically.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          title="Upload CSV file"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="text-4xl mb-3">📂</div>
        {fileName ? (
          <div>
            <p className="text-white font-medium">{fileName}</p>
            <p className="text-zinc-500 text-sm mt-1">{rows.length} valid rows found — click to replace</p>
          </div>
        ) : (
          <div>
            <p className="text-zinc-300 font-medium">Drag & drop a CSV file here</p>
            <p className="text-zinc-500 text-sm mt-1">or click to browse</p>
          </div>
        )}
      </div>

      {/* Preview table */}
      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Preview {rows.length > 10 ? `(showing 10 of ${rows.length})` : `(${rows.length} rows)`}
            </h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800 bg-zinc-900">
                  <th className="px-4 py-2">Contact Name</th>
                  <th className="px-4 py-2">Company</th>
                  <th className="px-4 py-2">Phone</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                    <td className="px-4 py-2.5 text-white">{row.contact_name || <span className="text-zinc-600">—</span>}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{row.company || <span className="text-zinc-600">—</span>}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{row.phone || <span className="text-zinc-600">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Import button / progress / result */}
          {!result ? (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {importing ? "Importing..." : `Import ${rows.length} contact${rows.length !== 1 ? "s" : ""}`}
              </button>
              {importing && progress && (
                <div className="flex items-center gap-3">
                  <div className="w-40 bg-zinc-800 rounded-full h-2">
                    <div
                      className="progress-bar bg-emerald-500 h-2 rounded-full"
                      style={{ "--progress-width": `${(progress.done / progress.total) * 100}%` } as React.CSSProperties}
                    />
                  </div>
                  <span className="text-sm text-zinc-400">
                    {progress.done}/{progress.total}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm flex gap-3">
                {result.success > 0 && (
                  <span className="text-emerald-400 font-medium">{result.success} imported</span>
                )}
                {result.skipped > 0 && (
                  <span className="text-zinc-500">{result.skipped} skipped (duplicates)</span>
                )}
                {result.error > 0 && (
                  <span className="text-rose-400 font-medium">{result.error} failed</span>
                )}
              </div>
              <a
                href="/calls"
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
              >
                View Calls →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
