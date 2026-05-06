'use client';
import { m, type Variants } from 'framer-motion';
import { Home, UserRound, FolderKanban, Send, Bell, Lock, LockOpen, Mail } from 'lucide-react';

// --- Variants ---

const bounceVariants: Variants = {
  idle: { y: 0 },
  hover: {
    y: [0, -3, 0],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

const wiggleVariants: Variants = {
  idle: { rotate: 0 },
  hover: {
    rotate: [0, -12, 12, -6, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

const tiltVariants: Variants = {
  idle: { rotate: 0, scale: 1 },
  hover: {
    rotate: [0, -10, 10, 0],
    scale: [1, 1.15, 1.15, 1],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

const sendVariants: Variants = {
  idle: { x: 0, y: 0 },
  hover: {
    x: [0, 3, 0],
    y: [0, -2, 0],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

const bellVariants: Variants = {
  idle: { rotate: 0 },
  hover: {
    rotate: [0, 15, -15, 10, -10, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

const lockVariants: Variants = {
  idle: { scale: 1 },
  hover: {
    scale: [1, 1.15, 1],
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
};

const socialVariants: Variants = {
  idle: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.2,
    rotate: [0, -10, 10, 0],
    transition: { duration: 0.3 },
  },
};

// --- Components ---

interface IconProps {
  size?: number;
  className?: string;
}

export function AnimatedHome({ size = 20, className }: IconProps) {
  return (
    <m.span variants={bounceVariants} className={`inline-flex ${className || ''}`}>
      <Home size={size} />
    </m.span>
  );
}

export function AnimatedUser({ size = 20, className }: IconProps) {
  return (
    <m.span variants={tiltVariants} className={`inline-flex ${className || ''}`}>
      <UserRound size={size} />
    </m.span>
  );
}

export function AnimatedProjects({ size = 20, className }: IconProps) {
  return (
    <m.span variants={wiggleVariants} className={`inline-flex ${className || ''}`}>
      <FolderKanban size={size} />
    </m.span>
  );
}

export function AnimatedSend({ size = 20, className }: IconProps) {
  return (
    <m.span variants={sendVariants} className={`inline-flex ${className || ''}`}>
      <Send size={size} />
    </m.span>
  );
}

export function AnimatedMail({ size = 20, className }: IconProps) {
  return (
    <m.span variants={sendVariants} className={`inline-flex ${className || ''}`}>
      <Mail size={size} />
    </m.span>
  );
}

export function AnimatedBell({ size = 20, className }: IconProps) {
  return (
    <m.span variants={bellVariants} className={`inline-flex ${className || ''}`}>
      <Bell size={size} />
    </m.span>
  );
}

export function AnimatedLock({ size = 20, className, open }: IconProps & { open: boolean }) {
  return (
    <m.span variants={lockVariants} className={`inline-flex ${className || ''}`}>
      {open ? <LockOpen size={size} /> : <Lock size={size} />}
    </m.span>
  );
}
