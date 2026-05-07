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
    <section className='relative min-h-screen overflow-hidden bg-background'>
      {/* Gradient background */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl' />
      </div>

      <div className='relative mx-auto flex max-w-7xl flex-col items-center justify-center px-6 pt-40 pb-20 lg:px-8'>
        <h1 className='max-w-4xl text-center font-serif text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl'>
          Private payments.
          <br />
          <span className='text-muted-foreground'>For the open internet.</span>
        </h1>

        <p className='mx-auto mt-6 max-w-lg text-center text-lg text-muted-foreground md:text-xl'>
          A passkey-secured smart wallet where every balance, transfer, and
          subscription runs encrypted on-chain.
        </p>

        <div className='mt-10'>
          <Link
            href='/dashboard/my-card'
            className='group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90'
          >
            Create your card
            <IconArrowRight
              size={18}
              className='transition-transform group-hover:translate-x-0.5'
            />
          </Link>
        </div>

        {/* Product visual */}
        <div className='mx-auto mt-16 w-full max-w-3xl'>
          <div className='overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-2xl backdrop-blur'>
            <div className='bg-gradient-to-b from-muted/30 to-background p-6 lg:p-8'>
              <div className='overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-950 p-6 text-white shadow-xl lg:p-8'>
                <div className='mb-10 flex items-center justify-between'>
                  <span className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    PayMe Private Card
                  </span>
                  <IconLock size={16} className='text-slate-500' />
                </div>
                <div className='text-sm tracking-[0.25em] text-slate-400'>
                  •••• •••• •••{' '}
                  <span className='font-medium text-white'>4337</span>
                </div>
                <div className='mt-8 flex items-end justify-between'>
                  <div>
                    <div className='text-[10px] uppercase tracking-wide text-slate-600'>
                      Card holder
                    </div>
                    <div className='mt-0.5 font-mono text-xs text-slate-400'>
                      0xf21a...e9a3
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-[10px] uppercase tracking-wide text-slate-600'>
                      Balance
                    </div>
                    <div className='mt-0.5 text-sm font-semibold text-emerald-400'>
                      Encrypted
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className='mt-4 grid grid-cols-3 gap-3'>
                {[
                  { label: 'Send', detail: 'Encrypted transfer' },
                  { label: 'Receive', detail: 'Confidential' },
                  { label: 'Decrypt', detail: 'On demand' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className='rounded-lg border border-border/60 bg-background/80 p-3'
                  >
                    <div className='text-[11px] font-medium'>{item.label}</div>
                    <div className='mt-0.5 text-[11px] text-muted-foreground'>
                      {item.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className='border-y border-border/40 bg-muted/20'>
      <div className='mx-auto max-w-7xl px-6 py-10 lg:px-8'>
        <p className='mb-6 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground'>
          Built with
        </p>
        <div className='flex flex-wrap items-center justify-center gap-8 md:gap-16'>
          {techStack.map((tech) => (
            <span
              key={tech}
              className='text-sm font-semibold text-muted-foreground/70'
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSolution() {
  return (
    <section className='mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32'>
      <div className='mx-auto max-w-3xl'>
        <p className='text-lg leading-relaxed text-muted-foreground md:text-xl'>
          <span className='font-semibold text-foreground'>
            On-chain payments are completely transparent.
          </span>{' '}
          Every balance, every transfer, every subscription payment is visible to
          anyone watching the blockchain. Block explorers index your spending
          habits. MEV bots front-run your transactions. Merchants can trace your
          payment history across every service you use.
        </p>
        <p className='mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl'>
          <span className='font-semibold text-foreground'>
            PayMe changes that.
          </span>{' '}
          Built on Zama Fully Homomorphic Encryption, every computation happens
          on encrypted data. Your cUSDC balances are invisible on-chain. Your
          transfers are private by default. Your subscriptions have encrypted
          spending caps that even the network cannot read.
        </p>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className='bg-muted/30'>
      <div className='mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32'>
        <div className='mx-auto mb-16 max-w-2xl text-center'>
          <h2 className='text-3xl font-bold leading-tight tracking-tight md:text-5xl'>
            Privacy without
            <br />
            compromise.
          </h2>
          <p className='mt-4 text-base text-muted-foreground md:text-lg'>
            Four technologies normally kept separate, combined into one coherent
            payments system.
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`rounded-2xl border border-border/60 bg-card p-8 ${
                  i % 2 === 1 ? 'md:mt-12' : ''
                }`}
              >
                <div className='mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-muted/80'>
                  <Icon size={20} className='text-foreground' />
                </div>
                <h3 className='whitespace-pre-line text-xl font-bold leading-tight tracking-tight'>
                  {f.title}
                </h3>
                <p className='mt-4 text-sm leading-relaxed text-muted-foreground'>
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className='mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32'>
      <div className='mx-auto max-w-3xl text-center'>
        <h2 className='text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl'>
          Start using private
          <br />
          payments today.
        </h2>
        <p className='mx-auto mt-6 max-w-md text-base text-muted-foreground md:text-lg'>
          Create a passkey wallet, fund a Private Card, and send your first
          encrypted transaction. Under two minutes.
        </p>
        <div className='mt-10'>
          <Link
            href='/dashboard/my-card'
            className='group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90'
          >
            Get started
            <IconArrowRight
              size={18}
              className='transition-transform group-hover:translate-x-0.5'
            />
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
