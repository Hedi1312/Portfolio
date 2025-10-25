"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/admin-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const result = await res.json();

            if (result.success) {
                sessionStorage.setItem("admin_logged_in", "true");
                window.dispatchEvent(new Event("admin-login"));
                router.push("/admin/dashboard");
            } else {
                setError(result.message);
                setLoading(false);
            }
        } catch {
            setError("Erreur de connexion");
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50">
            <div className="w-full max-w-xl mx-auto rounded-2xl bg-white p-8 shadow-md mb-12 mt-20">

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center ">👨🏻‍💻 Connexion Admin</h1>

                {error && <p className="mb-4 mt-10 rounded-lg bg-red-100 p-2 text-center text-red-600">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-4 text-gray-700 mt-12 max-w-sm mx-auto">
                    <div>
                        <label className="block text-sm font-medium">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="********"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 mt-4 mb-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>
            </div>
        </section>
    );
}