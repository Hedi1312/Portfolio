import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH!;

export async function POST(req: NextRequest) {


    const { password } = await req.json();


    const isValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);

    if (isValid) {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ success: false, message: "Mot de passe incorrect" });
    }
}