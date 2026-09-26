import {redirect} from 'next/navigation';
import type {Locale} from '@/types';

/** Preserve old bank-zone links while leading directly to the playable workpaper. */
export default async function Page({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  redirect(`/${locale}/game/bank-reconciliation`);
}
