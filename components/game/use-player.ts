"use client";
import { useEffect, useState } from "react";
import { createPlayerState, derivePlayerSnapshot } from "@/lib/game/engine";
import {
  subscribePlayer,
  syncExistingEducationProgress,
} from "@/lib/game/progress";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
export function usePlayer() {
  const identity = useCloudIdentity();
  const [player, setPlayer] = useState(() =>
    derivePlayerSnapshot(createPlayerState()),
  );
  useEffect(() => {
    setPlayer(syncExistingEducationProgress());
    return subscribePlayer(setPlayer);
  }, []);
  return {
    ...player,
    displayName: identity?.profile.displayName || player.displayName,
  };
}
