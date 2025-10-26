"use client";
import { useEffect } from "react";

export function useLockBodyScroll(isLocked: boolean) {
    useEffect(() => {
        // Fonction qui restaure le body dans son état initial
        const unlockScroll = () => {
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1);
        };

        if (isLocked) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";
        } else {
            unlockScroll();
        }

        // Nettoyage automatique à la fin du cycle
        return unlockScroll;
    }, [isLocked]);
}
