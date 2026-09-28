import {describe,expect,it} from 'vitest';
import {initialState,safeLoad} from '@/lib/campaign/director';
import {firstDayDocuments,submitFirstDayDocument} from '@/lib/campaign/first-day';
import {firstShiftMissionProgress,markFirstShiftLedgerReviewed} from '@/lib/campaign/first-shift-hub';

describe('First Shift mission hub progression',()=>{
 it('starts with five visible but unearned stations',()=>{const progress=firstShiftMissionProgress(initialState());expect(progress).toMatchObject({completedCount:0,total:5,level:1,journalComplete:false,ledgerComplete:false});expect(progress.cases).toHaveLength(3);});
 it('derives journal completion from three accepted entries and ledger completion from a real review',()=>{let state=initialState();for(const document of firstDayDocuments)state=submitFirstDayDocument(state,document.id,JSON.stringify(document.expected),1000).state;expect(firstShiftMissionProgress(state)).toMatchObject({completedCount:4,journalComplete:true,ledgerComplete:false});state=markFirstShiftLedgerReviewed(state);expect(firstShiftMissionProgress(state)).toMatchObject({completedCount:5,ledgerComplete:true,level:2});expect(firstShiftMissionProgress(safeLoad(JSON.stringify(state))).ledgerComplete).toBe(true);});
 it('does not award progress or XP merely for opening the ledger before journal completion',()=>{const state=initialState(),reviewed=markFirstShiftLedgerReviewed(state);expect(firstShiftMissionProgress(reviewed)).toMatchObject({completedCount:0,ledgerReviewed:false,ledgerComplete:false});expect(reviewed).toBe(state);expect(reviewed.xp).toBe(state.xp);expect(reviewed.journal).toEqual([]);});
});
