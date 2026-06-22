import Slider from "@react-native-community/slider";
import { setStatusBarHidden } from "expo-status-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, VideoPlayer as ExpoVideoPlayer } from "expo-video";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import Icon from "./Icon";
import Text from "./Text";
import colors from "@/constants/colors";

const { width } = Dimensions.get("window");

interface CustomVideoPlayerProps {
  player: ExpoVideoPlayer;
  title?: string;
  loading?: boolean;
  onFullscreenToggle?: () => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  pip?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function VideoPlayer({
  player,
  title,
  loading,
  onFullscreenToggle,
  onFullscreenChange,
  pip,
}: CustomVideoPlayerProps) {
  const insets = useSafeAreaInsets();
  const videoViewRef = useRef<VideoView>(null);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const isSeekingRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isSeekingRef.current = isSeeking;
  }, [isSeeking]);

  const handleFullscreenEnter = async () => {
    try {
      setIsFullscreen(true);
      setStatusBarHidden(true, "fade");
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE,
      );
      onFullscreenChange?.(true);
    } catch (error) {
      console.error("Error entering fullscreen orientation:", error);
    }
  };

  const handleFullscreenExit = async () => {
    try {
      setIsFullscreen(false);
      setStatusBarHidden(false, "fade");
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
      onFullscreenChange?.(false);
    } catch (error) {
      console.error("Error exiting fullscreen orientation:", error);
    }
  };

  const toggleFullscreen = async () => {
    if (onFullscreenToggle) {
      onFullscreenToggle();
    } else {
      if (isFullscreen) {
        await handleFullscreenExit();
      } else {
        await handleFullscreenEnter();
      }
    }
  };

  useEffect(() => {
    const playingSub = player.addListener("playingChange", (event) => {
      const playing = typeof event === "object" ? event.isPlaying : event;
      setIsPlaying(playing);
    });

    const timeSub = player.addListener("timeUpdate", (event) => {
      if (!isSeekingRef.current) {
        const time =
          (typeof event === "object" ? event.currentTime : event) ??
          player.currentTime;
        if (typeof time === "number") {
          setCurrentTime(time);
        }

        const dur =
          (typeof event === "object" && "duration" in event
            ? (event as any).duration
            : null) ??
          player.duration ??
          0;
        if (dur > 0) {
          setDuration(dur);
        }
      }
    });

    const statusSub = player.addListener("statusChange", (event) => {
      const status = typeof event === "object" ? event.status : event;
      if (status === "readyToPlay") {
        const dur = player.duration ?? 0;
        if (dur > 0) setDuration(dur);
      }
    });

    const interval = setInterval(() => {
      if (player.playing && !isSeekingRef.current) {
        setCurrentTime(player.currentTime);
        if (player.duration > 0) setDuration(player.duration);
      }
    }, 500);

    if (player.duration > 0) {
      setDuration(player.duration);
    }

    return () => {
      playingSub.remove();
      timeSub.remove();
      statusSub.remove();
      clearInterval(interval);
    };
  }, [player]);

  const resetHideTimer = useCallback(() => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (showControls) {
      resetHideTimer();
    }
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [showControls, resetHideTimer]);

  const handleTap = () => {
    setShowControls((prev) => !prev);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    resetHideTimer();
  };

  const skipBackward = () => {
    player.seekBy(-10);
    resetHideTimer();
  };

  const skipForward = () => {
    player.seekBy(10);
    resetHideTimer();
  };

  const handleSlidingStart = () => {
    setIsSeeking(true);
  };

  const handleSliderChange = (value: number) => {
    setCurrentTime(value);
  };

  const handleSlidingComplete = (value: number) => {
    player.currentTime = value;
    setIsSeeking(false);
    resetHideTimer();
  };

  return (
    <View
      style={[
        styles.container,
        isFullscreen && {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          aspectRatio: undefined,
          zIndex: 999,
          width: "100%",
          height: "100%",
        },
      ]}
    >
      <VideoView
        ref={videoViewRef}
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="contain"
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture={pip}
        startsPictureInPictureAutomatically={pip && isPlaying}
        onFullscreenEnter={handleFullscreenEnter}
        onFullscreenExit={handleFullscreenExit}
      />

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}

      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.overlay}>
          {showControls && (
            <View
              style={[
                styles.controlsContainer,
                isFullscreen && {
                  paddingHorizontal: Math.max(insets.left, insets.right, 32),
                  paddingVertical: Math.max(insets.top, insets.bottom, 20),
                },
              ]}
            >
              <View style={styles.topBar}>
                <View style={styles.titlePill}>
                  <View style={{ marginRight: 6 }}>
                    <Icon name="CirclePlay" size={16} color="#fff" />
                  </View>
                  <Text style={styles.titleText} numberOfLines={1}>
                    {title}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={toggleFullscreen}
                >
                  <Icon
                    name={isFullscreen ? "Minimize" : "Maximize"}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.centerControls}>
                <TouchableOpacity onPress={skipBackward} style={styles.sideBtn}>
                  <Icon name="RotateCcw" size={20} color="#fff" />
                  <Text style={styles.skipText}>10s</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={togglePlayPause}
                  style={styles.playBtn}
                >
                  <View style={styles.playCircle}>
                    <Icon
                      name={isPlaying ? "Pause" : "Play"}
                      size={22}
                      color="#fff"
                      fill="#fff"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={skipForward} style={styles.sideBtn}>
                  <Icon name="RotateCw" size={20} color="#fff" />
                  <Text style={styles.skipText}>10s</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomBar}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={
                    duration > 0
                      ? duration
                      : player.duration > 0
                        ? player.duration
                        : 100
                  }
                  value={currentTime}
                  minimumTrackTintColor={colors.accent}
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor={colors.accent}
                  onSlidingStart={handleSlidingStart}
                  onValueChange={handleSliderChange}
                  onSlidingComplete={handleSlidingComplete}
                />

                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden",
  },
  containerFullscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    aspectRatio: undefined,
    zIndex: 999,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titlePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 99,
    maxWidth: width * 0.75,
  },
  titleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    paddingRight: 24,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  playBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  sideBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    minWidth: 40,
    textAlign: "center",
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
