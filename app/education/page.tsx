'use client';

import { useState } from 'react';
export const dynamic = 'force-dynamic';

type Level = 'beginner' | 'intermediate' | 'advanced';

interface Course {
  title: string;
  desc: string;
  icon: string;
  duration: string;
  lessons: number;
}

const LEVELS: { key: Level; label: string; emoji: string; courses: Course[] }[] = [
  {
    key: 'beginner', label: 'Анхан шат', emoji: '🌱',
    courses: [
      {
        title: 'Арилжааны суурь ойлголт',
        desc: 'Зах зээл хэрхэн ажилладаг, Спред болон Лот гэж юу вэ? Энэ хичээлээр та крипто арилжааны үндсэн ойлголцуудтай танилцаж, зах зээлийн бүтэц, үнийн хөдөлгөөний логикийг ойлгох болно. Спред гэдэг нь Ask (зарах үнэ) болон Bid (авах үнэ)-ийн зөрүү бөгөөд брокерын комиссын нэг хэлбэр юм. Лот нь арилжааны хэмжээг тодорхойлдог бөгөөд 1 стандарт лот нь ихэвчлэн 100,000 нэгжтэй тэнцдэг. Эдгээр суурь ойлголтуудыг эзэмшсэнээр та платформ дээр итгэлтэйгээр арилжаа хийж эхлэх боломжтой болно.',
        icon: '📊', duration: '25 мин', lessons: 4,
      },
      {
        title: 'Японы лаа уншиж сурах нь',
        desc: 'Ногоон ба улаан лааны бүтэц, бие, сүүл гэж юу вэ? Японы лаа (Candlestick) бол график дээрх хамгийн чухал элемент юм. Лаа бүр нь 4 ү ослын мэдээллийг агуулдаг: Нээлт (Open), Хаалт (Close), Хамгийн өндөр (High), Хамгийн бага (Low). Бие (Body) нь нээлт ба хаалтын зөрүүг, сүүл (Wick/Shadow) нь хамгийн өндөр ба бага цэгүүдийг харуулдаг. Ногоон лаа нь үнэ өссөнийг, улаан лаа нь үнэ буурсныг илтгэнэ. Хэд хэдэн лааны хослол нь зах зээлийн сэтгэл зүйг илэрхийлдэг загваруудыг (Patterns) үүсгэдэг.',
        icon: '🕯️', duration: '30 мин', lessons: 5,
      },
      {
        title: 'Хөшүүрэг (Leverage) ба Барьцаа (Margin)',
        desc: 'Эрсдэл ба боломжийг тэнцвэржүүлэх нь арилжааны хамгийн чухал ур чадвар юм. Хөшүүрэг (Leverage) нь таны хөрөнгөөс хэд дахин их хэмжээний арилжаа нээх боломжийг олгодог. Жишээлбэл, 10x хөшүүрэгтэйгээр $100-ийн барьцаагаар $1000-ийн арилжаа нээж болно. Харин энэ нь ашиг орлогыг нэмэгдүүлэхийн зэрэгцээ алдагдлыг ч мөн адил хэмжээгээр нэмэгдүүлдэг тул маш болгоомжтой хэрэглэх шаардлагатай. Барьцаа (Margin) нь арилжааг нээхэд шаардагдах хөрөнгийн хэмжээ юм. Хөшүүргийг зөв ойлгож, барьцааны түвшингээ хянаж байх нь Margin Call болон дансны тэглэлтээс (Liquidation) сэргийлэх гол арга зам юм.',
        icon: '⚖️', duration: '35 мин', lessons: 6,
      },
    ],
  },
  {
    key: 'intermediate', label: 'Дунд шат', emoji: '📈',
    courses: [
      {
        title: 'Дэмжлэг ба Эсэргүүцлийн бүс',
        desc: 'Хэзээ худалдаж авч, хэзээ зарахаа тодорхойлох нь арилжааны гол урлаг юм. Дэмжлэг (Support) гэдэг нь үнэ буухад тодорхой түвшинд хүрээд дахин өсөх хандлагатай байдаг үнийн бүс юм. Эсэргүүцэл (Resistance) гэдэг нь үнэ өсөхөд тодорхой түвшинд хүрээд дахин буух хандлагатай байдаг үнийн бүс юм. Эдгээр түвшнүүдийг тодорхойлохын тулд өмнөх үнийн хөдөлгөөний түүхэн цэгүүдийг ашигладаг. Хэрэв үнэ дэмжлэгийн түвшинг давж унавал энэ нь эсэргүүцлийн түвшин болж хувирдаг ба эсрэгээрээ. Энэхүү харилцан өөрчлөгдөх чанар нь техникийн шинжилгээний үндэс суурь юм.',
        icon: '📐', duration: '40 мин', lessons: 6,
      },
      {
        title: 'Трэнд дагаж арилжаалах',
        desc: 'Өсөлтийн ба уналтын трэндийг зурах арга нь арилжаачдын хамгийн түгээмэл стратеги юм. "The trend is your friend" гэсэн алдартай зүйр үг байдаг. Өсөлтийн трэнд (Uptrend) нь өндөр цэгүүд болон нам цэгүүд хоёулаа дээшилж байгаа үед үүсдэг. Уналтын трэнд (Downtrend) нь өндөр ба нам цэгүүд хоёулаа доошилж байгаа үед үүсдэг. Трэндийг тодорхойлохын тулд дор хаяж 2 өндөр ба 2 нам цэг шаардлагатай. Трэнд шугам (Trendline) зурахдаа хамгийн багадаа 3 цэгт хүрсэн байх нь илүү найдвартай гэж үздэг. Трэндээс эсрэг арилжаа хийхээс зайлсхийж, трэндийн чиглэлд арилжаа хийх нь амжилтын магадлалыг өндөржүүлдэг.',
        icon: '📈', duration: '35 мин', lessons: 5,
      },
      {
        title: 'Индикатор ашиглах нь',
        desc: 'RSI болон MACD-ийг арилжааны дохио болгох нь техникийн шинжилгээний хүчирхэг арга хэрэгсэл юм. RSI (Relative Strength Index) нь 0-100 хүртэлх хэмжүүр бөгөөд 70-аас дээш байвал хэт худалдан авалт (Overbought), 30-аас доош байвал хэт худалдаа (Oversold) гэж үздэг. MACD (Moving Average Convergence Divergence) нь хоёр хөдөлгөөнт дундажын ялгаврыг харуулдаг. MACD шугам сигнал шугамаас дээш гарахад худалдан авах дохио, доош гарахад зараx дохио болдог. Эдгээр индикаторууд нь үнийн хөдөлгөөнийг баталгаажуулах нэмэлт хэрэгсэл бөгөөд дангаараа биш, харин үнийн графикын шинжилгээтэй хавсран хэрэглэх нь хамгийн үр дүнтэй.',
        icon: '📉', duration: '45 мин', lessons: 7,
      },
    ],
  },
  {
    key: 'advanced', label: 'Ахисан шат', emoji: '🚀',
    courses: [
      {
        title: 'Эрсдэлийн удирдлага (Risk Management)',
        desc: 'Нэг арилжаанд дансныхаа хэдэн хувийг эрсдэлд оруулах вэ? Эрсдэлийн удирдлага бол мэргэжлийн арилжаачдыг сонирхогчдоос ялгах хамгийн чухал хүчин зүйл юм. Ерөнхий дүрмээр нэг арилжаанд дансны 1-2 хувиас илүүг эрсдэлд оруулахгүй байхыг зөвлөдөг. Жишээлбэл, $10,000 данстай бол нэг арилжаанд $100-200-оос илүү алдах ёсгүй. Stop Loss-ийг зөв байрлуулах нь: техникийн шинжилгээгээр тодорхойлсон дэмжлэг/эсэргүүцлийн түвшний араас байрлуулах, Risk/Reward харьцааг 1:2 эсвэл 1:3 байлгах, волатилийг харгалзан үзэх зэрэг зарчмуудыг баримтлана. Risk/Reward харьцаа гэдэг нь боломжит ашиг болон боломжит алдагдлын харьцаа юм. Жишээлбэл $50 эрсдэлд оруулж, $150 ашиг олох боломжтой бол R:R = 1:3 байна.',
        icon: '🛡️', duration: '50 мин', lessons: 8,
      },
      {
        title: 'Арилжааны сэтгэл зүй',
        desc: 'Айдас ба шуналаа дарж, системээ дагах нь арилжааны хамгийн хэцүү сорилт юм. Олон арилжаачид техникийн шинжилгээг төгс эзэмшсэн ч сэтгэл зүйн хувьд бэлэн биш байдаг. FOMO (Fear Of Missing Out) нь ханш огцом өсөхөд оройтож орж, хамгийн өндөр цэгт худалдан авах сэтгэл зүй юм. FUD (Fear, Uncertainty, Doubt) нь ханш унах үед сандран гарч, хамгийн доод цэгт зарах явдал юм. Эдгээр сэтгэл хөдлөлөөс зайлсхийх гол арга бол: тодорхой арилжааны төлөвлөгөөтэй байх, дүрмээсээ хазайхгүй байх, арилжааны өдрийн тэмдэглэл хөтлөх, том алдагдлын дараа завсарлага авах, мөн арилжааг нэг өдрийн уралдаан биш урт хугацааны марафон гэж үзэх явдал юм.',
        icon: '🧠', duration: '45 мин', lessons: 6,
      },
    ],
  },
];

export default function EducationPage() {
  const [activeLevel, setActiveLevel] = useState<Level>('beginner');

  const levelData = LEVELS.find(l => l.key === activeLevel)!;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-400 mb-6">
            🎓 Үнэгүй сургалт
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Арилжааны Академи
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Анхан шатнаас Ахисан шат хүртэл — крипто арилжааны бүх мэдлэгийг нэг дор
          </p>
          <p className="text-sm text-slate-500 mt-3 max-w-xl mx-auto">
            Мэргэжлийн арилжаачдын бэлтгэсэн хичээлүүдээр дамжуулан зах зээлийг шинжлэх, эрсдэлээ удирдах, ашигтай арилжаа хийх ур чадварыг эзэмшээрэй.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5">📚 {LEVELS.reduce((s, l) => s + l.courses.length, 0)} хичээл</span>
            <span className="flex items-center gap-1.5">⏱️ Дунджаар 35 мин</span>
            <span className="flex items-center gap-1.5">🏆 Ахисан шат хүртэл</span>
          </div>
        </div>
      </section>

      {/* ── TABS ── */}
      <section className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-1.5 inline-flex w-full sm:w-auto shadow-xl">
          {LEVELS.map(level => (
            <button key={level.key} onClick={() => setActiveLevel(level.key)}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeLevel === level.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}>
              <span className="mr-2">{level.emoji}</span>
              {level.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── COURSES ── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold">{levelData.emoji} {levelData.label} шат</h2>
            <p className="text-sm text-slate-500 mt-1">{levelData.courses.length} хичээл</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Дасгал
            <span className="w-2 h-2 rounded-full bg-blue-500 ml-3" /> Онол
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {levelData.courses.map((course, i) => (
            <div key={i}
              className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1">
              {/* top accent bar */}
              <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />

              <div className="p-6">
                {/* icon + meta */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {course.icon}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="bg-slate-800 rounded-md px-2 py-1">{course.duration}</span>
                    <span className="bg-slate-800 rounded-md px-2 py-1">{course.lessons} хичээл</span>
                  </div>
                </div>

                {/* title + desc */}
                <h3 className="text-lg font-bold mb-2 text-slate-100 group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-4">
                  {course.desc}
                </p>

                {/* tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-600/10 text-blue-400 rounded px-2 py-0.5">
                    {activeLevel === 'beginner' ? 'Суурь' : activeLevel === 'intermediate' ? 'Дунд' : 'Ахисан'}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-400 rounded px-2 py-0.5">
                    {i === 0 ? 'Эхлэх' : i === 1 ? 'Дараах' : 'Дуусгах'}
                  </span>
                </div>
              </div>

              {/* bottom action */}
              <div className="px-6 pb-6">
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-[0.98]">
                  📖 Унших
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-blue-600/10 via-slate-900 to-blue-600/10 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold mb-2">Арилжааны замналаа эхлүүлэхэд бэлэн үү?</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-6">
            Демо арилжааны платформ дээр дадлага хийж, бодит мөнгөөр эрсдэлд орохгүйгээр ур чадвараа сорь.
          </p>
          <a href="/demo-trade"
            className="inline-block px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-400/40 active:scale-[0.98]">
            🚀 Демо арилжааг нээх
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-500 text-center">
          Крипто Тайлбар Толь · Арилжааны Академи · © 2026
        </div>
      </footer>
    </div>
  );
}
