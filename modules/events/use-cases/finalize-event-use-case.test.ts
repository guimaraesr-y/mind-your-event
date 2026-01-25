import { describe, it, expect, vi, beforeEach } from 'vitest';
import FinalizeEventUseCase from './finalizeEventUseCase';

describe('FinalizeEventUseCase', () => {
    let useCase: FinalizeEventUseCase;
    let mockEventRepo: any;
    let mockParticipantRepo: any;
    let mockEmailUseCase: any;

    beforeEach(() => {
        mockEventRepo = {
            isEventFinalized: vi.fn(),
            updateEvent: vi.fn(),
        };
        mockParticipantRepo = {
            getParticipantsByEventId: vi.fn(),
        };
        mockEmailUseCase = {
            execute: vi.fn(),
        };

        useCase = new FinalizeEventUseCase(
            mockEventRepo,
            mockParticipantRepo,
            mockEmailUseCase
        );
    });

    it('should finalize event and notify participants', async () => {
        const payload = {
            eventId: 'event-1',
            finalizedDate: '2026-03-01',
            finalizedStartTime: '10:00',
            finalizedEndTime: '11:00',
        };

        const mockEvent = {
            id: 'event-1',
            title: 'Test Event',
            finalized_date: payload.finalizedDate,
            finalized_start_time: payload.finalizedStartTime,
            finalized_end_time: payload.finalizedEndTime,
        };

        const mockParticipants = [
            {
                invite_token: 'token-1',
                user: { email: 'p1@test.com', name: 'P1' }
            },
            {
                invite_token: 'token-2',
                user: { email: 'p2@test.com', name: 'P2' }
            }
        ];

        mockEventRepo.isEventFinalized.mockResolvedValue(false);
        mockEventRepo.updateEvent.mockResolvedValue(mockEvent);
        mockParticipantRepo.getParticipantsByEventId.mockResolvedValue(mockParticipants);
        mockEmailUseCase.execute.mockResolvedValue(undefined);

        const result = await useCase.execute(payload);

        // Verify event update
        expect(mockEventRepo.updateEvent).toHaveBeenCalledWith(
            payload.eventId,
            expect.objectContaining({
                is_finalized: true,
                finalized_date: payload.finalizedDate,
            })
        );

        // Verify emails sent
        expect(mockEmailUseCase.execute).toHaveBeenCalledTimes(2);
        expect(mockEmailUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            email: 'p1@test.com',
            eventTitle: 'Test Event',
        }));
        expect(mockEmailUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            email: 'p2@test.com',
            eventTitle: 'Test Event',
        }));

        expect(result).toEqual(mockEvent);
    });

    it('should throw error if event is already finalized', async () => {
        mockEventRepo.isEventFinalized.mockResolvedValue(true);

        await expect(useCase.execute({
            eventId: 'event-1',
            finalizedDate: '',
            finalizedStartTime: '',
            finalizedEndTime: ''
        })).rejects.toThrow('Event is already finalized');
    });
});
