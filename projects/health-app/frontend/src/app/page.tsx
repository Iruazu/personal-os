import Link from "next/link";

const CARDS = [
  { href: "/workout", title: "筋トレログ", desc: "セッション・ボリューム推移", color: "from-blue-600 to-blue-800" },
  { href: "/inbody", title: "InBody", desc: "OCR読み取り・体組成グラフ", color: "from-green-600 to-green-800" },
  { href: "/nutrition", title: "栄養管理", desc: "食事記録 + LLMフィードバック", color: "from-orange-600 to-orange-800" },
  { href: "/english", title: "英語学習", desc: "Speakセッション・週次統計", color: "from-purple-600 to-purple-800" },
];

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Health Tracker</h1>
      <p className="text-gray-400 mb-8">個人ヘルスデータを一元管理</p>
      <div className="grid grid-cols-2 gap-4">
        {CARDS.map(({ href, title, desc, color }) => (
          <Link key={href} href={href}>
            <div className={`bg-gradient-to-br ${color} rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer`}>
              <h2 className="text-xl font-bold mb-1">{title}</h2>
              <p className="text-sm opacity-80">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
