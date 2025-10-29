import { EmailService } from "@/lib/email/email-service";
import { EmailServiceFactory } from "@/lib/email/email-service.factory";
import { getTranslations } from "next-intl/server";
import { type ReactNode } from "react";
import { renderComponent } from "@/lib/server";
import { EventInviteEmailTemplate } from "../../emails/invite-email";

interface SendEventInviteEmailParams {
  emails: string[];
  eventTitle: string;
  eventDescription: string;
  authorName: string;
  inviteLink: string;
}

/**
 * Use case for sending event invite emails.
 * Only used when sending unique link to participants
 */
export class SendEventInviteEmailUseCase {

  constructor(
    private emailService: EmailService = EmailServiceFactory.create(),
    private translations = getTranslations("Email.Event.InviteEmail"),
    private template = EventInviteEmailTemplate,
  ) {}

  public async execute(params: SendEventInviteEmailParams) {
    const { emails, eventTitle, eventDescription, inviteLink, authorName } = params;

    const t = await this.translations;

    const component = await this.template({
      eventTitle,
      eventDescription,
      inviteLink,
      authorName,
    });
    const html = await this.getHtmlContent(component);

    return this.emailService.sendMail(emails, t("title"), html);
  }

  private async getHtmlContent(component: ReactNode): Promise<string> {
    return await renderComponent(component);
  }
}
