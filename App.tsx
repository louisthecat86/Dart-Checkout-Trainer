
import React, { useState, useMemo } from 'react';
import { 
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  BackspaceIcon,
  ForwardIcon
} from '@heroicons/react/24/outline';

// Hochauflösende URL eines Winmau-Dartboards (Schwarz-Weiß Stil) für die Ästhetik
const backgroundImageUrl = "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop";

class CheckoutCalculator {
  static getValue(s: string): number {
    if (!s || s === '-') return 0;
    const cleanS = s.toUpperCase().trim();
    if (cleanS === 'BULL' || cleanS === 'D25') return 50;
    if (cleanS === '25' || cleanS === 'S25') return 25;
    if (cleanS.startsWith('T')) return (parseInt(cleanS.substring(1)) || 0) * 3;
    if (cleanS.startsWith('D')) return (parseInt(cleanS.substring(1)) || 0) * 2;
    if (cleanS.startsWith('S')) return parseInt(cleanS.substring(1)) || 0;
    return parseInt(cleanS) || 0;
  }

  static getPath(remaining: number, dartsLeft: number): string[] {
    if (remaining <= 0) return [];
    if (remaining > 170 || [169, 168, 166, 165, 163, 162, 159].includes(remaining)) {
      return dartsLeft > 0 ? ["Setup"] : [];
    }
    const table: Record<number, string[]> = {
      170: ["T20", "T20", "Bull"], 167: ["T20", "T19", "Bull"], 164: ["T20", "T18", "Bull"],
      161: ["T20", "T17", "Bull"], 160: ["T20", "T20", "D20"], 158: ["T20", "T20", "D19"],
      121: ["T20", "25", "D18"], 100: ["T20", "D20"], 90: ["T18", "D18"], 80: ["T20", "D10"],
      60: ["S20", "D20"], 50: ["Bull"], 40: ["D20"], 32: ["D16"], 16: ["D8"]
    };
    if (table[remaining]) return table[remaining].slice(0, dartsLeft);
    const result: string[] = [];
    let temp = remaining;
    for (let i = 0; i < dartsLeft; i++) {
      if (temp <= 0) break;
      if (temp <= 40 && temp % 2 === 0) { result.push(`D${temp / 2}`); temp = 0; }
      else if (temp === 50) { result.push(`Bull`); temp = 0; }
      else if (temp > 60) { result.push(`T20`); temp -= 60; }
      else if (temp > 40) {
        const setup = temp - 40;
        result.push(setup <= 20 ? `S${setup}` : `S20`);
        temp -= (setup <= 20 ? setup : 20);
      } else { result.push(`S${temp}`); temp = 0; }
    }
    return result;
  }
}

const InteractiveDartboard = ({ onSelect, target }: { onSelect: (val: string) => void, target: string }) => {
  const segments = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  const cleanTarget = target.toUpperCase();
  const isTarget = (type: string, num: number) => {
    const t = type + num;
    return t === cleanTarget || (type === 'S' && num.toString() === cleanTarget);
  };
  const getSegmentPath = (r1: number, r2: number, angle: number, nextAngle: number) => {
    const x1 = 50 + r1 * Math.cos(angle);
    const y1 = 50 + r1 * Math.sin(angle);
    const x2 = 50 + r2 * Math.cos(angle);
    const y2 = 50 + r2 * Math.sin(angle);
    const x3 = 50 + r2 * Math.cos(nextAngle);
    const y3 = 50 + r2 * Math.sin(nextAngle);
    const x4 = 50 + r1 * Math.cos(nextAngle);
    const y4 = 50 + r1 * Math.sin(nextAngle);
    return `M ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${r1} ${r1} 0 0 0 ${x1} ${y1} Z`;
  };

  return (
    <div className="w-full aspect-square max-w-[340px] mx-auto relative mt-4">
      <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-9deg] drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <circle cx="50" cy="50" r="49" fill="#000" />
        {segments.map((num, i) => {
          const angle = (i * 18 - 90) * (Math.PI / 180);
          const nextAngle = ((i + 1) * 18 - 90) * (Math.PI / 180);
          const isBlack = i % 2 !== 0;
          return (
            <g key={num} className="cursor-pointer">
              <path d={getSegmentPath(40, 44, angle, nextAngle)} fill={isTarget('D', num) ? "#FFD700" : (isBlack ? "#15803d" : "#b91c1c")} className={isTarget('D', num) ? "animate-pulse" : "hover:opacity-80"} filter={isTarget('D', num) ? "url(#glow)" : ""} onClick={() => onSelect(`D${num}`)} />
              <path d={getSegmentPath(27, 40, angle, nextAngle)} fill={isTarget('S', num) ? "#FFD700" : (isBlack ? "#eee" : "#111")} className={isTarget('S', num) ? "animate-pulse" : "hover:opacity-80"} filter={isTarget('S', num) ? "url(#glow)" : ""} onClick={() => onSelect(`S${num}`)} />
              <path d={getSegmentPath(24, 27, angle, nextAngle)} fill={isTarget('T', num) ? "#FFD700" : (isBlack ? "#15803d" : "#b91c1c")} className={isTarget('T', num) ? "animate-pulse" : "hover:opacity-80"} filter={isTarget('T', num) ? "url(#glow)" : ""} onClick={() => onSelect(`T${num}`)} />
              <path d={getSegmentPath(4, 24, angle, nextAngle)} fill={isTarget('S', num) ? "#FFD700" : (isBlack ? "#eee" : "#111")} className={isTarget('S', num) ? "animate-pulse" : "hover:opacity-80"} filter={isTarget('S', num) ? "url(#glow)" : ""} onClick={() => onSelect(`S${num}`)} />
              <text x={50 + 46.5 * Math.cos(angle + 0.15)} y={50 + 46.5 * Math.sin(angle + 0.15)} fill="#888" fontSize="2.8" fontWeight="black" textAnchor="middle" transform={`rotate(9, ${50 + 46.5 * Math.cos(angle + 0.15)}, ${50 + 46.5 * Math.sin(angle + 0.15)})`}>{num}</text>
            </g>
          );
        })}
        <circle cx="50" cy="50" r="4" fill={(cleanTarget === '25' || cleanTarget === 'S25') ? "#FFD700" : "#15803d"} className="cursor-pointer" onClick={() => onSelect('25')} />
        <circle cx="50" cy="50" r="1.8" fill={cleanTarget === 'BULL' ? "#FFD700" : "#b91c1c"} className="cursor-pointer" onClick={() => onSelect('Bull')} />
      </svg>
      <button onClick={() => onSelect('S0')} className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl text-white text-[9px] px-10 py-3 rounded-full font-black uppercase tracking-[0.3em] border border-white/10 active:scale-95 transition-all shadow-2xl">Miss / 0</button>
    </div>
  );
};

const App: React.FC = () => {
  const [initialScore, setInitialScore] = useState<string>('');
  const [dartsThrown, setDartsThrown] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const currentScore = useMemo(() => {
    const start = parseInt(initialScore) || 0;
    const totalDartsValue = dartsThrown.reduce((acc, d) => acc + CheckoutCalculator.getValue(d), 0);
    return Math.max(0, start - totalDartsValue);
  }, [initialScore, dartsThrown]);

  const suggestedPath = useMemo(() => {
    if (currentScore <= 0 || !initialScore) return [];
    return CheckoutCalculator.getPath(currentScore, 3 - dartsThrown.length);
  }, [currentScore, dartsThrown, initialScore]);

  const activeTarget = suggestedPath[0] || "";

  const handleNextTurn = () => {
    if (!initialScore) return;
    const entry = {
      id: Date.now(),
      scoreBefore: parseInt(initialScore),
      darts: [...dartsThrown],
      scoreAfter: currentScore
    };
    setHistory(prev => [entry, ...prev].slice(0, 5));
    if (currentScore > 0) {
      setInitialScore(currentScore.toString());
      setDartsThrown([]);
    } else {
      setInitialScore('');
      setDartsThrown([]);
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans text-white overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      
      {/* BACKGROUND IMAGE LAYER */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center grayscale brightness-75 contrast-125"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />
      
      {/* FROSTED GLASS OVERLAY */}
      <div className="fixed inset-0 z-10 bg-black/30 backdrop-blur-2xl" />

      {/* APP CONTENT */}
      <div className="relative z-20 flex flex-col items-center p-4 min-h-screen w-full">
        
        <header className="w-full max-w-md mt-8 mb-8 flex flex-col items-center relative">
          <button 
            onClick={() => { setInitialScore(''); setDartsThrown([]); setHistory([]); }} 
            className="absolute right-0 top-0 p-3 text-white/30 hover:text-yellow-500 transition-colors"
          >
            <ArrowPathIcon className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-yellow-500 tracking-[0.3em] uppercase drop-shadow-[0_4px_15px_rgba(0,0,0,1)]">BRAADART</h1>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.5em] mt-1">Checkout Trainer</p>
        </header>

        <main className="w-full max-w-md space-y-6">
          
          {/* Score Input Card */}
          <section className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden group focus-within:border-yellow-500/50 transition-colors">
            <div className="p-8 text-center bg-black/20">
              <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block mb-2 opacity-70">Starting Score</label>
              <input
                type="number"
                value={initialScore}
                onChange={(e) => {setInitialScore(e.target.value); setDartsThrown([]);}}
                className="w-full bg-transparent text-white text-center text-6xl font-black outline-none placeholder:text-white/5"
                placeholder="170"
              />
            </div>

            {parseInt(initialScore) > 0 && (
              <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Left</span>
                    <span className="text-white text-5xl font-black drop-shadow-md">{currentScore}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Target</span>
                    <span className="text-yellow-500 text-4xl font-black drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                      {activeTarget || (currentScore === 0 ? "OUT" : "CHECK")}
                    </span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-3 h-2 px-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`flex-1 rounded-full transition-all duration-700 ${dartsThrown.length > i ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'bg-white/10'}`}></div>
                  ))}
                </div>

                {/* Path display */}
                <div className="flex justify-center gap-3">
                  {suggestedPath.length > 0 ? suggestedPath.map((p, i) => (
                    <div key={i} className={`px-4 py-4 rounded-2xl font-black text-sm flex-1 text-center transition-all ${i === 0 ? 'bg-yellow-500 text-black shadow-xl scale-105' : 'bg-white/5 text-white/40 border border-white/5'}`}>
                      {p}
                    </div>
                  )) : (
                    <div className="text-white/20 font-black uppercase text-xs tracking-widest py-4">
                      {currentScore === 0 ? "LEG FINISHED" : "NO CHECKOUT"}
                    </div>
                  )}
                </div>

                {/* The Board */}
                <InteractiveDartboard onSelect={(v) => { if(dartsThrown.length < 3 && currentScore > 0) setDartsThrown([...dartsThrown, v]); }} target={activeTarget} />

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setDartsThrown(p => p.slice(0, -1))} 
                    disabled={dartsThrown.length === 0} 
                    className="flex-1 bg-white/5 border border-white/10 py-5 rounded-3xl flex items-center justify-center gap-2 text-white/40 font-black uppercase text-[10px] tracking-widest active:scale-95 disabled:opacity-5 transition-all"
                  >
                    <BackspaceIcon className="w-5 h-5" /> Undo
                  </button>
                  {(dartsThrown.length === 3 || currentScore === 0) && (
                    <button 
                      onClick={handleNextTurn} 
                      className="flex-[2] bg-yellow-500 text-black font-black py-5 rounded-3xl flex items-center justify-center gap-2 uppercase text-[11px] tracking-widest shadow-2xl active:scale-95 animate-in zoom-in-95"
                    >
                      <ForwardIcon className="w-5 h-5" /> Confirm Turn
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Turn History */}
          {history.length > 0 && (
            <div className="space-y-3 pb-12">
              <div className="flex items-center gap-2 px-2 opacity-50">
                <ClockIcon className="w-4 h-4 text-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Recent Logs</span>
              </div>
              {history.map(h => (
                <div key={h.id} className="flex justify-between items-center bg-black/40 backdrop-blur-xl border border-white/5 p-5 rounded-[1.5rem] animate-in slide-in-from-left-6">
                  <div className="flex items-center gap-4">
                    <span className="text-white/20 font-black text-xl">{h.scoreBefore}</span>
                    <div className="flex gap-2">
                      {h.darts.map((d: string, i: number) => (
                        <span key={i} className="bg-yellow-500/10 px-3 py-1.5 rounded-xl text-[10px] font-black text-yellow-500 border border-yellow-500/20">{d}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-yellow-500 font-black text-2xl">{h.scoreAfter}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; filter: brightness(1.2); } 50% { opacity: 0.6; filter: brightness(1.8); } }
        .animate-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}} />
    </div>
  );
};

export default App;
