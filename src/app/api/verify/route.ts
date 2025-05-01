import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {

        const { code } = await req.json();

        if (!code || typeof code !== "string") {
            return Response.json({ error: "No Input Received" }, { status: 400 })
        }

        const hashedPassword = process.env.HASHED_PASSWORD_CODE!;
        const pepper = process.env.PEPPER_CODE!;

        const decodedHash = Buffer.from(hashedPassword, 'base64').toString();
        const isMatch = await bcrypt.compare(code + pepper, decodedHash);

        if (isMatch) {
            return Response.json({ success: true }, { status: 200 })
        } else {
            return Response.json({ success: false }, { status: 201 })
        }

    } catch (error) {
        console.log(error);

        return new Response("Internal server error", { status: 500 })
    }
}
