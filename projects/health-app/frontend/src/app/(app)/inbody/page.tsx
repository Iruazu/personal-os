"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { inBodyApi, InBodyOut } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

type EditForm = {
  weight_kg: string;
  muscle_kg: string;
  fat_kg: string;
  fat_percent: string;
  bmi: string;
  visceral_fat_level: string;
};

const FIELDS: { key: keyof EditForm; label: string; unit: string; step: string }[] = [
  { key: "weight_kg",          label: "体重",     unit: "kg", step: "0.1" },
  { key: "muscle_kg",          label: "筋肉量",   unit: "kg", step: "0.1" },
  { key: "fat_kg",             label: "体脂肪量", unit: "kg", step: "0.1" },
  { key: "fat_percent",        label: "体脂肪率", unit: "%",  step: "0.1" },
  { key: "bmi",                label: "BMI",      unit: "",   step: "0.1" },
  { key: "visceral_fat_level", label: "内臓脂肪", unit: "",   step: "1"   },
];

function toForm(r: InBodyOut): EditForm {
  return {
    weight_kg:          r.weight_kg          != null ? String(r.weight_kg)          : "",
    muscle_kg:          r.muscle_kg          != null ? String(r.muscle_kg)          : "",
    fat_kg:             r.fat_kg             != null ? String(r.fat_kg)             : "",
    fat_percent:        r.fat_percent        != null ? String(r.fat_percent)        : "",
    bmi:                r.bmi               != null ? String(r.bmi)               : "",
    visceral_fat_level: r.visceral_fat_level != null ? String(r.visceral_fat_level) : "",
  };
}

function EditModal({
  record,
  onClose,
  onSaved,
}: {
  record: InBodyOut;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<EditForm>(toForm(record));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Fix 2: Escape key + scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = (key: keyof EditForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setErr("");
    const patch: Partial<InBodyOut> = {};
    for (const { key } of FIELDS) {
      const raw = form[key].trim();
      if (raw === "") continue;
      const n = Number(raw);
      if (isNaN(n)) { setErr(`${key}: 数値を入力してください`); setSaving(false); return; }
      (patch as Record<string, number>)[key] = n;
    }
    if (Object.keys(patch).length === 0) {
      setErr("少なくとも1つの値を入力してください");
      setSaving(false);
      return;
    }
    try {
      await inBodyApi.patchRecord(record.id, patch);
      onSaved();
      onClose();
    } catch (e) {
      setErr(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    // Fix 2: ARIA attributes on overlay
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4"
    >
      <div className="glass-card w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          {/* Fix 2: id on heading */}
          <h3 id="modal-title" className="font-semibold text-lg">手動修正</h3>
          <span className="text-xs text-gray-400">
            {new Date(record.measured_at).toLocaleDateString("ja-JP")}
          </span>
        </div>

        <div className="space-y-3">
          {/* Fix 2: autoFocus on first field */}
          {FIELDS.map(({ key, label, unit, step }, index) => (
            <div key={key} className="flex items-center gap-3">
              <label className="w-20 text-sm text-gray-400 shrink-0">{label}</label>
              <div className="relative flex-1">
                <input
                  type="number"
                  step={step}
                  min="0"
                  value={form[key]}
                  onChange={set(key)}
                  placeholder="—"
                  autoFocus={index === 0}
                  className="w-full text-right pr-8 focus:outline-none focus:ring-1 focus:ring-[#6B8CAE]"
                />
                {unit && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    {unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {err && <p className="text-red-400 text-xs">{err}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl glass-inner hover:brightness-125 text-sm"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-xl bg-[#6B8CAE] hover:bg-[#7B9CBE] text-sm font-medium disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InBodyPage() {
  const { status } = useSession();
  const [records, setRecords] = useState<InBodyOut[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [editTarget, setEditTarget] = useState<InBodyOut | null>(null);
  // Fix 3: inline delete confirmation state
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  // Fix 4: fetching state
  const [fetching, setFetching] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fix 4: wrap refresh with setFetching
  const refresh = useCallback(async () => {
    setFetching(true);
    try {
      const data = await inBodyApi.listRecords();
      setRecords(data);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") refresh();
  }, [status, refresh]);

  // Fix 3: remove window.confirm, use pendingDelete pattern
  const handleDelete = async (id: number) => {
    setError("");
    try {
      await inBodyApi.deleteRecord(id);
      setPendingDelete(null);
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      await inBodyApi.upload(file);
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const chartData = [...records]
    .reverse()
    .map((r) => ({
      date: new Date(r.measured_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
      体重: r.weight_kg,
      筋肉量: r.muscle_kg,
      体脂肪量: r.fat_kg,
    }));

  // Inline delete button helper to avoid duplication
  const DeleteButton = ({ r }: { r: InBodyOut }) => {
    const dateLabel = new Date(r.measured_at).toLocaleDateString("ja-JP");
    if (pendingDelete === r.id) {
      return (
        <span className="flex items-center gap-1">
          <button
            onClick={() => handleDelete(r.id)}
            className="text-xs text-[#C4785A] hover:text-[#D4886A] font-medium px-1 py-1"
          >
            はい
          </button>
          <button
            onClick={() => setPendingDelete(null)}
            className="text-xs text-slate-400 hover:text-slate-200 px-1 py-1"
          >
            いいえ
          </button>
        </span>
      );
    }
    return (
      <button
        onClick={() => setPendingDelete(r.id)}
        className="text-xs text-slate-500 hover:text-[#C4785A] transition-colors px-2 py-1"
        aria-label={`${dateLabel}のデータを削除`}
      >
        削除
      </button>
    );
  };

  return (
    // Fix 6: remove p-4 pb-24
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">InBody</h1>

      {editTarget && (
        <EditModal
          key={editTarget.id}
          record={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={refresh}
        />
      )}

      {/* Upload */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-lg mb-4">スキャン画像アップロード</h2>
        {/* Fix 5: aria-busy + aria-label on upload label */}
        <label
          role="button"
          aria-busy={uploading}
          aria-label={uploading ? "OCR処理中" : "InBody画像を選択してアップロード"}
          className="block w-fit cursor-pointer bg-[#8FAF8F]/20 hover:bg-[#8FAF8F]/30 border border-[#8FAF8F]/40 text-[#8FAF8F] px-5 py-2 rounded-xl text-sm font-medium min-h-[48px] flex items-center"
        >
          {uploading ? "OCR処理中..." : "画像を選択"}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        <p className="text-xs text-gray-500 mt-2">JPEG / PNG / WebP（10MB以下）</p>
      </div>

      {/* Chart */}
      {records.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-semibold text-lg mb-4">体組成推移</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} unit="kg" />
              <Tooltip contentStyle={{ backgroundColor: "rgba(18,18,18,0.92)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="体重" stroke="#8FAF8F" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="筋肉量" stroke="#6B8CAE" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="体脂肪量" stroke="#C4785A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Records */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-lg mb-4">計測履歴</h2>

        {/* Fix 4: spinner while fetching */}
        {fetching ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#6B8CAE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <p className="text-slate-500 text-sm">記録なし</p>
        ) : (
          <>
            {/* Fix 1: Mobile card view */}
            <div className="md:hidden space-y-2">
              {records.map((r) => {
                const dateLabel = new Date(r.measured_at).toLocaleDateString("ja-JP");
                return (
                  <div key={r.id} className="glass-inner p-3">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium">{dateLabel}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditTarget(r)}
                          className="text-xs text-[#6B8CAE] hover:text-[#8BACCE] px-2 py-1"
                          aria-label={`${dateLabel}のデータを編集`}
                        >
                          編集
                        </button>
                        <DeleteButton r={r} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
                      {r.weight_kg != null && (
                        <span><span className="text-slate-400">体重</span> {r.weight_kg}kg</span>
                      )}
                      {r.muscle_kg != null && (
                        <span><span className="text-slate-400">筋肉</span> {r.muscle_kg}kg</span>
                      )}
                      {r.fat_percent != null && (
                        <span><span className="text-slate-400">脂肪率</span> {r.fat_percent}%</span>
                      )}
                      {r.bmi != null && (
                        <span><span className="text-slate-400">BMI</span> {r.bmi}</span>
                      )}
                      {r.visceral_fat_level != null && (
                        <span><span className="text-slate-400">内臓脂肪</span> {r.visceral_fat_level}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fix 1: Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-white/10">
                    <th className="pb-2">日付</th>
                    <th className="pb-2">体重</th>
                    <th className="pb-2">筋肉量</th>
                    <th className="pb-2">体脂肪率</th>
                    <th className="pb-2">BMI</th>
                    <th className="pb-2">内臓脂肪</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map((r) => {
                    const dateLabel = new Date(r.measured_at).toLocaleDateString("ja-JP");
                    return (
                      <tr key={r.id} className="py-2">
                        <td className="py-2">{dateLabel}</td>
                        <td className="py-2">{r.weight_kg != null ? `${r.weight_kg}kg` : "—"}</td>
                        <td className="py-2">{r.muscle_kg != null ? `${r.muscle_kg}kg` : "—"}</td>
                        <td className="py-2">{r.fat_percent != null ? `${r.fat_percent}%` : "—"}</td>
                        <td className="py-2">{r.bmi ?? "—"}</td>
                        <td className="py-2">{r.visceral_fat_level ?? "—"}</td>
                        <td className="py-2 whitespace-nowrap">
                          <button
                            onClick={() => setEditTarget(r)}
                            className="text-[#6B8CAE] hover:text-[#8BACCE] text-xs px-2 py-1"
                            aria-label={`${dateLabel}のデータを編集`}
                          >
                            編集
                          </button>
                          <DeleteButton r={r} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
