'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface AnimatedTableRowProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export default function AnimatedTableRow({ children, delay = 0, className }: AnimatedTableRowProps) {
    return (
        <motion.tr
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay, ease: 'easeOut' }}
            className={cn(
                'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors animate-in',
                className
            )}
        >
            {children}
        </motion.tr>
    );
}
