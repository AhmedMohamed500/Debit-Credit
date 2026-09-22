import{describe,expect,it}from'vitest';
import{placementTasks,tasksForPersona}from'@/lib/placement/catalog';
import{createPlacementState,evaluatePlacement,migratePlacementState}from'@/lib/placement/engine';

const correct=(persona:'student'|'graduate'|'working-accountant')=>Object.fromEntries(tasksForPersona(persona).map(task=>[task.id,task.correctIndex]));
describe('persona placement and career diagnostic',()=>{
 it('uses a short student check, practical graduate coverage, and a ten-case working diagnostic',()=>{expect(tasksForPersona('student')).toHaveLength(4);expect(tasksForPersona('graduate')).toHaveLength(9);expect(tasksForPersona('working-accountant')).toHaveLength(10);expect(new Set(placementTasks.map(task=>task.id)).size).toBe(placementTasks.length)});
 it('recommends foundation refresh conservatively without granting evidence',()=>{const result=evaluatePlacement('graduate',{});expect(result.recommendedTrack).toBe('foundation-refresh');expect(result.score).toBe(0);expect(result.localOnly).toBe(true);expect(result.grantsEvidence).toBe(false)});
 it('recommends the graduate practical track when practical basics are supported',()=>{const result=evaluatePlacement('graduate',correct('graduate'));expect(result.recommendedTrack).toBe('graduate-practical');expect(result.strengths).toContain('ap');expect(result.strengths).toContain('bank');expect(result.gaps).toEqual([])});
 it('distinguishes a careful working accountant from an unsupported corporate claim',()=>{const strong=evaluatePlacement('working-accountant',correct('working-accountant')),rushed=evaluatePlacement('working-accountant',{});expect(strong.recommendedTrack).toBe('general-accounting-practice');expect(rushed.recommendedTrack).toBe('corporate-bridge-foundation');expect(strong.score).toBeGreaterThan(rushed.score);expect(strong).not.toHaveProperty('jobTitle')});
 it('migrates only honest local results',()=>{expect(migratePlacementState({version:1,persona:'graduate',answers:{x:1},result:{score:100,localOnly:false,grantsEvidence:true}})).toEqual({...createPlacementState(),persona:'graduate',answers:{x:1}})});
});
