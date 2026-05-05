import Link from "next/link";

const CARDS = [
  { href: "/workout", title: "筋トレログ",  desc: "セッション・ボリューム推移",   tint: "rgba(107,140,174,0.15)" },
  { href: "/inbody",  title: "InBody",      desc: "OCR読み取り・体組成グラフ",     tint: "rgba(143,175,143,0.15)" },
  { href: "/nutrition", title: "栄養管理",  desc: "食事記録 + LLMフィードバック",  tint: "rgba(196,120,90,0.15)"  },
  { href: "/english", title: "英語学習",    desc: "Speakセッション・週次統計",     tint: "rgba(155,142,196,0.15)" },
];

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Health Tracker</h1>
      <p className="text-slate-500 mb-8">個人ヘルスデータを一元管理</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map(({ href, title, desc, tint }) => (
          <Link key={href} href={href}>
            <div
              className="glass-card p-6 hover:brightness-110 hover:shadow-2xl transition-all duration-200 cursor-pointer min-h-[80px]"
              style={{ background: tint }}
            >
              <h2 className="text-xl font-semibold mb-1">{title}</h2>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
