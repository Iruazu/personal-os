"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { nutritionApi, NutritionOut, NutritionIn } from "@/lib/api";

export default function NutritionPage() {
  const { status } = useSession();
  const [logs, setLogs] = useState<NutritionOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const [form, setForm] = useState<NutritionIn>({
    meal_description: "",
    calories: undefined,
    protein_g: undefined,
    carbs_g: undefined,
    fat_g: undefined,
  });

  const refresh = useCallback(async () => {
    setFetching(true);
    setPendingDelete(null);
    try {
      const data = await nutritionApi.listLogs();
      setLogs(data);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") refresh();
  }, [status, refresh]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await nutritionApi.createLog(form);
      setForm({ meal_description: "", calories: undefined, protein_g: undefined, carbs_g: undefined, fat_g: undefined });
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id: number) => {
    await nutritionApi.deleteLog(id);
    await refresh();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">栄養管理</h1>

      {/* Form */}
      <form onSubmit={submit} className="glass-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">食事を記録</h2>
        <textarea
          placeholder="食事内容を入力（例：鶏むね肉200g、白米150g、サラダ）"
          value={form.meal_description}
          onChange={(e) => setForm({ ...form, meal_description: e.target.value })}
          maxLength={1000} required rows={3}
          className="w-full resize-none"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["calories", "protein_g", "carbs_g", "fat_g"] as const).map((field) => (
            <div key={field}>
              <label className="text-xs text-gray-400 block mb-1">
                {{ calories: "カロリー(kcal)", protein_g: "タンパク質(g)", carbs_g: "炭水化物(g)", fat_g: "脂質(g)" }[field]}
              </label>
              <input type="number" inputMode="decimal" min={0} step={0.1}
                value={form[field] ?? ""}
                onChange={(e) => setForm({ ...form, [field]: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full" />
            </div>
          ))}
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="bg-[#C4785A] hover:bg-[#D4886A] disabled:opacity-50 px-6 py-2 rounded-xl font-medium text-sm min-h-[48px]">
          {loading ? "AI評価中..." : "記録 + LLM評価"}
        </button>
      </form>

      {/* Logs */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-lg mb-4">食事履歴</h2>
        {fetching ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#C4785A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-gray-500 text-sm">記録なし</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="glass-inner p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-gray-400">{new Date(log.logged_at).toLocaleString("ja-JP")}</p>
                  {pendingDelete === log.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">削除しますか？</span>
                      <button onClick={() => { deleteLog(log.id); setPendingDelete(null); }}
                        className="text-xs text-[#C4785A] hover:text-[#D4886A] font-medium">はい</button>
                      <button onClick={() => setPendingDelete(null)}
                        className="text-xs text-slate-400 hover:text-slate-200">いいえ</button>
                    </div>
                  ) : (
                    <button onClick={() => setPendingDelete(log.id)}
                      className="text-xs text-slate-500 hover:text-[#C4785A] transition-colors">削除</button>
                  )}
                </div>
                <p className="text-sm mb-2">{log.meal_description}</p>
                {(log.calories || log.protein_g) && (
                  <div className="flex gap-4 text-xs text-gray-400 mb-2">
                    {log.calories && <span>{log.calories}kcal</span>}
                    {log.protein_g && <span>P:{log.protein_g}g</span>}
                    {log.carbs_g && <span>C:{log.carbs_g}g</span>}
                    {log.fat_g && <span>F:{log.fat_g}g</span>}
                  </div>
                )}
                {log.llm_feedback ? (
                  <div className="glass-inner border border-[#C4785A]/30 p-3 text-sm">
                    <p className="text-xs text-[#C9B99A] font-medium mb-1">AI評価</p>
                    <p className="text-slate-200">{log.llm_feedback}</p>
                  </div>
                ) : (
                  <div className="glass-inner p-2 text-xs text-gray-400">
                    LLM未接続（LM Studioを起動してください）
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
