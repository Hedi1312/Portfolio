import { NextResponse } from "next/server";
import { Resend } from "resend";

import { AdminNotification } from "@/emails/AdminNotification";
import { UserConfirmation } from "@/emails/UserConfirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const message = formData.get("message") as string;
        const file = formData.get("file") as File | null;
        const honeypot = formData.get("company") as string;

        if (honeypot) return NextResponse.json({ success: true });

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Champs requis." }, { status: 400 });
        }

        const attachments = [];
        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            attachments.push({
                filename: file.name,
                content: buffer.toString("base64"),
            });
        }

        await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: process.env.EMAIL_TO!,
            replyTo: email,
            subject: `Nouveau message de ${name}`,
            react: AdminNotification({ name, email, message }),
            attachments,
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: email,
            subject: "Merci pour ton message !",
            react: UserConfirmation({ name }),
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
    }
}