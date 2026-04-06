'use client';
import { m } from 'framer-motion';
import Contact from './Contact';
import CV from './CV';

interface NextStepsProps {
  cvUrl: string | null;
}

export default function NextSteps({ cvUrl }: NextStepsProps) {
  return (
    <section
      id="contact"
      className="relative px-6 py-16 md:py-24 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-500 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,213,190,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <m.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] as const }}
        >
          <h3 className="text-3xl md:text-4xl section-heading font-bold">
            <span className="text-neutral-900 dark:text-white transition-colors duration-300">
              Contact
            </span>{' '}
            <span className="text-brand-400 transition-colors duration-300">& CV</span>
          </h3>
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <m.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.23, 1, 0.32, 1] as const }}
          >
            <Contact />
          </m.div>

          <m.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] as const }}
          >
            <CV initialUrl={cvUrl} />
          </m.div>
        </div>
      </div>
    </section>
  );
}
