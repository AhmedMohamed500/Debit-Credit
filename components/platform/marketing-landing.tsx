import type {Locale} from '@/types';
import {PlatformNav} from './platform-nav';
import {AccountingPractice,CareerEvidence,CareerJourney,CareerLeagueCompetition,CareerProgression,CompanyWorld,LandingFinalCTA,LandingHero,PersonaSelector} from './landing-sections';

export function MarketingLanding({locale}:{locale:Locale}) {
  return <main className="platform-page marketing-page career-landing">
    <PlatformNav locale={locale} marketing/>
    <LandingHero locale={locale}/>
    <CompanyWorld locale={locale}/>
    <PersonaSelector locale={locale}/>
    <CareerJourney locale={locale}/>
    <AccountingPractice locale={locale}/>
    <CareerLeagueCompetition locale={locale}/>
    <CareerEvidence locale={locale}/>
    <CareerProgression locale={locale}/>
    <LandingFinalCTA locale={locale}/>
  </main>;
}
