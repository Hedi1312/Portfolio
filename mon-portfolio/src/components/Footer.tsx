import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-6 border-t border-gray-800">
            <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-2 flex-wrap text-sm">
                <p>
                    © {new Date().getFullYear()}{" "}
                    <span className="text-white font-semibold">Hëdi OKBA</span> - Tous droits réservés.
                </p>

                <div className="flex space-x-3">
                    <a
                        href="https://github.com/Hedi1312"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-teal-400 transition-colors"
                        aria-label="GitHub"
                    >
                        <FaGithub size={20} />
                    </a>
                    <a
                        href="https://linkedin.com/in/hedi-okba"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-teal-400 transition-colors"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedin size={20} />
                    </a>
                </div>
            </div>
        </footer>
    );
}
