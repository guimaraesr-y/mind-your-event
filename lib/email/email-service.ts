import { EmailStrategy } from "./email-strategy";

export class EmailService {
    
    constructor(
        private readonly strategy: EmailStrategy
    ) { }

    async sendMail(to: string | string[], subject: string, html: string) {
        return this.strategy.sendMail({ to, subject, html });
    }

}
