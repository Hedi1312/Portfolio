// hooks/useLockBodyScroll.ts
"use client";
import { useEffect } from "react";

export function useLockBodyScroll(isLocked: boolean) {
    useEffect(() => {
        if (isLocked) {
            const scrollY = window.scrollY;
            // Fige le body à la position actuelle
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";
        } else {
            // Restaure le scroll
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            // Replace à la position d’avant ouverture
            if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1);
        }

        return () => {
            // Nettoyage si le composant est démonté avec le body encore bloqué
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1);
        };
    }, [isLocked]);
}