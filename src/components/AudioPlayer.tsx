import { useEffect, useRef, useState } from 'react';

export const PlayPauseIcon = ({
  playing,
  onClick,
}: {
  playing: boolean;
  onClick: () => void;
}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    aria-label={playing ? 'Pause' : 'Play'}
    role="button"
    tabIndex={0}
    className="block shrink-0 cursor-pointer"
    onClick={onClick}
  >
    {playing ? (
      <>
        <rect x="4" y="3" width="3" height="10" fill="currentColor" />
        <rect x="9" y="3" width="3" height="10" fill="currentColor" />
      </>
    ) : (
      <path d="M5 3.25L12 8L5 12.75V3.25Z" fill="currentColor" />
    )}
  </svg>
);

export const ReplayIcon = ({ onClick }: { onClick: () => void }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    aria-label="Replay"
    role="button"
    tabIndex={0}
    className="block shrink-0 cursor-pointer"
    onClick={onClick}
  >
    <path
      d="M3.25 6.5A5 5 0 1 1 4.7 11.9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    />
    <path
      d="M3.25 3.5V6.75H6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
    />
  </svg>
);

export const VolumeIcon = ({
  muted,
  onClick,
  onMouseEnter,
}: {
  muted: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    aria-label={muted ? 'Unmute' : 'Mute'}
    role="button"
    tabIndex={0}
    className="block shrink-0 cursor-pointer"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
  >
    <path
      d="M2.5 6H5L8.5 3V13L5 10H2.5V6Z"
      fill="currentColor"
    />

    {muted ? (
      <path
        d="M10 6L13 10M13 6L10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    ) : (
      <path
        d="M10 5.25C11 6 11.5 7 11.5 8C11.5 9 11 10 10 10.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
      />
    )}
  </svg>
);

export const VolumeSlider = ({
  volume,
  trackRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  volume: number;
  trackRef: React.RefObject<SVGRectElement | null>;
  onPointerDown: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerCancel: (event: React.PointerEvent<SVGSVGElement>) => void;
}) => (
  <svg
    width="16"
    height="64"
    viewBox="0 0 16 64"
    className="block cursor-pointer"
    role="slider"
    aria-label="Volume"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(volume * 100)}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerCancel}
  >
    <rect
      x="4.5"
      y="2"
      width="7"
      height="60"
      fill="currentColor"
      opacity="0.15"
    />

    <rect
      x="5.5"
      y={2 + 60 * (1 - volume)}
      width="5"
      height={60 * volume}
      fill="currentColor"
    />

    <rect
      ref={trackRef}
      x="4.5"
      y="0"
      width="7"
      height="64"
      fill="transparent"
    />
  </svg>
);

export const ProgressSlider = ({
  progress,
  trackRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  progress: number;
  trackRef: React.RefObject<SVGRectElement | null>;
  onPointerDown: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerCancel: (event: React.PointerEvent<SVGSVGElement>) => void;
}) => (
  <svg
    width="100"
    height="16"
    viewBox="0 0 100 16"
    className="block shrink-0 cursor-pointer"
    role="slider"
    aria-label="Audio progress"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(progress * 100)}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerCancel}
  >
    <rect
      x="0"
      y="4.5"
      width="100"
      height="7"
      fill="currentColor"
      opacity="0.15"
    />

    <rect
      x="0"
      y="5.5"
      width={100 * progress}
      height="5"
      fill="currentColor"
    />

    <rect
      ref={trackRef}
      x="0"
      y="4.5"
      width="100"
      height="7"
      fill="transparent"
    />
  </svg>
);

export const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<SVGRectElement | null>(null);
  const volumeTrackRef = useRef<SVGRectElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [volumeDragging, setVolumeDragging] = useState(false);

  const progressDragRef = useRef(false);
  const volumeDragRef = useRef(false);
  const wasPlayingBeforeSeekRef = useRef(false);

  useEffect(() => {
    const audio = new Audio('/audio.mp3');

    audio.preload = 'metadata';
    audio.volume = 1;
    audioRef.current = audio;

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    const handleEnded = () => {
      setPlaying(false);
      setProgress(1);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      if (!progressDragRef.current && audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current = null;
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {}
    } else {
      audio.pause();
    }
  };

  const replay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setProgress(0);

    try {
      await audio.play();
    } catch {}
  };

  const setAudioVolume = (value: number) => {
    const next = Math.max(0, Math.min(1, value));

    setVolume(next);

    if (next > 0) {
      setPreviousVolume(next);
    }

    if (audioRef.current) {
      audioRef.current.volume = next;
    }
  };

  const updateVolumeFromPointer = (clientY: number) => {
    const track = volumeTrackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();

    const position = Math.max(
      0,
      Math.min(1, (clientY - rect.top) / rect.height),
    );

    setAudioVolume(1 - position);
  };

  const updateProgressFromPointer = (clientX: number) => {
    const track = progressRef.current;
    const audio = audioRef.current;

    if (!track || !audio || !duration) return;

    const rect = track.getBoundingClientRect();

    const position = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width),
    );

    setProgress(position);
    audio.currentTime = position * duration;
  };

  const beginVolumeDrag = (
    event: React.PointerEvent<SVGSVGElement>,
  ) => {
    event.preventDefault();

    volumeDragRef.current = true;
    setVolumeDragging(true);
    setVolumeOpen(true);

    event.currentTarget.setPointerCapture(event.pointerId);
    updateVolumeFromPointer(event.clientY);
  };

  const handleVolumePointerMove = (
    event: React.PointerEvent<SVGSVGElement>,
  ) => {
    if (volumeDragRef.current) {
      updateVolumeFromPointer(event.clientY);
    }
  };

  const endVolumeDrag = (
    event: React.PointerEvent<SVGSVGElement>,
  ) => {
    volumeDragRef.current = false;
    setVolumeDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const beginProgressDrag = (
    event: React.PointerEvent<SVGSVGElement>,
  ) => {
    event.preventDefault();

    const audio = audioRef.current;
    if (!audio) return;

    wasPlayingBeforeSeekRef.current = !audio.paused;
    progressDragRef.current = true;

    event.currentTarget.setPointerCapture(event.pointerId);
    updateProgressFromPointer(event.clientX);
  };

  const handleProgressPointerMove = (
    event: React.PointerEvent<SVGSVGElement>,
  ) => {
    if (progressDragRef.current) {
      updateProgressFromPointer(event.clientX);
    }
  };

  const endProgressDrag = (
    event: React.PointerEvent<SVGSVGElement>,
  ) => {
    if (!progressDragRef.current) return;

    updateProgressFromPointer(event.clientX);
    progressDragRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (wasPlayingBeforeSeekRef.current && audio.paused) {
      void audio.play().catch(() => {});
    }

    if (!wasPlayingBeforeSeekRef.current && !audio.paused) {
      audio.pause();
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setAudioVolume(previousVolume || 1);
    } else {
      setPreviousVolume(volume);
      setAudioVolume(0);
    }
  };

  return (
    <div className="relative flex h-4 items-center">
      <PlayPauseIcon
        playing={playing}
        onClick={togglePlay}
      />

      <ReplayIcon onClick={replay} />

      <div
        className="relative h-4 w-4 shrink-0"
        onMouseEnter={() => setVolumeOpen(true)}
        onMouseLeave={() => {
          if (!volumeDragging) {
            setVolumeOpen(false);
          }
        }}
      >
        <VolumeIcon
          muted={volume === 0}
          onClick={toggleMute}
          onMouseEnter={() => setVolumeOpen(true)}
        />

        {volumeOpen && (
          <div
            className="absolute bottom-full left-1/2 z-50 -translate-x-1/2"
            onMouseEnter={() => setVolumeOpen(true)}
            onMouseLeave={() => {
              if (!volumeDragging) {
                setVolumeOpen(false);
              }
            }}
          >
            <VolumeSlider
              volume={volume}
              trackRef={volumeTrackRef}
              onPointerDown={beginVolumeDrag}
              onPointerMove={handleVolumePointerMove}
              onPointerUp={endVolumeDrag}
              onPointerCancel={endVolumeDrag}
            />
          </div>
        )}
      </div>

      <ProgressSlider
        progress={progress}
        trackRef={progressRef}
        onPointerDown={beginProgressDrag}
        onPointerMove={handleProgressPointerMove}
        onPointerUp={endProgressDrag}
        onPointerCancel={endProgressDrag}
      />
    </div>
  );
};
