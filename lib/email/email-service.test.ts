import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from './email-service';
import { EmailStrategy } from './email-strategy';

describe('EmailService', () => {
    let emailService: EmailService;
    let mockStrategy: EmailStrategy;

    beforeEach(() => {
        mockStrategy = {
            sendMail: vi.fn().mockResolvedValue(undefined),
        };
        emailService = new EmailService(mockStrategy);
    });

    it('should delegate sendMail call to the strategy', async () => {
        const to = 'test@example.com';
        const subject = 'Test Subject';
        const html = '<p>Test Body</p>';

        await emailService.sendMail(to, subject, html);

        expect(mockStrategy.sendMail).toHaveBeenCalledWith({
            to,
            subject,
            html,
        });
    });

    it('should handle array of recipients', async () => {
        const to = ['test1@example.com', 'test2@example.com'];
        const subject = 'Test Subject';
        const html = '<p>Test Body</p>';

        await emailService.sendMail(to, subject, html);

        expect(mockStrategy.sendMail).toHaveBeenCalledWith({
            to,
            subject,
            html,
        });
    });
});
