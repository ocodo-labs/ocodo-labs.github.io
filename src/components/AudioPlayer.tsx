import {
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useRef, useState } from 'react';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      await audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const replay = async () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    await audioRef.current.play();
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);

    if (value > 0) {
      setPreviousVolume(value);
    }

    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    if (volume === 0) {
      const restoredVolume = previousVolume || 1;

      setVolume(restoredVolume);
      audioRef.current.volume = restoredVolume;
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      audioRef.current.volume = 0;
    }
  };

  return (
    <div className="flex items-center gap-2 bg-background/20 px-2 py-1 text-foreground backdrop-blur-sm">
      <audio
        ref={audioRef}
        src="/audio.mp3"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <button
        type="button"
        onClick={togglePlay}
        className="flex h-8 w-8 shrink-0 items-center justify-center transition-colors hover:bg-foreground/10"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={15} /> : <Play size={15} />}
      </button>

      <button
        type="button"
        onClick={replay}
        className="flex h-8 w-8 shrink-0 items-center justify-center transition-colors hover:bg-foreground/10"
        aria-label="Replay"
      >
        <RotateCcw size={15} />
      </button>

      <button
        type="button"
        onClick={toggleMute}
        className="flex shrink-0 items-center justify-center opacity-60 transition-opacity hover:opacity-100"
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
      >
        {volume === 0 ? (
          <VolumeX size={16} />
        ) : (
          <Volume2 size={16} />
        )}
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => handleVolumeChange(Number(e.target.value))}
        className="
          h-1.5 w-24 cursor-pointer appearance-none rounded-full
          bg-foreground/15
          accent-foreground
          [&::-webkit-slider-runnable-track]:h-1.5
          [&::-webkit-slider-runnable-track]:rounded-full
          [&::-webkit-slider-runnable-track]:bg-foreground/15
          [&::-webkit-slider-thumb]:mt-[-3px]
          [&::-webkit-slider-thumb]:h-2.5
          [&::-webkit-slider-thumb]:w-2.5
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-foreground
          [&::-moz-range-track]:h-1.5
          [&::-moz-range-track]:rounded-full
          [&::-moz-range-track]:bg-foreground/15
          [&::-moz-range-thumb]:h-2.5
          [&::-moz-range-thumb]:w-2.5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:bg-foreground
        "
        aria-label="Volume"
      />
    </div>
  );
}
