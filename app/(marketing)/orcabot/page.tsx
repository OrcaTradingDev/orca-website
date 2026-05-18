import { Metadata } from 'next'
import {
  OrcabotHero,
  ProblemSection,
  SolutionSection,
  HowItWorksSection,
  DifferencesSection,
  ReceiveSection,
  TestimonialSection,
  BeginnerSection,
  ExpectationsSection,
  WhoItIsForSection,
  OrcabotPricingSection,
  FaqSection,
  OrcabotCtaSection,
  DisclaimerSection,
} from '@/features/orcabot'
import s from '@/features/orcabot/components/orcabot.module.css'

export const metadata: Metadata = {
  title: 'OrcaBot 2.0 — The Hybrid Automated Trading System | OrcaTrading',
  description: 'One decision. Precision execution. Consistent results. OrcaBot 2.0 is the hybrid automated trading system that removes execution errors while keeping you in control.',
  keywords: 'OrcaBot, automated trading bot, hybrid trading system, cTrader bot, trading automation, forex bot',
}

export default function OrcaBotPage() {
  return (
    <div className={s.page}>
      <OrcabotHero />
      <hr className={s.divider} />
      <ProblemSection />
      <hr className={s.divider} />
      <SolutionSection />
      <hr className={s.divider} />
      <HowItWorksSection />
      <hr className={s.divider} />
      <DifferencesSection />
      <hr className={s.divider} />
      <ReceiveSection />
      <hr className={s.divider} />
      <TestimonialSection />
      <hr className={s.divider} />
      <BeginnerSection />
      <hr className={s.divider} />
      <ExpectationsSection />
      <hr className={s.divider} />
      <WhoItIsForSection />
      <hr className={s.divider} />
      <OrcabotPricingSection />
      <hr className={s.divider} />
      <FaqSection />
      <hr className={s.divider} />
      <OrcabotCtaSection />
      <DisclaimerSection />
    </div>
  )
}
