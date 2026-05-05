"use client";
import { useState, useEffect, useCallback } from "react";
import { englishApi, EnglishOut, EnglishIn, ActivityType, WeeklyStats, ActivityBreakdown } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

const ACTIVITIES: ActivityType[] = ["speak", "reading", "listening", "writing"];
const COLORS: Record<ActivityType, string> = {
  speak: "#a855f7",
  reading: "#3b82f6",
  listening: "#22c55e",
  writing: "#f97316",
};

export default function EnglishPage() {
  const [logs, setLogs] = useState<EnglishOut[]>([]);
  const [weekly, setWeekly] = useState<WeeklyStats[]>([]);
  const [breakdown, setBreakdown] = useState<ActivityBreakdown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<EnglishIn>({
    activity_type: "speak",
    duration_minutes: 30,
    score: undefined,
    note: "",
  });

  const refresh = useCallback(async () => {
    const [l, w, b] = await Promise.all([
      englishApi.listLogs(),
      englishApi.weeklyStats(),
      englishApi.breakdown(),
    ]);
    setLogs(l);
    setWeekly(w);
    setBreakdown(b);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await englishApi.createLog(form);
      setForm({ activity_type: "speak", duration_minutes: 30, score: undefined, note: "" });
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id: number) => {
    await englishApi.deleteLog(id);
    await refresh();
  };

  // Build stacked bar data
  const weekKeys = [...new Set(weekly.map((w) => w.week))].sort();
  const barData = weekKeys.map((week) => {
    const entry: Record<string, string | number> = { week };
    ACTIVITIES.forEach((act) => {
      const row = weekly.find((w) => w.week === week && w.activity_type === act);
      entry[act] = row?.total_minutes ?? 0;
    });
    return entry;
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">英語学習ログ</h1>

      {/* Form */}
      <form onSubmit={submit} className="bg-gray-900 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">セッション記録</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">種類</label>
            <select value={form.activity_type}
              onChange={(e) => setForm({ ...form, activity_type: e.target.value as ActivityType })}
              className="bg-gray-800 rounded px-3 py-2 text-sm w-full">
              {ACTIVITIES.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">時間（分）</label>
            <input type="number" min={1} max={480} value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
              className="bg-gray-800 rounded px-3 py-2 text-sm w-full" required />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">スコア（0-100、任意）</label>
          <input type="number" min={0} max={100} step={0.1}
            value={form.score ?? ""}
            onChange={(e) => setForm({ ...form, score: e.target.value ? Number(e.target.value) : undefined })}
            className="bg-gray-800 rounded px-3 py-2 text-sm w-48" />
        </div>
        <textarea placeholder="メモ（任意）" value={form.note ?? ""}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          maxLength={500} rows={2}
          className="bg-gray-800 rounded px-3 py-2 text-sm w-full resize-none" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-6 py-2 rounded font-medium text-sm">
          {loading ? "保存中..." : "記録"}
        </button>
      </form>

      {/* Charts */}
      {barData.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">週次学習時間</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} unit="分" />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {ACTIVITIES.map((act) => (
                  <Bar key={act} dataKey={act} stackId="a" fill={COLORS[act]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">種類別割合</h2>
            {breakdown.length === 0 ? (
              <p className="text-gray-500 text-sm">データなし</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={breakdown} dataKey="total_minutes" nameKey="activity_type" cx="50%" cy="50%" outerRadius={70}>
                      {breakdown.map((entry) => (
                        <Cell key={entry.activity_type} fill={COLORS[entry.activity_type as ActivityType] ?? "#6b7280"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {breakdown.map((entry) => (
                    <span key={entry.activity_type} className="text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: COLORS[entry.activity_type as ActivityType] ?? "#6b7280" }} />
                      {entry.activity_type}: {entry.total_minutes}分
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">ログ</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">記録なし</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="bg-gray-800 rounded-lg px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: COLORS[log.activity_type as ActivityType] + "33", color: COLORS[log.activity_type as ActivityType] }}>
                    {log.activity_type}
                  </span>
                  <span className="text-sm">{log.duration_minutes}分</span>
                  {log.score != null && <span className="text-xs text-gray-400">{log.score}点</span>}
                  {log.note && <span className="text-xs text-gray-500">{log.note}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{new Date(log.logged_at).toLocaleDateString("ja-JP")}</span>
                  <button onClick={() => deleteLog(log.id)}
                    className="text-xs text-red-400 hover:text-red-300">削除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
