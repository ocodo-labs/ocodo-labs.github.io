import { useCallback, useEffect, useState } from 'react';
import { Moon, RefreshCw, Sun } from 'lucide-react';
import { AnimatedArc } from '@/components/AnimatedArc';
import { GradientBackground } from '@/components/GradientBackground';
import { OcodoFoundryPanel } from '@/components/OcodoFoundryPanel';
import { AudioPlayer } from '@/components/AudioPlayer';

const BPM = 173;

export type Ring = {
  radius: number;
  width: number;
  alpha: number;
  minArcDegrees: number;
  maxArcDegrees: number;
  initialArcDegrees: number;
  rotationStart: number;
  randomIntervalStart: number;
  randomIntervalEnd: number;
};

export const purpleColor = (e: Ring) => `hsl(255 30% 60% / ${e.alpha}%)`;

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

const createUpTo10Rings = () =>
  Array.from({ length: randomBetween(1, 10) }, () => ring());

const createRings = (c: number) =>
  Array.from({ length: c }, () => ring())

const BAR_LENGTH = (60_000 / BPM) * 4;

type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';
type ArcButt = 'butt' | 'round'

export default function App() {
  const [rings, setRings] = useState<Ring[]>(createUpTo10Rings);
  const [showButtons, setShowButtons] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showGlobs, setShowGlobs] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');
  const [arcLinecap, setArcLinecap] = useState<ArcButt>('butt');

  const toggleButts = useCallback(() => {
    setArcLinecap(prev => prev === 'butt' ? 'round' : 'butt');
  }, []);

  const resetRings = useCallback(() => {
    setRings(createUpTo10Rings());
  }, []);

  const numberOfRings = useCallback((count: number) => {
    setRings(createRings(count));
  }, []);

  useEffect(() => {
    const media = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    const updateSystemTheme = () => {
      setSystemTheme(media.matches ? 'dark' : 'light');
    };

    updateSystemTheme();

    media.addEventListener('change', updateSystemTheme);

    return () => {
      media.removeEventListener('change', updateSystemTheme);
    };
  }, []);

  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      resolvedTheme === 'dark'
    );
  }, [resolvedTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const current = prev === 'system' ? systemTheme : prev;

      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemTheme]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'v') {
        setShowButtons((visible) => !visible);
      }

      if (event.key === 'r') {
        resetRings();
      }

      if (event.key === 'f') {
        setShowPanel((visible) => !visible);
      }

      if (event.key === 'g') {
        setShowGlobs((visible) => !visible);
      }

      if (event.key === 't') {
        toggleTheme();
      }

      if ([1, 2, 3, 4, 5, 6, 7, 8, 9].map(e => e.toString()).includes(event.key)) {
        numberOfRings(Number(event.key));
      }

      if (event.key === 'b') {
        toggleButts();
      }

      if (
        event.ctrlKey &&
        (event.key === '/' || event.key === '?')
      ) {
        setShowHelpPanel((visible) => !visible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [resetRings, toggleTheme, toggleButts]);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {showGlobs && <GradientBackground />}

      {rings.map((e: Ring, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
        >
          <AnimatedArc
            radius={e.radius}
            strokeWidth={e.width}
            strokeColor={purpleColor(e) ?? 'white'}
            strokeLinecap={arcLinecap}
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
      ))}

      <div
        className="absolute bottom-15 inset-x-0 flex justify-center gap-2"
        style={{
          opacity: showPanel ? 1 : 0,
          transition: `opacity ${BAR_LENGTH}ms ease-in-out`,
        }}
      >
        <OcodoFoundryPanel />
      </div>
      <div
        className="absolute bottom-5 inset-x-0 flex justify-center gap-2">
        <AudioPlayer />
      </div>

      {showButtons && (
        <>
          <button
            onClick={toggleTheme}
            className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-sm transition-opacity hover:bg-white/10 hover:text-white"
            aria-label={`Theme: ${theme}`}
            title={`Theme: ${theme}`}
          >
            {resolvedTheme === 'dark' ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} />
            )}
          </button>

          <button
            onClick={resetRings}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-sm transition-opacity hover:bg-white/10 hover:text-white"
            aria-label="Reset rings"
            title="Reset rings"
          >
            <RefreshCw size={18} />
          </button>
        </>
      )}

      {showHelpPanel && (
        <HelpPanel />
      )}
    </main>
  );
}


const HelpPanel = () => (
  <div className="absolute top-0 inset-x-0 flex justify-center">
    <div
      className="w-1/2 rounded-lg border bg-white/10 p-5 text-white"
      style={{
        borderColor: 'hsl(255 30% 60% / 20%)',
      }}
    >
      <div className="mb-2 text-md text-foreground font-bold">
        Help Panel
      </div>
      <div className='text-sm'>


        <div className="grid grid-cols-[4rem_1fr] items-center gap-2">
          <div className="text-foreground flex w-8 justify-center rounded-xl bg-foreground/10 p-2 font-mono">
            f
          </div>
          <div className="text-foreground">Toggle logo fade in / out</div>

          <div className="text-foreground flex w-8 justify-center rounded-xl bg-foreground/10 p-2 font-mono">
            r
          </div>
          <div className="text-foreground">Reset with Random number of arcs</div>

          <div className="text-foreground flex w-8 justify-center rounded-xl bg-foreground/10 p-2 font-mono">
            1..9
          </div>
          <div className="text-foreground">Reset with number of arcs</div>

          <div className="text-foreground flex w-8 justify-center rounded-xl bg-foreground/10 p-2 font-mono">
            v
          </div>
          <div className="text-foreground">Toggle button visibility</div>

          <div className="text-foreground flex w-8 justify-center rounded-xl bg-foreground/10 p-2 font-mono">
            g
          </div>
          <div className="text-foreground">Toggle gradient background</div>

          <div className="text-foreground flex w-8 justify-center rounded-xl bg-foreground/10 p-2 font-mono">
            b
          </div>
          <div className="text-foreground">Toggle linecaps butt or round</div>

          <div className="text-foreground flex w-8 justify-center rounded-xl bg-foreground/10 p-2 font-mono">
            t
          </div>
          <div className="text-foreground">Toggle theme Dark/Light</div>

          <div className="text-foreground flex w-8 flex-col items-center justify-center rounded-xl bg-foreground/10 p-2 font-mono text-[12px]">
            <div className="text-foreground">Ctrl+?</div>
          </div>
          <div className="text-foreground">Toggle help panel</div>
        </div>
      </div>
    </div>
  </div>
)