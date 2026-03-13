'use client';
import { motion } from 'framer-motion';

export default function MesProjets() {
  const projets = ['Projet 1', 'Projet 2', 'Projet 3'];

  return (
    <section
      id="mes-projets"
      className="px-6 py-20 bg-neutral-50 dark:bg-neutral-800 text-center text-neutral-900 dark:text-white transition-colors duration-300"
    >
      <h3 className="text-3xl font-bold mb-10">Mes Projets</h3>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {projets.map((title, i) => (
          <motion.div
            key={i}
            className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg hover:shadow-brand-400/30 transition-shadow duration-300"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
          >
            <h4 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">{title}</h4>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              Description rapide du projet, technologies utilisées ou lien vers le code source.
            </p>
            <a href="#" className="text-brand-400 hover:underline">
              Voir le projet →
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
