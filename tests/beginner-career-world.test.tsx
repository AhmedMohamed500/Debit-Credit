import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {GameHub} from '@/components/platform/game-hub';
import {createCareerLeagueState} from '@/lib/career-league/engine';
import {CAREER_LEAGUE_KEY} from '@/lib/career-league/repository';
import {PLAYER_STORAGE_KEY} from '@/lib/game/progress';
import {SKILL_EVIDENCE_KEY} from '@/lib/career/repository';
import type {SkillEvidence} from '@/lib/career/model';
import {ThemeProvider} from '@/components/platform/theme-provider';

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
  expect(within(preview).getByText(/promotion-1/)).toBeInTheDocument();
  expect(within(preview).queryByRole('link',{name:'Enter Mizan Trading'})).not.toBeInTheDocument();
  const tools=document.querySelector('.bcw-tools')!;
  expect(within(tools as HTMLElement).getByRole('link',{name:'Ledger'})).toHaveAttribute('href','/en/ledger');
  expect(within(tools as HTMLElement).getByRole('link',{name:'Trial Balance'})).toHaveAttribute('href','/en/trial-balance');
  expect(within(tools as HTMLElement).getByRole('link',{name:'Nature of Accounts'})).toHaveAttribute('href','/en/account-guide');
 });
 it('runs the beginner transaction investigation and saves only game practice',async()=>{
  await show();
  fireEvent.click(screen.getByRole('button',{name:/Start mission/}));
  for(const answer of ['The owner invested capital','Cash and Owner Capital','Cash and equity both increase','No, both accounts increased'])fireEvent.click(screen.getByRole('button',{name:answer}));
  expect(screen.getByText('Transaction understood')).toBeInTheDocument();
  const saved=JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)??'{}');
  expect(saved.activities['practice:beginner-owner-capital']).toMatchObject({bestScore:100,kind:'practice'});
  expect(localStorage.getItem('debit-credit-skill-evidence-v1')).toBeNull();
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
