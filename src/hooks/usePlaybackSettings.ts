import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  AUTOPLAY: "@phinime:autoplay",
  AUTONEXT: "@phinime:autonext",
  PIP: "@phinime:pip",
};

export default function usePlaybackSettings() {
  const [autoplay, setAutoplayState] = useState(false);
  const [autonext, setAutonextState] = useState(false);
  const [pip, setPipState] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [a, b, c] = await AsyncStorage.multiGet([
          STORAGE_KEYS.AUTOPLAY,
          STORAGE_KEYS.AUTONEXT,
          STORAGE_KEYS.PIP,
        ]);
        if (!mounted) return;
        if (a && a[1] !== null) setAutoplayState(a[1] === "true");
        if (b && b[1] !== null) setAutonextState(b[1] === "true");
        if (c && c[1] !== null) setPipState(c[1] === "true");
      } catch (err) {
        console.warn("[usePlaybackSettings] failed to load:", err);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const setAutoplay = async (val: boolean) => {
    setAutoplayState(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTOPLAY, String(val));
    } catch (err) {
      console.warn("[usePlaybackSettings] failed to save autoplay:", err);
    }
  };

  const setAutonext = async (val: boolean) => {
    setAutonextState(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTONEXT, String(val));
    } catch (err) {
      console.warn("[usePlaybackSettings] failed to save autonext:", err);
    }
  };

  const setPip = async (val: boolean) => {
    setPipState(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PIP, String(val));
    } catch (err) {
      console.warn("[usePlaybackSettings] failed to save pip:", err);
    }
  };

  return { autoplay, autonext, pip, setAutoplay, setAutonext, setPip };
}
