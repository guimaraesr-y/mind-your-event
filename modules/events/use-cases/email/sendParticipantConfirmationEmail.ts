import { EmailService } from "@/lib/email/email-service";
import { EmailServiceFactory } from "@/lib/email/email-service.factory";
import { getTranslations } from "next-intl/server";
import { type ReactNode } from "react";
import { renderComponent } from "@/lib/server";
import { emailRetryService } from "@/lib/email/email-retry.service";
import { ParticipantConfirmationEmailTemplate } from "../../emails/participant-confirmation-email";

interface SendParticipantConfirmationEmailParams {
  email: string;
  userName: string;
  eventTitle: string;
  eventDescription: string;
  eventStartDate: string;
  eventEndDate: string;
  organizerName: string;
  availabilityLink: string;
}

/**
 * Use case for sending participant confirmation emails.
 * Sends an email when a participant successfully joins an event.
 */
export class SendParticipantConfirmationEmailUseCase {

  constructor(
    private emailService: EmailService = EmailServiceFactory.create(),
    private translations = getTranslations("Email.Event.ParticipantConfirmationEmail"),
    private template = ParticipantConfirmationEmailTemplate,
  ) {}

  public async execute(params: SendParticipantConfirmationEmailParams) {
    const { 
      email, 
      userName, 
      eventTitle, 
      eventDescription, 
      eventStartDate, 
      eventEndDate, 
      organizerName, 
      availabilityLink 
    } = params;

    const component = await this.template({
      userName,
      eventTitle,
      eventDescription,
      eventStartDate,
      eventEndDate,
      organizerName,
      availabilityLink,
    });
    const html = await this.getHtmlContent(component);

    const t = await this.translations;

    return this.emailService.sendMail(email, t("subtitle"), html);
  }

  /**
   * Execute with retry for reliable delivery.
   */
  public async executeWithRetry(params: SendParticipantConfirmationEmailParams) {
    await emailRetryService.executeWithRetry(() =>
      this.execute(params)
    );
  }

  private async getHtmlContent(component: ReactNode): Promise<string> {
    return await renderComponent(component);
  }
}
