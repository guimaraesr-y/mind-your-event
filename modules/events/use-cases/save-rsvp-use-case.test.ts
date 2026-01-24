import { describe, it, expect, vi, beforeEach } from 'vitest';
import SaveRsvpUseCase from './SaveRsvpUseCase';

describe('SaveRsvpUseCase', () => {
    let useCase: SaveRsvpUseCase;
    let mockParticipantRepo: any;

    beforeEach(() => {
        mockParticipantRepo = {
            updateRsvp: vi.fn(),
        };
        useCase = new SaveRsvpUseCase(mockParticipantRepo);
    });

    it('should update rsvp status', async () => {
        const payload = {
            eventId: 'event-1',
            inviteToken: 'token-123',
            willAttend: true,
        };

        mockParticipantRepo.updateRsvp.mockResolvedValue(undefined);

        await useCase.execute(payload);

        expect(mockParticipantRepo.updateRsvp).toHaveBeenCalledWith(
            payload.eventId,
            payload.inviteToken,
            payload.willAttend
        );
    });

    it('should throw error if repository fails', async () => {
        const payload = {
            eventId: 'event-1',
            inviteToken: 'token-123',
            willAttend: true,
        };

        const error = new Error('Database error');
        mockParticipantRepo.updateRsvp.mockRejectedValue(error);

        await expect(useCase.execute(payload)).rejects.toThrow('Database error');
    });
});
