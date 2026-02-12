import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpdateEventUseCase from './updateEventUseCase';
import { UpdateEventDto } from '../event';
import { ApiException } from '@/lib/exceptions/api';
import { ZodError } from 'zod';

describe('UpdateEventUseCase', () => {
    let useCase: UpdateEventUseCase;
    let mockEventRepo: any;
    let mockParticipantRepo: any;
    let mockFindOrCreateUserUseCase: any;

    beforeEach(() => {
        mockEventRepo = {
            isEventOwner: vi.fn(),
            updateEvent: vi.fn(),
            isEventConfirmed: vi.fn(),
        };

        mockParticipantRepo = {
            getParticipantsByEventId: vi.fn(),
            createParticipant: vi.fn(),
            deleteParticipant: vi.fn(),
        };

        mockFindOrCreateUserUseCase = {
            execute: vi.fn(),
        };

        useCase = new UpdateEventUseCase(mockEventRepo, mockParticipantRepo, mockFindOrCreateUserUseCase);
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
        mockEventRepo.isEventConfirmed.mockResolvedValue(false);
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

    it('should throw validation error if event data is invalid', async () => {
        const eventId = 'event-id';
        const userId = 'user-id';
        const eventData: any = {
            title: 'A', // too short
        };

        await expect(useCase.execute(eventId, userId, eventData)).rejects.toThrow(ZodError);
    });

    it('should throw error if event is already confirmed', async () => {
        const eventId = 'event-id';
        const userId = 'user-id';
        const eventData: UpdateEventDto = {
            title: 'Valid Title',
        };

        mockEventRepo.isEventOwner.mockResolvedValue(true);
        mockEventRepo.isEventConfirmed.mockResolvedValue(true);

        await expect(useCase.execute(eventId, userId, eventData)).rejects.toThrow('This event has already been confirmed and cannot be edited.');
    });

    it('should sync participants: add and remove', async () => {
        const eventId = 'event-id';
        const userId = 'user-id';
        const eventData: UpdateEventDto = {
            participantEmails: ['new@example.com'], // 'old@example.com' is missing
        };

        mockEventRepo.isEventOwner.mockResolvedValue(true);
        mockEventRepo.isEventConfirmed.mockResolvedValue(false);
        mockParticipantRepo.getParticipantsByEventId.mockResolvedValue([
            { user: { email: 'old@example.com' }, user_id: 'old-user-id' }
        ]);
        mockFindOrCreateUserUseCase.execute.mockResolvedValue({ user: { id: 'new-user-id' } });

        await useCase.execute(eventId, userId, eventData);

        expect(mockParticipantRepo.deleteParticipant).toHaveBeenCalledWith(eventId, 'old-user-id');
        expect(mockParticipantRepo.createParticipant).toHaveBeenCalledWith(eventId, 'new-user-id', expect.any(String));
    });
});
