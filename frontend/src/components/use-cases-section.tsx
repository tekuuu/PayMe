'use client';

import { useState } from 'react';
import {
  IconUser,
  IconShoppingCart,
  IconBuilding,
  IconGitFork,
} from '@tabler/icons-react';

interface UseCase {
  icon: React.ComponentType<{ size: number; className: string }>;
  title: string;
  description: string;
  benefits: string[];
}

const useCases: UseCase[] = [
  {
    icon: IconUser,
    title: 'Privacy-Focused Users',
    description:
      'Send and receive payments without revealing your identity or spending habits to the blockchain.',
    benefits: [
      'Encrypted balances stay invisible',
      'Private transaction history',
      'No MEV bot front-running',
    ],
  },
  {
    icon: IconShoppingCart,
    title: 'E-commerce Merchants',
    description:
      'Accept encrypted subscriptions and recurring payments with spending caps that remain private.',
    benefits: [
      'No sensitive data on-chain',
      'Encrypted merchant identity',
      'Compliance-friendly',
    ],
  },
  {
    icon: IconBuilding,
    title: 'Enterprise Payments',
    description:
      'Execute confidential treasury operations and B2B transfers without exposing financial movements.',
    benefits: [
      'Competitive advantage hidden',
      'Private fund flows',
      'Encrypted audit trail',
    ],
  },
  {
    icon: IconGitFork,
    title: 'DeFi Protocols',
    description:
      'Integrate encrypted logic into your smart contracts. Approve encrypted allowances and transfers.',
    benefits: [
      'Programmable privacy',
      'Encrypted smart contracts',
      'Private liquidity pools',
    ],
  },
];

interface UseCaseCardProps {
  useCase: UseCase;
  isActive: boolean;
  onHover: () => void;
}

function UseCaseCard({ useCase, isActive, onHover }: UseCaseCardProps) {
  const Icon = useCase.icon;
  return (
    <div
      onMouseEnter={onHover}
      className={`cursor-pointer rounded-2xl border transition-all ${
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border/60 bg-card/30 hover:border-border/80'
      } p-8 backdrop-blur-sm`}
    >
      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10'>
        <Icon size={24} className='text-primary' />
      </div>
      <h3 className='font-serif text-base font-bold text-foreground sm:text-lg'>
        {useCase.title}
      </h3>
      <p className='mt-3 text-xs text-muted-foreground sm:text-sm'>
        {useCase.description}
      </p>
      {isActive && (
        <div className='mt-6 space-y-2 border-t border-border/40 pt-6'>
          {useCase.benefits.map((benefit, idx) => (
            <div key={idx} className='flex items-start gap-3'>
              <div className='mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary' />
              <span className='text-xs text-muted-foreground sm:text-sm'>{benefit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function UseCasesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className='border-t border-border/40 bg-gradient-to-b from-muted/5 to-background py-24 lg:py-32'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mb-16 text-center'>
          <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
            Who uses PayMe
          </p>
          <h2 className='mt-2 font-serif text-3xl font-bold leading-tight tracking-tight md:text-5xl'>
            Built for everyone
          </h2>
          <p className='mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg'>
            From individual users to enterprises—PayMe provides encrypted payment
            privacy for any use case.
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {useCases.map((useCase, idx) => (
            <UseCaseCard
              key={idx}
              useCase={useCase}
              isActive={activeIndex === idx}
              onHover={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
