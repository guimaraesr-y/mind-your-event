import nodemailer from "nodemailer";
import { EmailStrategy } from "../email-strategy";
import { ApiException } from "@/lib/exceptions/api";

export class GmailSMTPStrategy implements EmailStrategy {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  async sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
    try {
      await this.transporter.sendMail({
        from: `MindYourEvent <${process.env.GMAIL_EMAIL}>`,
        to,
        subject,
        html,
      });

      return true;
    } catch (err) {
      console.error(err);
      throw new ApiException("Email sending failed", 500);
    }
  }
}
