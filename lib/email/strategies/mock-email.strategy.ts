import { EmailStrategy } from "../email-strategy";

export class MockEmailStrategy implements EmailStrategy {
  async sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
    console.log("🧪 [MOCK EMAIL]");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Content:", html);
    console.log("-----------------------------");
    return true;
  }
}
