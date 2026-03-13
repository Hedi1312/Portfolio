'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaHome, FaUser, FaFolderOpen, FaEnvelope, FaUnlockAlt } from 'react-icons/fa';
import { LuFileText } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { status } = useSession();

  const handleLinkClick = () => setIsOpen(false);

  return (
    <header className="fixed w-full bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md text-neutral-900 dark:text-white flex justify-between items-center p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-lg z-50 transition-colors duration-300">
      {/* Logo */}
      <h1 className="text-2xl font-bold">
        <Link href="/">Mon Portfolio</Link>
      </h1>

      {/* Menu desktop avec icônes */}
      <nav className="hidden md:flex items-center space-x-8 text-xl">
        <Link href="/" className="hover:text-brand-400 transition" title="Accueil">
          <FaHome size={30} />
        </Link>
        <Link href="/#a-propos" className="hover:text-brand-400 transition" title="À propos">
          <FaUser size={30} />
        </Link>
        <Link href="/#mes-projets" className="hover:text-brand-400 transition" title="Projets">
          <FaFolderOpen size={30} />
        </Link>
        <Link href="/#cv" className="hover:text-brand-400 transition" title="Cv">
          <LuFileText size={30} />
        </Link>
        <Link href="/#contact" className="hover:text-brand-400 transition" title="Contact">
          <FaEnvelope size={30} />
        </Link>
        {status === 'authenticated' && (
          <Link
            href="/admin/dashboard"
            className="text-danger-500 hover:text-danger-400 transition flex items-center gap-2"
            title="Admin"
          >
            <FaUnlockAlt size={30} />
          </Link>
        )}
        <div className="pl-4 border-l border-neutral-300 dark:border-neutral-600 transition-colors">
          <ThemeToggle />
        </div>
      </nav>

      {/* Bouton menu mobile */}
      <button
        className="md:hidden text-neutral-900 dark:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <FiX size={28} />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <FiMenu size={28} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Menu mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl md:hidden flex flex-col items-center py-8 border-t border-neutral-200 dark:border-neutral-700 shadow-xl"
          >
            <div className="grid grid-cols-4 gap-8 text-4xl justify-items-center">
              <Link
                href="/"
                onClick={handleLinkClick}
                className="hover:text-brand-400 transition flex flex-col items-center"
              >
                <FaHome size={38} />
                <span className="text-sm mt-2">Accueil</span>
              </Link>

              <Link
                href="#a-propos"
                onClick={handleLinkClick}
                className="hover:text-brand-400 transition flex flex-col items-center"
              >
                <FaUser size={38} />
                <span className="text-sm mt-2">À propos</span>
              </Link>

              <Link
                href="#mes-projets"
                onClick={handleLinkClick}
                className="hover:text-brand-400 transition flex flex-col items-center"
              >
                <FaFolderOpen size={38} />
                <span className="text-sm mt-2">Projets</span>
              </Link>

              <Link
                href="#cv"
                onClick={handleLinkClick}
                className="hover:text-brand-400 transition flex flex-col items-center"
              >
                <LuFileText size={38} />
                <span className="text-sm mt-2">CV</span>
              </Link>

              <Link
                href="#contact"
                onClick={handleLinkClick}
                className="hover:text-brand-400 transition flex flex-col items-center"
              >
                <FaEnvelope size={38} />
                <span className="text-sm mt-2">Contact</span>
              </Link>

              {status === 'authenticated' && (
                <div className="col-span-4 mt-4 w-full flex justify-center border-t border-neutral-200 dark:border-neutral-700 pt-6">
                  <Link
                    href="/admin/dashboard"
                    onClick={handleLinkClick}
                    className="text-danger-500 hover:text-danger-400 transition flex flex-col items-center"
                  >
                    <FaUnlockAlt size={38} />
                    <span className="text-sm mt-2 font-semibold">Admin</span>
                  </Link>
                </div>
              )}

              <div className="col-span-4 mt-2 flex justify-center w-full">
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
