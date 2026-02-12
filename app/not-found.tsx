"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { CalendarX, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

import en from '@/messages/en.json';
import pt from '@/messages/pt.json';

const messagesMap = { en, pt } as const;

// Generic version for the root 404 (when locale context might be missing)
export default function RootNotFound() {
    const [t, setT] = useState(messagesMap.en.NotFound);

    useEffect(() => {
        const locale = (Cookies.get('USER_LOCALE') as 'en' | 'pt') || 'en';
        const activeMessages = messagesMap[locale] || messagesMap.en;
        if (activeMessages?.NotFound) {
            setT(activeMessages.NotFound);
        }
    }, []);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-8 animated-gradient">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="z-10 w-full max-w-lg glass-card rounded-3xl p-8 border border-white/20 shadow-2xl text-center space-y-8 interactive-card-hover">
                {/* Floating Icon */}
                <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="relative bg-white/10 p-6 rounded-full backdrop-blur-sm border border-white/30 shadow-inner">
                        <CalendarX className="w-16 h-16 text-primary animate-bounce" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-6xl font-black tracking-tighter sm:text-7xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-mask">
                        404
                    </h1>
                    <h2 className="text-2xl font-bold text-foreground">
                        {t.title}
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        {t.description}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto gap-2 border-primary/20 hover:bg-primary/10"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t.goBack}
                    </Button>

                    <Button
                        variant="default"
                        size="lg"
                        className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                        asChild
                    >
                        <Link href="/">
                            <Home className="w-4 h-4" />
                            {t.home}
                        </Link>
                    </Button>
                </div>
            </div>

            <p className="mt-12 text-sm font-medium text-foreground/50 tracking-widest uppercase italic">
                Mind Your Event
            </p>
        </main>
    );
}
