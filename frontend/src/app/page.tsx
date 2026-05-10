'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  IconArrowRight,
  IconLock,
  IconShield,
  IconKey,
  IconRepeat,
  IconBrandTwitter,
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandTelegram,
  IconEye,
  IconWallet,
  IconSend,
} from '@tabler/icons-react';
import { FAQSection } from '@/components/faq-section';
import { UseCasesSection } from '@/components/use-cases-section';

const techStack = [
  'Zama fhEVM',
  'ERC-4337',
  'WebAuthn',
  'Pimlico',
  'ERC-7984',
];

const features = [
  {
    icon: IconLock,
    title: 'Encrypted\nbalances.',
    description:
      'Every balance, transfer, and allowance is encrypted on-chain using Zama Fully Homomorphic Encryption. Computations happen without decryption. Your numbers are invisible to block explorers, MEV bots, and anyone watching the mempool.',
    visual: 'balances',
  },
  {
    icon: IconKey,
    title: 'Passkey\nwallets.',
    description:
      'Sign ERC-4337 UserOperations with FaceID, TouchID, or YubiKey through native WebAuthn. No extensions, no seed phrases, no private key management. Your device biometric is your wallet.',
    visual: 'passkey',
  },
  {
    icon: IconShield,
    title: 'Private\nCards.',
    description:
      'Each Private Card is a separate smart contract with its own encrypted cUSDC balance. Fund it from your wallet, spend from it independently. One compromised card cannot drain your main balance.',
    visual: 'cards',
  },
  {
    icon: IconRepeat,
    title: 'Encrypted\nsubscriptions.',
    description:
      'Approve a merchant with an encrypted spending cap per billing period. They pull funds up to that limit — the network never learns the cap amount, the payment amount, or the merchant identity.',
    visual: 'subscriptions',
  },
];

function Nav() {
  return (
    <nav className='fixed top-0 left-0 right-0 z-50'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8'>
        <Link href='/' className='flex items-center gap-2'>
          <Image
            src='/assets/payme.svg'
            alt='PayMe'
            width={100}
            height={25}
            className='h-6 w-auto'
          />
        </Link>

        <div className='flex items-center gap-6'>
          <Link
            href='/dashboard'
            className='hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block'
          >
            Sign in
          </Link>
          <Link
            href='/dashboard/my-card'
            className='rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className='relative min-h-screen overflow-hidden bg-background pt-32 pb-20 lg:pt-40 lg:pb-32'>
      {/* Decorative grid lines */}
      <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />

      {/* Premium gradient depth layer */}
      <div className='absolute inset-0 opacity-5' style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #3b82f6 0%, transparent 70%)' }} />

      <div className='relative mx-auto flex max-w-7xl flex-col items-center justify-center px-6 lg:px-8'>
        {/* Status badge - credibility indicator */}
        <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5'>
          <div className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
          <span className='text-xs font-medium text-foreground/70 tracking-wide'>Live on Zama testnet</span>
        </div>

        {/* Hero headline - editorial serif for premium feel */}
        <h1 className='max-w-4xl text-center font-serif text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl text-foreground'>
          Private payments.
          <br />
          <span className='text-primary'>For the open internet.</span>
        </h1>

        {/* Subtitle with clear value prop */}
        <p className='mx-auto mt-8 max-w-2xl text-center text-base md:text-lg text-muted-foreground leading-relaxed'>
          A passkey-secured smart wallet where every balance, transfer, and subscription runs encrypted on-chain using Fully Homomorphic Encryption.
        </p>

        {/* Dual CTA - primary and secondary */}
        <div className='mt-12 flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Link
            href='/dashboard/my-card'
            className='group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg'
          >
            Create your card
            <IconArrowRight
              size={18}
              className='transition-transform group-hover:translate-x-0.5'
            />
          </Link>
          <Link
            href='#features'
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 px-8 py-3 text-base font-semibold text-foreground transition-all hover:border-primary/60 hover:bg-primary/5'
          >
            Learn more
          </Link>
        </div>

        {/* Product visual - prominent placement */}
        <div className='mx-auto mt-20 w-full max-w-3xl px-4 sm:px-0'>
          <div className='rounded-2xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden shadow-2xl'>
            {/* Card face */}
            <div className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900'>
              <div className='absolute inset-0 opacity-10' style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #6366f1 1px, transparent 1px), radial-gradient(circle at 80% 20%, #a855f7 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-3xl' />

              <div className='relative space-y-3 sm:space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-bold tracking-[0.2em]'>PAYME</span>
                  <span className='rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-wide'>
                    FHE
                  </span>
                </div>

                <div className='space-y-1'>
                  <p className='font-mono text-sm tracking-[0.15em] opacity-60 break-all'>
                    0x1234  0x5678  0xabcd  0xef00
                  </p>
                  <button className='flex items-center gap-1 text-[11px] opacity-40 hover:opacity-80 transition-opacity'>
                    <IconLock size={12} />
                    <span>copy</span>
                  </button>
                </div>

                <div className='space-y-0.5'>
                  <p className='text-[10px] uppercase tracking-wide opacity-40'>Owner</p>
                  <p className='font-mono text-xs break-all'>
                    0xf21a...e9a3
                  </p>
                </div>
              </div>
            </div>

            {/* Private balance section */}
            <div className='relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-5 text-white dark:from-slate-800 dark:to-slate-900'>
              <div className='absolute inset-0 opacity-10' style={{ backgroundImage: 'radial-gradient(circle at 80% 80%, #6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

              <div className='relative'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='min-w-0'>
                    <p className='text-[11px] uppercase tracking-wide opacity-50'>Private balance</p>
                    <p className='text-lg sm:text-xl font-bold tracking-tight mt-0.5'>Encrypted</p>
                  </div>
                  <button className='gap-2 rounded-full bg-white text-slate-900 hover:bg-white/90 shrink-0 self-start sm:self-auto font-medium px-4 py-2 inline-flex items-center text-sm'>
                    <IconEye size={16} />
                    Decrypt
                  </button>
                </div>
              </div>
            </div>

            {/* Divider line */}
            <div className='h-px bg-gradient-to-r from-transparent via-white/15 to-transparent' />

            {/* Action buttons row */}
            <div className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 sm:px-5 py-4 sm:py-6 text-white dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900'>
              <div className='absolute inset-0 opacity-10' style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #6366f1 1px, transparent 1px), radial-gradient(circle at 80% 20%, #a855f7 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

              <div className='relative flex items-center justify-center gap-2 sm:gap-3'>
                <button className='flex-1 gap-1.5 sm:gap-2 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 inline-flex items-center justify-center'>
                  <IconWallet size={16} />
                  <span className='hidden sm:inline'>Add funds</span>
                  <span className='sm:hidden'>Add</span>
                </button>
                <button className='flex-1 gap-1.5 sm:gap-2 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 inline-flex items-center justify-center'>
                  <IconSend size={16} />
                  <span className='hidden sm:inline'>Withdraw</span>
                  <span className='sm:hidden'>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative grid line */}
      <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
    </section>
  );
}

function TechStack() {
  return (
    <section className='relative border-y border-primary/10 bg-muted/5 py-12 lg:py-16'>
      {/* Top divider */}
      <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />

      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <p className='mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/70'>
          Infrastructure partners
        </p>
        <div className='flex flex-wrap items-center justify-center gap-10 md:gap-20'>
          {techStack.map((tech) => (
            <span
              key={tech}
              className='text-sm font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors'
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
    </section>
  );
}

function ProblemSolution() {
  return (
    <section className='relative bg-background py-24 lg:py-32'>
      {/* Top divider */}
      <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />

      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl space-y-8'>
          {/* Problem statement */}
          <div className='space-y-4'>
            <h3 className='text-sm font-bold uppercase tracking-widest text-destructive/80'>
              The problem
            </h3>
            <p className='text-lg leading-relaxed text-muted-foreground md:text-xl'>
              <span className='font-semibold text-foreground'>
                On-chain payments are completely transparent.
              </span>{' '}
              Every balance, every transfer, every subscription payment is visible to
              anyone watching the blockchain. Block explorers index your spending
              habits. MEV bots front-run your transactions. Merchants can trace your
              payment history across every service you use.
            </p>
          </div>

          {/* Solution statement */}
          <div className='space-y-4 pt-8 border-t border-primary/10'>
            <h3 className='text-sm font-bold uppercase tracking-widest text-primary'>
              The solution
            </h3>
            <p className='text-lg leading-relaxed text-muted-foreground md:text-xl'>
              <span className='font-semibold text-foreground'>
                PayMe changes that.
              </span>{' '}
              Built on Zama Fully Homomorphic Encryption, every computation happens
              on encrypted data. Your cUSDC balances are invisible on-chain. Your
              transfers are private by default. Your subscriptions have encrypted
              spending caps that even the network cannot read.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
    </section>
  );
}

function Features() {
  return (
    <section id='features' className='relative bg-background py-24 lg:py-32'>
      {/* Top divider */}
      <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />

      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        {/* Section header */}
        <div className='mx-auto mb-20 max-w-2xl text-center'>
          <p className='text-xs font-medium uppercase tracking-widest text-primary mb-4'>
            Core capabilities
          </p>
          <h2 className='font-serif text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-6'>
            Privacy without compromise
          </h2>
          <p className='text-base md:text-lg text-muted-foreground leading-relaxed'>
            Four technologies normally kept separate, now unified into one coherent payments infrastructure.
          </p>
        </div>

        {/* Features grid with enhanced styling */}
        <div className='grid gap-8 md:grid-cols-2'>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group relative rounded-2xl border border-border/40 bg-card/30 backdrop-blur p-8 transition-all hover:border-primary/30 hover:bg-card/50 ${
                  i % 2 === 1 ? 'md:mt-8' : ''
                }`}
              >
                {/* Decorative corner accent */}
                <div className='absolute -top-1 -right-1 h-8 w-8 rounded-bl-2xl border-b border-l border-primary/10 opacity-0 group-hover:opacity-100 transition-opacity' />

                <div className='relative'>
                  <div className='mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors'>
                    <Icon size={24} />
                  </div>
                  <h3 className='whitespace-pre-line font-serif text-2xl font-bold leading-tight text-foreground mb-4'>
                    {f.title}
                  </h3>
                  <p className='text-sm leading-relaxed text-muted-foreground'>
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom divider */}
      <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
    </section>
  );
}

function CTABanner() {
  return (
    <section className='relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32 overflow-hidden'>
      {/* Premium gradient background */}
      <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background' />

      {/* Decorative elements */}
      <div className='absolute top-8 right-8 h-24 w-24 rounded-full bg-primary/5 blur-3xl' />
      <div className='absolute bottom-8 left-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl' />

      {/* Corner accents - top left */}
      <div className='absolute top-6 left-6 h-6 w-6 border-t border-l border-primary/20 rounded-tl-2xl' />
      {/* Corner accents - bottom right */}
      <div className='absolute bottom-6 right-6 h-6 w-6 border-b border-r border-primary/20 rounded-br-2xl' />

      <div className='relative mx-auto max-w-3xl text-center'>
        <p className='text-xs font-medium uppercase tracking-widest text-primary mb-4'>
          Ready to start?
        </p>
        <h2 className='font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground mb-6'>
          Begin your private
          <br />
          payments journey.
        </h2>
        <p className='mx-auto text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-10'>
          Create a passkey-secured wallet, fund your first Private Card, and send an encrypted transaction—all in under two minutes.
        </p>

        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Link
            href='/dashboard/my-card'
            className='group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg'
          >
            Create your card
            <IconArrowRight
              size={18}
              className='transition-transform group-hover:translate-x-0.5'
            />
          </Link>
          <Link
            href='/dashboard'
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 px-8 py-3 text-base font-semibold text-foreground transition-all hover:border-primary/60 hover:bg-primary/5'
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className='border-t border-border/40'>
      <div className='mx-auto max-w-7xl px-6 py-12 lg:px-8'>
        <div className='flex flex-col items-start justify-between gap-8 md:flex-row md:items-center'>
          <div className='flex items-center gap-2'>
            <Image
              src='/assets/payme.svg'
              alt='PayMe'
              width={100}
              height={25}
              className='h-6 w-auto'
            />
          </div>

          <div className='flex items-center gap-4'>
            <a
              href='https://twitter.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground transition-colors hover:text-foreground'
            >
              <IconBrandTwitter size={18} />
            </a>
            <a
              href='https://discord.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground transition-colors hover:text-foreground'
            >
              <IconBrandDiscord size={18} />
            </a>
            <a
              href='https://t.me'
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground transition-colors hover:text-foreground'
            >
              <IconBrandTelegram size={18} />
            </a>
            <a
              href='https://github.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground transition-colors hover:text-foreground'
            >
              <IconBrandGithub size={18} />
            </a>
          </div>
        </div>

        <div className='mt-8 flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-8 text-xs text-muted-foreground md:flex-row md:items-center'>
          <span>
            Proof of concept. Smart contracts have not undergone a third-party
            security audit.
          </span>
          <span>&copy; {new Date().getFullYear()} PayMe</span>
        </div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <main className='min-h-screen bg-background text-foreground antialiased'>
      <Nav />
      <Hero />
      <TechStack />
      <ProblemSolution />
      <Features />
      <UseCasesSection />
      <FAQSection />
      <CTABanner />
      <Footer />
    </main>
  );
}
