import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {PromotionAssessmentScreen} from '@/components/platform/career-league';
import {initialState} from '@/lib/campaign/director';
import {closeFirstDayDocument,completeFirstDayIntro,enterFirstDayDesk,firstDayDocuments,submitFirstDayDocument} from '@/lib/campaign/first-day';
import {GAME_KEY} from '@/lib/campaign/store';
import {CAREER_LEAGUE_KEY} from '@/lib/career-league/repository';
import {SKILL_EVIDENCE_KEY} from '@/lib/career/repository';
import {promotionCase} from '@/lib/promotion-assessment';

vi.mock('next/navigation',()=>({usePathname:()=>'/ar/career-league/promotion'}));

function completedFirstShift(){let state=enterFirstDayDesk(completeFirstDayIntro(initialState()));for(const document of firstDayDocuments)state=submitFirstDayDocument(state,document.id,JSON.stringify(document.expected),1000).state;return closeFirstDayDocument(state)}

beforeEach(()=>{localStorage.clear();localStorage.setItem(GAME_KEY,JSON.stringify(completedFirstShift()))});
afterEach(cleanup);

describe('Promotion assessment UI',()=>{
 it('plays the complete Arabic connected case and persists a passing result',async()=>{
  render(<PromotionAssessmentScreen locale="ar"/>);
  const open=await screen.findByRole('button',{name:'افتح ملف التقييم'});
  fireEvent.click(open);
  for(const item of promotionCase.evidence)fireEvent.click(screen.getByRole('button',{name:item.label.ar}));
  fireEvent.click(screen.getByRole('button',{name:'أوقف الفرق واطلب تصحيحًا مؤيدًا'}));
  fireEvent.click(screen.getByRole('button',{name:'سجّل التحصيل المؤيد وخفّض العميل'}));
  for(const item of promotionCase.items)fireEvent.change(screen.getByLabelText(item.title.ar),{target:{value:item.correctTreatment}});
  expect(screen.getByText('متطابق ✓')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'وثّق البنود، جهّز قيود الدفاتر، وأرسل للمراجعة'}));
  fireEvent.click(screen.getByRole('button',{name:'سلّم ملف التقييم'}));
  await screen.findByRole('heading',{name:'اجتزت تقييم الترقية'});
  await waitFor(()=>expect(JSON.parse(localStorage.getItem(CAREER_LEAGUE_KEY)!)).toMatchObject({assessmentResults:{'promotion-1':'pass'}}));
  const evidence=JSON.parse(localStorage.getItem(SKILL_EVIDENCE_KEY)!);
  expect(evidence.map((item:{skillId:string})=>item.skillId)).toEqual(expect.arrayContaining(['document-analysis','journal-entries','bank-reconciliation']));
  expect(screen.getByText(/ليست اعتمادًا مهنيًا أو خبرة عمل/)).toBeInTheDocument();
 });
});
