import {describe,expect,it} from 'vitest';
import {createCareerLeagueState} from '@/lib/career-league/engine';
import {gameHubNextMission} from '@/lib/platform/journey';
import type {PlacementResult} from '@/lib/placement/model';

const diagnostic: PlacementResult = {score: 50, strengths: ['classification'], gaps: ['bank'], recommendedTrack: 'general-accounting-practice', explanation: {ar: 'نتيجة محلية', en: 'Local result'}, localOnly: true, grantsEvidence: false};

describe('connected product journey', () => {
  it('sends first-time visitors to career entry before diagnostics or missions', () => {
    expect(gameHubNextMission(createCareerLeagueState(), [], null)).toMatchObject({kind: 'entry', route: '/onboarding'});
  });

  it('requires the diagnostic after selecting a persona and target', () => {
    const career = {...createCareerLeagueState(), persona: 'graduate' as const, targetRoleId: 'general-accountant' as const, onboardingComplete: true};
    expect(gameHubNextMission(career, [], null)).toMatchObject({kind: 'diagnostic', route: '/career-league/placement'});
  });

  it('derives one playable next action from career-map prerequisites, not a diagnostic skill claim', () => {
    const career = {...createCareerLeagueState(), persona: 'working-accountant' as const, targetRoleId: 'general-accountant' as const, onboardingComplete: true};
    const next = gameHubNextMission(career, [], diagnostic);
    expect(next.kind).toBe('skill');
    expect(next.route).toMatch(/^\//);
    expect(next.completedSteps).toBe(0);
    expect(next.totalSteps).toBeGreaterThan(0);
  });
});
