"use client";
import Link from "next/link";

export default function Navbar() {
    return (
        <header className="fixed w-full bg-gray-900/90 backdrop-blur-sm text-white flex justify-between items-center p-6 shadow-lg z-50">
            <h1 className="text-2xl font-bold">
                <Link href="/">Mon Portfolio</Link>
            </h1>
            <nav className="space-x-6">
                <a href="/" className="hover:text-teal-400">Accueil</a>
                <a href="#a-propos" className="hover:text-teal-400">À propos</a>
                <a href="#mes-projets" className="hover:text-teal-400">Projets</a>
                <a href="#contact" className="hover:text-teal-400">Contact</a>
            </nav>
        </header>
    );
}
