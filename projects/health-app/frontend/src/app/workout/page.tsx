"use client";
import { useState, useEffect, useCallback } from "react";
import { workoutApi, SessionOut, VolumePoint, ExerciseIn } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ExerciseRow extends ExerciseIn {
  key: number;
}

export default function WorkoutPage() {
  const [sessions, setSessions] = useState<SessionOut[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [volume, setVolume] = useState<VolumePoint[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<ExerciseRow[]>([
    { key: 0, name: "", set_number: 1, weight_kg: 0, reps: 0 },
  ]);

  const refresh = useCallback(async () => {
    const [s, n] = await Promise.all([workoutApi.listSessions(), workoutApi.listExerciseNames()]);
    setSessions(s);
    setNames(n);
    if (!selectedExercise && n.length > 0) setSelectedExercise(n[0]);
  }, [selectedExercise]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!selectedExercise) return;
    workoutApi.getVolume(selectedExercise).then(setVolume);
  }, [selectedExercise]);

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
      <form onSubmit={submit} className="bg-gray-900 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">セッション記録</h2>
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-gray-800 rounded px-3 py-2 text-sm w-full" required />
        <input type="text" placeholder="メモ（任意）" value={note}
          onChange={(e) => setNote(e.target.value)} maxLength={500}
          className="bg-gray-800 rounded px-3 py-2 text-sm w-full" />

        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-5 gap-2 items-center">
              <input type="text" placeholder="種目名" value={row.name}
                onChange={(e) => updateRow(row.key, "name", e.target.value)}
                className="bg-gray-800 rounded px-2 py-1 text-sm col-span-2" required />
              <input type="number" placeholder="セット" value={row.set_number} min={1} max={100}
                onChange={(e) => updateRow(row.key, "set_number", e.target.value)}
                className="bg-gray-800 rounded px-2 py-1 text-sm" />
              <input type="number" placeholder="重量(kg)" value={row.weight_kg} min={0} step={0.5}
                onChange={(e) => updateRow(row.key, "weight_kg", e.target.value)}
                className="bg-gray-800 rounded px-2 py-1 text-sm" />
              <div className="flex gap-1">
                <input type="number" placeholder="回数" value={row.reps} min={1}
                  onChange={(e) => updateRow(row.key, "reps", e.target.value)}
                  className="bg-gray-800 rounded px-2 py-1 text-sm flex-1" />
                <button type="button" onClick={() => removeRow(row.key)}
                  className="text-red-400 hover:text-red-300 px-1">×</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addRow}
            className="text-sm text-blue-400 hover:text-blue-300">+ 種目追加</button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-2 rounded font-medium text-sm">
          {loading ? "保存中..." : "保存"}
        </button>
      </form>

      {/* Volume Chart */}
      {names.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-semibold text-lg">ボリューム推移</h2>
            <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-gray-800 rounded px-3 py-1 text-sm">
              {names.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          {volume.length === 0 ? (
            <p className="text-gray-500 text-sm">データなし</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...volume].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
                <Line type="monotone" dataKey="total_volume" stroke="#3b82f6" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* History */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">履歴</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">記録なし</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{new Date(s.date).toLocaleString("ja-JP")}</p>
                    {s.note && <p className="text-xs text-gray-400 mt-1">{s.note}</p>}
                  </div>
                  <button onClick={() => deleteSession(s.id)}
                    className="text-xs text-red-400 hover:text-red-300">削除</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {s.exercises.map((ex) => (
                    <span key={ex.id} className="text-xs bg-gray-700 rounded px-2 py-1">
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
