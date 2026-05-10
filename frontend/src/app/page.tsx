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
    <nav className='fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm'>
      <div className='mx-auto flex h-16 max-w-7xl items-center px-6 lg:px-8'>
        <Link href='/' className='group flex items-center gap-2 transition-all duration-300 hover:opacity-80 active:scale-95'>
          <div className='relative'>
            <Image
              src='/assets/payme-n.svg'
              alt='PayMe'
              width={100}
              height={30}
              className='h-7 w-auto relative z-10 transition-all duration-300 group-hover:drop-shadow-lg group-hover:drop-shadow-primary/40'
            />
            <div className='absolute inset-0 -top-1 -bottom-1 -left-1 -right-1 rounded-md bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10' />
          </div>
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className='relative min-h-screen overflow-hidden bg-background pt-32 pb-20 lg:pt-40 lg:pb-32'>
      {/* Top decorative line */}
      <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent' />

      {/* Premium gradient depth layer */}
      <div className='absolute inset-0 opacity-8' style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #3b82f6 0%, transparent 70%)' }} />

      {/* Animated background logo watermark */}
      <div className='absolute top-32 left-1/2 -translate-x-1/2 z-0 pointer-events-none'>
        <div className='relative w-64 h-64 opacity-8'>
          <Image
            src='/assets/payme-n.svg'
            alt=''
            width={256}
            height={256}
            className='w-full h-full animate-float filter drop-shadow-lg'
          />
        </div>
      </div>

      <div className='relative mx-auto flex max-w-7xl flex-col items-center justify-center px-6 lg:px-8'>
        {/* Status Badge */}
        <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-2 animate-fade-in'>
          <span className='flex h-2 w-2 rounded-full bg-primary animate-pulse' />
          <span className='text-xs font-medium text-primary'>Live on Ethereum</span>
        </div>

        <h1 className='max-w-4xl text-center text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-foreground'>
          Private payments.
          <br />
          <span className='bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>For the open internet.</span>
        </h1>

        <p className='mx-auto mt-8 max-w-2xl text-center text-base md:text-lg text-muted-foreground leading-[1.6] font-light'>
          Keep your balances and transactions completely private on-chain. No exposed spending patterns. No MEV bots. No visibility.
        </p>

        <div className='mt-12 flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Link
            href='/dashboard'
            className='group inline-flex items-center justify-center rounded-md border border-primary/80 bg-primary px-9 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 hover:border-primary active:scale-[0.97]'
          >
            Get started
          </Link>
          <Link
            href='#features'
            className='group inline-flex items-center justify-center rounded-md border border-primary/50 px-9 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-primary hover:bg-gradient-to-br hover:from-primary/15 hover:to-primary/8 hover:shadow-lg hover:shadow-primary/15 active:scale-[0.97]'
          >
            Learn more
          </Link>
        </div>

        <div className='mx-auto mt-24 w-full max-w-3xl px-4 sm:px-0'>
          {/* Card Container with enhanced styling */}
          <div className='relative'>
            {/* Accent top-left corner */}
            <div className='absolute -top-6 -left-6 w-12 h-12 border-t border-l border-primary/30 rounded-tl-lg pointer-events-none' />
            {/* Accent bottom-right corner */}
            <div className='absolute -bottom-6 -right-6 w-12 h-12 border-b border-r border-primary/30 rounded-br-lg pointer-events-none' />

            <div className='rounded-xl border border-border/50 overflow-hidden shadow-2xl bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95'>
              {/* Card Header */}
              <div className='relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 text-white border-b border-white/10'>
                <div className='relative space-y-6'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold uppercase tracking-widest text-white/40'>Private Card</span>
                    <span className='rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm'>FHE Encrypted</span>
                  </div>

                  <div className='space-y-3'>
                    <p className='text-xs text-white/35 uppercase tracking-wider font-semibold'>Wallet Address</p>
                    <p className='font-mono text-sm text-white/90 font-medium'>0x1234...ef00</p>
                    <button className='group flex items-center gap-1.5 text-xs text-white/45 hover:text-primary/80 transition-colors duration-250 font-medium'>
                    <IconLock size={13} className='group-hover:text-primary/70' />
                    Copy Address
                  </button>
                  </div>
                </div>
              </div>

              {/* Card Balance Section */}
              <div className='bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-8 text-white border-b border-white/10'>
                <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <p className='text-xs text-white/35 uppercase tracking-wider font-semibold mb-2'>Total Balance</p>
                    <p className='text-2xl font-bold text-white/95'>Encrypted</p>
                  </div>
                  <button className='group rounded-md border border-white/40 bg-white/95 text-slate-950 hover:shadow-xl hover:shadow-primary/30 hover:bg-white hover:border-primary/50 font-bold px-7 py-3 inline-flex items-center justify-center gap-2 text-sm transition-all duration-250 active:scale-[0.97]'>
                    <IconEye size={17} className='group-hover:text-primary' />
                    Decrypt
                  </button>
                </div>
              </div>

              {/* Card Actions Section */}
              <div className='bg-gradient-to-br from-slate-950 to-slate-950/95 px-8 py-6 text-white'>
                <div className='flex gap-4'>
                  <button className='group flex-1 rounded-md border border-white/25 bg-white/12 text-white hover:bg-white/18 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 text-sm font-semibold py-3.5 inline-flex items-center justify-center gap-2 transition-all duration-250 active:scale-[0.97]'>
                    <IconWallet size={17} className='group-hover:text-primary/80' />
                    Add funds
                  </button>
                  <button className='group flex-1 rounded-md border border-white/25 bg-white/12 text-white hover:bg-white/18 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 text-sm font-semibold py-3.5 inline-flex items-center justify-center gap-2 transition-all duration-250 active:scale-[0.97]'>
                    <IconSend size={17} className='group-hover:text-primary/80' />
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
      </div>

    </section>
  );
}


function Footer() {
  return (
    <footer className='bg-gradient-to-br from-primary via-primary to-primary/85 text-primary-foreground border-t border-primary/50'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-24'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-12 mb-16'>
          {/* Product */}
          <div>
            <h4 className='font-semibold text-xs mb-6 tracking-widest uppercase'>Product</h4>
            <ul className='space-y-3.5 text-sm'>
              <li><a href='#features' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>Features<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
              <li><a href='https://docs.example.com' target='_blank' rel='noopener noreferrer' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>Documentation<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
              <li><a href='#' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>Roadmap<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className='font-semibold text-xs mb-6 tracking-widest uppercase'>Developers</h4>
            <ul className='space-y-3.5 text-sm'>
              <li><a href='https://github.com' target='_blank' rel='noopener noreferrer' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>GitHub<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
              <li><a href='#' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>API Reference<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
              <li><a href='#' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>Integration Guide<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className='font-semibold text-xs mb-6 tracking-widest uppercase'>Resources</h4>
            <ul className='space-y-3.5 text-sm'>
              <li><a href='#' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>Blog<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
              <li><a href='#' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>Support<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
              <li><a href='#' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>Status<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className='font-semibold text-xs mb-6 tracking-widest uppercase'>Legal</h4>
            <ul className='space-y-3.5 text-sm'>
              <li><a href='#' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>Privacy<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
              <li><a href='#' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>Terms of Service<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
              <li><a href='#' className='group opacity-75 hover:opacity-100 transition-all duration-250 relative'>Security<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/60 group-hover:w-full transition-all duration-300' /></a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-primary-foreground/25 pt-8'>
          {/* Social icons and copyright */}
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-8'>
            <div className='flex items-center gap-6'>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='opacity-70 hover:opacity-100 transition-all duration-250'
                aria-label='Twitter'
              >
                <IconBrandTwitter size={18} />
              </a>
              <a
                href='https://discord.com'
                target='_blank'
                rel='noopener noreferrer'
                className='opacity-70 hover:opacity-100 transition-all duration-250'
                aria-label='Discord'
              >
                <IconBrandDiscord size={18} />
              </a>
              <a
                href='https://github.com'
                target='_blank'
                rel='noopener noreferrer'
                className='opacity-70 hover:opacity-100 transition-all duration-250'
                aria-label='GitHub'
              >
                <IconBrandGithub size={18} />
              </a>
              <a
                href='https://t.me'
                target='_blank'
                rel='noopener noreferrer'
                className='opacity-70 hover:opacity-100 transition-all duration-250'
                aria-label='Telegram'
              >
                <IconBrandTelegram size={18} />
              </a>
            </div>

            {/* Copyright and disclaimer */}
            <div className='text-xs opacity-70 space-y-2 md:text-right'>
              <div>&copy; {new Date().getFullYear()} PayMe. All rights reserved.</div>
              <div className='text-xs opacity-60'>Proof of concept. Contracts unaudited.</div>
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
