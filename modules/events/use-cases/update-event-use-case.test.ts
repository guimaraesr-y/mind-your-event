import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpdateEventUseCase from './updateEventUseCase';
import { UpdateEventDto } from '../event';
import { ApiException } from '@/lib/exceptions/api';

describe('UpdateEventUseCase', () => {
    let useCase: UpdateEventUseCase;
    let mockEventRepo: any;

    beforeEach(() => {
        mockEventRepo = {
            isEventOwner: vi.fn(),
            updateEvent: vi.fn(),
        };

        useCase = new UpdateEventUseCase(mockEventRepo);
    });

    it('should update an event if user is the owner', async () => {
        const eventId = 'event-id';
        const userId = 'user-id';
        const eventData: UpdateEventDto = {
            title: 'Updated Event',
            description: 'Updated Description',
        };

        const mockEvent = { id: eventId, ...eventData };

        mockEventRepo.isEventOwner.mockResolvedValue(true);
        mockEventRepo.updateEvent.mockResolvedValue(mockEvent);

        const result = await useCase.execute(eventId, userId, eventData);

        expect(mockEventRepo.isEventOwner).toHaveBeenCalledWith(userId, eventId);
        expect(mockEventRepo.updateEvent).toHaveBeenCalledWith(eventId, eventData);
        expect(result.title).toBe('Updated Event');
    });

    it('should throw forbidden exception if user is not the owner', async () => {
        const eventId = 'event-id';
        const userId = 'not-owner-id';
        const eventData: UpdateEventDto = {
            title: 'Updated Event',
        };

        mockEventRepo.isEventOwner.mockResolvedValue(false);

        await expect(useCase.execute(eventId, userId, eventData)).rejects.toThrow('You are not authorized to edit this event.');
        expect(mockEventRepo.updateEvent).not.toHaveBeenCalled();
    });
});
