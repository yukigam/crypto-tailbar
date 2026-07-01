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
  { min: 0, title: 'Арилжааны Шинэ цэрэг', icon: '🪖' },
  { min: 11000, title: 'Трэнд дагагч', icon: '📈' },
  { min: 15000, title: 'Эрсдэлийн Мастер', icon: '🛡️' },
  { min: 30000, title: 'Крипто Мэргэжилтэн', icon: '🏆' },
  { min: 80000, title: 'Арилжааны Домог', icon: '👑' },
];

function getBadge(equity: number) {
  const b = BADGES.slice().reverse().find(b => equity >= b.min);
  return b || BADGES[0];
}

function getRankIcon(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

const MOCK_USERS: LeaderEntry[] = [
  { rank: 1, name: 'Б.Эрдэнэ', badge: 'Арилжааны Домог', badgeIcon: '👑', equity: 186420, roi: 1764.2 },
  { rank: 2, name: 'Г.Мөнх-Оргил', badge: 'Арилжааны Домог', badgeIcon: '👑', equity: 153750, roi: 1437.5 },
  { rank: 3, name: 'Н.Тэнгүүн', badge: 'Крипто Мэргэжилтэн', badgeIcon: '🏆', equity: 98230, roi: 882.3 },
  { rank: 4, name: 'Ч.Ангирмаа', badge: 'Крипто Мэргэжилтэн', badgeIcon: '🏆', equity: 86500, roi: 765.0 },
  { rank: 5, name: 'О.Сүхбат', badge: 'Эрсдэлийн Мастер', badgeIcon: '🛡️', equity: 43200, roi: 332.0 },
  { rank: 6, name: 'Д.Ариунзаяа', badge: 'Эрсдэлийн Мастер', badgeIcon: '🛡️', equity: 38900, roi: 289.0 },
  { rank: 7, name: 'Э.Гантулга', badge: 'Эрсдэлийн Мастер', badgeIcon: '🛡️', equity: 35120, roi: 251.2 },
  { rank: 8, name: 'С.Амарбаясгалан', badge: 'Трэнд дагагч', badgeIcon: '📈', equity: 28400, roi: 184.0 },
  { rank: 9, name: 'Э.Хүслэн', badge: 'Трэнд дагагч', badgeIcon: '📈', equity: 22150, roi: 121.5 },
  { rank: 10, name: 'Н.Бат-Эрдэнэ', badge: 'Трэнд дагагч', badgeIcon: '📈', equity: 19820, roi: 98.2 },
];

export default function LeaderboardPage() {
  const [userId, setUserId] = useState('');
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [userEntry, setUserEntry] = useState<LeaderEntry | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let id = localStorage.getItem('demo_user_id');
    if (!id) { id = 'demo_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('demo_user_id', id); }
    setUserId(id);

    (async () => {
      if (!supabase) {
        setEntries(MOCK_USERS);
        setTotalCount(52);
        setLoading(false);
        return;
      }

      // fetch all profiles + their open positions
      const { data: profiles } = await supabase.from('profiles').select('user_id, virtual_balance');
      const { data: positions } = await supabase.from('demo_positions').select('user_id, coin, side, amount, entry_price').eq('status', 'open');

      if (!profiles || profiles.length === 0) {
        setEntries(MOCK_USERS);
        setTotalCount(52);
        setLoading(false);
        return;
      }

      // calculate unrealized P&L per user
      const upnlMap: Record<string, number> = {};
      if (positions) {
        // need prices - fetch from CoinGecko
        let priceRaw: Record<string, any> = {};
        try {
          const coinIds = [...new Set(positions.map(p => p.coin))].join(',');
          if (coinIds) {
            const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`);
            if (r.ok) priceRaw = await r.json();
          }
        } catch {}

        for (const pos of positions) {
          const cp = priceRaw[pos.coin]?.usd || 0;
          const upnl = pos.side === 'buy'
            ? (cp - Number(pos.entry_price)) * Number(pos.amount)
            : (Number(pos.entry_price) - cp) * Number(pos.amount);
          upnlMap[pos.user_id] = (upnlMap[pos.user_id] || 0) + upnl;
        }
      }

      // compute each user's equity
      const userList: { id: string; balance: number; equity: number; roi: number; name?: string }[] = profiles.map(p => {
        const bal = Number(p.virtual_balance);
        const upnl = upnlMap[p.user_id] || 0;
        const equity = bal + upnl;
        const roi = ((equity - 10000) / 10000) * 100;
        return { id: p.user_id, balance: bal, equity, roi };
      });

      // sort by equity descending
      userList.sort((a, b) => b.equity - a.equity);

      const leaderboard: LeaderEntry[] = userList.map((u, i) => {
        const badge = getBadge(u.equity);
        return {
          rank: i + 1,
          name: u.id === id ? 'Та' : u.id.slice(0, 8),
          badge: badge.title,
          badgeIcon: badge.icon,
          equity: u.equity,
          roi: u.roi,
          isUser: u.id === id,
        };
      });

      // current user
      const me = leaderboard.find(e => e.isUser) || null;
      if (me) setUserEntry(me);

      // show top 50
      setEntries(leaderboard.slice(0, 50));
      setTotalCount(leaderboard.length);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Ачааллаж байна...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <a href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors mb-6">← Буцах</a>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">🏆 Шилдэг арилжаачдын жагсаалт</h1>
            <p className="text-slate-400 text-sm sm:text-base">Демо арилжааны хамгийн шилдэг тоглогчид. Өрсөлдөж, тэргүүн байрыг эзэл!</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* ── MY RANK ── */}
        {userEntry && (
          <div className="bg-gradient-to-r from-amber-900/20 via-slate-900 to-amber-900/10 border border-amber-700/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">👤</div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Таны одоогийн байр</p>
                <p className="text-2xl font-extrabold text-amber-400">#{userEntry.rank}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
              <div className="text-center">
                <p className="text-slate-500 text-xs">Цол</p>
                <p className="font-semibold">{userEntry.badgeIcon} {userEntry.badge}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-xs">Нийт хөрөнгө</p>
                <p className="font-semibold text-green-400">${userEntry.equity.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-xs">ROI</p>
                <p className={`font-bold ${userEntry.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {userEntry.roi >= 0 ? '+' : ''}{userEntry.roi.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TABLE ── */}
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
                {entries.map((user) => {
                  const roiUp = user.roi >= 0;
                  return (
                    <tr key={user.rank}
                      className={`border-t border-slate-800/50 transition-colors hover:bg-slate-800/30 ${user.isUser ? 'bg-blue-900/20 border-blue-700/30' : ''} ${user.rank <= 3 ? 'bg-amber-500/5' : ''}`}>
                      <td className="px-4 py-3.5 font-bold">
                        <span className={user.rank <= 3 ? 'text-2xl' : 'text-slate-400 font-mono'}>
                          {getRankIcon(user.rank)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-200">{user.name}</span>
                        {user.isUser && <span className="ml-2 text-[10px] font-bold text-blue-400 bg-blue-900/30 rounded px-1.5 py-0.5">Чи</span>}
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                          <span>{user.badgeIcon}</span>
                          <span>{user.badge}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-200">
                        ${user.equity.toFixed(2)}
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
          <div className="px-4 py-3 border-t border-slate-800 text-center text-xs text-slate-600">
            Жагсаалт нь демо арилжааны оролцогчдын нийт хөрөнгөөр эрэмбэлэгдсэн · {totalCount} оролцогч
          </div>
        </div>

        {/* ── BADGE LEGEND ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">🏅 Цолны тэмдэглэгээ</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {BADGES.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-lg">{b.icon}</span>
                <span>{b.title}</span>
                <span className="text-slate-600">(${b.min.toLocaleString()}+)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
