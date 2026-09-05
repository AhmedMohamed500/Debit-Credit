"use client";
import { useEffect, useState } from "react";
import { createPlayerState, derivePlayerSnapshot } from "@/lib/game/engine";
import { subscribePlayer, syncExistingEducationProgress } from "@/lib/game/progress";
export function usePlayer(){const [player,setPlayer]=useState(()=>derivePlayerSnapshot(createPlayerState()));useEffect(()=>{setPlayer(syncExistingEducationProgress());return subscribePlayer(setPlayer)},[]);return player}
