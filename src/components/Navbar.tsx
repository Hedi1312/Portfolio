'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import {
  FaHome,
  FaUser,
  FaFolderOpen,
  FaEnvelope,
  FaLock,
  FaUnlockAlt,
  FaBell,
} from 'react-icons/fa';
import { LuFileText } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useSession } from 'next-auth/react';

const navLinks = [
  { href: '/', icon: FaHome, label: 'Accueil', section: 'home' },
  { href: '/#a-propos', icon: FaUser, label: 'À propos', section: 'a-propos' },
  { href: '/#mes-projets', icon: FaFolderOpen, label: 'Projets', section: 'mes-projets' },
  { href: '/#cv', icon: LuFileText, label: 'CV', section: 'cv' },
  { href: '/#contact', icon: FaEnvelope, label: 'Contact', section: 'contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const { status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(() => {
    if (status !== 'authenticated') return;
    fetch('/api/admin/messages/unread-count')
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    const handleUnreadUpdate = () => fetchUnread();
    window.addEventListener('unread-updated', handleUnreadUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('unread-updated', handleUnreadUpdate);
    };
  }, [fetchUnread]);

  // Detect active section via IntersectionObserver
  useEffect(() => {
    const sections = navLinks
      .map((l) => document.getElementById(l.section))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Detect scroll for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => setIsOpen(false);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled ? 'glass shadow-lg py-4' : 'bg-transparent py-6'
      }`}
      style={{ padding: scrolled ? '1rem 1.5rem' : '1.5rem' }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-2">
        {/* Logo */}
        <Link href="/" className="group">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
            <span className="gradient-text-animated">Hëdi</span>
            <span className="text-foreground ml-2 group-hover:text-brand-400 transition-colors duration-300">
              OKBA
            </span>
          </h1>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.section;
            return (
              <Link
                key={link.section}
                href={link.href}
                className={`relative p-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'text-brand-400'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-foreground'
                }`}
                title={link.label}
              >
                <Icon
                  size={22}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {/* Hover glow */}
                <span className="absolute inset-0 rounded-xl bg-brand-400/0 group-hover:bg-brand-400/10 transition-colors duration-300" />
              </Link>
            );
          })}

          {status === 'authenticated' && (
            <Link
              href="/admin/messages"
              className="relative p-3 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-foreground transition-all duration-300 group"
              title="Messages"
            >
              <FaBell
                size={20}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-danger-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <span className="absolute inset-0 rounded-xl bg-brand-400/0 group-hover:bg-brand-400/10 transition-colors duration-300" />
            </Link>
          )}

          <Link
            href={status === 'authenticated' ? '/admin/dashboard' : '/admin-login'}
            className="relative p-3 rounded-xl text-danger-500 hover:text-danger-400 transition-all duration-300 group"
            title="Admin"
          >
            {status === 'authenticated' ? (
              <FaUnlockAlt
                size={22}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            ) : (
              <FaLock
                size={22}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            )}
            <span className="absolute inset-0 rounded-xl bg-danger-500/0 group-hover:bg-danger-500/10 transition-colors duration-300" />
          </Link>

          <div className="ml-2 pl-3 border-l border-neutral-300/30 dark:border-neutral-600/30">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-xl text-foreground hover:bg-brand-400/10 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <FiX size={26} />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <FiMenu size={26} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={handleLinkClick}
            />
            {/* Slide-in panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 glass md:hidden flex flex-col pt-20 pb-8 px-6 z-50"
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
                    <motion.div
                      key={link.section}
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-brand-400/15 text-brand-400'
                            : 'hover:bg-brand-400/5 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        <Icon size={22} />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                >
                  <Link
                    href={status === 'authenticated' ? '/admin/dashboard' : '/admin-login'}
                    onClick={handleLinkClick}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-danger-500 hover:bg-danger-500/10 transition-all duration-200"
                  >
                    {status === 'authenticated' ? <FaUnlockAlt size={22} /> : <FaLock size={22} />}
                    <span className="font-medium">Admin</span>
                  </Link>
                </motion.div>

                {status === 'authenticated' && (
                  <>
                    <motion.div
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: (navLinks.length + 1) * 0.05 }}
                    >
                      <Link
                        href="/admin/messages"
                        onClick={handleLinkClick}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-brand-500 hover:bg-brand-400/10 transition-all duration-200"
                      >
                        <div className="relative">
                          <FaBell size={22} />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-danger-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">Messages</span>
                      </Link>
                    </motion.div>
                  </>
                )}
              </nav>

              <div className="mt-auto pt-6 border-t border-neutral-300/20 dark:border-neutral-600/20 flex justify-center">
                <ThemeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
