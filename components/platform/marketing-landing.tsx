import type {Locale} from '@/types';
import {PlatformNav} from './platform-nav';
import {CareerLandingV4} from './landing-career-v4';

export function MarketingLanding({locale}:{locale:Locale}) {
  return <main className="platform-page marketing-page career-landing">
    <PlatformNav locale={locale} marketing/>
    <CareerLandingV4 locale={locale}/>
  </main>;
}
