'use client';

import { useEffect, useState, useCallback } from 'react';
export const dynamic = 'force-dynamic';
import { supabase } from '../../lib/supabase';

// ── TYPES ──
interface CoinCfg { id: string; label: string; name: string; icon: string; }
interface MktData {
  id: string; current_price: number; price_change_percentage_24h: number;
  sparkline_in_7d: { price: number[] };
}
interface Holding { coin: string; amount: number; avg_buy_price: number; }
interface Trade { id: string; coin: string; type: string; amount: number; price: number; total: number; created_at: string; }

// ── 10 COINS ──
const COINS: CoinCfg[] = [
  { id: 'bitcoin', label: 'BTC', name: 'Bitcoin', icon: '₿' },
  { id: 'ethereum', label: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { id: 'solana', label: 'SOL', name: 'Solana', icon: '◎' },
  { id: 'cardano', label: 'ADA', name: 'Cardano', icon: '₳' },
  { id: 'avalanche-2', label: 'AVAX', name: 'Avalanche', icon: '◈' },
  { id: 'polkadot', label: 'DOT', name: 'Polkadot', icon: '●' },
  { id: 'dogecoin', label: 'DOGE', name: 'Dogecoin', icon: 'Ð' },
  { id: 'matic-network', label: 'MATIC', name: 'Polygon', icon: '⬡' },
  { id: 'chainlink', label: 'LINK', name: 'Chainlink', icon: '🔗' },
  { id: 'litecoin', label: 'LTC', name: 'Litecoin', icon: 'Ł' },
];

const COIN_IDS = COINS.map(c => c.id).join(',');
const C = {
  bg: '#0f172a', card: '#1e293b', cardHover: '#253349', border: '#334155',
  ink: '#f1f5f9', inkLight: '#94a3b8', inkFaint: '#64748b',
  accentBlue: '#3b82f6', accentGreen: '#22c55e', accentRed: '#ef4444',
  accentYellow: '#f59e0b',
};

// ── SPARKLINE ──
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const w = 140, h = 36;
  const min = Math.min(...data), max = Math.max(...data), r = max - min || 1;
  const pts = data.map((p, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((p - min) / r) * h }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${d} L${w} ${h} L0 ${h} Z`;
  const id = color.replace('#', '');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${id})`} />
      <path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── QUANTITY INPUT ──
function QtyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <button onClick={() => onChange(Math.max(0, value - 1))}
        style={{ padding: '6px 12px', border: `1px solid ${C.border}`, borderRight: 'none', borderRadius: '6px 0 0 6px', background: C.card, color: C.ink, cursor: 'pointer', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>
        −
      </button>
      <input type="number" min={0} step={1} value={value}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        style={{ width: 56, padding: '6px 4px', border: `1px solid ${C.border}`, background: C.bg, color: C.ink, textAlign: 'center', fontSize: 14, fontWeight: 600, outline: 'none' }} />
      <button onClick={() => onChange(value + 1)}
        style={{ padding: '6px 12px', border: `1px solid ${C.border}`, borderLeft: 'none', borderRadius: '0 6px 6px 0', background: C.card, color: C.ink, cursor: 'pointer', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>
        +
      </button>
    </div>
  );
}

// ── MAIN ──
export default function DemoTradePage() {
  const [userId, setUserId] = useState('');
  const [balance, setBalance] = useState(10000);
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [mktMap, setMktMap] = useState<Record<string, MktData>>({});
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const flash = useCallback((text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  }, []);

  const addQty = useCallback((coin: string, delta: number) => {
    setQtys(prev => ({ ...prev, [coin]: Math.max(0, (prev[coin] || 1) + delta) }));
  }, []);

  // init user
  useEffect(() => {
    let id = localStorage.getItem('demo_user_id');
    if (!id) { id = 'demo_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('demo_user_id', id); }
    setUserId(id);
    if (!supabase) { setLoading(false); return; }
    (async () => {
      const { data: prof } = await supabase.from('profiles').select('virtual_balance').eq('user_id', id).single();
      if (prof) setBalance(Number(prof.virtual_balance));
      else { await supabase.rpc('ensure_user_profile', { p_user_id: id }); }
      const { data: port } = await supabase.from('demo_portfolio').select('coin, amount, avg_buy_price').eq('user_id', id);
      if (port) setPortfolio(port.map((p: any) => ({ coin: p.coin, amount: Number(p.amount), avg_buy_price: Number(p.avg_buy_price || 0) })));
      const { data: tr } = await supabase.from('demo_trade_history').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(50);
      if (tr) setTrades(tr.map((t: any) => ({ ...t, amount: Number(t.amount), price: Number(t.price), total: Number(t.total) })));
      setLoading(false);
    })();
  }, []);

  // fetch market data
  useEffect(() => {
    async function fetchMkt() {
      try {
        const r = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`
        );
        if (!r.ok) return;
        const d: MktData[] = await r.json();
        const map: Record<string, MktData> = {};
        d.forEach(item => { map[item.id] = item; });
        setMktMap(map);
        // default quantities
        setQtys(prev => {
          const next = { ...prev };
          d.forEach(item => { if (!(item.id in next)) next[item.id] = 1; });
          return next;
        });
      } catch {}
    }
    fetchMkt();
    const iv = setInterval(fetchMkt, 30000);
    return () => clearInterval(iv);
  }, []);

  // buy / sell
  const trade = useCallback(async (coinId: string, isBuy: boolean) => {
    if (!userId) return;
    const mkt = mktMap[coinId];
    if (!mkt || !mkt.current_price) { flash('Үнэ олдсонгүй', false); return; }
    const qty = qtys[coinId] || 1;
    if (qty <= 0) { flash('Тоо хэмжээг оруулна уу', false); return; }
    const price = mkt.current_price;
    const total = qty * price;
    if (isBuy && balance < total) { flash('Хангалттай демо мөнгө байхгүй!', false); return; }
    if (!isBuy) {
      const holding = portfolio.find(p => p.coin === coinId);
      if (!holding || holding.amount < qty) { flash('Тухайн койн хангалтгүй байна', false); return; }
    }

    const newBalance = isBuy ? balance - total : balance + total;
    setBalance(newBalance);

    const holding = portfolio.find(p => p.coin === coinId);
    let newAmount: number;
    let newAvg: number;

    if (isBuy) {
      newAmount = (holding?.amount || 0) + qty;
      const oldVal = (holding?.amount || 0) * (holding?.avg_buy_price || 0);
      newAvg = (oldVal + total) / newAmount;
    } else {
      newAmount = Math.max(0, (holding?.amount || 0) - qty);
      newAvg = holding?.avg_buy_price || 0;
    }

    // update portfolio in state
    setPortfolio(prev => {
      const filtered = prev.filter(p => p.coin !== coinId);
      return newAmount > 0 ? [...filtered, { coin: coinId, amount: newAmount, avg_buy_price: newAvg }] : filtered;
    });

    // supabase writes
    if (supabase) {
      await supabase.from('profiles').upsert({ user_id: userId, virtual_balance: newBalance });
      if (newAmount > 0) {
        await supabase.from('demo_portfolio').upsert(
          { user_id: userId, coin: coinId, amount: newAmount, avg_buy_price: newAvg },
          { onConflict: 'user_id, coin' }
        );
      } else {
        await supabase.from('demo_portfolio').delete().eq('user_id', userId).eq('coin', coinId);
      }
      // record trade
      const { data: newTrade } = await supabase.from('demo_trade_history').insert({
        user_id: userId, coin: coinId, type: isBuy ? 'buy' : 'sell',
        amount: qty, price, total,
      }).select().single();
      if (newTrade) {
        setTrades(prev => [{ ...newTrade, amount: Number(newTrade.amount), price: Number(newTrade.price), total: Number(newTrade.total) }, ...prev]);
      }
    }

    flash(isBuy
      ? `${qty} ${COINS.find(c => c.id === coinId)?.label || coinId} амжилттай худалдаж авлаа!`
      : `${qty} ${COINS.find(c => c.id === coinId)?.label || coinId} амжилттай зарлаа!`);
  }, [userId, balance, portfolio, mktMap, qtys, flash]);

  // reset
  const reset = useCallback(async () => {
    if (!userId) return;
    setBalance(10000);
    setPortfolio([]);
    setTrades([]);
    if (supabase) {
      await supabase.from('profiles').upsert({ user_id: userId, virtual_balance: 10000 });
      await supabase.from('demo_portfolio').delete().eq('user_id', userId);
      await supabase.from('demo_trade_history').delete().eq('user_id', userId);
    }
    flash('Бүх өгөгдөл шинэчлэгдсэн. Дахин эхлэхэд бэлэн!');
  }, [userId, flash]);

  const totalPortValue = portfolio.reduce((sum, p) => {
    return sum + ((mktMap[p.coin]?.current_price || 0) * p.amount);
  }, 0);
  const totalCost = portfolio.reduce((sum, p) => sum + (p.avg_buy_price * p.amount), 0);
  const totalPnl = totalPortValue - totalCost;
  const totalWealth = totalPortValue + balance;
  const initBalance = 10000;

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px', fontFamily: 'system-ui, sans-serif', background: C.bg, minHeight: '100vh', color: C.ink }}>
      {/* BACK BUTTON */}
      <div style={{ marginBottom: 12 }}>
        <a href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.inkLight, fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, transition: 'all 0.2s' }}>
          ← Буцах
        </a>
      </div>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 2px', color: C.ink }}>Crypto Demo Trading</h1>
          <p style={{ color: C.inkLight, margin: 0, fontSize: 14 }}>Хуурамч мөнгөөр крипто арилжаа туршиж үзэх</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowHistory(o => !o)}
            style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.inkLight, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            📋 Арилжааны түүх
          </button>
          <button onClick={reset}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            🔄 Шинээр эхлэх
          </button>
        </div>
      </div>

      {/* FLASH MESSAGE */}
      {msg && (
        <div style={{
          padding: '12px 18px', borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: 14,
          background: msg.ok ? '#064e3b' : '#450a0a',
          border: `1px solid ${msg.ok ? '#22c55e' : '#ef4444'}`,
          color: msg.ok ? '#bbf7d0' : '#fecaca',
        }}>
          {msg.text}
        </div>
      )}

      {/* BALANCE + PORTFOLIO SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        <div style={{ background: C.card, borderRadius: 12, padding: '16px 20', border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 12, color: C.inkLight, margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>💵 Бэлэн мөнгө</p>
          <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div style={{ background: C.card, borderRadius: 12, padding: '16px 20', border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 12, color: C.inkLight, margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Портфолио</p>
          <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>${totalPortValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div style={{ background: C.card, borderRadius: 12, padding: '16px 20', border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 12, color: C.inkLight, margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>💰 Нийт хөрөнгө</p>
          <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>${totalWealth.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p style={{ fontSize: 13, margin: '2px 0 0', color: totalWealth >= initBalance ? C.accentGreen : C.accentRed, fontWeight: 700 }}>
            {totalWealth >= initBalance ? '▲' : '▼'} {((totalWealth / initBalance - 1) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* COIN GRID */}
      <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
        {loading ? (
          <p style={{ color: C.inkLight, textAlign: 'center', padding: 40 }}>Ачааллаж байна...</p>
        ) : (
          COINS.map(coin => {
            const mkt = mktMap[coin.id];
            const price = mkt?.current_price || 0;
            const chg = mkt?.price_change_percentage_24h;
            const holding = portfolio.find(p => p.coin === coin.id);
            const holdAmt = holding?.amount || 0;
            const avgPrice = holding?.avg_buy_price || 0;
            const holdValue = price * holdAmt;
            const pnl = holdValue - (avgPrice * holdAmt);
            const spData = mkt?.sparkline_in_7d?.price;
            const up = chg !== undefined && chg >= 0;
            const chgColor = chg === undefined ? C.inkLight : up ? C.accentGreen : C.accentRed;

            return (
              <div key={coin.id} style={{
                background: C.card, borderRadius: 12, padding: '16px 20',
                border: `1px solid ${C.border}`, transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                  {/* LEFT: coin info */}
                  <div style={{ flex: '1 1 160px', minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 22 }}>{coin.icon}</span>
                      <span style={{ fontSize: 18, fontWeight: 700 }}>{coin.label}</span>
                      <span style={{ fontSize: 12, color: C.inkFaint }}>{coin.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 24, fontWeight: 800 }}>${price.toLocaleString('en-US')}</span>
                      {chg !== undefined && (
                        <span style={{ fontSize: 13, fontWeight: 700, color: chgColor }}>
                          {up ? '▲' : '▼'} {Math.abs(chg).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CENTER: sparkline */}
                  <div style={{ flex: '0 0 auto' }}>
                    {spData && spData.length > 1 ? (
                      <Sparkline data={spData} color={chgColor} />
                    ) : (
                      <div style={{ width: 140, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkFaint, fontSize: 12 }}>
                        График ачааллаж байна...
                      </div>
                    )}
                  </div>

                  {/* RIGHT: controls */}
                  <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <QtyInput value={qtys[coin.id] || 1} onChange={v => setQtys(prev => ({ ...prev, [coin.id]: v }))} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => trade(coin.id, true)} disabled={!price}
                        style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: price ? C.accentGreen : C.border, color: '#fff', cursor: price ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 13 }}>
                        Худалдаж авах
                      </button>
                      <button onClick={() => trade(coin.id, false)} disabled={!price || holdAmt <= 0}
                        style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: price && holdAmt > 0 ? C.accentRed : C.border, color: '#fff', cursor: price && holdAmt > 0 ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 13 }}>
                        Зарах
                      </button>
                    </div>
                  </div>
                </div>

                {/* HOLDING INFO + P&L */}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: C.inkLight }}>
                  <span>Суудaл: <strong style={{ color: C.ink }}>{holdAmt > 0 ? holdAmt.toFixed(4) : '0'} {coin.label}</strong></span>
                  {holdAmt > 0 && avgPrice > 0 && (
                    <>
                      <span>Дундаж үнэ: <strong style={{ color: C.ink }}>${avgPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
                      <span style={{ color: pnl >= 0 ? C.accentGreen : C.accentRed, fontWeight: 700 }}>
                        {pnl >= 0 ? '▲' : '▼'} ${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({((pnl / (avgPrice * holdAmt || 1)) * 100).toFixed(1)}%)
                      </span>
                    </>
                  )}
                  {!price && <span style={{ color: C.accentYellow }}>Үнэ ачааллаж байна...</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PORTFOLIO TABLE */}
      {portfolio.length > 0 && (
        <div style={{ background: C.card, borderRadius: 12, padding: '16px 20', border: `1px solid ${C.border}`, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>📊 Миний портфолио</h3>
          <div style={{ overflowX: 'auto', fontSize: 14 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.inkLight, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Койн</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px' }}>Суудaл</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px' }}>Дундаж үнэ</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px' }}>Одоогийн үнэ</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px' }}>Үнэлгээ</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px' }}>P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map(p => {
                  const coin = COINS.find(c => c.id === p.coin);
                  const price = mktMap[p.coin]?.current_price || 0;
                  const value = price * p.amount;
                  const cost = p.avg_buy_price * p.amount;
                  const pnl = value - cost;
                  const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                  return (
                    <tr key={p.coin} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 6px', fontWeight: 700 }}>{coin?.icon} {coin?.label || p.coin}</td>
                      <td style={{ padding: '10px 6px', textAlign: 'right' }}>{p.amount.toFixed(4)}</td>
                      <td style={{ padding: '10px 6px', textAlign: 'right' }}>${p.avg_buy_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '10px 6px', textAlign: 'right' }}>${price.toLocaleString('en-US')}</td>
                      <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 600 }}>${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '10px 6px', textAlign: 'right', color: pnl >= 0 ? C.accentGreen : C.accentRed, fontWeight: 700 }}>
                        {pnl >= 0 ? '▲' : '▼'} ${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({pnlPct.toFixed(1)}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRADE HISTORY MODAL */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={() => setShowHistory(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bg, borderRadius: 16, border: `1px solid ${C.border}`, width: '100%', maxWidth: 700, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20', borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>📋 Арилжааны түүх</h3>
              <button onClick={() => setShowHistory(false)}
                style={{ background: 'none', border: 'none', color: C.inkLight, cursor: 'pointer', fontSize: 20, fontWeight: 700, padding: '4px 8px' }}>
                ✕
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: 16 }}>
              {trades.length === 0 ? (
                <p style={{ color: C.inkLight, textAlign: 'center', padding: 20 }}>Арилжаа хийгээгүй байна</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.inkLight, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ textAlign: 'left', padding: '6px 4px' }}>Цаг</th>
                      <th style={{ textAlign: 'left', padding: '6px 4px' }}>Койн</th>
                      <th style={{ textAlign: 'left', padding: '6px 4px' }}>Төрөл</th>
                      <th style={{ textAlign: 'right', padding: '6px 4px' }}>Тоо</th>
                      <th style={{ textAlign: 'right', padding: '6px 4px' }}>Үнэ</th>
                      <th style={{ textAlign: 'right', padding: '6px 4px' }}>Нийт</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map(t => (
                      <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 4px', color: C.inkLight, whiteSpace: 'nowrap' }}>
                          {new Date(t.created_at).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '8px 4px', fontWeight: 600 }}>{COINS.find(c => c.id === t.coin)?.label || t.coin}</td>
                        <td style={{ padding: '8px 4px', color: t.type === 'buy' ? C.accentGreen : C.accentRed, fontWeight: 700 }}>
                          {t.type === 'buy' ? 'АВСАН' : 'ЗАРСАН'}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'right' }}>{Number(t.amount).toFixed(4)}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right' }}>${Number(t.price).toLocaleString('en-US')}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600 }}>${Number(t.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DISCLAIMER */}
      <div style={{ background: '#1c1917', border: '1px solid #78350f', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#fbbf24', fontWeight: 600, marginTop: 32 }}>
        ⚠️ Энэ бол зөвхөн сургалтын зориулалттай демо систем бөгөөд бодит мөнгө оролцоогүй.
      </div>
    </main>
  );
}
