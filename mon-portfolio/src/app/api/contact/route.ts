import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const message = formData.get("message") as string;
        const file = formData.get("file") as File | null;

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
        }

        let attachments = [];

        // Si un fichier est présent, on le convertit en base64
        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            attachments.push({
                filename: file.name,
                content: buffer.toString("base64"),
            });
        }

        // Envoi via Resend
        await resend.emails.send({
            from: "Portfolio Hedi <onboarding@resend.dev>",
            to: process.env.GMAIL_USER!,
            subject: `📩 Nouveau message depuis ton portfolio de ${name}`,
            html: `
                <h2>Message de ${name}</h2>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Message :</strong></p>
                <p>${message}</p>
                ${file ? `<p>📎 Pièce jointe : ${file.name}</p>` : ""}
            `,
            attachments,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur envoi mail :", error);
        return NextResponse.json({ error: "Erreur lors de l’envoi du message." }, { status: 500 });
    }
}
