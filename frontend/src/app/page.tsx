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
import { UseCasesSection } from '@/components/use-cases-section';

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
      <div className='mx-auto flex h-16 max-w-7xl items-center px-6 lg:px-8'>
        <Link href='/' className='flex items-center gap-2'>
          <Image
            src='/assets/payme-n.svg'
            alt='PayMe'
            width={100}
            height={30}
            className='h-8 w-auto'
          />
        </Link>
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

        <h1 className='max-w-4xl text-center text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground'>
          Private payments.
          <br />
          <span className='text-primary'>For the open internet.</span>
        </h1>

        <p className='mx-auto mt-6 max-w-2xl text-center text-sm md:text-base text-muted-foreground leading-relaxed'>
          Keep your balances and transactions completely private on-chain. No exposed spending patterns. No MEV bots. No visibility.
        </p>

        <div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Link
            href='/dashboard'
            className='group inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90'
          >
            Get started
            <IconArrowRight size={16} className='transition-transform group-hover:translate-x-1' />
          </Link>
          <Link
            href='#features'
            className='inline-flex items-center justify-center gap-2.5 rounded-md border border-primary/20 px-7 py-3 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5'
          >
            Learn more
          </Link>
        </div>

        <div className='mx-auto mt-16 w-full max-w-3xl px-4 sm:px-0'>
          <div className='rounded-xl border border-border/40 overflow-hidden shadow-xl'>
            <div className='relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white'>
              <div className='relative space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold uppercase tracking-widest text-white/60'>Card</span>
                  <span className='rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium'>FHE</span>
                </div>

                <div className='space-y-2'>
                  <p className='text-xs text-white/40 uppercase tracking-widest'>Address</p>
                  <p className='font-mono text-sm text-white/80'>0x1234...ef00</p>
                  <button className='flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors'>
                    <IconLock size={14} />
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className='border-t border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <p className='text-xs text-white/40 uppercase tracking-widest mb-1'>Balance</p>
                  <p className='text-lg font-semibold'>Encrypted</p>
                </div>
                <button className='rounded-md bg-white text-slate-900 hover:bg-white/90 font-medium px-4 py-2 inline-flex items-center gap-2 text-sm transition-colors'>
                  <IconEye size={16} />
                  Decrypt
                </button>
              </div>
            </div>

            <div className='border-t border-white/10 bg-gradient-to-br from-slate-900 to-slate-900 px-6 py-4 text-white'>
              <div className='flex gap-3'>
                <button className='flex-1 rounded-md bg-white/10 text-white hover:bg-white/20 border border-white/20 text-sm font-medium py-2.5 inline-flex items-center justify-center gap-2 transition-colors'>
                  <IconWallet size={16} />
                  Add funds
                </button>
                <button className='flex-1 rounded-md bg-white/10 text-white hover:bg-white/20 border border-white/20 text-sm font-medium py-2.5 inline-flex items-center justify-center gap-2 transition-colors'>
                  <IconSend size={16} />
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}


function Footer() {
  return (
    <footer className='bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground border-t border-primary/30'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-8 mb-12'>
          {/* Product */}
          <div>
            <h4 className='font-semibold text-sm mb-4'>Product</h4>
            <ul className='space-y-2 text-sm'>
              <li><a href='#features' className='opacity-70 hover:opacity-100 transition-opacity'>Features</a></li>
              <li><a href='https://docs.example.com' target='_blank' rel='noopener noreferrer' className='opacity-70 hover:opacity-100 transition-opacity'>Docs</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className='font-semibold text-sm mb-4'>Company</h4>
            <ul className='space-y-2 text-sm'>
              <li><a href='https://github.com' target='_blank' rel='noopener noreferrer' className='opacity-70 hover:opacity-100 transition-opacity'>GitHub</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className='font-semibold text-sm mb-4'>Legal</h4>
            <ul className='space-y-2 text-sm'>
              <li><a href='#' className='opacity-70 hover:opacity-100 transition-opacity'>Privacy</a></li>
              <li><a href='#' className='opacity-70 hover:opacity-100 transition-opacity'>Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Social icons */}
        <div className='border-t border-primary-foreground/20 pt-8'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-8'>
            <div className='flex items-center gap-4'>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='opacity-70 hover:opacity-100 transition-opacity'
              >
                <IconBrandTwitter size={18} />
              </a>
              <a
                href='https://discord.com'
                target='_blank'
                rel='noopener noreferrer'
                className='opacity-70 hover:opacity-100 transition-opacity'
              >
                <IconBrandDiscord size={18} />
              </a>
              <a
                href='https://github.com'
                target='_blank'
                rel='noopener noreferrer'
                className='opacity-70 hover:opacity-100 transition-opacity'
              >
                <IconBrandGithub size={18} />
              </a>
              <a
                href='https://t.me'
                target='_blank'
                rel='noopener noreferrer'
                className='opacity-70 hover:opacity-100 transition-opacity'
              >
                <IconBrandTelegram size={18} />
              </a>
            </div>
            <div className='text-xs opacity-70 space-y-1'>
              <div>Proof of concept. Smart contracts have not undergone a third-party security audit.</div>
              <div>&copy; {new Date().getFullYear()} PayMe. All rights reserved.</div>
            </div>
          </div>
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
      <Footer />
    </main>
  );
}
