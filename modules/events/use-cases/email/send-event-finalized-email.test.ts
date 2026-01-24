import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendEventFinalizedEmailUseCase } from './sendEventFinalizedEmail';
import { EmailService } from '@/lib/email/email-service';

// Mock dependencies
vi.mock('@/lib/server', () => ({
    renderComponent: vi.fn().mockResolvedValue('<html>Rendered Finalized</html>'),
}));

describe('SendEventFinalizedEmailUseCase', () => {
    let useCase: SendEventFinalizedEmailUseCase;
    let mockEmailService: any;
    let mockTranslations: any;
    let mockTemplate: any;

    beforeEach(() => {
        mockEmailService = {
            sendMail: vi.fn().mockResolvedValue(undefined),
        } as unknown as EmailService;

        mockTranslations = vi.fn((key: string) => {
            if (key === 'subtitle') return 'Event Finalized!';
            return key;
        });

        mockTemplate = vi.fn().mockReturnValue('TemplateComponent');

        useCase = new SendEventFinalizedEmailUseCase(
            mockEmailService,
            Promise.resolve(mockTranslations),
            mockTemplate
        );
    });

    it('should generate html and send finalized email', async () => {
        const params = {
            email: 'participant@test.com',
            userName: 'Jane',
            eventTitle: 'Meeting',
            eventLink: 'http://example.com/event',
            finalizedDate: '2026-03-01',
            finalizedTime: '10:00 - 11:00',
        };

        await useCase.execute(params);

        // Verify template was called with correct params
        expect(mockTemplate).toHaveBeenCalledWith({
            userName: params.userName,
            eventTitle: params.eventTitle,
            eventLink: params.eventLink,
            finalizedDate: params.finalizedDate,
            finalizedTime: params.finalizedTime,
        });

        // Verify email service was called
        expect(mockEmailService.sendMail).toHaveBeenCalledWith(
            params.email,
            'Event Finalized!',
            '<html>Rendered Finalized</html>'
        );
    });
});
