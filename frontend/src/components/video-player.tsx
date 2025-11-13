import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Download, PictureInPicture, Loader2 } from "lucide-react";

const VideoPlayer = ({ src, duration }: { src: string; duration?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [previewTime, setPreviewTime] = useState<number | null>(null);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [volumeSliderTimeout, setVolumeSliderTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);
        
        // Loading states
        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleLoadedData = () => setIsLoading(false);
        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => {
            setIsBuffering(false);
            setIsLoading(false);
        };
        const handleError = () => {
            setHasError(true);
            setIsLoading(false);
            setIsBuffering(false);
        };

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('loadstart', handleLoadStart);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('error', handleError);

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('loadstart', handleLoadStart);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('error', handleError);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const togglePlay = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newTime = parseFloat(e.target.value);
        video.currentTime = newTime;
        setCurrentTime(newTime);
        setPreviewTime(null);
    };

    const handleSeekPreview = (e: React.MouseEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const rect = input.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * videoDuration;
        setPreviewTime(time);
    };

    const handleSeekPreviewLeave = () => {
        setPreviewTime(null);
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;

        if (isMuted) {
            video.muted = false;
            setIsMuted(false);
            if (volume === 0) {
                const newVolume = 0.5;
                setVolume(newVolume);
                video.volume = newVolume;
            }
        } else {
            video.muted = true;
            setIsMuted(true);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const formatTime = (seconds: number | string) => {
        const totalSeconds = typeof seconds === 'string' ? parseFloat(seconds) || 0 : seconds;
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const container = containerRef.current;
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const togglePictureInPicture = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await video.requestPictureInPicture();
            }
        } catch (error) {
            console.error('Picture-in-Picture error:', error);
        }
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const video = videoRef.current;
        if (!video || !video.src) return;

        const a = document.createElement('a');
        a.href = video.src;
        a.download = 'video.mp4';
        a.click();
    };

    const handlePlaybackRateChange = (rate: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;

        video.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSettings(false);
    };

    const setShowVolumeLeave = (show: boolean) => {
        if (volumeSliderTimeout) clearTimeout(volumeSliderTimeout);

        if (!show) {
            const timeout = setTimeout(() => {
                setShowVolumeSlider(false);
            }, 300);
            setVolumeSliderTimeout(timeout);
        } else {
            setShowVolumeSlider(true);
        }
    };

    const videoDuration = videoRef.current?.duration || 0;
    const progress = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className={`relative bg-black rounded-lg overflow-hidden group ${
                isFullscreen ? 'w-screen h-screen' : 'aspect-video'
            }`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                preload="metadata"
            />

            {/* Loading Spinner */}
            {(isLoading || isBuffering) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 text-white animate-spin" />
                        <p className="text-white text-sm font-medium">
                            {isLoading ? 'Loading video...' : 'Buffering...'}
                        </p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center px-4">
                        <p className="text-white text-lg font-semibold mb-2">Failed to load video</p>
                        <p className="text-white/70 text-sm">Please check your connection and try again</p>
                    </div>
                </div>
            )}

            {/* Custom Controls Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
            }`}>
                {/* Progress Bar */}
                <div className="mb-4 relative group/progress">
                    {/* Time Preview Tooltip */}
                    {previewTime !== null && (
                        <div
                            className="absolute bottom-full mb-2 bg-black/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm"
                            style={{
                                left: `${(previewTime / videoDuration) * 100}%`,
                                transform: 'translateX(-50%)'
                            }}
                        >
                            {formatTime(previewTime)}
                        </div>
                    )}

                    <div className="relative h-1 bg-white/20 rounded-full cursor-pointer">
                        {/* Buffered/Loaded Bar (simulated) */}
                        <div className="absolute h-full bg-white/30 rounded-full" style={{ width: '70%' }} />

                        {/* Progress Bar */}
                        <div
                            className="absolute h-full bg-blue-400 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />

                        {/* Scrubber - properly centered */}
                        <div
                            className="absolute top-1/2 w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-lg transition-all duration-150 -translate-y-1/2 hover:scale-110"
                            style={{
                                left: `${progress}%`,
                                marginLeft: '-6px'
                            }}
                        />
                    </div>

                    {/* Invisible wider hit area for easier scrubbing */}
                    <input
                        type="range"
                        min="0"
                        max={videoDuration}
                        value={currentTime}
                        onChange={handleSeek}
                        onMouseMove={handleSeekPreview}
                        onMouseLeave={handleSeekPreviewLeave}
                        className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer -top-1.5"
                    />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause Button */}
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="text-white hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            {isPlaying ? (
                                <Pause className="h-5 w-5 fill-white" />
                            ) : (
                                <Play className="h-5 w-5 fill-white" />
                            )}
                        </button>

                        {/* Volume Controls */}
                        <div
                            className={`flex items-center gap-4 pr-[6px] transition-all duration-300 ease-in-out overflow-hidden ${
                                showVolumeSlider ? 'w-32' : 'w-8'
                            }`}
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            onMouseLeave={() => setShowVolumeLeave(false)}
                        >
                            {/* Mute/Unmute Button */}
                            <button
                                type="button"
                                onClick={toggleMute}
                                className="text-white hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="h-4 w-4" />
                                ) : (
                                    <Volume2 className="h-4 w-4" />
                                )}
                            </button>

                            {/* Horizontal Volume Slider */}
                            <div
                                className={`flex-1 relative transition-opacity duration-300 ease-in-out ${
                                    showVolumeSlider ? 'opacity-100' : 'opacity-0'
                                }`}
                            >
                                <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
                                    <div
                                        className="absolute h-full bg-blue-400 rounded-full transition-all duration-150"
                                        style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                                    />
                                </div>

                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer -top-1.5"
                                />

                                <div
                                    className="absolute top-1/2 w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-lg transition-all duration-150 -translate-y-1/2 hover:scale-110"
                                    style={{
                                        left: `${(isMuted ? 0 : volume) * 100}%`,
                                        marginLeft: '-6px'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Time Display */}
                        <div className="text-white text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(videoDuration)}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Settings Button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowSettings(!showSettings);
                                }}
                                className="text-white hover:opacity-80 transition-opacity cursor-pointer"
                            >
                                <Settings className="h-4 w-4" />
                            </button>

                            {/* Settings Menu */}
                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 backdrop-blur-sm min-w-[160px] z-50">
                                    <div className="text-white text-sm mb-1 px-2 py-1 font-medium">Playback Speed</div>
                                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                        <button
                                            type="button"
                                            key={rate}
                                            onClick={(e) => handlePlaybackRateChange(rate, e)}
                                            className={`w-full text-left px-3 py-1.5 text-sm rounded cursor-pointer transition-colors ${
                                                playbackRate === rate
                                                    ? 'bg-blue-400 text-white'
                                                    : 'text-white/80 hover:bg-white/10'
                                            }`}
                                        >
                                            {rate === 1 ? 'Normal' : `${rate}x`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Picture-in-Picture Button */}
                        <button
                            type="button"
                            onClick={togglePictureInPicture}
                            className="text-white hover:opacity-80 transition-opacity cursor-pointer"
                            title="Picture in Picture"
                        >
                            <PictureInPicture className="h-4 w-4" />
                        </button>

                        {/* Download Button */}
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="text-white hover:opacity-80 transition-opacity cursor-pointer"
                            title="Download"
                        >
                            <Download className="h-4 w-4" />
                        </button>

                        {/* Fullscreen Button */}
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="text-white hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            {isFullscreen ? (
                                <Minimize className="h-4 w-4" />
                            ) : (
                                <Maximize className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Play Button Overlay when paused - non-blocking */}
            {!isPlaying && !isLoading && !isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        type="button"
                        onClick={togglePlay}
                        className="bg-black/60 rounded-full p-4 backdrop-blur-sm hover:bg-black/80 transition-colors cursor-pointer pointer-events-auto"
                    >
                        <Play className="h-12 w-12 text-white fill-white" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default VideoPlayer;