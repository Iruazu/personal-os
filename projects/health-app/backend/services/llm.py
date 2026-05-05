import os
import httpx

LLM_API_BASE = os.getenv("LLM_API_BASE", "http://localhost:1234/v1")
TIMEOUT = httpx.Timeout(connect=5.0, read=60.0, write=10.0, pool=5.0)

SYSTEM_PROMPT = (
    "あなたは栄養管理の専門家です。ユーザーの食事内容を分析し、"
    "タンパク質・炭水化物・脂質のバランス、カロリー充足度、"
    "改善点を日本語で簡潔にフィードバックしてください。"
    "200文字以内でまとめてください。"
)


async def evaluate_nutrition(meal_description: str) -> str:
    payload = {
        "model": "local-model",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": meal_description[:1000]},
        ],
        "max_tokens": 300,
        "temperature": 0.7,
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(f"{LLM_API_BASE}/chat/completions", json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
