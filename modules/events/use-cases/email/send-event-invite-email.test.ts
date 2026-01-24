import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendEventInviteEmailUseCase } from './sendEventInviteEmail';
import { EmailService } from '@/lib/email/email-service';

// Mock dependencies
vi.mock('@/lib/server', () => ({
    renderComponent: vi.fn().mockResolvedValue('<html>Rendered</html>'),
}));

describe('SendEventInviteEmailUseCase', () => {
    let useCase: SendEventInviteEmailUseCase;
    let mockEmailService: any;
    let mockTranslations: any;
    let mockTemplate: any;

    beforeEach(() => {
        mockEmailService = {
            sendMail: vi.fn().mockResolvedValue(undefined),
        } as unknown as EmailService;

        mockTranslations = vi.fn((key: string) => {
            if (key === 'title') return 'You are invited!';
            return key;
        });

        mockTemplate = vi.fn().mockReturnValue('TemplateComponent');

        useCase = new SendEventInviteEmailUseCase(
            mockEmailService,
            Promise.resolve(mockTranslations),
            mockTemplate
        );
    });

    it('should generate html and send email', async () => {
        const params = {
            email: 'invitee@test.com',
            eventTitle: 'Birthday Party',
            eventDescription: 'Fun time',
            authorName: 'John Doe',
            inviteLink: 'http://example.com/invite',
        };

        await useCase.execute(params);

        // Verify template was called with correct params
        expect(mockTemplate).toHaveBeenCalledWith({
            eventTitle: params.eventTitle,
            eventDescription: params.eventDescription,
            inviteLink: params.inviteLink,
            authorName: params.authorName,
        });

        // Verify email service was called
        expect(mockEmailService.sendMail).toHaveBeenCalledWith(
            params.email,
            'You are invited!',
            '<html>Rendered</html>'
        );
    });
});
