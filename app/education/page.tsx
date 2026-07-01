'use client';

import { useState, useEffect } from 'react';
export const dynamic = 'force-dynamic';

type Level = 'beginner' | 'intermediate' | 'advanced';

interface Course {
  title: string;
  desc: string;
  content: string[];
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
        desc: 'Зах зээл хэрхэн ажилладаг, Спред болон Лот гэж юу вэ? Энэ хичээлээр та крипто арилжааны үндсэн ойлголцуудтай танилцаж, зах зээлийн бүтэц, үнийн хөдөлгөөний логикийг ойлгох болно.',
        icon: '📊', duration: '25 мин', lessons: 4,
        content: [
          'Зах зээл гэдэг нь худалдагч болон худалдан авагчдыг нэгтгэдэг орон зай юм. Крипто арилжаанд зах зээл нь төвлөрсөн биржүүд (Binance, Bybit гэх мэт) болон төвлөрсөн бус биржүүд (DEX) гэж хуваагддаг. Үнийн хөдөлгөөн нь эрэлт нийлүүлэлтийн хуулиар зохицуулагдана. Олон хүн худалдан авахыг хүсвэл үнэ өснө, олон хүн зараxыг хүсвэл үнэ буурна.',
          'Спред (Spread) гэдэг нь Ask (зарах үнэ) болон Bid (авах үнэ)-ийн зөрүү юм. Жишээлбэл, хэрэв BTC/USDT-ийн Ask үнэ 50,000 USDT, Bid үнэ 49,990 USDT бол спред нь 10 USDT байна. Спред нь зах зээлийн хөрвөх чадварыг илтгэдэг гол үзүүлэлт бөгөөд бага спред нь илүү сайн хөрвөх чадварыг, өндөр спред нь хөрвөх чадвар багатай эсвэл тогтворгүй зах зээлийг илтгэнэ. Шинэ арилжаачид ихэвчлэн спредэд анхаарал хандуулдаггүй ч урт хугацаанд энэ нь таны ашгид ихээхэн нөлөөлдөг.',
          'Лот (Lot) нь арилжааны хэмжээг тодорхойлох нэгж юм. 1 стандарт лот нь ихэвчлэн 100,000 нэгжтэй тэнцдэг. Харин крипто арилжаанд 1 лот нь тухайн хослолоос хамаарч өөр өөр байдаг. Жишээлбэл, BTC/USDT-д 1 лот нь 1 BTC-тэй тэнцэх бол ETH/USDT-д 1 лот нь 1 ETH байдаг. Микро болон мини лот гэсэн жижиг нэжүүд байдаг бөгөөд эхлэгчдэд микро лотоор (0.01) арилжаа хийж эхлэхийг зөвлөдөг.',
        ],
      },
      {
        title: 'Японы лаа уншиж сурах нь',
        desc: 'Ногоон ба улаан лааны бүтэц, бие, сүүл гэж юу вэ? Японы лаа (Candlestick) бол график дээрх хамгийн чухал элемент бөгөөд үнийн хөдөлгөөнийг дүрслэн харуулдаг.',
        icon: '🕯️', duration: '30 мин', lessons: 5,
        content: [
          'Японы лааны график (Candlestick Chart) нь 18-р зууны Японы будааны худалдаачны бүтээсэн арга бөгөөд өнөөдөр дэлхийн хамгийн өргөн хэрэглэгддэг графикын төрөл юм. Лаа бүр нь 4 үнэ цэнийн мэдээллийг агуулдаг: Нээлт (Open), Хаалт (Close), Хамгийн өндөр (High), Хамгийн бага (Low). Эдгээр дөрвөн мэдээлэл нь тодорхой хугацааны интервалд (1 минут, 1 цаг, 1 өдөр гэх мэт) цугларсан үнийн хөдөлгөөнийг бүрэн дүрсэлдэг.',
          'Лааны бие (Body) нь нээлт ба хаалтын үнийн зөрүүг харуулдаг. Хэрэв хаалтын үнэ нээлтээс дээш байвал ногоон (эсвэл цагаан) лаа үүснэ — энэ нь үнэ өссөнийг илтгэнэ. Харин хаалтын үнэ нээлтээс доош байвал улаан (эсвэл хар) лаа үүснэ — энэ нь үнэ буурсныг илтгэнэ. Лааны сүүл (Wick буюу Shadow) нь хамгийн өндөр ба хамгийн бага үнэийг харуулдаг. Урт дээд сүүл нь худалдагчдын дарамтыг, урт доод сүүл нь худалдан авагчдын дэмжлэгийг илтгэдэг.',
          'Лааны загварууд (Candlestick Patterns) нь зах зээлийн сэтгэл зүйг ойлгох хүчирхэг хэрэгсэл юм. Хамгийн алдартай загварууд: Doji (нээлт ба хаалт ижил) — зах зээлийн эргэлзээг илтгэнэ; Hammer (алх) — урт доод сүүлтэй, өсөлтийн эргэлтийн дохио; Engulfing — том лаа өмнөх жижиг лааг бүрэн эзлэх нь хүчтэй эргэлтийг илтгэнэ. Эдгээр загваруудыг таньж сурах нь арилжааны шийдвэр гаргахад ихээхэн тус болдог.',
        ],
      },
      {
        title: 'Хөшүүрэг (Leverage) ба Барьцаа (Margin)',
        desc: 'Эрсдэл ба боломжийг тэнцвэржүүлэх нь арилжааны хамгийн чухал ур чадвар юм.',
        icon: '⚖️', duration: '35 мин', lessons: 6,
        content: [
          'Хөшүүрэг (Leverage) нь таны хөрөнгөөс хэд дахин их хэмжээний арилжаа нээх боломжийг олгодог санхүүгийн хэрэгсэл юм. Жишээлбэл, 10x хөшүүрэгтэйгээр $100-ийн барьцаагаар $1,000-ийн арилжаа нээж болно. Энэ нь таны ашгийг 10 дахин үржүүлэх боломжтой боловч алдагдлыг ч мөн адил 10 дахин нэмэгдүүлдэг. Өндөр хөшүүрэг нь том ашиг олох боломжтой мэт санагдах боловч шинэ арилжаачдын хамгийн түгээмэл алдангийн шалтгаан болдог.',
          'Барьцаа (Margin) гэдэг нь арилжааг нээхэд шаардагдах хамгийн бага хөрөнгийн хэмжээ юм. Margin Call нь таны барьцааны түвшин тодорхой хэмжээнээс доош унах үед брокероос ирүүлдэг сануулга бөгөөд нэмэлт хөрөнгө оруулах эсвэл арилжаагаа хаах шаардлагатай гэсэн үг юм. Хэрэв та нэмэлт хөрөнгө оруулахгүй бол таны арилжаа албадан хаагдах (Liquidation) эрсдэлд орно.',
          'Хөшүүргийг зөв хэрэглэх гол зарчим: бага хөшүүргээр (3x-5x) эхэлж, зах зээлийн туршлага хуримтлуулах. Хэзээ ч бүх хөрөнгөө нэг арилжаанд барьцаалж болохгүй. Арилжаа бүрт эрсдэлд оруулах хөрөнгийн хэмжээгээ урьдчилан тогтоож, түүнээсээ хэтрэхгүй байх. Маржингийн түвшингээ тогтмол хянаж байх нь гэнэтийн ханшийн хөдөлгөөнөөс хамгаалдаг хамгийн сайн арга юм.',
        ],
      },
    ],
  },
  {
    key: 'intermediate', label: 'Дунд шат', emoji: '📈',
    courses: [
      {
        title: 'Дэмжлэг ба Эсэргүүцлийн бүс',
        desc: 'Хэзээ худалдаж авч, хэзээ зарахаа тодорхойлох нь арилжааны гол урлаг юм.',
        icon: '📐', duration: '40 мин', lessons: 6,
        content: [
          'Дэмжлэг (Support) гэдэг нь үнэ буухдаа тодорхой түвшинд хүрээд дахин өсөх хандлагатай байдаг үнийн бүс юм. Энэ нь зах зээлд хангалттай хэмжээний худалдан авагчид тухайн үнийн түвшинд орж ирдэгтэй холбоотой. Дэмжлэгийн түвшинг тодорхойлохдоо өмнөх үнийн хөдөлгөөний хамгийн бага цэгүүдийг холбож шугам татдаг. Энэ шугамд үнэ хэд хэдэн удаа хүрч, буцаж өссөн байх тусам тухайн түвшин илүү хүчтэй дэмжлэг гэж тооцогддог.',
          'Эсэргүүцэл (Resistance) гэдэг нь үнэ өсөхдөө тодорхой түвшинд хүрээд дахин буух хандлагатай байдаг үнийн бүс юм. Эсэргүүцлийн түвшинд хангалттай хэмжээний худалдагчид гарч ирдэг. Эсэргүүцлийг тодорхойлохдоо өмнөх хамгийн өндөр цэгүүдийг холбож шугам татдаг. Хэрэв үнэ эсэргүүцлийн түвшинг хүчтэй эвдвэл (breakout), тухайн түвшин шинэ дэмжлэг болж хувирдаг. Харин дэмжлэгийн түвшин эвдрэхэд (breakdown) эсэргүүцэл болж хувирдаг.',
          'Дэмжлэг ба эсэргүүцлийн түвшнүүдийг арилжаандаа ашиглах хэд хэдэн стратеги байдаг: Эсэргүүцлийн түвшинд хүрэхэд зарах, дэмжлэгийн түвшинд хүрэхэд авах (range trading); Эсэргүүцлийн түвшин эвдрэхэд авах, дэмжлэгийн түвшин эвдрэхэд зарах (breakout trading). Хуурамч эвдрэлээс (fakeout) сэргийлэхийн тулд үнэ тухайн түвшинг тодорхой хугацаанд хааж чадсан эсэхийг баталгаажуулах нь чухал юм.',
        ],
      },
      {
        title: 'Трэнд дагаж арилжаалах',
        desc: 'Өсөлтийн ба уналтын трэндийг зурах арга нь арилжаачдын хамгийн түгээмэл стратеги юм.',
        icon: '📈', duration: '35 мин', lessons: 5,
        content: [
          '"The trend is your friend" — энэ бол арилжааны хамгийн алдартай зүйр үг юм. Трэнд (Trend) гэдэг нь зах зээлийн үнийн хөдөлгөөний ерөнхий чиглэл юм. Гурван төрлийн трэнд байдаг: Өсөлтийн трэнд (Uptrend) — өндөр цэгүүд болон нам цэгүүд хоёулаа дээшилж байдаг; Уналтын трэнд (Downtrend) — өндөр ба нам цэгүүд хоёулаа доошилж байдаг; Хажуугийн трэнд (Sideways/Range) — үнэ тодорхой хүрээнд хэвтээ чиглэлд хөдөлдөг.',
          'Трэнд шугам (Trendline) зурахдоо хамгийн багадаа хоёр цэг ашигладаг боловч гурван цэгт хүрсэн шугам илүү найдвартай гэж үздэг. Өсөлтийн трэнд шугамыг нам цэгүүдийг холбож, уналтын трэнд шугамыг өндөр цэгүүдийг холбож зурдаг. Трэнд шугам өөрөө динамик дэмжлэг (өсөлтийн трэндэд) эсвэл эсэргүүцэл (уналтын трэндэд) болж өгдөг. Трэнд шугамын өнцөг хэт эгц байх нь трэнд удаан үргэлжлэхгүй гэсэн дохио байж болно.',
          'Трэнд дагаж арилжаалах гол дүрмүүд: Трэндийн чиглэлд л арилжаа нээх (өсөлтийн трэндэд зөвхөн авах, уналтын трэндэд зөвхөн зарах); Трэнд шугамд хүрэх үед арилжаа нээх; Ашиг авах цэгээ (Take Profit) эсрэг трэнд шугам дээр байрлуулах; Stop Loss-оо трэнд шугамаас бага зэрэг доогуур (эсвэл дээгүүр) байрлуулах. Трэнд суларч байгаа шинж тэмдгүүд: хавтгайрч буй трэнд шугам, хэмжээ багатай хөдөлгөөнүүд, трэнд шугамаар олон удаа шүргэгдэх.',
        ],
      },
      {
        title: 'Индикатор ашиглах нь',
        desc: 'RSI болон MACD-ийг арилжааны дохио болгох нь техникийн шинжилгээний хүчирхэг арга хэрэгсэл юм.',
        icon: '📉', duration: '45 мин', lessons: 7,
        content: [
          'RSI (Relative Strength Index) нь 0-100 хүртэлх хэмжүүр бөгөөд үнийн хөдөлгөөний хурд болон өөрчлөлтийг хэмждэг. 70-аас дээш байвал хэт худалдан авалт (Overbought) гэж үздэг — энэ нь үнэ удахгүй буурч болзошгүй гэсэн дохио юм. 30-аас доош байвал хэт худалдаа (Oversold) гэж үздэг — үнэ удахгүй өсөж болзошгүй. Стандарт тохиргоо нь 14 үеийн RSI боловч арилжаачид өөрсдийн стратегид тохируулан үеийг өөрчилдөг. RSI-ийн divergence (зөрүү) нь хүчтэй дохио болдог: үнэ шинэ өндөрт хүрсэн боловч RSI доогуур байвал энэ нь трэнд суларч байгааг илтгэнэ.',
          'MACD (Moving Average Convergence Divergence) нь хоёр хөдөлгөөнт дундаж (EMA)-ийн харилцан үйлчлэлийг харуулдаг индикатор юм. MACD шугам нь 12 EMA ба 26 EMA-ийн зөрүүгээр тооцогддог. Сигнал шугам нь MACD шугамын 9 EMA юм. MACD шугам сигнал шугамаас дээш гарахад худалдан авах дохио, доош гарахад зарах дохио болдог. Түүхэн өгөгдлөөр MACD нь трэндийн өөрчлөлтийг бусад индикаторуудаас эрт илрүүлдэг гэж үздэг.',
          'Индикаторуудыг хослуулан ашиглах нь хамгийн үр дүнтэй арга юм. Жишээлбэл: MACD худалдан авах дохио өгөхөд RSI 30-аас дээш гарч байгаа эсэхийг шалгах; RSI overbought (70+) үед MACD зарах дохио өгч байгаа эсэхийг баталгаажуулах. Гол зарчим: индикаторууд нь зөвхөн нэмэлт хэрэгсэл бөгөөд дангаараа биш, харин үнийн графикын шинжилгээтэй хавсран хэрэглэх нь хамгийн үр дүнтэй. Ямар ч индикатор 100% нарийвчлалтай биш гэдгийг санаарай.',
        ],
      },
    ],
  },
  {
    key: 'advanced', label: 'Ахисан шат', emoji: '🚀',
    courses: [
      {
        title: 'Эрсдэлийн удирдлага (Risk Management)',
        desc: 'Нэг арилжаанд дансныхаа хэдэн хувийг эрсдэлд оруулах вэ? Stop Loss-ийг зөв байрлуулах арга.',
        icon: '🛡️', duration: '50 мин', lessons: 8,
        content: [
          'Эрсдэлийн удирдлага бол мэргэжлийн арилжаачдыг сонирхогчдоос ялгах хамгийн чухал хүчин зүйл юм. Ерөнхий дүрмээр нэг арилжаанд дансны 1-2 хувиас илүүг эрсдэлд оруулахгүй байхыг зөвлөдөг. Жишээлбэл, $10,000 данстай бол нэг арилжаанд $100-200-оос илүү алдах ёсгүй. Энэ нь дараалсан хэд хэдэн алдагдсан арилжааны дараа ч таны данс мэдэгдэхүйц буурахаас сэргийлдэг. Мэргэжлийн арилжаачид арилжааны системийнхээ амжилтын магадлалыг (win rate) харгалзан эрсдэлийн хэмжээгээ тохируулдаг.',
          'Stop Loss-ийг зөв байрлуулах хэд хэдэн зарчим байдаг: Техникийн шинжилгээгээр тодорхойлсон дэмжлэг/эсэргүүцлийн түвшний араас байрлуулах (хэт ойрхон байрлуулбал хэвийн хэлбэлзэлд хаагдах эрсдэлтэй); АТR (Average True Range) индикаторыг ашиглан волатилийг харгалзан үзэх; Risk/Reward харьцааг 1:2 эсвэл 1:3 байлгах. R:R харьцаа гэдэг нь боломжит ашиг болон боломжит алдагдлын харьцаа юм. Жишээлбэл $50 эрсдэлд оруулж, $150 ашиг олох боломжтой бол R:R = 1:3 байна. Амжилттай арилжаачид 40-50% амжилтын магадлалтай ч R:R харьцаагаа зөв тохируулснаар нийт ашигтай ажилладаг.',
          'Портфолиогийн төрөлжилт (Diversification) нь эрсдэлийн удирдлагын өөр нэг чухал хэсэг юм. Бүх хөрөнгөө нэг койн эсвэл нэг стратегид төвлөрүүлэхгүй байх. Өөр өөр койнууд, өөр өөр цагийн хүрээнд (timeframe) арилжаа хийх. Зах зээлийн тогтворгүй байдлын үед (жишээ нь: чухал мэдээ гарах үед) арилжааны хэмжээгээ багасгах эсвэл заримдаа зах зээлээс бүрэн гарах нь ухаалаг шийдвэр байж болно. Арилжааны тэмдэглэл (Trading Journal) хөтөлж, алдаа дутагдлаа дүн шинжилгээ хийх нь урт хугацаанд амжилттай арилжаачин болоход зайлшгүй шаардлагатай.',
        ],
      },
      {
        title: 'Арилжааны сэтгэл зүй',
        desc: 'Айдас ба шуналаа дарж, системээ дагах нь арилжааны хамгийн хэцүү сорилт юм.',
        icon: '🧠', duration: '45 мин', lessons: 6,
        content: [
          'Арилжааны сэтгэл зүй (Trading Psychology) нь техникийн шинжилгээнээс ч илүү чухал байж болно. Олон арилжаачид техникийн шинжилгээг төгс эзэмшсэн ч сэтгэл зүйн хувьд бэлэн биш байдаг. FOMO (Fear Of Missing Out) нь ханш огцом өсөхөд оройтож орж, хамгийн өндөр цэгт худалдан авах сэтгэл зүй юм. FUD (Fear, Uncertainty, Doubt) нь ханш унах үед сандран гарч, хамгийн доод цэгт зарах явдал юм. Эдгээр сэтгэл хөдлөлийн шийдвэрүүд нь ихэвчлэн алдагдалд хүргэдэг.',
          'Сэтгэл зүйгээ хянах хэд хэдэн арга байдаг: Нэгдүгээрт, тодорхой арилжааны төлөвлөгөөтэй байж, зах зээлд орохоосоо өмнө оролт, гарц, Stop Loss, Take Profit-ээ тогтоосон байх. Хоёрдугаарт, арилжааны өдрийн тэмдэглэл (Journal) хөтөлж, арилжаа бүрийн сэтгэл хөдлөлийн төлөв байдлаа тэмдэглэх. Гуравдугаарт, том алдагдлын дараа завсарлага авах — revenge trading хийхээс зайлсхийх. Дөрөвдүгээрт, арилжааг нэг өдрийн уралдаан биш урт хугацааны марафон гэж үзэх.',
          'Амжилттай арилжаачдын нийтлэг зуршил: Тэд төлөвлөгөөгөө дагадаг, алдагдлаа хүлээн зөвшөөрч, жижиг алдагдалтай хаахыг мэддэг. Арилжаа нь тэдний хувьд "зөв байх" тухай биш, харин "ашигтай байх" тухай юм. Алдагдсан арилжааг "сургамж" болгон үзэж, системээ сайжруулдаг. Амжилттай арилжаачид стрессээ удирдах аргаа мэддэг: дасгал хөдөлгөөн, бясалгал, завсарлага. Тэд хэзээ арилжаа хийхээ болихоо мэддэг — зах зээл тодорхойгүй үед зах зээлээс гадагш гарах нь ч бас нэг арилжааны шийдвэр гэдгийг ойлгодог.',
        ],
      },
    ],
  },
];

export default function EducationPage() {
  const [activeLevel, setActiveLevel] = useState<Level>('beginner');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Course | null>(null);

  const levelData = LEVELS.find(l => l.key === activeLevel)!;

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  const openLesson = (course: Course) => {
    setSelectedLesson(course);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedLesson(null), 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="absolute top-6 left-4 sm:left-6">
            <a href="/"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">
              ← Буцах
            </a>
          </div>
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-400 mb-6">
            🎓 Үнэгүй сургалт
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Арилжааны Академи
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Арилжааны суурь ойлголтууд — шинээр сонирхогчдод зориулсан хөтөч
          </p>
          <p className="text-sm text-slate-500 mt-3 max-w-xl mx-auto">
            Крипто зах зээлийн үндсэн бүтэц, техникийн анхны мэдэгдэхүүнүүд болон эрсдэлээс сэргийлэх суурь аргуудтай алхам алхмаар танилцаарай.
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
              <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {course.icon}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="bg-slate-800 rounded-md px-2 py-1">{course.duration}</span>
                    <span className="bg-slate-800 rounded-md px-2 py-1">{course.lessons} хичээл</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-100 group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-4">
                  {course.desc}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-600/10 text-blue-400 rounded px-2 py-0.5">
                    {activeLevel === 'beginner' ? 'Суурь' : activeLevel === 'intermediate' ? 'Дунд' : 'Ахисан'}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-400 rounded px-2 py-0.5">
                    {i === 0 ? 'Эхлэх' : i === 1 ? 'Дараах' : 'Дуусгах'}
                  </span>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button onClick={() => openLesson(course)}
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

      {/* ── MODAL ── */}
      {isModalOpen && selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div onClick={e => e.stopPropagation()}
            className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease]">
            {/* header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl shrink-0">
                  {selectedLesson.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{selectedLesson.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {levelData.emoji} {levelData.label} · {selectedLesson.duration} · {selectedLesson.lessons} хичээл
                  </p>
                </div>
              </div>
              <button onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors shrink-0 text-lg font-bold">
                ✕
              </button>
            </div>

            {/* content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-sm text-slate-300 leading-relaxed">
              {selectedLesson.content.map((paragraph, pi) => (
                <p key={pi} className="text-justify">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end">
              <button onClick={closeModal}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-[0.98]">
              Хаах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-500 text-center">
          Крипто Тайлбар Толь · Арилжааны Академи · © 2026
        </div>
      </footer>
    </div>
  );
}
