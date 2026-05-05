"use client";
import { useState, useEffect, useRef } from "react";
import { inBodyApi, InBodyOut } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export default function InBodyPage() {
  const [records, setRecords] = useState<InBodyOut[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    const data = await inBodyApi.listRecords();
    setRecords(data);
  };

  useEffect(() => { refresh(); }, []);

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
