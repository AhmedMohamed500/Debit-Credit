// @vitest-environment jsdom
import { beforeEach,describe,expect,it } from "vitest";
import { PLAYER_STORAGE_KEY, loadPlayerSnapshot, recordGameActivity, spendCoins, updatePlayerName } from "@/lib/game/progress";
describe("unified player persistence",()=>{beforeEach(()=>localStorage.clear());it("persists XP, coins, objective and player name",()=>{recordGameActivity("practice","entry",100,["journal-entries"]);updatePlayerName("Mona");const player=loadPlayerSnapshot();expect(localStorage.getItem(PLAYER_STORAGE_KEY)).toBeTruthy();expect(player).toMatchObject({displayName:"Mona",xp:30,coins:10});expect(player.currentObjective.route).toBeTruthy()});it("spends coins only when the balance is sufficient",()=>{recordGameActivity("practice","entry",100,["journal-entries"]);expect(spendCoins(5)).toBe(true);expect(loadPlayerSnapshot().coins).toBe(5);expect(spendCoins(10)).toBe(false);expect(loadPlayerSnapshot().coins).toBe(5)})});

