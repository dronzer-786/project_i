"use server"
import bcrypt from 'bcryptjs'

export const verifyPassword = async (code: string) => {
    try {
        if (!code || typeof code !== "string") {
            return { success: false, error: "No Input Received" }
        }

        const hashedPassword = process.env.HASHED_PASSWORD_CODE!;
        const pepper = process.env.PEPPER_CODE!;

        const decodedHash = Buffer.from(hashedPassword, 'base64').toString();
        const isMatch = await bcrypt.compare(code + pepper, decodedHash);

        if (isMatch) {
            return { success: true }
        } else {
            return { success: false }
        }

    } catch (error) {
        console.log(error);
        return { success: false, error: "Internal server error" }
    }
}
