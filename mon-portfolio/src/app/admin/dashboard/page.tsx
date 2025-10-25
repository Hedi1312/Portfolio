"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Trophy, Ticket, LogOut, CirclePlus, BellRing, LoaderPinwheel } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();

    const handleLogout = () => {
        sessionStorage.removeItem("admin_logged_in");
        window.dispatchEvent(new Event("admin-logout"));
        router.push("/admin-login");
    };

    const actions = [
        {
            title: "Modifier mon CV",
            description: "Consultez la liste des tickets déjà achetés",
            icon: <Ticket className="h-8 w-8 text-red-500" />,
            onClick: () => router.push("/admin/cv"),
        },
        {
            title: "Créer des tickets",
            description: "Créer des tickets à partir des infos de l'acheteur",
            icon: <CirclePlus className="h-8 w-8 text-green-600" />,
            onClick: () => router.push("/admin/creer-ticket"),
        },
        {
            title: "Déterminer les gagnants",
            description: "Choisir le nombre de gagnants, les ajouter aléatoirement et leur envoyer un email",
            icon: <Trophy className="h-8 w-8 text-yellow-500" />,
            onClick: () => router.push("/admin/choix-gagnant"),
        },
        {
            title: "Roue de la chance",
            description: "Modifier le taux de victoire de la roue et afficher la liste des participants",
            icon: <LoaderPinwheel className="h-8 w-8 text-green-600" />,
            onClick: () => router.push("/admin/roue-probabilite"),
        },
        {
            title: "Choisir la date du tirage",
            description: "Modifiez la date prévue pour le prochain tirage",
            icon: <CalendarDays className="h-8 w-8 text-indigo-600" />,
            onClick: () => router.push("/admin/choix-date"),
        },
        {
            title: "Prévenir les participants",
            description: "Envoyer un email aux participants inscrits que le tirage a eu lieu",
            icon: <BellRing className="h-8 w-8 text-yellow-500" />,
            onClick: () => router.push("/admin/envoyer-notifications"),
        },


    ];

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50">
            <div className="mx-auto max-w-5xl w-full mb-12 mt-20">
                {/* Titre + bouton logout */}
                <div className="flex flex-col items-center lg:flex-row lg:justify-center lg:gap-4 mb-10 w-full relative">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center">
                        👨🏻‍💻 Espace Admin
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="mt-4 lg:absolute lg:right-0 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 cursor-pointer"
                    >
                        <LogOut className="h-5 w-5" /> Déconnexion
                    </button>
                </div>

                {/* Actions grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {actions.map((action, index) => (
                        <div
                            key={index}
                            onClick={action.onClick}
                            className="cursor-pointer rounded-2xl bg-white p-6 shadow-md transition hover:scale-105 hover:shadow-xl"
                        >
                            <div className="flex items-center justify-center rounded-xl bg-gray-100 p-4">
                                {action.icon}
                            </div>
                            <h2 className="mt-4 text-xl font-semibold text-gray-800">{action.title}</h2>
                            <p className="mt-2 text-sm text-gray-600">{action.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}