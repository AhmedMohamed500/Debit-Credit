import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {createHash} from 'node:crypto';
import {accountLearningGuide} from '@/data/account-learning-guide';
import {AccountCity} from '@/components/academy/account-city';
import {ACCOUNT_CITY_KEY,cityCounts,cityTotal,featuredAccounts,readAccountCityProgress} from '@/lib/account-city';
import {PLAYER_STORAGE_KEY} from '@/lib/game/progress';
import {SKILL_EVIDENCE_KEY} from '@/lib/career/repository';
import {GAME_KEY} from '@/lib/campaign/store';
import {ThemeProvider} from '@/components/platform/theme-provider';

const push=vi.fn();
vi.mock('next/navigation',()=>({useRouter:()=>({push}),usePathname:()=>'/ar/account-guide'}));
beforeEach(()=>{localStorage.clear();push.mockClear();window.history.replaceState({},'','/ar/account-guide')});
afterEach(cleanup);
const show=(locale:'ar'|'en'='ar')=>render(<ThemeProvider><AccountCity locale={locale}/></ThemeProvider>);

describe('Account City authoritative chart',()=>{
 it('uses all 197 existing records, family counts, codes, and movement rules',()=>{
  expect(cityTotal).toBe(197);
  expect(cityCounts).toEqual({assets:62,liabilities:40,equity:10,revenue:23,expenses:54,contra:8});
  expect(new Set(accountLearningGuide.map(item=>item.code)).size).toBe(197);
  for(const account of accountLearningGuide){expect(account.increaseSideAr).toBe(account.normalEn==='Debit'?'مدين':'دائن');expect(account.decreaseSideAr).toBe(account.normalEn==='Debit'?'دائن':'مدين')}
  const projection=accountLearningGuide.map(item=>[item.code,item.nameAr,item.nameEn,item.category,item.normalEn,item.increaseSideAr,item.decreaseSideAr,item.statementAr]);
  expect(createHash('sha256').update(JSON.stringify(projection)).digest('hex')).toBe('94df44a8aa19cfc5ecdffe1b5ac74a88b365a20ff47606ac8c8062fb88a2d697');
 });
 it('renders a full game city with six semantic districts and no book layout',()=>{
  const view=show();expect(view.container.querySelector('.account-city')).toHaveAttribute('dir','rtl');
  expect(screen.getByRole('heading',{name:'مدينة الحسابات'})).toBeInTheDocument();
  expect(view.container.querySelectorAll('.ac-district')).toHaveLength(6);
  expect(view.container.querySelector('.manual-book')).toBeNull();
  expect(screen.getAllByText(/كل عملية بتحكي قصة/)).toHaveLength(2);
  expect(screen.getByRole('heading',{name:'تقدمك في مدينة الحسابات'})).toBeInTheDocument();
 });
 it('visits a district, discovers a real account, and keeps exploration out of Skill Passport',async()=>{
  show();fireEvent.click(screen.getByRole('button',{name:/حي الأصول · 62 حساب/}));
  expect(screen.getByRole('button',{name:/العودة للمدينة/})).toBeInTheDocument();
  expect(readAccountCityProgress().visited).toEqual(['assets']);
  fireEvent.click(within(document.querySelector('.ac-building-list') as HTMLElement).getByRole('button',{name:/الصندوق/}));
  expect(screen.getByRole('dialog',{name:/فحص الحساب: الصندوق/})).toBeInTheDocument();
  expect(readAccountCityProgress().discovered).toContain('1100');
  expect(localStorage.getItem(SKILL_EVIDENCE_KEY)).toBeNull();
  expect(localStorage.getItem(PLAYER_STORAGE_KEY)).toBeNull();
  fireEvent.keyDown(window,{key:'Escape'});
  expect(screen.queryByRole('dialog',{name:/فحص الحساب/})).not.toBeInTheDocument();
 });
 it('opens the account inspector in steps, its real documents, movement, and a practice-only mini mission',async()=>{
  show('en');fireEvent.click(screen.getByRole('button',{name:'Start mission'}));
  const dialog=screen.getByRole('dialog',{name:/Account Inspector: Cash on hand/});
  fireEvent.click(within(dialog).getByRole('button',{name:/Continue investigation/}));
  expect(within(dialog).getByText('Where it appears in the statements')).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button',{name:/Continue investigation/}));
  expect(within(dialog).getByText('Debit')).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button',{name:/Money\/value leaves/}));
  expect(dialog.querySelector('.ac-flow')).toHaveClass('decrease');
  for(let index=0;index<3;index++)fireEvent.click(within(dialog).getByRole('button',{name:/Continue investigation/}));
  fireEvent.click(within(dialog).getByRole('button',{name:/سند قبض/}));
  expect(within(dialog).getByRole('status')).toHaveTextContent('سند قبض');
  fireEvent.click(within(dialog).getByRole('button',{name:/Continue investigation/}));
  expect(within(dialog).queryByRole('link',{name:/Open canonical Journal/})).not.toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button',{name:/Play mini mission/}));
  const mission=screen.getByRole('dialog',{name:'Account City mission'});
  fireEvent.click(within(mission).getByRole('button',{name:'Debit'}));
  expect(within(mission).getByText(/no professional Skill Passport claim/)).toBeInTheDocument();
  expect(readAccountCityProgress().practiced).toContain('1100');
  fireEvent.click(within(mission).getByRole('button',{name:'Continue exploring'}));
  expect(within(dialog).getByRole('link',{name:/Open canonical Journal/})).toHaveAttribute('href','/en/journal');
  expect(JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)??'{}').activities['practice:account-city-1100']).toBeDefined();
  expect(JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)??'{}').coins).toBe(0);
  expect(localStorage.getItem(SKILL_EVIDENCE_KEY)).toBeNull();
 });
 it('scores an incorrect mini-mission attempt conservatively without coins or professional evidence',()=>{
  show('en');fireEvent.click(screen.getByRole('button',{name:'Start mission'}));
  const inspector=screen.getByRole('dialog',{name:/Account Inspector: Cash on hand/});
  for(let step=0;step<6;step++)fireEvent.click(within(inspector).getByRole('button',{name:/Continue investigation/}));
  fireEvent.click(within(inspector).getByRole('button',{name:'Play mini mission'}));
  const mission=screen.getByRole('dialog',{name:'Account City mission'});
  fireEvent.click(within(mission).getByRole('button',{name:'Credit'}));
  expect(within(mission).getByRole('alert')).toHaveTextContent('try again');
  fireEvent.click(within(mission).getByRole('button',{name:'Debit'}));
  const saved=JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)??'{}');
  expect(saved.activities['practice:account-city-1100']).toMatchObject({bestScore:50,attempts:2,coinsAwarded:0});
  expect(saved.coins).toBe(0);
  expect(localStorage.getItem(SKILL_EVIDENCE_KEY)).toBeNull();
 });
 it('searches Arabic, English, code and category as city destinations',()=>{
  show();fireEvent.click(screen.getByRole('button',{name:'بحث'}));
  const dialog=screen.getByRole('dialog',{name:'ابحث في حسابات المدينة'}),input=within(dialog).getByRole('textbox');
  for(const [term,expected] of [['الصندوق','1100'],['Bank','1110'],['2100','2100'],['liabilities','2100']]){
   fireEvent.change(input,{target:{value:term}});
   expect(within(dialog).getAllByRole('button').some(button=>button.textContent?.includes(expected))).toBe(true);
  }
  fireEvent.change(input,{target:{value:'2100'}});
  fireEvent.click(within(dialog).getByRole('button',{name:/2100/}));
  expect(screen.getByRole('dialog',{name:/فحص الحساب: الموردون/})).toBeInTheDocument();
 });
 it('runs the three business-story quests with deterministic game-only rewards',()=>{
  show('en');
  fireEvent.click(screen.getByRole('button',{name:/Follow the Money/}));
  let mission=screen.getByRole('dialog',{name:'Account City mission'});
  fireEvent.click(within(mission).getByRole('button',{name:'Sales revenue'}));
  fireEvent.click(within(mission).getByRole('button',{name:'Accounts receivable'}));
  fireEvent.click(within(mission).getByRole('button',{name:'Bank'}));
  fireEvent.click(within(mission).getByRole('button',{name:'Accounts payable'}));
  fireEvent.click(within(mission).getByRole('button',{name:'Office supplies expense'}));
  fireEvent.click(within(mission).getByRole('button',{name:'Cash on hand'}));
  expect(readAccountCityProgress().quests).toContain('follow-money');
  fireEvent.click(within(mission).getByRole('button',{name:'Continue exploring'}));
  fireEvent.click(screen.getByRole('button',{name:/Debit or Credit\?/}));
  mission=screen.getByRole('dialog',{name:'Account City mission'});
  for(const choice of ['Rent expense and Cash','Debit','Credit'])fireEvent.click(within(mission).getByRole('button',{name:choice}));
  expect(readAccountCityProgress().quests).toContain('debit-credit');
  fireEvent.click(within(mission).getByRole('button',{name:'Continue exploring'}));
  fireEvent.click(screen.getByRole('button',{name:/Boss: Build the Transaction/}));
  mission=screen.getByRole('dialog',{name:'Account City mission'});
  for(const choice of ['Equipment and Accounts payable','Debit','Credit'])fireEvent.click(within(mission).getByRole('button',{name:choice}));
  expect(within(mission).getByText(/Dr Property, plant and equipment/)).toBeInTheDocument();
  expect(readAccountCityProgress().quests).toContain('build-transaction');
  expect(localStorage.getItem(SKILL_EVIDENCE_KEY)).toBeNull();
 });
 it('completes the six district examples exactly once and restores discovery after remount',async()=>{
  const view=show('en');
  for(const [id,label] of [['assets','Asset District'],['liabilities','Liability District'],['equity','Equity District'],['revenue','Revenue District'],['expenses','Expense District'],['contra','Contra Accounts District']] as const){
   fireEvent.click(screen.getByRole('button',{name:new RegExp(`${label} ·`)}));
   fireEvent.click(screen.getByRole('button',{name:'Play district example'}));
   const mission=screen.getByRole('dialog',{name:'Account City mission'});
   fireEvent.click(within(mission).getByRole('button',{name:featuredAccounts(id)[0].normalEn}));
   fireEvent.click(within(mission).getByRole('button',{name:'Continue exploring'}));
   fireEvent.click(screen.getByRole('button',{name:'Back to city'}));
  }
  expect(readAccountCityProgress().quests).toContain('six-families');
  expect(readAccountCityProgress().familyExamples).toHaveLength(6);
  const activity=JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)??'{}').activities['practice:account-city-six-families'];
  expect(activity).toBeDefined();
  expect(JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)??'{}').coins).toBe(0);
  view.unmount();show('en');
  await waitFor(()=>expect(screen.getByText(/6\/6 districts visited/)).toBeInTheDocument());
  expect(localStorage.getItem(SKILL_EVIDENCE_KEY)).toBeNull();
 });
 it('restores contextual First Shift account while preserving the draft and case storage',async()=>{
  const saved='{"active":{"draft":"cash debit 2500"},"legacy":{"case":"office-expense"}}';
  localStorage.setItem(GAME_KEY,saved);window.history.replaceState({},'','/ar/account-guide?return=first-day&document=office-expense&account=cash');
  show();await waitFor(()=>expect(screen.getByRole('dialog',{name:/فحص الحساب: الصندوق/})).toBeInTheDocument());
  expect(localStorage.getItem(GAME_KEY)).toBe(saved);
  expect(screen.getByRole('button',{name:'العودة إلى أول وردية'})).toBeInTheDocument();
  expect(readAccountCityProgress().discovered).toContain('1100');
 });
 it('keeps English LTR, canonical tool routes, and light theme control',async()=>{
  const view=show('en');expect(view.container.querySelector('.account-city')).toHaveAttribute('dir','ltr');
  expect(screen.getByRole('link',{name:'Ledger'})).toHaveAttribute('href','/en/ledger');
  expect(screen.getByRole('link',{name:'Trial Balance'})).toHaveAttribute('href','/en/trial-balance');
  expect(screen.getByRole('link',{name:'Financial Statements'})).toHaveAttribute('href','/en/financial-statements');
  fireEvent.click(screen.getByTitle('light'));await waitFor(()=>expect(document.documentElement.dataset.theme).toBe('light'));
  expect(localStorage.getItem(ACCOUNT_CITY_KEY)).toBeNull();
 });
});
