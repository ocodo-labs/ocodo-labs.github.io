import { AnimatedArc } from '@/components/AnimatedArc';
import { GradientBackground } from '@/components/GradientBackground';
import { OcodoFoundryPanel } from '@/components/OcodoFoundryPanel';

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const ring = () => ({
  radius: randomBetween(50, 200),
  width: randomBetween(1, 30),
  alpha: randomBetween(1, 50),
});

const rings = Array.from({ length: 20 }, () => ring());

export default function App() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <GradientBackground />

      {rings.map((e) =>
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedArc
            radius={e.radius}
            strokeWidth={e.width}
            strokeColor={` hsl(255 30% 60% / ${e.alpha}%)`}
            strokeLinecap='butt'
            minArcDegrees={Math.random() * 50}
            maxArcDegrees={Math.random() * 270}
            initialArcDegrees={120}
            rotationStart={20}
            minRotationDegrees={45}
            maxRotationDegrees={180}
            spinDirection="both"
            durationRangeStart={10}
            durationRangeEnd={3000}
            randomIntervalStart={0}
            randomIntervalEnd={1000}
          />
        </div>
      )
      }
      <div className="absolute bottom-0 inset-0 flex items-center justify-center">
        <OcodoFoundryPanel />
      </div>
    </main>
  );
}
