import{afterEach,beforeEach,describe,expect,it,vi}from'vitest';import{cleanup,fireEvent,render,screen,waitFor}from'@testing-library/react';
import{MarketingLanding}from'@/components/platform/marketing-landing';import{PlatformOnboarding}from'@/components/platform/onboarding';import{MobileGameNav}from'@/components/game/mobile-game-nav';import{ThemeProvider,ThemeToggle}from'@/components/platform/theme-provider';import{AcademyPlatform}from'@/components/platform/academy-platform';import{ChallengesPlatform}from'@/components/platform/challenges-platform';import{GameHub}from'@/components/platform/game-hub';import{THEME_KEY}from'@/lib/platform';import{PLATFORM_KEY}from'@/lib/platform/repository';
vi.mock('next/navigation',()=>({usePathname:()=>'/en'}));
beforeEach(()=>{localStorage.clear();document.documentElement.dataset.theme=''});afterEach(cleanup);
describe('platform UI',()=>{
 it('uses clean text-free artwork and preserves the five career and three feature routes',()=>{
   const {container}=render(<MarketingLanding locale="en"/>);
   expect(screen.getByRole('heading',{name:'Learn accounting through work and build your career step by step'})).toBeInTheDocument();
   expect(container.querySelector('.cl4-hero-visual img')).toHaveAttribute('src',expect.stringContaining('career-league-hero-v2.png'));
   expect(container.querySelector('.cl4-journey-visual img')).toHaveAttribute('src',expect.stringContaining('career-journey-world-v2.webp'));
   expect(container.querySelectorAll('.cl4-feature-image img')).toHaveLength(3);
   expect(container.querySelector('.cl4-final-image img')).toHaveAttribute('src',expect.stringContaining('career-future-v2.webp'));
   const stages=[['Accounting Bootcamp','/en/bootcamp'],['Mizan Trading','/en/game'],['Structured Company','/en/career-league/companies'],['Month-End Close','/en/game/month-end'],['Finance Leadership','/en/career-league/promotion']];
   stages.forEach(([name,href])=>expect(screen.getByRole('heading',{name}).closest('a')).toHaveAttribute('href',href));
   const features=[['Try competition','/en/leaderboard'],['View your CV','/en/career-profile/cv'],['Browse skills','/en/career-profile/skills']];
   features.forEach(([name,href])=>expect(screen.getByRole('link',{name})).toHaveAttribute('href',href));
 });
 it('renders accessible Arabic headings and real calls to action',()=>{
   render(<MarketingLanding locale="ar"/>);
   expect(screen.getByRole('heading',{name:'تعلّم المحاسبة بالشغل، وابنِ مستقبلك خطوة بخطوة'})).toBeInTheDocument();
   expect(screen.getAllByRole('link',{name:'ابدأ مجانًا'}).map(link=>link.getAttribute('href'))).toContain('/ar/onboarding');
   expect(screen.getByRole('heading',{name:'رحلتك المهنية في خمس مراحل'})).toBeInTheDocument();
   expect(screen.getByRole('link',{name:/ميزان للتجارة/})).toHaveAttribute('href','/ar/game');
   expect(screen.getByRole('link',{name:/الإقفال الشهري/})).toHaveAttribute('href','/ar/game/month-end');
   expect(screen.getByRole('link',{name:'ابدأ المنافسة'})).toHaveAttribute('href','/ar/leaderboard');
   expect(screen.getByRole('link',{name:'شاهد سيرتك'})).toHaveAttribute('href','/ar/career-profile/cv');
   expect(screen.getByRole('link',{name:'تصفح المهارات'})).toHaveAttribute('href','/ar/career-profile/skills');
 });
 it('labels personas as examples and keeps skill claims truthful',()=>{
   const view=render(<MarketingLanding locale="en"/>);
   expect(screen.getByRole('heading',{name:'Start from where you really are'})).toBeInTheDocument();
   expect(screen.getByText(/Illustrative examples, not reviews/)).toBeInTheDocument();
   expect(screen.getByText(/See what you practised, demonstrated/)).toBeInTheDocument();
   expect(screen.queryByText(/Deloitte|KPMG|PwC|EY/)).not.toBeInTheDocument();
   view.rerender(<MarketingLanding locale="ar"/>);
   expect(screen.getByRole('heading',{name:'ابدأ من مكانك الحقيقي'})).toBeInTheDocument();
   expect(screen.getByText(/نماذج توضيحية وليست تقييمات/)).toBeInTheDocument();
 });
 it('renders Arabic academy content and leaves Closing locked',()=>{render(<AcademyPlatform locale="ar"/>);expect(screen.getByRole('heading',{name:'اتعلّمها. تدرّب عليها. استخدمها في الشغل.'})).toBeInTheDocument();expect(screen.getByText(/الإقفال/).closest('article')).toHaveClass('locked')});
 it('exposes real challenge routes and labels the boss as locked',()=>{render(<ChallengesPlatform locale="en"/>);expect(screen.getAllByRole('link',{name:/Play challenge/})).toHaveLength(2);expect(screen.getByText('Month-End Crisis').closest('article')).toHaveClass('locked')});
 it('persists dark theme and applies it',async()=>{render(<ThemeProvider><ThemeToggle/></ThemeProvider>);fireEvent.click(screen.getByTitle('dark'));await waitFor(()=>expect(document.documentElement.dataset.theme).toBe('dark'));expect(localStorage.getItem(THEME_KEY)).toBe('dark')});
 it('restores a saved theme preference',async()=>{localStorage.setItem(THEME_KEY,'dark');render(<ThemeProvider><ThemeToggle/></ThemeProvider>);await waitFor(()=>expect(screen.getByTitle('dark')).toHaveAttribute('aria-pressed','true'))});
 it('stores student career entry and sends the foundation path to Bootcamp without granting evidence',()=>{render(<PlatformOnboarding locale="en"/>);fireEvent.click(screen.getByRole('button',{name:/Accounting Student/}));fireEvent.click(screen.getByRole('button',{name:/Get first accounting job/}));fireEvent.click(screen.getByRole('button',{name:/Start from the beginning/}));const enter=screen.getByRole('link',{name:/Enter Accounting Bootcamp/});expect(enter).toHaveAttribute('href','/en/bootcamp');enter.addEventListener('click',event=>event.preventDefault());fireEvent.click(enter);expect(JSON.parse(localStorage.getItem(PLATFORM_KEY)??'{}')).toMatchObject({experience:'student',goal:'career',onboardingComplete:true});expect(localStorage.getItem(PLATFORM_KEY)).not.toMatch(/verified|evidence/i)});
 it('provides five career-game mobile destinations in both directions',()=>{const view=render(<MobileGameNav locale="en"/>);expect(screen.getByRole('navigation',{name:'Mobile navigation'}).querySelectorAll('a')).toHaveLength(5);expect(screen.getByRole('link',{name:'League'})).toHaveAttribute('href','/en/leaderboard');expect(screen.getByRole('link',{name:'Profile'})).toHaveAttribute('href','/en/profile');view.rerender(<MobileGameNav locale="ar"/>);expect(screen.getByRole('navigation',{name:'تنقل الهاتف'})).toBeInTheDocument()});
 it('renders one full-screen Game Hub shell with canonical accounting routes',()=>{const{container}=render(<GameHub locale="en"/>);expect(container.querySelector('main')).toHaveClass('command-game');expect(container.querySelectorAll('.platform-nav')).toHaveLength(1);expect(screen.getByRole('region',{name:'Interactive Mizan Trading map'})).toBeInTheDocument();expect(screen.getByRole('link',{name:/Suppliers/})).toHaveAttribute('href','/en/game/suppliers');expect(screen.getByRole('link',{name:/Customers/})).toHaveAttribute('href','/en/game/customers');expect(screen.getByRole('link',{name:/Bank/})).toHaveAttribute('href','/en/game/bank');expect(screen.getByRole('link',{name:/Logistics/})).toHaveAttribute('href','/en/game/logistics');expect(screen.getByRole('link',{name:/Month End/})).toHaveAttribute('href','/en/game/month-end');expect(screen.getByRole('link',{name:'Ledger'})).toHaveAttribute('href','/en/ledger');expect(screen.getByRole('link',{name:'Nature of Accounts'})).toHaveAttribute('href','/en/account-guide');expect(screen.getByRole('link',{name:'Journal'})).toHaveAttribute('href','/en/journal');expect(screen.getByRole('link',{name:'Trial Balance'})).toHaveAttribute('href','/en/trial-balance');expect(screen.getByText('EMPLOYER PREVIEW · DEMO')).toBeInTheDocument()});
});
