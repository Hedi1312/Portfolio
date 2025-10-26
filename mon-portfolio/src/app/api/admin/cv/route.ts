import { NextResponse } from "next/server";
import { mkdir, writeFile, stat } from "fs/promises";
import path from "path";

// GET → renvoie l'URL publique du CV + taille + nom
export async function GET() {
    const filePath = path.join(process.cwd(), "public", "cv", "CV_OKBA_Hedi.pdf");
    try {
        const stats = await stat(filePath);
        const sizeKo = (stats.size / 1024).toFixed(1);
        return NextResponse.json({
            url: "/cv/CV_OKBA_Hedi.pdf",
            size: `${sizeKo} Ko`,
            name: "CV_OKBA_Hedi.pdf",
        });
    } catch {
        return NextResponse.json({ url: null, size: null, name: null });
    }
}

// POST → upload du nouveau CV
export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
        return NextResponse.json(
            { error: "Le fichier doit être au format PDF." },
            { status: 400 }
        );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const folderPath = path.join(process.cwd(), "public", "cv");
    const filePath = path.join(folderPath, "CV_OKBA_Hedi.pdf");

    try {
        await mkdir(folderPath, { recursive: true });
        await writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            url: "/cv/CV_OKBA_Hedi.pdf",
            name: file.name, // le vrai nom d’origine
            message: "CV mis à jour avec succès.",
        });
    } catch (err) {
        console.error("Erreur upload CV:", err);
        return NextResponse.json(
            { error: "Erreur lors de l’enregistrement du fichier." },
            { status: 500 }
        );
    }
}
