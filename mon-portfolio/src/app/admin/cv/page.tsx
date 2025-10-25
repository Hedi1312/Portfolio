"use client";
import { useState, useRef, useEffect } from "react";
import { GrDocumentPdf } from "react-icons/gr";
import { FiEye, FiDownload, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

export default function AdminCVPage() {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [fileSize, setFileSize] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Charger le CV existant
    useEffect(() => {
        fetch("/api/admin/cv")
            .then((res) => res.json())
            .then((data) => {
                if (data.url) {
                    setPreviewUrl(data.url);
                    setFileSize(data.size || null);
                    setFileName(data.name || null);
                }
            })
            .catch(() => console.warn("Aucun CV trouvé au chargement"));
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/cv", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        if (res.ok) {
            setMessage("✅ CV mis à jour avec succès !");
            setTimeout(() => setMessage(""), 5000);
            setPreviewUrl(data.url);
            setFileSize((file.size / 1024).toFixed(1) + " Ko");
            setFileName(data.name || file.name);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
            setMessage(`❌ Erreur : ${data.error}`);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 pt-40">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-900/70 border border-gray-700 rounded-2xl shadow-lg p-10 px-3 sm:px-10 w-full max-w-2xl mx-auto backdrop-blur-sm"
            >
                <h1 className="text-3xl font-bold mb-8 text-center text-teal-400">
                    Gestion du CV
                </h1>

                {/* === FORMULAIRE UPLOAD === */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 flex flex-col items-center"
                >
                    <label
                        htmlFor="file"
                        className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-600 rounded-xl p-10 cursor-pointer hover:border-teal-400 transition-colors"
                    >
                        <GrDocumentPdf className="text-teal-400 text-5xl mb-4" />
                        <p className="text-gray-300 text-center">
                            {file ? (
                                <>
                                    <span className="font-semibold text-white">
                                        {file.name}
                                    </span>{" "}
                                    prêt à être uploadé
                                </>
                            ) : (
                                <>
                                    Glisse ton fichier ici ou{" "}
                                    <span className="text-teal-400 underline">
                                        choisis-en un
                                    </span>
                                </>
                            )}
                        </p>
                        <input
                            id="file"
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={!file}
                        className="bg-teal-500 hover:bg-teal-400 px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        Mettre à jour le CV
                    </button>
                </form>

                {/* === MESSAGE === */}
                {message && (
                    <p
                        className={`my-6 rounded-lg text-center text-base p-3 ${
                            message.startsWith("✅")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {message}
                    </p>
                )}

                {/* === APERÇU DU CV === */}
                {previewUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="pt-10 mt-10 border-t border-gray-700"
                    >
                        <h2 className="text-xl font-semibold mb-6 text-center text-gray-200">
                            CV actuel :
                        </h2>

                        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-teal-500/20 transition-all">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <GrDocumentPdf className="text-red-500 text-3xl" />
                                    <div>
                                        <p className="font-medium text-gray-100 truncate max-w-[250px] sm:max-w-[300px]">
                                            {fileName || "Fichier inconnu"}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {fileSize || "Taille inconnue"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                                    >
                                        {showPreview ? (
                                            <>
                                                <FiX className="text-red-400" />
                                                Fermer
                                            </>
                                        ) : (
                                            <>
                                                <FiEye className="text-teal-400" />
                                                Voir
                                            </>
                                        )}
                                    </button>
                                    <a
                                        href={previewUrl}
                                        download
                                        className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        <FiDownload />
                                        Télécharger
                                    </a>
                                </div>
                            </div>

                            {showPreview && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="mt-6"
                                >
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-[70vh] sm:h-[80vh] border border-gray-700 rounded-lg shadow-inner overflow-auto"
                                        allow="fullscreen"
                                    />
                                    <p className="text-center mt-3 text-gray-400 text-sm">
                                        📱 Si la lecture est difficile,{" "}
                                        <a
                                            href={previewUrl}
                                            target="_blank"
                                            className="text-teal-400 underline"
                                        >
                                            ouvre le PDF en plein écran
                                        </a>.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </section>
    );
}
