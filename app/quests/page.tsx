'use client';

import { useEffect, useState, useCallback } from 'react';
export const dynamic = 'force-dynamic';
import { supabase } from '../../lib/supabase';

// ── RANKS ──
const RANKS = [
  { id: 0, title: 'Арилжааны Шинэ цэрэг', sub: 'Novice Trader', xpNeeded: 0, icon: '🪖', color: 'text-slate-400' },
  { id: 1, title: 'Трэнд дагагч', sub: 'Trend Follower', xpNeeded: 100, icon: '📈', color: 'text-blue-400' },
  { id: 2, title: 'Эрсдэлийн Мастер', sub: 'Risk Master', xpNeeded: 300, icon: '🛡️', color: 'text-green-400' },
  { id: 3, title: 'Крипто Мэргэжилтэн', sub: 'Crypto Expert', xpNeeded: 600, icon: '🏆', color: 'text-amber-400' },
  { id: 4, title: 'Арилжааны Домог', sub: 'Trading Legend', xpNeeded: 1000, icon: '👑', color: 'text-purple-400' },
];

interface QuestState {
  q1Done: boolean; q1Claimed: boolean;
  q2Done: boolean; q2Claimed: boolean;
  q3Done: boolean; q3Claimed: boolean;
  q3Streak: number;
  xp: number;
  lastLogin: string;
}

const STORAGE_KEY = 'quest_state';

function loadState(): QuestState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch {}
  return defaultState();
}

function defaultState(): QuestState {
  return {
    q1Done: false, q1Claimed: false,
    q2Done: false, q2Claimed: false,
    q3Done: false, q3Claimed: false,
    q3Streak: 1,
    xp: 0,
    lastLogin: new Date().toDateString(),
  };
}

function saveState(s: QuestState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

const TOTAL_XP = RANKS[RANKS.length - 1].xpNeeded;

// ── COMPONENT ──
export default function QuestsPage() {
  const [userId, setUserId] = useState('');
  const [balance, setBalance] = useState(10000);
  const [state, setState] = useState<QuestState>(defaultState());
  const [animXp, setAnimXp] = useState(0);
  const [animBalance, setAnimBalance] = useState(0);
  const [claimMsg, setClaimMsg] = useState('');
  const [hasTrade, setHasTrade] = useState(false);

  const curRank = RANKS.slice().reverse().find(r => state.xp >= r.xpNeeded) || RANKS[0];
  const nextRank = RANKS.find(r => r.xpNeeded > state.xp) || curRank;
  const xpInRank = state.xp - curRank.xpNeeded;
  const xpNeededForNext = nextRank.xpNeeded - curRank.xpNeeded;
  const rankProgress = xpNeededForNext > 0 ? xpInRank / xpNeededForNext : 1;
  const overallProgress = state.xp / TOTAL_XP;

  // init
  useEffect(() => {
    let id = localStorage.getItem('demo_user_id');
    if (!id) { id = 'demo_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('demo_user_id', id); }
    setUserId(id);

    // load quest state
    const s = loadState();
    // check login streak
    const today = new Date().toDateString();
    if (s.lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (s.lastLogin === yesterday) {
        s.q3Streak = Math.min((s.q3Streak || 0) + 1, 3);
      } else {
        s.q3Streak = 1;
      }
      s.lastLogin = today;
      if (s.q3Streak >= 3) s.q3Done = true;
      saveState(s);
    }
    setState(s);

    // fetch balance
    if (supabase) {
      (async () => {
        const { data: prof } = await supabase.from('profiles').select('virtual_balance').eq('user_id', id).single();
        if (prof) setBalance(Number(prof.virtual_balance));
        const { data: pos } = await supabase.from('demo_positions').select('id').eq('user_id', id).limit(1);
        if (pos && pos.length > 0) setHasTrade(true);
      })();
    }
  }, []);

  // check if quests auto-complete
  useEffect(() => {
    setState(prev => {
      let changed = false;
      const next = { ...prev };
      // q2: has opened a trade
      if (hasTrade && !next.q2Done) { next.q2Done = true; changed = true; }
      if (changed) saveState(next);
      return next;
    });
  }, [hasTrade]);

  const claim = useCallback(async (questId: number) => {
    const s = { ...state };
    let xpGain = 0;
    let balanceGain = 0;

    if (questId === 1 && s.q1Done && !s.q1Claimed) {
      s.q1Claimed = true;
      balanceGain = 500;
      xpGain = 50;
    } else if (questId === 2 && s.q2Done && !s.q2Claimed) {
      s.q2Claimed = true;
      xpGain = 20;
    } else if (questId === 3 && s.q3Done && !s.q3Claimed) {
      s.q3Claimed = true;
      xpGain = 80;
      balanceGain = 200;
    } else return;

    const newBalance = balance + balanceGain;
    const newXp = s.xp + xpGain;
    s.xp = newXp;
    saveState(s);
    setState(s);
    setBalance(newBalance);

    // animate
    setAnimBalance(balanceGain);
    setAnimXp(xpGain);
    setTimeout(() => { setAnimBalance(0); setAnimXp(0); }, 2500);
    setClaimMsg(`+${balanceGain > 0 ? '$' + balanceGain : ''} ${xpGain > 0 ? xpGain + ' XP' : ''}`.trim());
    setTimeout(() => setClaimMsg(''), 2500);

    // supabase balance update
    if (supabase && balanceGain > 0) {
      await supabase.from('profiles').upsert({ user_id: userId, virtual_balance: newBalance });
    }
  }, [state, balance, userId]);

  const completeQuest = useCallback((questId: number) => {
    setState(prev => {
      const next = { ...prev };
      if (questId === 1 && !next.q1Done) { next.q1Done = true; }
      if (questId === 3 && !next.q3Done) { next.q3Done = true; next.q3Streak = 3; }
      saveState(next);
      return next;
    });
  }, []);

  // ── RENDER ──
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <a href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors mb-6">
            ← Буцах
          </a>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">🎯 Өдөр тутмын даалгавар</h1>
            <p className="text-slate-400 text-sm sm:text-base">Даалгавруудыг биелүүлж, цолоо ахиулж, демо бонус аваарай!</p>
          </div>
        </div>
      </section>

      {/* ── CLAIM FLASH ── */}
      {claimMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-900/90 border border-green-600/50 backdrop-blur-md rounded-xl px-6 py-3 shadow-2xl animate-[fadeIn_0.3s_ease]">
          <p className="text-green-300 font-bold text-lg flex items-center gap-2">🎉 {claimMsg}</p>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ── RANK + XP SECTION ── */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* current rank */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 text-7xl opacity-5 select-none pointer-events-none">{curRank.icon}</div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Таны цол</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{curRank.icon}</span>
              <div>
                <h2 className={`text-xl font-bold ${curRank.color}`}>{curRank.title}</h2>
                <p className="text-sm text-slate-500">{curRank.sub}</p>
              </div>
            </div>
            {nextRank.id > curRank.id && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Дараагийн цол: {nextRank.title}</span>
                  <span>{xpInRank}/{xpNeededForNext} XP</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700" style={{ width: `${Math.round(rankProgress * 100)}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* overall progress */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Ерөнхий ахиц</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold">{state.xp} <span className="text-sm font-normal text-slate-500">/ {TOTAL_XP} XP</span></span>
              <span className="text-sm text-slate-500">{Math.round(overallProgress * 100)}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700" style={{ width: `${Math.round(overallProgress * 100)}%` }} />
            </div>
            <div className="flex justify-between mt-3 text-xs text-slate-600">
              {RANKS.filter(r => r.id > 0).map(r => (
                <span key={r.id} className="flex flex-col items-center gap-0.5">
                  <span className={state.xp >= r.xpNeeded ? 'text-green-400' : ''}>{r.icon}</span>
                  <span className={state.xp >= r.xpNeeded ? 'text-green-400/70' : ''}>{r.xpNeeded}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── QUESTS ── */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">📋 Идэвхтэй даалгаврууд</h2>
          <div className="space-y-4">
            {/* QUEST 1 */}
            <QuestCard
              icon="📘"
              title="Анхны алхам"
              desc="Сургалтын анхан шатны 3 хичээлийг уншиж, тестийг зөв бөглөх."
              reward="$500 Демо бонус + 50 XP"
              done={state.q1Done}
              claimed={state.q1Claimed}
              progress={state.q1Done ? 100 : 0}
              onComplete={() => completeQuest(1)}
              onClaim={() => claim(1)}
            />

            {/* QUEST 2 */}
            <QuestCard
              icon="📊"
              title="Дадлагажигч"
              desc="Демо арилжааны хуудас руу орж анхны арилжаагаа нээх."
              reward="+20 XP"
              done={state.q2Done}
              claimed={state.q2Claimed}
              progress={hasTrade ? 100 : 0}
              linkTo="/demo-trade"
              onClaim={() => claim(2)}
            />

            {/* QUEST 3 */}
            <QuestCard
              icon="🔥"
              title="Тогтвортой ажиллагаа"
              desc={`3 өдөр дараалж сайтад нэвтрэх. (${state.q3Streak}/3)`}
              reward="200$ Демо бонус + 80 XP"
              done={state.q3Done}
              claimed={state.q3Claimed}
              progress={Math.round((state.q3Streak / 3) * 100)}
              onComplete={() => completeQuest(3)}
              onClaim={() => claim(3)}
            />
          </div>
        </div>

        {/* ── RANK PREVIEW ── */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">🏅 Цолны жагсаалт</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RANKS.map(r => {
              const unlocked = state.xp >= r.xpNeeded;
              return (
                <div key={r.id} className={`rounded-xl border p-4 transition-all ${unlocked ? 'border-green-700/50 bg-green-900/10' : 'border-slate-800 bg-slate-900'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${unlocked ? '' : 'opacity-30 grayscale'}`}>{r.icon}</span>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${unlocked ? r.color : 'text-slate-500'}`}>{r.title}</p>
                      <p className="text-xs text-slate-600">{r.sub}</p>
                    </div>
                    {unlocked && <span className="text-green-400 text-lg">✓</span>}
                    {!unlocked && <span className="text-xs text-slate-600">{r.xpNeeded} XP</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── QUEST CARD ──
function QuestCard({ icon, title, desc, reward, done, claimed, progress, onComplete, onClaim, linkTo }: {
  icon: string; title: string; desc: string; reward: string;
  done: boolean; claimed: boolean; progress: number;
  onComplete?: () => void; onClaim?: () => void; linkTo?: string;
}) {
  const [localDone, setLocalDone] = useState(done);

  useEffect(() => { setLocalDone(done); }, [done]);

  return (
    <div className={`rounded-2xl border p-5 transition-all ${claimed ? 'border-green-800/40 bg-green-900/5' : done ? 'border-blue-600/40 bg-blue-900/10' : 'border-slate-800 bg-slate-900'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-200">{title}</h3>
              {claimed && <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-900/30 rounded px-2 py-0.5">Шагнал авсан</span>}
              {done && !claimed && <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-900/30 rounded px-2 py-0.5">Дуусгасан</span>}
            </div>
            <p className="text-sm text-slate-400 mt-1">{desc}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Явц</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${claimed ? 'bg-green-600' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-xs font-semibold text-amber-400 bg-amber-900/20 rounded-lg px-3 py-1.5 text-center whitespace-nowrap">{reward}</span>

          {!done && !claimed && linkTo && (
            <a href={linkTo} className="w-full text-center px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
              🚀 Эхлэх
            </a>
          )}

          {!done && !claimed && !linkTo && onComplete && (
            <button onClick={() => { onComplete(); setLocalDone(true); }}
              className="w-full px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
              ✅ Дуусгасан
            </button>
          )}

          {done && !claimed && onClaim && (
            <button onClick={onClaim}
              className="w-full px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.97]">
              🎁 Шагнал авах
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
