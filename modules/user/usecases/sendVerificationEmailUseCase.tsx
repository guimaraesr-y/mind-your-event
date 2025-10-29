import { EmailService } from "@/lib/email/email-service";
import { EmailServiceFactory } from "@/lib/email/email-service.factory";
import { getTranslations } from "next-intl/server";
import { VerifyUserTemplate } from "../emails/verify-user";
import { GenerateEmailTokenUseCase } from "./generateEmailTokenUseCase";
import { type ReactNode } from "react";
import { renderComponent } from "@/lib/server";

export class SendVerificationEmailUseCase {

    constructor(
        private emailService: EmailService = EmailServiceFactory.create(),
        private translations = getTranslations("UserEmail.VerifyEmail"),
        private tokenService = new GenerateEmailTokenUseCase(),
        private template = VerifyUserTemplate,
    ) {}

    public async execute(email: string) {
        const token = await this.getToken(email);

        const t = await this.translations;
        const component = await this.template({ email, token });
        const html = await this.getHtmlContent(component);

        return this.emailService.sendMail(
            email,
            t("subject"),
            html,
        );
    }

    private async getHtmlContent(component: ReactNode): Promise<string> {
        return await renderComponent(component);
    }

    private async getToken(email: string): Promise<string> {
        const { token } = await this.tokenService.execute(email);
        return token;
    }

}
