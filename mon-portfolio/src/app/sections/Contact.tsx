"use client";
import { useState, useEffect } from "react";
import { FiMail, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";

export default function Contact() {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [file, setFile] = useState<File | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useLockBodyScroll(isOpen);


    useEffect(() => {
        if (!isOpen) {
            setForm({ name: "", email: "", message: "" });
            setFile(null);
            setSubmitted(false);
        }
    }, [isOpen]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("message", form.message);
        if (file) formData.append("file", file);

        const res = await fetch("/api/contact", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            setSubmitted(true);
            setForm({ name: "", email: "", message: "" });
            setFile(null);
            setTimeout(() => setIsOpen(false), 2000);
        } else {
            const data = await res.json();
            alert(data.error || "Erreur lors de l’envoi du message.");
        }
    };

    return (
        <section id="contact" className="px-6 py-20 bg-gray-800 text-center text-white">
            <h3 className="text-3xl font-bold mb-6">Contact</h3>
            <p className="text-gray-300 mb-6">Tu veux collaborer ou discuter d’un projet ?</p>

            <button
                onClick={() => {
                    setSubmitted(false);
                    setIsOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 rounded-lg font-semibold transition-colors cursor-pointer mx-auto"
            >
                <FiMail className="text-lg" />
                Me contacter
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-900 rounded-2xl shadow-lg max-w-lg w-full p-8 relative border border-gray-700"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl cursor-pointer"
                            >
                                <FiX />
                            </button>

                            <h2 className="text-2xl font-bold text-teal-400 mb-6 text-center">
                                Contacte-moi
                            </h2>


                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                                    <div>
                                        <label className="block text-gray-300 mb-2">NOM Prénom</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-teal-400 focus:outline-none"
                                            placeholder="NOM Prénom"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-teal-400 focus:outline-none"
                                            placeholder="exemple@exemple.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2">Message</label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            required
                                            rows={4}
                                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-teal-400 focus:outline-none resize-none"
                                            placeholder="Mon message..."
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2">Pièce jointe</label>
                                        <input
                                            type="file"
                                            accept=".png,.jpg,.jpeg,.pdf"
                                            onChange={handleFileChange}
                                            className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-500 file:text-white hover:file:bg-teal-400 cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                        {/* Bouton Mailto */}
                                        <a
                                            href="mailto:hediokbapro@gmail.com?subject=Contact%20depuis%20le%20portfolio&body=Bonjour%20Hedi%2C%0A%0A"
                                            className="w-full sm:w-1/2 text-center bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
                                        >
                                            M’écrire directement
                                        </a>
                                        {/* Bouton Envoyer */}
                                        <button
                                            type="submit"
                                            className="w-full sm:w-1/2 bg-teal-500 hover:bg-teal-400 py-3 rounded-lg font-semibold transition-colors cursor-pointer"
                                        >
                                            Envoyer
                                        </button>

                                    </div>


                                </form>
                            ) : (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center text-green-400 font-medium text-lg"
                                >
                                    ✅ Message envoyé avec succès !
                                </motion.p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
