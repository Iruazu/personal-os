"use client";
import { useState, useEffect } from "react";
import { nutritionApi, NutritionOut, NutritionIn } from "@/lib/api";

export default function NutritionPage() {
  const [logs, setLogs] = useState<NutritionOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<NutritionIn>({
    meal_description: "",
    calories: undefined,
    protein_g: undefined,
    carbs_g: undefined,
    fat_g: undefined,
  });

  const refresh = async () => {
    const data = await nutritionApi.listLogs();
    setLogs(data);
  };

  useEffect(() => { refresh(); }, []);

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
    <div className="space-y-8 p-4 pb-24">
      <h1 className="text-2xl font-bold">栄養管理</h1>

      {/* Form */}
      <form onSubmit={submit} className="bg-gray-900 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">食事を記録</h2>
        <textarea
          placeholder="食事内容を入力（例：鶏むね肉200g、白米150g、サラダ）"
          value={form.meal_description}
          onChange={(e) => setForm({ ...form, meal_description: e.target.value })}
          maxLength={1000} required rows={3}
          className="bg-gray-800 rounded px-3 py-2 text-base w-full resize-none"
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
                className="bg-gray-800 rounded px-2 py-1 text-base w-full" />
            </div>
          ))}
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 px-6 py-2 rounded font-medium text-sm min-h-[48px]">
          {loading ? "AI評価中..." : "記録 + LLM評価"}
        </button>
      </form>

      {/* Logs */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">食事履歴</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">記録なし</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-gray-400">{new Date(log.logged_at).toLocaleString("ja-JP")}</p>
                  <button onClick={() => deleteLog(log.id)}
                    className="text-xs text-red-400 hover:text-red-300">削除</button>
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
                  <div className="bg-orange-950 border border-orange-800 rounded p-3 text-sm">
                    <p className="text-xs text-orange-400 font-medium mb-1">AI評価</p>
                    <p className="text-orange-100">{log.llm_feedback}</p>
                  </div>
                ) : (
                  <div className="bg-gray-700 rounded p-2 text-xs text-gray-400">
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
