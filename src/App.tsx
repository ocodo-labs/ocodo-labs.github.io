import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { AnimatedArc } from '@/components/AnimatedArc';
import { GradientBackground } from '@/components/GradientBackground';
import { OcodoFoundryPanel } from '@/components/OcodoFoundryPanel';

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const ring = () => {
  const minArcDegrees = randomBetween(60, 240);
  const maxArcDegrees = randomBetween(minArcDegrees, 360);

  return {
    radius: randomBetween(40, 170),
    width: randomBetween(1, 30),
    alpha: randomBetween(1, 50),
    minArcDegrees,
    maxArcDegrees,
    initialArcDegrees: randomBetween(minArcDegrees, maxArcDegrees),
    rotationStart: randomBetween(0, 360),
  };
};

const createRings = () => Array.from({ length: 8 }, () => ring());

export default function App() {
  const [rings, setRings] = useState(createRings);

  const resetRings = () => {
    setRings(createRings());
  };

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
            randomIntervalStart={0}
            randomIntervalEnd={1000}
          />
        </div>
      )}

      <div className="absolute bottom-0 flex justify-center inset-x-0">
        <OcodoFoundryPanel />
      </div>

      <button
        onClick={resetRings}
        className="cursor-pointer absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
        aria-label="Reset rings"
      >
        <RefreshCw size={18} />
      </button>
    </main>
  );
}
