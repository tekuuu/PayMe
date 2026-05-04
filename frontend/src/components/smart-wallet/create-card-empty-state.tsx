'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconCreditCard, IconSparkles, IconLock } from '@tabler/icons-react';
import { toast } from 'sonner';
// import { useSendUserOperation } from ... // Will integrate soon

export function CreateCardEmptyState({ onCreate, isCreating }: { onCreate: () => void; isCreating: boolean }) {
    const handleCreateCard = async () => {
        try {
            onCreate();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Teaser placeholder for the card */}
            <div className="relative w-full max-w-[320px] aspect-[1.586/1] rounded-2xl p-6 bg-muted/40 border-2 border-dashed border-primary/20 overflow-hidden group shadow-inner">
                <div className="absolute inset-0 flex items-center justify-center opacity-20 transition-opacity group-hover:opacity-40">
                    <IconCreditCard size={80} className="text-primary/40" />
                </div>
                <div className="relative h-full flex flex-col items-center justify-center space-y-2 opacity-50 z-10">
                    <IconLock size={24} className="text-muted-foreground" />
                    <p className="font-mono text-sm tracking-widest text-muted-foreground">**** **** **** ****</p>
                </div>
            </div>

            <div className="space-y-4 max-w-md">
                <h2 className="text-3xl font-extrabold tracking-tight">Activate Your Private Card</h2>
            </div>

            <Button
                size="lg"
                onClick={handleCreateCard}
                disabled={isCreating}
                className="rounded-full px-8 font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 h-14"
            >
                {isCreating ? (
                    <div className="flex items-center gap-2">
                        <span className="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent" />
                        Deploying Contract...
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <IconCreditCard size={20} />
                        Create Private Card
                    </div>
                )}
            </Button>
        </div>
    );
}
