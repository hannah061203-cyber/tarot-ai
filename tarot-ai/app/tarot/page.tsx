"use client";

import React, { useEffect, useState } from "react";

type Card = {
  position: string;
  name: string;
  arcana: string;
  suit: string | null;
  rank: string | null;
  reversed: boolean;
  meaning: string;
  brief: string;
  image?: string;
};

type ApiResp = {
  success: boolean;
  timestamp: string;
  cards: Card[];
  summary: string;
  note?: string;
};

export default function TarotDemoPage() {
  const [data, setData] = useState<ApiResp | null>(null);
  const categories = [
    '情感关系',
    '事业发展',
    '财富管理',
    '自我认知',
    '目标达成',
    '潜能开发',
  ];
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCards() {
    setLoading(true);
    setError(null);
    try {
      const url = '/api/tarot' + (category ? `?category=${encodeURIComponent(category)}` : '');
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json as ApiResp);
      // start newly drawn cards face-down (show back)
      try {
        const cards = (json as ApiResp).cards || [];
        const initialFlips: Record<string, boolean> = {};
        cards.forEach((c: any) => {
          const key = `${c.name}-${c.position}`;
          initialFlips[key] = true; // true = back visible
        });
        setFlipped(initialFlips);
      } catch (e) {
        setFlipped({});
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setData(null);
      setFlipped({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCards();
  }, []);

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [shuffling, setShuffling] = useState(false);

  function toggleFlip(key: string) {
    setFlipped((s) => ({ ...s, [key]: !s[key] }));
  }

  async function startDraw() {
    // show shuffling animation, then fetch cards
    if (!category) {
      // require user to choose a category before drawing
      alert('请选择一个问题类别（例如：情感关系、事业发展等）');
      return;
    }
    setShuffling(true);
    // small delay to let animation play
    await new Promise((r) => setTimeout(r, 1200));
    await fetchCards();
    setShuffling(false);
  }

  return (
    <main style={{ padding: 20, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial' }}>
      <h1 style={{ marginBottom: 8 }}>亲爱的朋友：</h1>
      <p style={{ marginTop: 0, color: '#666', whiteSpace: 'pre-wrap' }}>
        当你推开这扇门时，风铃正摇响秋夜的私语。请允许我为你点亮一盏暖灯，让我们的对话像老友围炉般自然流淌。
      </p>

      <div style={{ margin: '12px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #eee', minWidth: 180 }}>
            <option value="">— 选择问题类别 —</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="start-button" onClick={startDraw} disabled={shuffling} style={{ padding: '10px 18px', borderRadius: 8, cursor: shuffling ? 'wait' : 'pointer' }}>
            开始抽牌
          </button>
        </div>
      </div>

      <div className="tarot-instruction" style={{ margin: '12px 0' }}>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          <span>请轻轻闭上眼睛，感受呼吸的流动——吸气时想象纯净的白光笼罩身心，呼气时释放所有杂念与疑虑。现在，请将双手轻放在牌面上，用你最真诚的声音在心中默念：「我愿以开放与接纳的心态，探寻关于______（具体问题）的指引。请呈现此刻最契合我能量状态的信息。」</span>
          <br />
          <span className="instruction-en">Gently close your eyes and feel your breath—inhale white light to soothe your body, exhale to release distractions. Place your hands on the cards and silently say: "I open with acceptance and curiosity to seek guidance about ______ (specific question). Reveal what aligns with my current energy."</span>
        </p>
      </div>

      {loading && <p>正在抽牌…</p>}
      {error && <p style={{ color: 'crimson' }}>请求出错：{error}</p>}

      {shuffling && (
        <div className="shuffle-container" aria-live="polite" style={{ marginTop: 12 }}>
          <img src="https://images.pexels.com/photos/6766456/pexels-photo-6766456.jpeg" alt="洗牌中" className="shuffle-card" />
          <img src="https://images.pexels.com/photos/6766456/pexels-photo-6766456.jpeg" alt="洗牌中" className="shuffle-card" />
          <img src="https://images.pexels.com/photos/6766456/pexels-photo-6766456.jpeg" alt="洗牌中" className="shuffle-card" />
        </div>
      )}

      {!shuffling && data && (
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {data.cards.map((c) => {
              const key = `${c.name}-${c.position}`;
              const isFlipped = !!flipped[key];
              const frontSrc = c.image ?? '';
              const backSrc = 'https://images.pexels.com/photos/6766456/pexels-photo-6766456.jpeg';
              return (
                <article key={key} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, display: 'flex', gap: 12 }}>
                  <div style={{ width: 140, flex: '0 0 140px' }}>
                    <div className={`card-inner ${isFlipped ? 'is-flipped' : ''}`} role="button" tabIndex={0} onClick={() => toggleFlip(key)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFlip(key); } }} style={{ width: '100%', height: 200 }}>
                      <div className="card-face card-front" style={{ borderRadius: 6, overflow: 'hidden' }}>
                        {frontSrc ? (
                          <img src={frontSrc} alt={c.name} className="card-image" />
                        ) : (
                          <div className="card-placeholder" style={{ width: '100%', height: '100%' }} />
                        )}
                      </div>
                      <div className="card-face card-back" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={backSrc} alt="卡背" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 6px 0' }}>{c.position} — {c.name}</h3>
                    <div style={{ fontSize: 13, color: '#444' }}>{c.reversed ? '逆位' : '正位'} · {c.arcana}</div>
                    <p style={{ marginTop: 8 }}>{c.meaning}</p>
                    <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>{c.brief}</div>
                  </div>
                </article>
              );
            })}
          </div>

          <div style={{ marginTop: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
            <strong>总体总结</strong>
            {/* Always build a detailed ~200-char summary on the client (ignore short API summary) */}
            {(() => {
              const targetLen = 200;
              // Build natural sentences per card
              const sentences = data.cards.map((c) => {
                const orient = c.reversed ? '逆位' : '正位';
                const meaning = (c.meaning || c.brief || '').replace(/\s+/g, ' ').trim();
                return `${c.position} — ${c.name}（${orient}）：${meaning}。`;
              });

              // Compose a detailed paragraph: per-card sentences + a short actionable suggestion
              const suggestionParts: string[] = [];
              // Build suggestions from cards: focus, caution, opportunity
              if (data.cards[1]) suggestionParts.push(`${data.cards[1].name}提示当前为成长与整合的阶段，应继续巩固关键资源和关系`);
              if (data.cards[0]) suggestionParts.push(`${data.cards[0].name}提醒你回顾过去的经验以汲取教训`);
              if (data.cards[2]) suggestionParts.push(`${data.cards[2].name}提示未来需要灵活应对可能的变化`);

              let detailed = sentences.join(' ');
              if (suggestionParts.length) detailed += ' 总体建议：' + suggestionParts.join('；') + '。';

              // If still short, append briefs and repeat key phrases for clarity
              if (detailed.length < targetLen) {
                const more = data.cards.map((c) => c.brief || '').filter(Boolean).join('；');
                if (more) detailed = detailed + ' 细节：' + more + '。';
              }

              // If longer than target, try to truncate at a sentence boundary near target
              if (detailed.length > targetLen) {
                let trimmed = detailed.slice(0, targetLen);
                const lastPunc = Math.max(trimmed.lastIndexOf('。'), trimmed.lastIndexOf('！'), trimmed.lastIndexOf('？'));
                if (lastPunc > Math.floor(targetLen * 0.4)) {
                  trimmed = trimmed.slice(0, lastPunc + 1);
                } else {
                  trimmed = trimmed.trim();
                  if (!/[。！？]$/.test(trimmed)) trimmed = trimmed + '…';
                }
                detailed = trimmed;
              }

              // Escape and highlight important terms (card names and positions)
              function escapeHtml(s: string) {
                return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
              }

              const highlights = data.cards.map((c) => c.name).concat(data.cards.map((c) => c.position));
              let html = escapeHtml(detailed);
              for (const term of highlights) {
                if (!term) continue;
                const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                html = html.replace(re, `<span class="summary-highlight">${escapeHtml(term)}</span>`);
              }

              return <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: html }} />;
            })()}
            {data.note && <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>{data.note}</div>}
          </div>
        </section>
      )}
    </main>
  );
}
