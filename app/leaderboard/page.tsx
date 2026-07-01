'use client';

import { useEffect, useState } from 'react';
export const dynamic = 'force-dynamic';
import { supabase } from '../../lib/supabase';

interface LeaderEntry {
  rank: number;
  name: string;
  badge: string;
  badgeIcon: string;
  equity: number;
  roi: number;
  isUser?: boolean;
}

const BADGES = [
  { id: 0, title: 'Арилжааны Шинэ цэрэг', icon: '🪖' },
  { id: 1, title: 'Трэнд дагагч', icon: '📈' },
  { id: 2, title: 'Эрсдэлийн Мастер', icon: '🛡️' },
  { id: 3, title: 'Крипто Мэргэжилтэн', icon: '🏆' },
  { id: 4, title: 'Арилжааны Домог', icon: '👑' },
];

const TOP_USERS: LeaderEntry[] = [
  { rank: 1, name: 'Б.Эрдэнэ',   badge: 'Арилжааны Домог',   badgeIcon: '👑', equity: 186420, roi: 1764.2 },
  { rank: 2, name: 'Г.Мөнх-Оргил', badge: 'Арилжааны Домог',   badgeIcon: '👑', equity: 153750, roi: 1437.5 },
  { rank: 3, name: 'Н.Тэнгүүн',   badge: 'Крипто Мэргэжилтэн', badgeIcon: '🏆', equity: 98230,  roi: 882.3 },
  { rank: 4, name: 'Ч.Ангирмаа', badge: 'Крипто Мэргэжилтэн', badgeIcon: '🏆', equity: 86500,  roi: 765.0 },
  { rank: 5, name: 'О.Сүхбат',   badge: 'Эрсдэлийн Мастер',   badgeIcon: '🛡️', equity: 43200,  roi: 332.0 },
  { rank: 6, name: 'Д.Ариунзаяа', badge: 'Эрсдэлийн Мастер',   badgeIcon: '🛡️', equity: 38900,  roi: 289.0 },
  { rank: 7, name: 'Э.Гантулга',  badge: 'Эрсдэлийн Мастер',   badgeIcon: '🛡️', equity: 35120,  roi: 251.2 },
  { rank: 8, name: 'С.Амарбаясгалан', badge: 'Трэнд дагагч', badgeIcon: '📈', equity: 28400,  roi: 184.0 },
  { rank: 9, name: 'Э.Хүслэн',    badge: 'Трэнд дагагч',       badgeIcon: '📈', equity: 22150,  roi: 121.5 },
  { rank: 10, name: 'Н.Бат-Эрдэнэ', badge: 'Трэнд дагагч',     badgeIcon: '📈', equity: 19820,  roi: 98.2 },
];

const TOTAL_MOCK = 52;

function getRankIcon(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export default function LeaderboardPage() {
  const [userId, setUserId] = useState('');
  const [userRank, setUserRank] = useState(42);
  const [userEquity, setUserEquity] = useState(10750);
  const [userRoi, setUserRoi] = useState(7.5);
  const [userBadge, setUserBadge] = useState('Арилжааны Шинэ цэрэг');
  const [userBadgeIcon, setUserBadgeIcon] = useState('🪖');

  useEffect(() => {
    let id = localStorage.getItem('demo_user_id');
    if (!id) { id = 'demo_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('demo_user_id', id); }
    setUserId(id);

    if (supabase) {
      (async () => {
        const { data: prof } = await supabase.from('profiles').select('virtual_balance').eq('user_id', id).single();
        if (prof) {
          const bal = Number(prof.virtual_balance);
          const roi = ((bal - 10000) / 10000) * 100;
          setUserEquity(bal);
          setUserRoi(roi);
          // rough rank estimate
          const rank = Math.max(1, Math.round(25 + Math.random() * 30 - roi * 0.5));
          setUserRank(Math.min(TOTAL_MOCK, Math.max(1, rank)));
        }
      })();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <a href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors mb-6">
            ← Буцах
          </a>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">🏆 Шилдэг арилжаачдын жагсаалт</h1>
            <p className="text-slate-400 text-sm sm:text-base">Демо арилжааны хамгийн шилдэг тоглогчид. Өрсөлдөж, тэргүүн байрыг эзэл!</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* ── MY RANK CARD ── */}
        <div className="bg-gradient-to-r from-amber-900/20 via-slate-900 to-amber-900/10 border border-amber-700/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Таны одоогийн байр</p>
              <p className="text-2xl font-extrabold text-amber-400">#{userRank}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
            <div className="text-center">
              <p className="text-slate-500 text-xs">Цол</p>
              <p className="font-semibold">{userBadgeIcon} {userBadge}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs">Нийт хөрөнгө</p>
              <p className="font-semibold text-green-400">${userEquity.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs">ROI</p>
              <p className={`font-bold ${userRoi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {userRoi >= 0 ? '+' : ''}{userRoi.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* ── LEADERBOARD TABLE ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="text-left px-4 py-3.5 w-16">Байр</th>
                  <th className="text-left px-4 py-3.5">Хэрэглэгч</th>
                  <th className="text-left px-4 py-3.5 hidden sm:table-cell">Цол</th>
                  <th className="text-right px-4 py-3.5">Нийт хөрөнгө</th>
                  <th className="text-right px-4 py-3.5">ROI</th>
                </tr>
              </thead>
              <tbody>
                {TOP_USERS.map((user) => {
                  const roiUp = user.roi >= 0;
                  return (
                    <tr key={user.rank} className={`border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors ${user.rank <= 3 ? 'bg-amber-500/5' : ''}`}>
                      <td className="px-4 py-3.5 font-bold">
                        <span className={user.rank <= 3 ? 'text-2xl' : 'text-slate-400 font-mono'}>
                          {getRankIcon(user.rank)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-200">{user.name}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                          <span>{user.badgeIcon}</span>
                          <span>{user.badge}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-200">
                        ${user.equity.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3.5 text-right font-bold font-mono ${roiUp ? 'text-green-400' : 'text-red-400'}`}>
                        {roiUp ? '+' : ''}{user.roi.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* bottom note */}
          <div className="px-4 py-3 border-t border-slate-800 text-center text-xs text-slate-600">
            Жагсаалт нь демо арилжааны оролцогчдын нийт хөрөнгөөр эрэмбэлэгдсэн · {TOTAL_MOCK} оролцогч
          </div>
        </div>

        {/* ── RANK BADGE LEGEND ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">🏅 Цолны тэмдэглэгээ</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {BADGES.map(b => (
              <div key={b.id} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-lg">{b.icon}</span>
                <span>{b.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
