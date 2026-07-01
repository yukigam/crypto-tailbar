'use client';

import { useEffect, useState, useCallback } from 'react';
export const dynamic = 'force-dynamic';
import { supabase } from '../../lib/supabase';

const COINS = ['bitcoin', 'ethereum', 'solana'];
const COIN_LABELS = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL' };

async function ensureProfile(userId: string) {
  if (!supabase) return 10000;
  const { data } = await supabase
    .from('profiles')
    .select('virtual_balance')
    .eq('user_id', userId)
    .single();
  if (data) return data.virtual_balance;

  await supabase.rpc('ensure_user_profile', { p_user_id: userId });
  return 10000;
}

async function getPortfolio(userId: string) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('demo_portfolio')
    .select('coin, amount')
    .eq('user_id', userId);
  return data || [];
}

export default function DemoTradePage() {
  const [userId, setUserId] = useState<string>('');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [balance, setBalance] = useState(0);
  const [portfolio, setPortfolio] = useState<{ coin: string; amount: number }[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let id = localStorage.getItem('demo_user_id');
    if (!id) {
      id = 'demo_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('demo_user_id', id);
    }
    setUserId(id);

    async function init() {
      const bal = await ensureProfile(id!);
      setBalance(bal);
      const p = await getPortfolio(id!);
      setPortfolio(p);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const r = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd',
        );
        const d = await r.json();
        if (d.bitcoin?.usd) setPrices({ bitcoin: d.bitcoin.usd, ethereum: d.ethereum.usd, solana: d.solana.usd });
      } catch {
        // retry
      }
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const updatePortfolio = useCallback(
    async (coin: string, price: number, isBuy: boolean) => {
      if (!userId || !supabase) return;
      const cost = 1 * price;
      if (isBuy && balance < cost) {
        setMessage('Хангалттай демо мөнгө байхгүй!');
        return;
      }

      const newBalance = isBuy ? balance - cost : balance + cost;
      setBalance(newBalance);
      await supabase.from('profiles').upsert({ user_id: userId, virtual_balance: newBalance });

      const existing = portfolio.find((p) => p.coin === coin);
      const newAmount = isBuy ? (existing?.amount || 0) + 1 : Math.max(0, (existing?.amount || 0) - 1);
      await supabase.from('demo_portfolio').upsert(
        { user_id: userId, coin, amount: newAmount },
        { onConflict: 'user_id, coin' },
      );

      setPortfolio((prev) => {
        const filtered = prev.filter((p) => p.coin !== coin);
        return newAmount > 0 ? [...filtered, { coin, amount: newAmount }] : filtered;
      });

      setMessage(isBuy ? `1 ${COIN_LABELS[coin as keyof typeof COIN_LABELS]} амжилттай худалдаж авлаа!` : `1 ${COIN_LABELS[coin as keyof typeof COIN_LABELS]} амжилттай зарлаа!`);
      setTimeout(() => setMessage(''), 3000);
    },
    [userId, balance, portfolio],
  );

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Crypto Demo Trading</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Хуурамч мөнгөөр крипто арилжаа туршиж үзэх</p>

      {message && (
        <div style={{ padding: '10px 16px', background: '#e8f5e9', borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {loading ? (
        <p>Ачааллаж байна...</p>
      ) : (
        <>
          <div style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 4px' }}>Демо баланс</p>
            <p style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>
              ${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            {COINS.map((coin) => {
              const price = prices[coin] || 0;
              const holding = portfolio.find((p) => p.coin === coin);
              const label = COIN_LABELS[coin as keyof typeof COIN_LABELS];
              return (
                <div key={coin} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 700 }}>{label}</span>
                      <span style={{ fontSize: 14, color: '#666', marginLeft: 8, textTransform: 'capitalize' }}>{coin}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 22, fontWeight: 700 }}>${price.toLocaleString('en-US')}</span>
                      <span style={{ fontSize: 13, color: '#666', display: 'block' }}>USDT</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                    Таны баланс: {holding ? holding.amount : 0} {label}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => updatePortfolio(coin, price, true)}
                      disabled={!price}
                      style={{
                        flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, fontWeight: 700, cursor: price ? 'pointer' : 'not-allowed',
                        background: '#22c55e', color: '#fff', fontSize: 15,
                      }}
                    >
                      Худалдаж авах
                    </button>
                    <button
                      onClick={() => updatePortfolio(coin, price, false)}
                      disabled={!price || !holding || holding.amount <= 0}
                      style={{
                        flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, fontWeight: 700, cursor: price && holding && holding.amount > 0 ? 'pointer' : 'not-allowed',
                        background: '#ef4444', color: '#fff', fontSize: 15,
                      }}
                    >
                      Зарах
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {portfolio.length > 0 && (
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Миний портфолио</h3>
              {portfolio.map((p) => {
                const label = COIN_LABELS[p.coin as keyof typeof COIN_LABELS];
                const value = (prices[p.coin] || 0) * p.amount;
                return (
                  <div key={p.coin} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: 600 }}>{label}</span>
                    <span>{p.amount} — ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700 }}>
                <span>Нийт үнэлгээ</span>
                <span>
                  ${(portfolio.reduce((sum, p) => sum + (prices[p.coin] || 0) * p.amount, 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span style={{ fontWeight: 400, color: '#666', fontSize: 13, marginLeft: 4 }}>
                    + ${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} (бэлэн)
                  </span>
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#856404', marginTop: 32 }}>
        Энэ бол зөвхөн сургалтын зориулалттай демо систем бөгөөд бодит мөнгө оролцоогүй.
      </div>
    </main>
  );
}
