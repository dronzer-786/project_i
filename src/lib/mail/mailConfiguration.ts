'use server'
import nodemailer from 'nodemailer'
export async function sendMail({  subject, body }: {  subject: string, body: string }) {
    const {  SMPT_HOST, SMPT_USER, SMPT_PASS } = process.env;

    const transport = nodemailer.createTransport({
        host: SMPT_HOST,
        port: 587,
        secure: false,
        auth: {
            user: SMPT_USER,
            pass: SMPT_PASS
        }
    });
    try {
        const sendResult = await transport.sendMail({
            from: 'mdtaqui.jhar@gmail.com',
            to: 'mdtaqui.jhar@gmail.com',
            subject,
            html: body
        })
        return sendResult.accepted.length > 0 ? true : false;

    } catch (error) {
        console.log(error);
        return error
    }

}