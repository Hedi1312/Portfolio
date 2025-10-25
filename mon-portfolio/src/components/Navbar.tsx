"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { FaHome, FaUser, FaFolderOpen, FaEnvelope } from "react-icons/fa";
import { LuFileText } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const handleLinkClick = () => setIsOpen(false);

    return (
        <header className="fixed w-full bg-gray-800 backdrop-blur-sm text-white flex justify-between items-center p-6 shadow-lg z-50">
            {/* Logo */}
            <h1 className="text-2xl font-bold">
                <Link href="/">Mon Portfolio</Link>
            </h1>

            {/* Menu desktop avec icônes */}
            <nav className="hidden md:flex items-center space-x-8 text-xl">
                <Link href="/" className="hover:text-teal-400 transition" title="Accueil">
                    <FaHome size={30}/>
                </Link>
                <Link href="/#a-propos" className="hover:text-teal-400 transition" title="À propos">
                    <FaUser size={30}/>
                </Link>
                <Link href="/#mes-projets" className="hover:text-teal-400 transition" title="Projets">
                    <FaFolderOpen size={30}/>
                </Link>
                <Link href="/#cv" className="hover:text-teal-400 transition" title="Cv">
                    <LuFileText size={30}/>
                </Link>
                <Link href="/#contact" className="hover:text-teal-400 transition" title="Contact">
                    <FaEnvelope size={30}/>
                </Link>
            </nav>

            {/* Bouton menu mobile */}
            <button
                className="md:hidden text-white"
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

            {/* Menu mobile en grille avec séparateur */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-full bg-gray-900/95 backdrop-blur-md md:hidden flex flex-col items-center py-6"
                    >
                        {/* 🔹 Trait de séparation */}
                        <div className="w-full border-t border-white mb-6"></div>

                        {/* Grille d’icônes */}
                        <div className="grid grid-cols-4 gap-10 text-3xl justify-items-center">
                            <Link href="/" onClick={handleLinkClick} className="hover:text-teal-400 transition" title="Accueil">
                                <FaHome size={30} />
                            </Link>
                            <Link href="#a-propos" onClick={handleLinkClick} className="hover:text-teal-400 transition" title="À propos">
                                <FaUser size={30} />
                            </Link>
                            <Link href="#mes-projets" onClick={handleLinkClick} className="hover:text-teal-400 transition" title="Projets">
                                <FaFolderOpen size={30} />
                            </Link>
                            <Link href="#cv" onClick={handleLinkClick} className="hover:text-teal-400 transition" title="Cv">
                                <LuFileText size={30}/>
                            </Link>
                            <Link href="#contact" onClick={handleLinkClick} className="hover:text-teal-400 transition" title="Contact">
                                <FaEnvelope size={30} />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
