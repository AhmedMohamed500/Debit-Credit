import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {GameHub} from '@/components/platform/game-hub';
import {createCareerLeagueState} from '@/lib/career-league/engine';
import {CAREER_LEAGUE_KEY} from '@/lib/career-league/repository';
import {PLAYER_STORAGE_KEY} from '@/lib/game/progress';
import {LOCAL_CANDIDATE_KEY,SKILL_EVIDENCE_KEY} from '@/lib/career/repository';
import type {SkillEvidence} from '@/lib/career/model';
import {initialState} from '@/lib/campaign/director';
import {GAME_KEY} from '@/lib/campaign/store';
import {FIRST_DAY_KEY} from '@/lib/campaign/first-day';
import {ThemeProvider} from '@/components/platform/theme-provider';
import {THEME_KEY} from '@/lib/platform';

const push=vi.fn();
vi.mock('next/navigation',()=>({usePathname:()=>'/en/game',useRouter:()=>({push})}));
beforeEach(()=>{localStorage.clear();push.mockClear();localStorage.setItem(CAREER_LEAGUE_KEY,JSON.stringify({...createCareerLeagueState(),persona:'student',placementPath:'start-basics',onboardingComplete:true}))});
afterEach(cleanup);
const show=async(locale:'ar'|'en'='en')=>{const view=render(<ThemeProvider><GameHub locale={locale}/></ThemeProvider>);await waitFor(()=>expect(view.container.querySelector('.beginner-world')).toBeInTheDocument());return view};

describe('beginner career world',()=>{
 it('limits the new home to a saved beginner student, retains RTL and LTR, and shows honest roadmap and evidence',async()=>{
  const view=await show('en');
  expect(view.container.querySelector('.beginner-world')).toHaveAttribute('dir','ltr');
  expect(view.container.querySelectorAll('.bcw-company')).toHaveLength(5);
  expect(view.container.querySelectorAll('.bcw-roadmap-node')).toHaveLength(8);
  expect(screen.getByRole('button',{name:/Accounting Foundations/})).toHaveClass('current');
  expect(screen.getByRole('button',{name:/Journal Entries/})).toHaveClass('locked');
  expect(screen.getByRole('button',{name:/Certification Preparation Tracks/})).toHaveClass('planned');
  expect(screen.getAllByText('Unassessed')).toHaveLength(5);
  expect(screen.getByText('DEMO LEAGUE')).toBeInTheDocument();
  expect(screen.getByText(/Kareem · Finance Manager/)).toBeInTheDocument();
  view.unmount();
  await show('ar');
  expect(document.querySelector('.beginner-world')).toHaveAttribute('dir','rtl');
  expect(screen.getByText('دوري تجريبي')).toBeInTheDocument();
 });
 it('uses current company and accounting routes, and previews locked requirements',async()=>{
  await show();
  fireEvent.click(screen.getByRole('button',{name:/Mizan Trading Small Local Business/}));
  expect(push).toHaveBeenCalledWith('/en/game/first-shift');
  fireEvent.click(screen.getByRole('button',{name:/Delta Commerce Structured Medium Company/}));
  const preview=screen.getByRole('dialog',{name:'Delta Commerce'});
  expect(within(preview).getByText('Required skills')).toBeInTheDocument();
  expect(within(preview).getByText(/Junior Accountant Promotion Review/)).toBeInTheDocument();
  expect(within(preview).getByText(/Mission still required/)).toBeInTheDocument();
  expect(within(preview).queryByRole('link',{name:'Enter Mizan Trading'})).not.toBeInTheDocument();
  fireEvent.keyDown(window,{key:'Escape'});
  expect(screen.queryByRole('dialog',{name:'Delta Commerce'})).not.toBeInTheDocument();
  const tools=document.querySelector('.bcw-tools')!;
  expect(within(tools as HTMLElement).getByRole('link',{name:'Ledger'})).toHaveAttribute('href','/en/ledger');
  expect(within(tools as HTMLElement).getByRole('link',{name:'Trial Balance'})).toHaveAttribute('href','/en/trial-balance');
  expect(within(tools as HTMLElement).getByRole('link',{name:'Nature of Accounts'})).toHaveAttribute('href','/en/account-guide');
 });
 it('runs the beginner transaction investigation and saves only game practice',async()=>{
  const view=await show();
  fireEvent.click(screen.getByRole('button',{name:'Inspect owner capital receipt'}));
  for(const answer of ['The owner invested capital','Cash and Owner Capital','Cash and equity both increase','No, both accounts increased'])fireEvent.click(screen.getByRole('button',{name:answer}));
  expect(screen.getByText('Transaction understood')).toBeInTheDocument();
  const saved=JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)??'{}');
  expect(saved.activities['practice:beginner-owner-capital']).toMatchObject({bestScore:100,kind:'practice'});
  expect(localStorage.getItem('debit-credit-skill-evidence-v1')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Back to world'}));
  expect(within(document.querySelector('.bcw-mission') as HTMLElement).getByText('Completed')).toBeInTheDocument();
  view.unmount();
  await show();
  expect(within(document.querySelector('.bcw-mission') as HTMLElement).getByText('Completed')).toBeInTheDocument();
 });
 it('records a wrong choice as lower practice accuracy without professional evidence',async()=>{
  await show();
  fireEvent.click(screen.getByRole('button',{name:'Start mission'}));
  fireEvent.click(screen.getByRole('button',{name:'The company earned sales revenue'}));
  expect(screen.getByRole('alert')).toHaveTextContent('Look at the source document');
  for(const answer of ['The owner invested capital','Cash and Owner Capital','Cash and equity both increase','No, both accounts increased'])fireEvent.click(screen.getByRole('button',{name:answer}));
  const saved=JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)??'{}');
  expect(saved.activities['practice:beginner-owner-capital']).toMatchObject({bestScore:80,attempts:2});
  expect(localStorage.getItem(SKILL_EVIDENCE_KEY)).toBeNull();
 });
 it('retains the existing dark theme preference on the student home',async()=>{
  await show();
  fireEvent.click(screen.getByTitle('dark'));
  await waitFor(()=>expect(document.documentElement.dataset.theme).toBe('dark'));
  expect(localStorage.getItem(THEME_KEY)).toBe('dark');
 });
 it('updates the company map from saved unlock evidence without claiming future work is playable',async()=>{
  const candidate='current-candidate';
  localStorage.setItem(LOCAL_CANDIDATE_KEY,candidate);
  const evidence=(skillId:'document-analysis'|'journal-entries'):SkillEvidence=>({version:1,evidenceId:`proof-${skillId}`,localCandidateId:candidate,activityId:`case-${skillId}`,activityType:'case',chapterId:1,missionId:'first-shift',skillId,roleRelevance:['junior-accountant'],difficulty:1,score:90,accuracy:90,firstAttemptCorrect:true,attempts:1,hintsUsed:0,independentCompletion:true,criticalErrors:0,completedAt:'2026-09-18T00:00:00.000Z',source:'mission',assessmentIntegrity:'demonstrated',titleAr:'دليل',titleEn:'Evidence'});
  localStorage.setItem(SKILL_EVIDENCE_KEY,JSON.stringify([evidence('document-analysis'),evidence('journal-entries')]));
  localStorage.setItem(GAME_KEY,JSON.stringify({...initialState(),legacy:{[FIRST_DAY_KEY]:{completed:['supplier-invoice','customer-receipt','office-expense']}}}));
  localStorage.setItem(CAREER_LEAGUE_KEY,JSON.stringify({...createCareerLeagueState(),persona:'student',placementRecommendation:1,assessmentResults:{'promotion-1':'pass'}}));
  const view=await show();
  await waitFor(()=>expect(view.container.querySelector('.bcw-company-2')).toHaveClass('current'));
  expect(view.container.querySelector('.bcw-company-1')).toHaveClass('completed');
  expect(view.container.querySelector('.bcw-map-track>div')).toHaveStyle('--bcw-progress:25%');
  fireEvent.click(screen.getByRole('button',{name:/Delta Commerce Structured Medium Company/}));
  expect(screen.getByText(/Requirements met · playable company work is planned/)).toBeInTheDocument();
 });
 it('does not count evidence stored for a different local candidate',async()=>{
  const foreign:SkillEvidence={version:1,evidenceId:'foreign-proof',localCandidateId:'someone-else',activityId:'foreign-case',activityType:'case',chapterId:1,missionId:'other',skillId:'account-classification',roleRelevance:['junior-accountant'],difficulty:1,score:100,accuracy:100,firstAttemptCorrect:true,attempts:1,hintsUsed:0,independentCompletion:true,criticalErrors:0,completedAt:'2026-09-18T00:00:00.000Z',source:'mission',assessmentIntegrity:'demonstrated',titleAr:'دليل آخر',titleEn:'Other evidence'};
  localStorage.setItem(SKILL_EVIDENCE_KEY,JSON.stringify([foreign]));
  await show();
  const skills=document.querySelector('.bcw-skills')!;
  expect(within(skills as HTMLElement).getAllByText('Unassessed')).toHaveLength(5);
 });
 it('keeps graduate on the existing Game Hub',async()=>{
  localStorage.setItem(CAREER_LEAGUE_KEY,JSON.stringify({...createCareerLeagueState(),persona:'graduate',placementRecommendation:1}));
  const view=render(<GameHub locale="en"/>);
  await waitFor(()=>expect(view.container.querySelector('.command-game')).toBeInTheDocument());
  expect(view.container.querySelector('.beginner-world')).not.toBeInTheDocument();
 });
});
