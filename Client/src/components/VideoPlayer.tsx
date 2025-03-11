import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Button } from "./ui/button";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const VideoPlayer = ({
  width = "100%",
  height = "100%",
  url,
  onProgressUpdate,
  progressData,
}) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const handlePlayPause = () => setPlaying(!playing);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
      if (state.played >= 0.95) {
        onProgressUpdate(progressData);
      }
    }
  };

  const handleRewind = () => {
    const player = playerRef.current;
    if (player) {
      const currentTime = player.getCurrentTime();
      player.seekTo(currentTime - 10);
    }
  };

  const handleForward = () => {
    const player = playerRef.current;
    if (player) {
      const currentTime = player.getCurrentTime();
      player.seekTo(currentTime + 10);
    }
  };

  const handleToggleMute = () => setMuted(!muted);

  const handleSeekChange = (e) => {
    const newPlayed = parseFloat(e.target.value) / 100;
    setPlayed(newPlayed);
    setSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setSeeking(false);
    const player = playerRef.current;
    if (player) {
      player.seekTo(played);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds();
    return hh ? `${hh}:${pad(mm)}:${pad(ss)}` : `${mm}:${pad(ss)}`;
  };

  const pad = (string) => ("0" + string).slice(-2);

  const handleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [isFullScreen]);

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    const player = playerRef.current;
    if (player) {
      player.playbackRate = rate;
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${
        isFullScreen ? "w-screen h-screen" : ""
      }`}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <ReactPlayer
        ref={playerRef}
        className="absolute top-0 left-0"
        width="100%"
        height="100%"
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        onProgress={handleProgress}
      />

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 pointer-events-none ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Custom Progress Slider */}

        {/* Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
          <div className="absolute -top-10 left-0 right-0 px-4 pt-4 pointer-events-auto">
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={played * 100}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              onTouchEnd={handleSeekMouseUp}
              className="w-full h-1.5 bg-gray-500/50 rounded-full appearance-none cursor-pointer focus:outline-none
              [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border
              [&::-webkit-slider-thumb]:border-gray-300 [&::-webkit-slider-thumb]:appearance-none
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border
              [&::-moz-range-thumb]:border-gray-300 [&::-moz-range-thumb]:appearance-none
              [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent
              [&:before]:content-[''] [&:before]:absolute [&:before]:left-0 [&:before]:top-0 [&:before]:h-1.5
              [&:before]:bg-teal-500 [&:before]:rounded-full"
              style={{ "--progress-width": `${played * 100}%` }}
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="text-white hover:bg-gray-700/80 rounded-full"
            >
              {playing ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRewind}
              className="text-white hover:bg-gray-700/80 rounded-full"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleForward}
              className="text-white hover:bg-gray-700/80 rounded-full"
            >
              <RotateCw className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleMute}
                className="text-white hover:bg-gray-700/80 rounded-full"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={volume * 100}
                onChange={handleVolumeChange}
                className="w-24 h-1.5 bg-gray-500/50 rounded-full appearance-none cursor-pointer focus:outline-none
                  [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border
                  [&::-webkit-slider-thumb]:border-gray-300 [&::-webkit-slider-thumb]:appearance-none
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border
                  [&::-moz-range-thumb]:border-gray-300 [&::-moz-range-thumb]:appearance-none
                  [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent
                  [&:before]:content-[''] [&:before]:absolute [&:before]:left-0 [&:before]:top-0 [&:before]:h-1.5
                  [&:before]:bg-teal-500 [&:before]:rounded-full"
                style={{ "--progress-width": `${volume * 100}%` }}
              />
            </div>
            <span className="text-white text-sm font-medium">
              {formatTime(played * (playerRef.current?.getDuration() || 0))} /{" "}
              {formatTime(playerRef.current?.getDuration() || 0)}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-gray-700/80 rounded-full"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
                {[0.5, 1, 1.5, 2].map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`hover:bg-gray-700 ${
                      playbackRate === rate ? "text-teal-500" : ""
                    }`}
                  >
                    {rate}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullScreen}
              className="text-white hover:bg-gray-700/80 rounded-full"
            >
              {isFullScreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Inline CSS for Custom Slider Progress */}
      <style jsx>{`
        input[type="range"] {
          position: relative;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          background: transparent;
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
        }
        input[type="range"]:before {
          width: var(--progress-width);
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
