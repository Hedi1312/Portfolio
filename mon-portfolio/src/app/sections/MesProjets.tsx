"use client";
import { motion } from "framer-motion";

export default function MesProjets() {
    const projets = ["Projet 1", "Projet 2", "Projet 3"];

    return (
        <section id="mes-projets" className="px-6 py-20 bg-gray-800 text-center text-white">
            <h3 className="text-3xl font-bold mb-10">Mes Projets</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {projets.map((title, i) => (
                    <motion.div
                        key={i}
                        className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-teal-400/30 transition-shadow"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.2 }}
                    >
                        <h4 className="text-xl font-semibold mb-2">{title}</h4>
                        <p className="text-gray-400 text-sm mb-4">
                            Description rapide du projet, technologies utilisées ou lien vers le code source.
                        </p>
                        <a href="#" className="text-teal-400 hover:underline">
                            Voir le projet →
                        </a>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
