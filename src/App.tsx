import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { AnimatedArc } from '@/components/AnimatedArc';
import { GradientBackground } from '@/components/GradientBackground';
import { OcodoFoundryPanel } from '@/components/OcodoFoundryPanel';

const BPM = 60;

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const bpmIntervals = (bpm: number) => {
  const beat = 60_000 / bpm;

  return [
    beat * 0.25, // 1/16
    beat * 0.5,  // 1/8
    beat,        // 1/4
    beat * 2,    // 1/2
    beat * 4,    // 1 bar
  ];
};

const randomBpmInterval = (bpm: number) => {
  const intervals = bpmIntervals(bpm);
  return intervals[Math.floor(Math.random() * intervals.length)];
};

const ring = () => {
  const minArcDegrees = randomBetween(10, 120);
  const maxArcDegrees = randomBetween(minArcDegrees, 360);

  return {
    radius: randomBetween(50, 200),
    width: randomBetween(1, 30),
    alpha: randomBetween(1, 50),
    minArcDegrees,
    maxArcDegrees,
    initialArcDegrees: randomBetween(minArcDegrees, maxArcDegrees),
    rotationStart: randomBetween(0, 360),
    randomIntervalStart: randomBpmInterval(BPM),
    randomIntervalEnd: randomBpmInterval(BPM),
  };
};

const createRings = () =>
  Array.from({ length: randomBetween(1, 10) }, () => ring());

const BAR_LENGTH = (60_000 / BPM) * 4;

export default function App() {
  const [rings, setRings] = useState(createRings);
  const [showRefreshButton, setShowRefreshButton] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  const [showHelpPanel, setShowHelpPanel] = useState(false);

  const resetRings = () => {
    setRings(createRings());
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'v') {
        setShowRefreshButton((visible) => !visible);
      }

      if (event.key === 'r') {
        resetRings();
      }

      if (event.key === 'f') {
        setShowPanel((visible) => !visible);
      }

      if (
        event.ctrlKey &&
        (event.key === '/' || event.key === '?')
      ) {
        setShowHelpPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <GradientBackground />

      {rings.map((e, i) =>
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
        >
          <AnimatedArc
            radius={e.radius}
            strokeWidth={e.width}
            strokeColor={`hsl(255 30% 60% / ${e.alpha}%)`}
            strokeLinecap="butt"
            minArcDegrees={e.minArcDegrees}
            maxArcDegrees={e.maxArcDegrees}
            initialArcDegrees={e.initialArcDegrees}
            rotationStart={e.rotationStart}
            minRotationDegrees={45}
            maxRotationDegrees={180}
            spinDirection="both"
            durationRangeStart={10}
            durationRangeEnd={3000}
            randomIntervalStart={e.randomIntervalStart}
            randomIntervalEnd={e.randomIntervalEnd}
          />
        </div>
      )}

      <div
        className="absolute bottom-0 inset-x-0 flex justify-center"
        style={{
          opacity: showPanel ? 1 : 0,
          transition: `opacity ${BAR_LENGTH}ms ease-in-out`,
        }}
      >
        <OcodoFoundryPanel />
      </div>

      <button
        onClick={resetRings}
        className={`absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-sm transition-opacity hover:bg-white/10 hover:text-white ${showRefreshButton ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        aria-label="Reset rings"
      >
        <RefreshCw size={18} />
      </button>

      {showHelpPanel &&
        <>
          <div className='absolute top-0 inset-x-0 flex justify-center'>
            <div
              className='rounded-lg border p-5 text-white w-1/3 bg-white/10'
              style={{ borderColor: 'hsl(255 30% 60% / 20%)' }}
            >
              <div className='mb-2 text-2xl font-bold'>
                Help Panel
              </div>
              <div className="grid grid-cols-[4rem_1fr] gap-2 items-center">
                <div className="font-mono bg-white/10 p-2 w-8 rounded-xl flex justify-center">f</div>
                <div>Toggle logo fade in / out</div>

                <div className="font-mono bg-white/10 p-2 w-8 rounded-xl flex justify-center">r</div>
                <div>Reset arcs</div>

                <div className="font-mono bg-white/10 p-2 w-8 rounded-xl flex justify-center">v</div>
                <div>Toggle refresh button visibility</div>

                <div className="font-mono bg-white/10 p-2 w-15 rounded-xl flex justify-center items-center text-[12px] flex-col">
                  <div>Ctrl+?</div>
                </div>
                <div>Toggle help panel</div>
              </div>
            </div>
          </div>
        </>
      }
    </main>
  );
}
