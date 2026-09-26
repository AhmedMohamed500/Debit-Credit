import {nextCareerActivity, personalCareerMap} from '@/lib/career-entry/engine';
import type {CareerLeagueState} from '@/lib/career-league/model';
import type {SkillId, SkillResult} from '@/lib/career/model';
import type {PlacementResult} from '@/lib/placement/model';

export interface JourneyNextMission {
  kind: 'entry' | 'diagnostic' | 'skill' | 'review';
  route: string;
  skillId: SkillId | null;
  completedSteps: number;
  totalSteps: number;
}

/** One actionable route, derived from the same prerequisites as the career map. */
export function gameHubNextMission(career: CareerLeagueState, passport: SkillResult[], diagnostic: PlacementResult | null): JourneyNextMission {
  if (!career.persona || !career.onboardingComplete) return {kind: 'entry', route: '/onboarding', skillId: null, completedSteps: 0, totalSteps: 0};
  if (!diagnostic) return {kind: 'diagnostic', route: '/career-league/placement', skillId: null, completedSteps: 0, totalSteps: 0};
  const nodes = personalCareerMap(career, passport, diagnostic);
  const completedSteps = nodes.filter(node => node.status === 'practiced' || node.status === 'demonstrated').length;
  const next = nextCareerActivity(nodes);
  if (next?.status === 'available' && next.route) return {kind: 'skill', route: next.route, skillId: next.skillId, completedSteps, totalSteps: nodes.length};
  return {kind: 'review', route: '/career-league/map', skillId: next?.skillId ?? null, completedSteps, totalSteps: nodes.length};
}
