'use client';

import ThemeToggle from '@/components/ui/ThemeToggle';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { smoothScrollTo } from '@/lib/utils/scroll';
import { AnimatePresence, m, type Variants } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Home, UserRound, FolderKanban, Send, Bell, Lock, LockOpen } from 'lucide-react';
import { FiMenu, FiX } from 'react-icons/fi';
import { getUnreadCountAction } from '@/actions/message.action';

// --- Animated Icon Wrappers ---

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

function AnimatedHome({ size, className }: { size: number; className?: string }) {
  return (
    <m.span variants={bounceVariants} className={`inline-flex ${className || ''}`}>
      <Home size={size} />
    </m.span>
  );
}

function AnimatedUser({ size, className }: { size: number; className?: string }) {
  return (
    <m.span variants={tiltVariants} className={`inline-flex ${className || ''}`}>
      <UserRound size={size} />
    </m.span>
  );
}

function AnimatedProjects({ size, className }: { size: number; className?: string }) {
  return (
    <m.span variants={wiggleVariants} className={`inline-flex ${className || ''}`}>
      <FolderKanban size={size} />
    </m.span>
  );
}

function AnimatedSend({ size, className }: { size: number; className?: string }) {
  return (
    <m.span variants={sendVariants} className={`inline-flex ${className || ''}`}>
      <Send size={size} />
    </m.span>
  );
}

function AnimatedBell({ size, className }: { size: number; className?: string }) {
  return (
    <m.span variants={bellVariants} className={`inline-flex ${className || ''}`}>
      <Bell size={size} />
    </m.span>
  );
}

function AnimatedLock({
  size,
  className,
  open,
}: {
  size: number;
  className?: string;
  open: boolean;
}) {
  return (
    <m.span variants={lockVariants} className={`inline-flex ${className || ''}`}>
      {open ? <LockOpen size={size} /> : <Lock size={size} />}
    </m.span>
  );
}

const navLinks = [
  { href: '/', icon: AnimatedHome, label: 'Accueil', section: 'home' },
  { href: '/#a-propos', icon: AnimatedUser, label: 'À propos', section: 'a-propos' },
  { href: '/#mes-projets', icon: AnimatedProjects, label: 'Projets', section: 'mes-projets' },
  { href: '/#contact', icon: AnimatedSend, label: 'Contact & CV', section: 'contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  useLockBodyScroll(isOpen);

  const isAdminPage = pathname.startsWith('/admin') || pathname === '/admin-login';
  const isMessagesPage = pathname === '/admin/messages';
  const isDashboardPage = pathname.startsWith('/admin') && !isMessagesPage;

  const fetchUnread = useCallback(async () => {
    if (status !== 'authenticated') return;
    try {
      const res = await getUnreadCountAction();
      if (res.success && res.data) {
        setUnreadCount((res.data as { count: number }).count || 0);
      }
    } catch {}
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUnread();
    }, 0);

    const interval = setInterval(fetchUnread, 30000);
    const handleUnreadUpdate = () => {
      void fetchUnread();
    };
    window.addEventListener('unread-updated', handleUnreadUpdate);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('unread-updated', handleUnreadUpdate);
    };
  }, [fetchUnread]);

  // Sync IntersectionObserver for scroll spy on hydrated sections
  useEffect(() => {
    if (isAdminPage) {
      // Return early; no IntersectionObserver needed dynamically for admin pages
      return;
    }

    let observer: IntersectionObserver | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const setupObserver = () => {
      const sections = navLinks
        .map((l) => document.getElementById(l.section))
        .filter(Boolean) as HTMLElement[];

      // If no sections are in the DOM yet, keep polling (might not be hydrated yet)
      if (sections.length === 0) return false;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { rootMargin: '-10% 0px -80% 0px', threshold: 0 },
      );

      sections.forEach((s) => observer!.observe(s));
      return true;
    };

    // Try immediately, then poll every 200ms (max 15 times = 3s)
    let attempts = 0;
    if (!setupObserver()) {
      pollTimer = setInterval(() => {
        attempts++;
        if (setupObserver() || attempts >= 15) {
          if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
        }
      }, 200);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (observer) observer.disconnect();
    };
  }, [isAdminPage, pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pathname === '/') {
        if (window.scrollY < 100 && activeSection !== 'home') {
          setActiveSection('home');
        }
      } else if (activeSection !== null) {
        setActiveSection(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname, activeSection]);

  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const hash = window.location.hash;
      // Wait for components to mount and animations to settle
      const timer = setTimeout(() => {
        smoothScrollTo(hash.substring(1), 2500);
        // Clear hash from URL after scroll finishes for consistency
        setTimeout(() => {
          if (window.location.hash === hash) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }, 2600);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();

    const timer = setTimeout(() => setIsMounted(true), 50);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleLinkClick = () => setIsOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 px-6 ${
        isMounted ? 'transition-[padding] duration-500' : ''
      } ${scrolled ? 'py-4' : 'py-6'}`}
    >
      <div
        className={`absolute inset-0 bg-white/95 dark:bg-[#0a0f1a]/95 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 shadow-lg pointer-events-none ${
          isMounted ? 'transition-opacity duration-500' : ''
        } ${scrolled ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="relative z-10 max-w-7xl mx-auto flex justify-between items-center px-2">
        <Link
          href="/"
          className="group flex items-center"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <h1
            aria-label="Hëdi OKBA"
            className="text-3xl font-bold font-(family-name:--font-space-grotesk) tracking-tight flex items-center"
          >
            <span aria-hidden="true" className="relative inline-flex">
              <span className="gradient-text-animated opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                Hëdi
              </span>
              <span className="absolute inset-0 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Hëdi
              </span>
            </span>
            <span aria-hidden="true" className="relative inline-flex ml-2">
              <span className="text-foreground opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                OKBA
              </span>
              <span className="absolute inset-0 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                OKBA
              </span>
            </span>
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === '/' && activeSection === link.section;
            return (
              <m.div key={link.section} initial="idle" whileHover="hover" animate="idle">
                <Link
                  href={link.href}
                  onClick={(e) => {
                    if (pathname === '/') {
                      e.preventDefault();
                      smoothScrollTo(link.section, 2500);
                    }
                  }}
                  className={`relative p-3 rounded-xl transition-all duration-300 group flex items-center ${
                    isActive
                      ? 'text-brand-400'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-foreground'
                  }`}
                  title={link.label}
                >
                  <Icon size={21} />

                  {isActive && (
                    <m.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-400 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
                    />
                  )}

                  <span className="absolute inset-0 rounded-xl bg-brand-400/0 group-hover:bg-brand-400/10 transition-colors duration-300" />
                </Link>
              </m.div>
            );
          })}

          {status === 'authenticated' && (
            <m.div initial="idle" whileHover="hover" animate="idle">
              <Link
                href="/admin/messages"
                className={`relative p-3 rounded-xl transition-all duration-300 group flex items-center ${
                  isMessagesPage
                    ? 'text-brand-400'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-foreground'
                }`}
                title="Messages"
              >
                <AnimatedBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-danger-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-md">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {isMessagesPage && (
                  <m.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-400 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
                  />
                )}
                <span className="absolute inset-0 rounded-xl bg-brand-400/0 group-hover:bg-brand-400/10 transition-colors duration-300" />
              </Link>
            </m.div>
          )}

          <m.div initial="idle" whileHover="hover" animate="idle">
            <Link
              href={status === 'authenticated' ? '/admin/dashboard' : '/admin-login'}
              className={`relative p-3 rounded-xl transition-all duration-300 group flex items-center ${
                isDashboardPage || pathname === '/admin-login'
                  ? 'text-danger-500'
                  : 'text-danger-500 hover:text-danger-400'
              }`}
              title="Admin"
            >
              <AnimatedLock size={21} open={status === 'authenticated'} />
              {(isDashboardPage || pathname === '/admin-login') && (
                <m.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-400 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
                />
              )}
              <span className="absolute inset-0 rounded-xl bg-danger-500/0 group-hover:bg-danger-500/10 transition-colors duration-300" />
            </Link>
          </m.div>

          <div className="ml-2 pl-3 border-l border-neutral-300/30 dark:border-neutral-600/30">
            <ThemeToggle />
          </div>
        </nav>

        <button
          className="md:hidden p-2 rounded-xl text-foreground hover:bg-brand-400/10 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <m.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <FiX size={26} />
              </m.span>
            ) : (
              <m.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <FiMenu size={26} />
              </m.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={handleLinkClick}
            />

            <m.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 glass bg-white/95! dark:bg-[#0a0f1a]/95! md:hidden flex flex-col pt-20 pb-8 px-6 z-50"
            >
              <button
                onClick={handleLinkClick}
                className="absolute top-6 right-6 p-2 rounded-xl hover:bg-brand-400/10 transition-colors"
                aria-label="Fermer"
              >
                <FiX size={24} />
              </button>

              <nav className="flex flex-col gap-2">
                {navLinks.map((link, i) => {
                  const Icon = link.icon;
                  const isActive = activeSection === link.section;
                  return (
                    <m.div
                      key={link.section}
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover="hover"
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => {
                          handleLinkClick();
                          if (window.location.pathname === '/') {
                            e.preventDefault();
                            const el = document.getElementById(link.section);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-brand-400/15 text-brand-400'
                            : 'hover:bg-brand-400/5 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        <Icon size={22} />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    </m.div>
                  );
                })}

                {status === 'authenticated' && (
                  <>
                    <m.div
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: (navLinks.length + 1) * 0.05 }}
                      whileHover="hover"
                    >
                      <Link
                        href="/admin/messages"
                        onClick={handleLinkClick}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-brand-500 hover:bg-brand-400/10 transition-all duration-200"
                      >
                        <div className="relative">
                          <AnimatedBell size={22} />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-danger-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">Messages</span>
                      </Link>
                    </m.div>
                  </>
                )}

                <m.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                  whileHover="hover"
                >
                  <Link
                    href={status === 'authenticated' ? '/admin/dashboard' : '/admin-login'}
                    onClick={handleLinkClick}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-danger-500 hover:bg-danger-500/10 transition-all duration-200"
                  >
                    <AnimatedLock size={22} open={status === 'authenticated'} />
                    <span className="font-medium">Admin</span>
                  </Link>
                </m.div>
              </nav>

              <div className="mt-auto pt-6 border-t border-neutral-300/20 dark:border-neutral-600/20 flex justify-center">
                <ThemeToggle />
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
