import { EmailService } from "@/lib/email/email-service";
import { EmailServiceFactory } from "@/lib/email/email-service.factory";
import { getTranslations } from "next-intl/server";
import { type ReactNode } from "react";
import { renderComponent } from "@/lib/server";
import { EventFinalizedEmailTemplate } from "../../emails/event-finalized-email";

interface SendEventFinalizedEmailParams {
  email: string;
  userName: string;
  eventTitle: string;
  eventLink: string;
  finalizedDate: string;
  finalizedTime: string;
}

/**
 * Use case for sending event finalized emails.
 */
export class SendEventFinalizedEmailUseCase {

  constructor(
    private emailService: EmailService = EmailServiceFactory.create(),
    private translations = getTranslations("Email.Event.FinalizedEmail"),
    private template = EventFinalizedEmailTemplate,
  ) {}

  public async execute(params: SendEventFinalizedEmailParams) {
    const {
      userName,
      email,
      eventTitle,
      eventLink,
      finalizedDate,
      finalizedTime,
    } = params;

    const t = await this.translations;

    const component = await this.template({
      userName,
      eventTitle,
      eventLink,
      finalizedDate,
      finalizedTime,
    });
    const html = await this.getHtmlContent(component);

    return this.emailService.sendMail(email, t("subtitle"), html);
  }

  private async getHtmlContent(component: ReactNode): Promise<string> {
    return await renderComponent(component);
  }

}
