import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 py-6 border-t border-neutral-800">
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-2 flex-wrap text-sm">
        <p>
          © {new Date().getFullYear()} <span className="text-white font-semibold">Hëdi OKBA</span> -
          Tous droits réservés.
        </p>

        <div className="flex space-x-3">
          <a
            href="https://github.com/Hedi1312"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-400 transition-colors"
            aria-label="GitHub"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="https://linkedin.com/in/hedi-okba"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-400 transition-colors"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
