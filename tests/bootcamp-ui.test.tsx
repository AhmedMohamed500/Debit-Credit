import{afterEach,beforeEach,describe,expect,it,vi}from'vitest';
import{cleanup,render,screen}from'@testing-library/react';
import{AccountingBootcamp}from'@/components/platform/accounting-bootcamp';

vi.mock('next/navigation',()=>({usePathname:()=>'/en/bootcamp'}));
beforeEach(()=>localStorage.clear());afterEach(cleanup);

describe('Accounting Bootcamp UI',()=>{
 it('renders the ten-station English practice world with Mizan locked',()=>{const{container}=render(<AccountingBootcamp locale="en"/>);expect(container.querySelector('main')).toHaveAttribute('dir','ltr');expect(screen.getByRole('heading',{name:'Your first day as an accountant starts here.'})).toBeInTheDocument();expect(screen.getByRole('navigation',{name:'Bootcamp missions'}).querySelectorAll('button')).toHaveLength(10);expect(screen.getByText('Mizan Trading · First Company')).toBeInTheDocument();expect(screen.getAllByText('Locked').length).toBeGreaterThan(0)});
 it('renders Arabic RTL and exposes the full Account City return route in its mission catalog',()=>{const{container}=render(<AccountingBootcamp locale="ar"/>);expect(container.querySelector('main')).toHaveAttribute('dir','rtl');expect(screen.getByRole('heading',{name:'أول خطوة في شغل المحاسب تبدأ هنا.'})).toBeInTheDocument();expect(screen.getByRole('navigation',{name:'مهام المعسكر'}).querySelectorAll('button')).toHaveLength(10)});
});
