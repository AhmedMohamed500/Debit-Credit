import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { RewardNotice } from "@/components/game/reward-notice";
import { WorldMap } from "@/components/game/world-map";
import { createPlayerState } from "@/lib/game/engine";
import { PLAYER_STORAGE_KEY, PLAYER_SYNC_MARKER, recordGameActivity } from "@/lib/game/progress";

beforeEach(()=>{localStorage.clear();localStorage.setItem(PLAYER_SYNC_MARKER,"test")});
afterEach(cleanup);
describe("live game progression UI",()=>{
  it("does not announce old rewards when a returning player opens the page",()=>{
    localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify({...createPlayerState(),xp:200,coins:60}));
    render(<RewardNotice locale="en"/>);
    expect(screen.queryByRole("status")).toBeNull();
  });
  it("announces real earned rewards, but not an identical replay",()=>{
    const view=render(<RewardNotice locale="en"/>);
    act(()=>{recordGameActivity("practice","world-check",100,["journal-entries"])});
    expect(screen.getByRole("status")).toHaveTextContent("+30 XP");
    expect(screen.getByRole("status")).toHaveTextContent("Achievement unlocked");
    act(()=>screen.getByRole("button",{name:"Dismiss reward"}).click());
    act(()=>{recordGameActivity("practice","world-check",100,["journal-entries"])});
    expect(screen.queryByRole("status")).toBeNull();
    view.unmount();
  });
  it("opens the next checkpoint and announces level-up after crossing its XP threshold",()=>{
    localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify({...createPlayerState(),xp:170}));
    render(<><WorldMap locale="en"/><RewardNotice locale="en"/></>);
    expect(screen.queryByRole("link",{name:"Journal Entries"})).toBeNull();
    act(()=>{recordGameActivity("lesson","unlock-check",100,["fundamentals"])});
    expect(screen.getByRole("link",{name:"Journal Entries"})).toHaveAttribute("href","/en/learning-map#level-2");
    expect(screen.getByRole("status")).toHaveTextContent("Level 2 unlocked");
    expect(screen.queryByRole("link",{name:"Ledger & Posting"})).toBeNull();
  });
  it("renders Arabic unlocked checkpoints with Arabic route targets",()=>{
    render(<WorldMap locale="ar"/>);
    expect(screen.getByRole("link",{name:"أساسيات المحاسبة"})).toHaveAttribute("href","/ar/learning-map#level-1");
    expect(screen.queryByRole("link",{name:"القيود اليومية"})).toBeNull();
  });
});
