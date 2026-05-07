'use client';

import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How is my balance encrypted on-chain?',
    answer:
      'We use Zama Fully Homomorphic Encryption (fhEVM) to encrypt all balance data. The blockchain can process encrypted transactions without ever decrypting the values. This means your balance remains invisible to everyone, including the network validators.',
  },
  {
    question: 'Do I need a browser extension or seed phrase?',
    answer:
      'No. PayMe uses WebAuthn (passkeys) for authentication. Sign in with FaceID, TouchID, or a hardware security key. Your device handles the cryptography—no private keys to manage or lose.',
  },
  {
    question: 'Can merchants see my spending history?',
    answer:
      'No. With encrypted subscriptions, merchants only know they can pull up to your encrypted spending cap per period. The payment amounts, timing, and your identity remain encrypted on-chain.',
  },
  {
    question: 'How do I use PayMe for regular payments?',
    answer:
      'Create a card, fund it with cUSDC from your wallet, and use it for encrypted transfers. You control the spending cap and can decrypt amounts on-demand. Every card is a separate smart contract.',
  },
  {
    question: 'Is PayMe audited?',
    answer:
      'PayMe is currently a proof of concept. Smart contracts have not undergone a third-party security audit. Use at your own risk.',
  },
];

interface AccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ item, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className='border-b border-border/40'>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className='w-full px-4 py-6 text-left transition-colors hover:bg-muted/30 sm:px-6 lg:px-8'
      >
        <div className='flex items-start justify-between gap-4'>
          <h3 className='text-sm font-semibold text-foreground sm:text-base md:text-lg'>
            {item.question}
          </h3>
          <IconChevronDown
            size={20}
            className={`flex-shrink-0 text-muted-foreground transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden='true'
          />
        </div>
      </button>
      {isOpen && (
        <div className='border-t border-border/40 bg-muted/10 px-4 py-6 sm:px-6 lg:px-8'>
          <p className='text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base'>
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className='border-t border-border/40 bg-background py-24 lg:py-32'>
      <div className='mx-auto max-w-3xl px-6 lg:px-8'>
        <div className='mb-12 text-center'>
          <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
            Common questions
          </p>
          <h2 className='mt-2 font-serif text-3xl font-bold leading-tight tracking-tight md:text-5xl'>
            Frequently asked questions
          </h2>
        </div>

        <div className='overflow-hidden rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm'>
          {faqs.map((item, idx) => (
            <AccordionItem
              key={idx}
              item={item}
              isOpen={openIndex === idx}
              onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
