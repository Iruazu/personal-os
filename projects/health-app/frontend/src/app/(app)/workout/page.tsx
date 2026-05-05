"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { workoutApi, SessionOut, VolumePoint, ExerciseIn } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ExerciseRow extends ExerciseIn {
  key: number;
}

export default function WorkoutPage() {
  const { status } = useSession();
  const [sessions, setSessions] = useState<SessionOut[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [volume, setVolume] = useState<VolumePoint[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<ExerciseRow[]>([
    { key: 0, name: "", set_number: 1, weight_kg: 0, reps: 0 },
  ]);

  const refresh = useCallback(async () => {
    setFetching(true);
    setPendingDelete(null);
    try {
      const [s, n] = await Promise.all([workoutApi.listSessions(), workoutApi.listExerciseNames()]);
      setSessions(s);
      setNames(n);
      if (!selectedExercise && n.length > 0) setSelectedExercise(n[0]);
    } finally {
      setFetching(false);
    }
  }, [selectedExercise]);

  useEffect(() => {
    if (status === "authenticated") refresh();
  }, [status, refresh]);

  useEffect(() => {
    if (!selectedExercise || status !== "authenticated") return;
    workoutApi.getVolume(selectedExercise).then(setVolume);
  }, [selectedExercise, status]);

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { key: Date.now(), name: "", set_number: prev.length + 1, weight_kg: 0, reps: 0 },
    ]);

  const updateRow = (key: number, field: keyof ExerciseIn, value: string | number) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const removeRow = (key: number) => setRows((prev) => prev.filter((r) => r.key !== key));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const exercises = rows.map(({ key: _k, ...ex }) => ({
      ...ex,
      weight_kg: Number(ex.weight_kg),
      reps: Number(ex.reps),
      set_number: Number(ex.set_number),
    }));
    if (exercises.some((ex) => !ex.name.trim())) {
      setError("種目名を入力してください");
      return;
    }
    setLoading(true);
    try {
      await workoutApi.createSession({ date: new Date(date).toISOString(), note, exercises });
      setNote("");
      setRows([{ key: 0, name: "", set_number: 1, weight_kg: 0, reps: 0 }]);
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: number) => {
    await workoutApi.deleteSession(id);
    await refresh();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">筋トレログ</h1>

      {/* Form */}
      <form onSubmit={submit} className="glass-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">セッション記録</h2>
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full" required />
        <input type="text" placeholder="メモ（任意）" value={note}
          onChange={(e) => setNote(e.target.value)} maxLength={500}
          className="w-full" />

        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.key} className="glass-inner p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="種目名"
                  value={row.name}
                  onChange={(e) => updateRow(row.key, "name", e.target.value)}
                  className="flex-1"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  aria-label="この種目を削除"
                  className="text-slate-500 hover:text-[#C4785A] transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">セット</label>
                  <input type="number" inputMode="numeric" value={row.set_number} min={1} max={100}
                    onChange={(e) => updateRow(row.key, "set_number", e.target.value)}
                    className="w-full text-center" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">重量(kg)</label>
                  <input type="number" inputMode="decimal" value={row.weight_kg} min={0} step={0.5}
                    onChange={(e) => updateRow(row.key, "weight_kg", e.target.value)}
                    className="w-full text-center" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">回数</label>
                  <input type="number" inputMode="numeric" value={row.reps} min={1}
                    onChange={(e) => updateRow(row.key, "reps", e.target.value)}
                    className="w-full text-center" />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addRow}
            className="text-sm text-[#6B8CAE] hover:text-[#8BACCE] min-h-[48px]">+ 種目追加</button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="bg-[#6B8CAE] hover:bg-[#7B9CBE] disabled:opacity-50 px-6 py-2 rounded-xl font-medium text-sm min-h-[48px]">
          {loading ? "保存中..." : "保存"}
        </button>
      </form>

      {/* Volume Chart */}
      {names.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-semibold text-lg">ボリューム推移</h2>
            <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
              {names.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          {volume.length === 0 ? (
            <p className="text-gray-500 text-sm">データなし</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...volume].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(18,18,18,0.92)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="total_volume" stroke="#6B8CAE" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* History */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-lg mb-4">履歴</h2>
        {fetching ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#6B8CAE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">記録なし</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="glass-inner p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{new Date(s.date).toLocaleString("ja-JP")}</p>
                    {s.note && <p className="text-xs text-gray-400 mt-1">{s.note}</p>}
                  </div>
                  {pendingDelete === s.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">削除しますか？</span>
                      <button onClick={() => { deleteSession(s.id); setPendingDelete(null); }}
                        className="text-xs text-[#C4785A] hover:text-[#D4886A] font-medium">はい</button>
                      <button onClick={() => setPendingDelete(null)}
                        className="text-xs text-slate-400 hover:text-slate-200">いいえ</button>
                    </div>
                  ) : (
                    <button onClick={() => setPendingDelete(s.id)}
                      className="text-xs text-slate-500 hover:text-[#C4785A] transition-colors">削除</button>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {s.exercises.map((ex) => (
                    <span key={ex.id} className="glass-inner text-xs px-2 py-1">
                      {ex.name} {ex.set_number}セット {ex.weight_kg}kg×{ex.reps}回
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
