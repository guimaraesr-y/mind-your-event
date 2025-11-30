import { EmailService } from "./email-service";
import { EmailStrategy } from "./email-strategy";
import { GmailSMTPStrategy } from "./strategies/gmail-smtp.strategy";
import { MockEmailStrategy } from "./strategies/mock-email.strategy";
// import { ResendStrategy } from "./ResendStrategy" // TODO

type SupportedProviders = "gmail" | "mock" | "resend";

export class EmailServiceFactory {

    static create(): EmailService {
        const provider = (process.env.EMAIL_PROVIDER || "mock") as SupportedProviders;
        let strategy: EmailStrategy;

        switch (provider) {
            case "gmail":
                strategy = new GmailSMTPStrategy();
                break;

            // case "resend":
            //   strategy = new ResendStrategy(process.env.RESEND_API_KEY!);
            //   break;

            case "mock":
            default:
                strategy = new MockEmailStrategy();
                break;
        }

        return new EmailService(strategy);
    }

}
