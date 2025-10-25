"use client";
import { motion } from "framer-motion";

export default function Accueil() {
    return (
        <section
            id="home"
            className="flex flex-col items-center justify-center text-center min-h-screen px-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white"
        >
            <motion.h2
                className="text-5xl font-extrabold mb-4"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                Salut, moi c’est <span className="text-teal-400">Hëdi OKBA</span>
            </motion.h2>

            <p className="text-lg text-gray-300 max-w-xl mb-8">
                Développeur passionné par la création d’expériences web modernes,
                performantes et élégantes.
            </p>

            <a
                href="#mes-projets"
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 rounded-lg font-semibold transition-colors"
            >
                Voir mes projets
            </a>
        </section>
    );
}
