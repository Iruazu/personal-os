"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">手動修正</h3>
          <span className="text-xs text-gray-400">
            {new Date(record.measured_at).toLocaleDateString("ja-JP")}
          </span>
        </div>

        <div className="space-y-3">
          {FIELDS.map(({ key, label, unit, step }) => (
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
                  className="w-full bg-gray-800 rounded px-3 py-2 text-sm text-right pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm font-medium disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InBodyPage() {
  const [records, setRecords] = useState<InBodyOut[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [editTarget, setEditTarget] = useState<InBodyOut | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const data = await inBodyApi.listRecords();
    setRecords(data);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("このレコードを削除しますか？")) return;
    try {
      await inBodyApi.deleteRecord(id);
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

  return (
    <div className="space-y-8 p-4 pb-24">
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
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">スキャン画像アップロード</h2>
        <label className="block w-fit cursor-pointer bg-green-700 hover:bg-green-600 px-5 py-2 rounded text-sm font-medium min-h-[48px] flex items-center">
          {uploading ? "OCR処理中..." : "画像を選択"}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        <p className="text-xs text-gray-500 mt-2">JPEG / PNG / WebP（10MB以下）</p>
      </div>

      {/* Chart */}
      {records.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">体組成推移</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} unit="kg" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="体重" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="筋肉量" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="体脂肪量" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Records */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">計測履歴</h2>
        {records.length === 0 ? (
          <p className="text-gray-500 text-sm">記録なし</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left border-b border-gray-700">
                  <th className="pb-2">日付</th>
                  <th className="pb-2">体重</th>
                  <th className="pb-2">筋肉量</th>
                  <th className="pb-2">体脂肪率</th>
                  <th className="pb-2">BMI</th>
                  <th className="pb-2">内臓脂肪</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {records.map((r) => (
                  <tr key={r.id} className="py-2">
                    <td className="py-2">{new Date(r.measured_at).toLocaleDateString("ja-JP")}</td>
                    <td className="py-2">{r.weight_kg != null ? `${r.weight_kg}kg` : "—"}</td>
                    <td className="py-2">{r.muscle_kg != null ? `${r.muscle_kg}kg` : "—"}</td>
                    <td className="py-2">{r.fat_percent != null ? `${r.fat_percent}%` : "—"}</td>
                    <td className="py-2">{r.bmi ?? "—"}</td>
                    <td className="py-2">{r.visceral_fat_level ?? "—"}</td>
                    <td className="py-2 whitespace-nowrap">
                      <button
                        onClick={() => setEditTarget(r)}
                        className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-500 hover:text-red-400 text-xs px-2 py-1"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
