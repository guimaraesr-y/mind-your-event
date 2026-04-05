import { describe, it, expect, vi, beforeEach } from 'vitest';
import SaveRsvpUseCase from './SaveRsvpUseCase';
import { ApiException } from '@/lib/exceptions/api';

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

    it('should throw ApiException when participant not found', async () => {
        const payload = {
            eventId: 'event-1',
            inviteToken: 'token-123',
            willAttend: true,
        };

        mockParticipantRepo.updateRsvp.mockRejectedValue(
            new ApiException("Participant not found", 404)
        );

        await expect(useCase.execute(payload)).rejects.toThrow(ApiException);
        await expect(useCase.execute(payload)).rejects.toMatchObject({
            message: "Participant not found",
            httpCode: 404
        });
    });

    it('should throw ApiException for IDOR attempt (token mismatch)', async () => {
        const payload = {
            eventId: 'event-1',
            inviteToken: 'token-123',
            willAttend: true,
        };

        mockParticipantRepo.updateRsvp.mockRejectedValue(
            new ApiException("Invalid invite token for this event", 403)
        );

        await expect(useCase.execute(payload)).rejects.toThrow(ApiException);
        await expect(useCase.execute(payload)).rejects.toMatchObject({
            message: "Invalid invite token for this event",
            httpCode: 403
        });
    });

    it('should throw ApiException when repository fails with generic error', async () => {
        const payload = {
            eventId: 'event-1',
            inviteToken: 'token-123',
            willAttend: true,
        };

        const error = new Error('Database error');
        mockParticipantRepo.updateRsvp.mockRejectedValue(error);

        await expect(useCase.execute(payload)).rejects.toThrow(ApiException);
        await expect(useCase.execute(payload)).rejects.toMatchObject({
            message: "Database error",
            httpCode: 500
        });
    });
});
