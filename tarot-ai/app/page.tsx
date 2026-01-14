import TarotDemoPage from './tarot/page';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-english typing">Welcome To Tarot AI</div>
          <h1>欢迎来到 Tarot AI</h1>
          <p className="hero-sub">
            <span>在这里，你可以抽取塔罗卡片，聆听内心的回响。</span>
            <br />
            <span className="hero-sub-en">Here you can draw tarot cards and listen to the echoes of your heart.</span>
          </p>
          <a href="#tarot" className="scroll-down" aria-label="向下滚动查看塔罗牌">↓</a>
        </div>
      </section>

      <section id="tarot">
        <TarotDemoPage />
      </section>
    </main>
  );
}
