'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
export const dynamic = 'force-dynamic';
import { supabase } from '../../lib/supabase';

// ── TYPES ──
interface CoinCfg { id: string; label: string; name: string; symbol: string; }
interface Position {
  id: string; coin: string; side: 'buy' | 'sell'; amount: number;
  entry_price: number; sl: number | null; tp: number | null;
  status: string; open_time: string; close_time?: string; exit_price?: number; pnl?: number;
}
interface TradeHist { id: string; coin: string; side: string; amount: number; entry_price: number; exit_price: number; pnl: number; open_time: string; close_time: string; }
interface TradeRec { id: string; coin: string; type: string; amount: number; price: number; total: number; created_at: string; }

const COINS: CoinCfg[] = [
  { id: 'bitcoin', label: 'BTC', name: 'Bitcoin', symbol: 'BINANCE:BTCUSDT' },
  { id: 'ethereum', label: 'ETH', name: 'Ethereum', symbol: 'BINANCE:ETHUSDT' },
  { id: 'solana', label: 'SOL', name: 'Solana', symbol: 'BINANCE:SOLUSDT' },
  { id: 'cardano', label: 'ADA', name: 'Cardano', symbol: 'BINANCE:ADAUSDT' },
  { id: 'avalanche-2', label: 'AVAX', name: 'Avalanche', symbol: 'BINANCE:AVAXUSDT' },
  { id: 'polkadot', label: 'DOT', name: 'Polkadot', symbol: 'BINANCE:DOTUSDT' },
  { id: 'dogecoin', label: 'DOGE', name: 'Dogecoin', symbol: 'BINANCE:DOGEUSDT' },
  { id: 'matic-network', label: 'MATIC', name: 'Polygon', symbol: 'BINANCE:MATICUSDT' },
  { id: 'chainlink', label: 'LINK', name: 'Chainlink', symbol: 'BINANCE:LINKUSDT' },
  { id: 'litecoin', label: 'LTC', name: 'Litecoin', symbol: 'BINANCE:LTCUSDT' },
];

// ── TRADINGVIEW WIDGET ──
let tvWidget: any = null;

function useTVWidget(containerId: string, symbol: string) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!symbol || !containerId) return;

    const loadWidget = () => {
      if (!(window as any).TradingView) return;
      if (tvWidget) { try { tvWidget.remove(); } catch {} tvWidget = null; }

      tvWidget = new (window as any).TradingView.widget({
        container_id: containerId,
        symbol,
        interval: '60',
        timezone: 'Asia/Ulaanbaatar',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#0f172a',
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        details: false,
        hotlist: false,
        calendar: false,
        show_popup_button: false,
        width: '100%',
        height: '100%',
        studies: ['ROC@tv-basicstudies'],
        overrides: {
          'paneProperties.background': '#0f172a',
          'paneProperties.vertGridProperties.color': '#1e293b',
          'paneProperties.horzGridProperties.color': '#1e293b',
          'mainSeriesProperties.candleStyle.upColor': '#22c55e',
          'mainSeriesProperties.candleStyle.downColor': '#ef4444',
          'mainSeriesProperties.candleStyle.wickUpColor': '#22c55e',
          'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
        },
        disabled_features: ['use_localstorage_for_settings', 'header_symbol_search', 'symbol_search_hot_key'],
      });
    };

    if (!(window as any).TradingView) {
      const s = document.createElement('script');
      s.src = 'https://s3.tradingview.com/tv.js';
      s.async = true;
      s.onload = loadWidget;
      document.head.appendChild(s);
    } else {
      loadWidget();
    }

    return () => { if (tvWidget) { try { tvWidget.remove(); } catch {} tvWidget = null; } };
  }, [symbol, containerId]);
}

// ── UI HELPERS ──
const cx = (...cls: (string | false | undefined | null)[]) => cls.filter(Boolean).join(' ');

// ── MAIN ──
export default function DemoTradePage() {
  const [userId, setUserId] = useState('');
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<TradeHist[]>([]);
  const [trades, setTrades] = useState<TradeRec[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [qty, setQty] = useState(0.01);
  const [useTp, setUseTp] = useState(false);
  const [useSl, setUseSl] = useState(false);
  const [tpVal, setTpVal] = useState('');
  const [slVal, setSlVal] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  const flash = useCallback((text: string) => { setMsg(text); setTimeout(() => setMsg(null), 3000); }, []);

  const chartContainerId = 'tv_chart';

  useTVWidget(chartContainerId, COINS.find(c => c.id === selectedCoin)?.symbol || 'BINANCE:BTCUSDT');

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
      const { data: pos } = await supabase.from('demo_positions').select('*').eq('user_id', id).eq('status', 'open');
      if (pos) setPositions(pos.map((p: any) => ({ ...p, amount: Number(p.amount), entry_price: Number(p.entry_price), sl: p.sl ? Number(p.sl) : null, tp: p.tp ? Number(p.tp) : null })));
      const { data: hist } = await supabase.from('demo_positions').select('*').eq('user_id', id).eq('status', 'closed').order('close_time', { ascending: false }).limit(50);
      if (hist) setHistory(hist.map((p: any) => ({ ...p, amount: Number(p.amount), entry_price: Number(p.entry_price), exit_price: Number(p.exit_price || 0), pnl: Number(p.pnl || 0) })));
      const { data: tr } = await supabase.from('demo_trade_history').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(50);
      if (tr) setTrades(tr.map((t: any) => ({ ...t, amount: Number(t.amount), price: Number(t.price), total: Number(t.total) })));
      setLoading(false);
    })();
  }, []);

  // fetch prices every 10s
  useEffect(() => {
    const ids = COINS.map(c => c.id).join(',');
    async function fetchPrices() {
      try {
        const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        if (!r.ok) return;
        const d = await r.json();
        const map: Record<string, number> = {};
        COINS.forEach(c => { if (d[c.id]?.usd) map[c.id] = d[c.id].usd; });
        setPrices(map);
      } catch {}
    }
    fetchPrices();
    const iv = setInterval(fetchPrices, 10000);
    return () => clearInterval(iv);
  }, []);

  // check TP/SL
  useEffect(() => {
    if (!positions.length) return;
    let changed = false;
    const toClose: Position[] = [];

    const newPositions = positions.filter(pos => {
      const cp = prices[pos.coin];
      if (!cp) return true;
      if (pos.side === 'buy') {
        if (pos.tp && cp >= pos.tp) { toClose.push({ ...pos, exit_price: cp }); changed = true; return false; }
        if (pos.sl && cp <= pos.sl) { toClose.push({ ...pos, exit_price: cp }); changed = true; return false; }
      } else {
        if (pos.tp && cp <= pos.tp) { toClose.push({ ...pos, exit_price: cp }); changed = true; return false; }
        if (pos.sl && cp >= pos.sl) { toClose.push({ ...pos, exit_price: cp }); changed = true; return false; }
      }
      return true;
    });

    if (changed) {
      setPositions(newPositions);
      toClose.forEach(pos => closePositionLogic(pos, pos.exit_price || 0));
    }
  }, [prices, positions.length]);

  const closePositionLogic = useCallback(async (pos: Position, exitPrice: number) => {
    const pnl = pos.side === 'buy'
      ? (exitPrice - pos.entry_price) * pos.amount
      : (pos.entry_price - exitPrice) * pos.amount;
    const newBalance = balance + pnl;
    setBalance(newBalance);
    if (supabase) {
      await supabase.from('profiles').upsert({ user_id: userId, virtual_balance: newBalance });
      await supabase.from('demo_positions').update({ status: 'closed', close_time: new Date().toISOString(), exit_price: exitPrice, pnl }).eq('id', pos.id);
      await supabase.from('demo_trade_history').insert({ user_id: userId, coin: pos.coin, type: pos.side === 'buy' ? 'sell' : 'buy', amount: pos.amount, price: exitPrice, total: exitPrice * pos.amount });
    }
    setHistory(prev => [{ ...pos, exit_price: exitPrice, pnl, close_time: new Date().toISOString(), status: 'closed' } as any, ...prev]);
    flash(`${pos.coin.toUpperCase()} ${pos.side === 'buy' ? 'Long' : 'Short'} хаагдлаа. P&L: $${pnl.toFixed(2)}`);
  }, [userId, balance, flash]);

  const openPosition = useCallback(async () => {
    if (!userId) return;
    const cp = prices[selectedCoin];
    if (!cp) { flash('Үнэ олдсонгүй'); return; }
    if (qty <= 0) { flash('Тоо хэмжээг оруулна уу'); return; }

    const margin = cp * qty;
    const totalUpnl = positions.reduce((sum, pos) => {
      const p = prices[pos.coin] || 0;
      return sum + (pos.side === 'buy' ? (p - pos.entry_price) : (pos.entry_price - p)) * pos.amount;
    }, 0);
    const equity = balance + totalUpnl;
    if (margin > equity * 0.5) { flash('Хангалттай чөлөөт маржин байхгүй'); return; }

    const tp = useTp && tpVal ? parseFloat(tpVal) : null;
    const sl = useSl && slVal ? parseFloat(slVal) : null;
    if (tp && tp <= cp) { flash('TP нь одоогийн үнээс дээш байх ёстой (Long)'); return; }
    if (sl && sl >= cp) { flash('SL нь одоогийн үнээс доош байх ёстой (Long)'); return; }

    const pos: Position = {
      id: Math.random().toString(36).slice(2),
      coin: selectedCoin,
      side,
      amount: qty,
      entry_price: cp,
      tp,
      sl,
      status: 'open',
      open_time: new Date().toISOString(),
    };

    setPositions(prev => [...prev, pos]);
    if (supabase) {
      await supabase.from('demo_positions').insert({
        user_id: userId, coin: pos.coin, side: pos.side, amount: pos.amount,
        entry_price: pos.entry_price, sl: pos.sl, tp: pos.tp,
      });
    }
    flash(`${qty} ${COINS.find(c => c.id === selectedCoin)?.label} ${side === 'buy' ? 'Long' : 'Short'} нээгдлээ @ $${cp.toFixed(2)}`);
  }, [userId, selectedCoin, side, qty, tpVal, slVal, useTp, useSl, prices, balance, positions, flash]);

  const closePosition = useCallback((pos: Position) => {
    const cp = prices[pos.coin] || pos.entry_price;
    closePositionLogic(pos, cp);
  }, [closePositionLogic, prices]);

  const selectedPrice = prices[selectedCoin] || 0;
  const totalUpnl = positions.reduce((sum, pos) => {
    const cp = prices[pos.coin] || 0;
    return sum + (pos.side === 'buy' ? (cp - pos.entry_price) : (pos.entry_price - cp)) * pos.amount;
  }, 0);
  const equity = balance + totalUpnl;
  const usedMargin = positions.reduce((sum, pos) => sum + pos.entry_price * pos.amount, 0);
  const freeMargin = equity - usedMargin;
  const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 0;

  const filteredCoins = COINS.filter(c =>
    c.label.toLowerCase().includes(searchQ.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased select-none">
      {/* ── TOP BAR: Account Info ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <a href="/" className="text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">← Буцах</a>
            <h1 className="text-lg font-bold tracking-tight">Demo Trading</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <div className="bg-slate-800 rounded px-3 py-1.5">
              <span className="text-slate-500 mr-1">Balance</span>
              <span className="font-bold text-slate-100">${balance.toFixed(2)}</span>
            </div>
            <div className="bg-slate-800 rounded px-3 py-1.5">
              <span className="text-slate-500 mr-1">Equity</span>
              <span className={`font-bold ${equity >= balance ? 'text-green-400' : 'text-red-400'}`}>${equity.toFixed(2)}</span>
            </div>
            <div className="bg-slate-800 rounded px-3 py-1.5">
              <span className="text-slate-500 mr-1">Unrealized P/L</span>
              <span className={`font-bold ${totalUpnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalUpnl >= 0 ? '+' : ''}${totalUpnl.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-800 rounded px-3 py-1.5">
              <span className="text-slate-500 mr-1">Used Margin</span>
              <span className="font-bold text-amber-400">${usedMargin.toFixed(2)}</span>
            </div>
            <div className="bg-slate-800 rounded px-3 py-1.5">
              <span className="text-slate-500 mr-1">Free Margin</span>
              <span className={`font-bold ${freeMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>${freeMargin.toFixed(2)}</span>
            </div>
            <div className="bg-slate-800 rounded px-3 py-1.5">
              <span className="text-slate-500 mr-1">Margin Level</span>
              <span className={`font-bold ${marginLevel > 100 ? 'text-green-400' : marginLevel > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {marginLevel.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FLASH ── */}
      {msg && (
        <div className="max-w-[1600px] mx-auto px-4 pt-3">
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-200 shadow-lg">
            {msg}
          </div>
        </div>
      )}

      {/* ── MAIN 3-COL LAYOUT ── */}
      <div className="max-w-[1600px] mx-auto px-4 pt-3 pb-6">
        <div className="flex gap-3" style={{ minHeight: 'calc(100vh - 220px)' }}>
          {/* ── LEFT: WATCHLIST ── */}
          <div className="w-[220px] shrink-0 bg-slate-900 rounded-lg border border-slate-800 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-slate-800">
              <input
                value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Хайх..."
                className="w-full bg-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 border border-slate-700 outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredCoins.map(coin => {
                const price = prices[coin.id];
                const active = coin.id === selectedCoin;
                return (
                  <button key={coin.id} onClick={() => setSelectedCoin(coin.id)}
                    className={cx(
                      'w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors border-b border-slate-800/50',
                      active ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'hover:bg-slate-800/50'
                    )}>
                    <div>
                      <span className="text-sm font-semibold">{coin.label}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">/USDT</span>
                    </div>
                    <div className="text-right">
                      {price ? (
                        <span className="text-xs font-medium">${price.toLocaleString('en-US')}</span>
                      ) : (
                        <span className="text-[10px] text-slate-600">... </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── CENTER: CHART ── */}
          <div className="flex-1 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden relative min-h-[600px]">
            <div id={chartContainerId} className="absolute inset-0" />
          </div>

          {/* ── RIGHT: ORDER PANEL ── */}
          <div className="w-[280px] shrink-0 bg-slate-900 rounded-lg border border-slate-800 flex flex-col overflow-hidden">
            {/* Price */}
            <div className="px-4 pt-4 pb-2 border-b border-slate-800">
              <div className="text-2xl font-bold tracking-tight">
                ${selectedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {COINS.find(c => c.id === selectedCoin)?.label}/USDT · 1 USDT
              </div>
            </div>

            {/* Side toggle */}
            <div className="grid grid-cols-2 gap-1.5 px-4 pt-3">
              <button onClick={() => setSide('buy')}
                className={cx(
                  'py-2.5 rounded-lg text-sm font-bold transition-all',
                  side === 'buy' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                )}>
                Long
              </button>
              <button onClick={() => setSide('sell')}
                className={cx(
                  'py-2.5 rounded-lg text-sm font-bold transition-all',
                  side === 'sell' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                )}>
                Short
              </button>
            </div>

            {/* Quantity */}
            <div className="px-4 pt-3">
              <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Лот (Quantity)</label>
              <div className="flex mt-1.5">
                <input type="number" min={0.001} step={0.001} value={qty}
                  onChange={e => setQty(Math.max(0.001, parseFloat(e.target.value) || 0.001))}
                  className="flex-1 bg-slate-800 text-slate-200 text-sm rounded-l-lg px-3 py-2 border border-slate-700 outline-none focus:border-blue-500" />
                <div className="bg-slate-700 text-slate-400 text-xs font-medium px-2.5 flex items-center rounded-r-lg">LOT</div>
              </div>
              <div className="flex gap-1 mt-1.5">
                {[0.01, 0.05, 0.1, 0.5, 1].map(v => (
                  <button key={v} onClick={() => setQty(v)}
                    className={cx(
                      'flex-1 py-1 text-xs rounded font-medium transition-colors',
                      qty === v ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    )}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* TP / SL */}
            <div className="px-4 pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="tp" checked={useTp} onChange={e => setUseTp(e.target.checked)}
                  className="accent-blue-500 w-3.5 h-3.5" />
                <label htmlFor="tp" className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Take Profit</label>
              </div>
              {useTp && (
                <input type="number" step={0.01} value={tpVal} onChange={e => setTpVal(e.target.value)}
                  placeholder="0.00" className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 border border-slate-700 outline-none focus:border-green-500 placeholder-slate-600" />
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="sl" checked={useSl} onChange={e => setUseSl(e.target.checked)}
                  className="accent-red-500 w-3.5 h-3.5" />
                <label htmlFor="sl" className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Stop Loss</label>
              </div>
              {useSl && (
                <input type="number" step={0.01} value={slVal} onChange={e => setSlVal(e.target.value)}
                  placeholder="0.00" className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 border border-slate-700 outline-none focus:border-red-500 placeholder-slate-600" />
              )}
            </div>

            {/* Margin info */}
            <div className="px-4 pt-3 pb-2 border-t border-slate-800 mt-auto">
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Маржин</span><span className="text-slate-300">${(selectedPrice * qty).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Чөлөөт маржин</span><span className={freeMargin >= 0 ? 'text-green-400' : 'text-red-400'}>${freeMargin.toFixed(2)}</span></div>
              </div>
            </div>

            {/* Submit */}
            <div className="px-4 pb-4 pt-2">
              <button onClick={openPosition}
                className={cx(
                  'w-full py-3 rounded-lg text-sm font-bold transition-all shadow-lg',
                  side === 'buy'
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                )}>
                {side === 'buy' ? '📈 Long / Худалдаж авах' : '📉 Short / Зарах'}
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: POSITIONS & HISTORY ── */}
        <div className="mt-3 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
          <div className="flex border-b border-slate-800">
            <button onClick={() => setActiveTab('positions')}
              className={cx('px-5 py-3 text-sm font-semibold transition-colors',
                activeTab === 'positions' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300')}>
              Нээлттэй арилжаа ({positions.length})
            </button>
            <button onClick={() => setActiveTab('history')}
              className={cx('px-5 py-3 text-sm font-semibold transition-colors',
                activeTab === 'history' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300')}>
              Хаагдсан арилжаа ({history.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'positions' ? (
              positions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">Нээлттэй арилжаа байхгүй</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-800">
                      <th className="text-left px-4 py-3 font-medium">Койн</th>
                      <th className="text-left px-4 py-3 font-medium">Side</th>
                      <th className="text-right px-4 py-3 font-medium">Лот</th>
                      <th className="text-right px-4 py-3 font-medium">Entry Price</th>
                      <th className="text-right px-4 py-3 font-medium">Current Price</th>
                      <th className="text-right px-4 py-3 font-medium">Unrealized P/L</th>
                      <th className="text-right px-4 py-3 font-medium">TP / SL</th>
                      <th className="text-right px-4 py-3 font-medium">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map(pos => {
                      const cp = prices[pos.coin] || 0;
                      const pnl = pos.side === 'buy' ? (cp - pos.entry_price) * pos.amount : (pos.entry_price - cp) * pos.amount;
                      return (
                        <tr key={pos.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-semibold">{COINS.find(c => c.id === pos.coin)?.label || pos.coin}</td>
                          <td className="px-4 py-3">
                            <span className={cx('px-2 py-0.5 rounded text-xs font-bold', pos.side === 'buy' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400')}>
                              {pos.side === 'buy' ? 'Long' : 'Short'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">{pos.amount.toFixed(3)}</td>
                          <td className="px-4 py-3 text-right font-mono">${pos.entry_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 text-right font-mono">${cp ? cp.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '...'}</td>
                          <td className={cx('px-4 py-3 text-right font-bold font-mono', pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-xs">
                            {pos.tp ? <span className="text-green-500">TP ${pos.tp.toFixed(2)}</span> : <span className="text-slate-600">—</span>}
                            {' / '}
                            {pos.sl ? <span className="text-red-500">SL ${pos.sl.toFixed(2)}</span> : <span className="text-slate-600">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => closePosition(pos)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                              Хаах
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            ) : (
              history.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">Хаагдсан арилжаа байхгүй</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-800">
                      <th className="text-left px-4 py-3 font-medium">Койн</th>
                      <th className="text-left px-4 py-3 font-medium">Side</th>
                      <th className="text-right px-4 py-3 font-medium">Лот</th>
                      <th className="text-right px-4 py-3 font-medium">Entry</th>
                      <th className="text-right px-4 py-3 font-medium">Exit</th>
                      <th className="text-right px-4 py-3 font-medium">P&L</th>
                      <th className="text-right px-4 py-3 font-medium">Хаагдсан</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-semibold">{COINS.find(c => c.id === h.coin)?.label || h.coin}</td>
                        <td className="px-4 py-3">
                          <span className={cx('px-2 py-0.5 rounded text-xs font-bold', h.side === 'buy' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400')}>
                            {h.side === 'buy' ? 'Long' : 'Short'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">{h.amount.toFixed(3)}</td>
                        <td className="px-4 py-3 text-right font-mono">${h.entry_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right font-mono">${(h.exit_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className={cx('px-4 py-3 text-right font-bold font-mono', (h.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400')}>
                          {(h.pnl || 0) >= 0 ? '+' : ''}${(h.pnl || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500">
                          {h.close_time ? new Date(h.close_time).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <p className="text-xs text-amber-600/80 font-medium">⚠️ Энэ бол зөвхөн сургалтын зориулалттай демо систем бөгөөд бодит мөнгө оролцоогүй.</p>
        </div>
      </div>
    </div>
  );
}
