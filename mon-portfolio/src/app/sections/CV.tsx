"use client";
import { useState, useEffect } from "react";
import { GrDocumentPdf } from "react-icons/gr";
import { FiEye } from "react-icons/fi";

export default function CV() {
    const [cvUrl, setCvUrl] = useState("/cv/CV_OKBA_Hedi.pdf");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetch("/api/admin/cv")
            .then((res) => res.json())
            .then((data) => {
                if (data.url) {
                    // Ajoute un timestamp pour éviter le cache navigateur
                    setCvUrl(`${data.url}?t=${Date.now()}`);
                }
            })
            .catch((err) => console.error("Erreur chargement CV :", err));
    }, []);

    return (
        <section id="cv" className="px-6 py-20 bg-gray-900 text-center text-white">
            <h3 className="text-3xl font-bold mb-6">Mon CV</h3>
            <p className="text-gray-300 mb-8">
                Consulte mon CV ou télécharge-le directement.
            </p>

            <div className="flex justify-center gap-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                    <FiEye className="text-white text-lg" />
                    Voir mon CV
                </button>

                <a
                    href={cvUrl}
                    download
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                    <GrDocumentPdf className="w-5 h-5 text-red-400" />
                    Télécharger
                </a>
            </div>

            {isOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl shadow-lg max-w-5xl w-full p-4 relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-3 text-gray-400 hover:text-white text-3xl cursor-pointer"
                        >
                            ✕
                        </button>

                        <iframe
                            src={cvUrl}
                            title="CV Hedi OKBA"
                            className="w-full h-[80vh] rounded-lg border border-gray-700"
                        ></iframe>
                    </div>
                </div>
            )}
        </section>
    );
}
