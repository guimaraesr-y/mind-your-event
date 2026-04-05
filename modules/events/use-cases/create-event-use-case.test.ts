import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateEventUseCase from './createEventUseCase';
import { CreateEventDto } from '../event';

describe('CreateEventUseCase', () => {
    let useCase: CreateEventUseCase;
    let mockEventRepo: any;
    let mockParticipantRepo: any;
    let mockFindOrCreateUserUseCase: any;

    beforeEach(() => {
        mockEventRepo = {
            createEvent: vi.fn(),
        };
        mockParticipantRepo = {
            createParticipant: vi.fn(),
        };
        mockFindOrCreateUserUseCase = {
            execute: vi.fn(),
        };

        useCase = new CreateEventUseCase(mockEventRepo, mockParticipantRepo, mockFindOrCreateUserUseCase);
    });

    it('should create a new event and its participants', async () => {
        const eventData: CreateEventDto = {
            title: 'Test Event',
            description: 'Test Description',
            start_date: '2026-02-01',
            end_date: '2026-02-05',
            participantEmails: ['p1@test.com'],
            creatorEmail: 'creator@test.com',
            creatorName: 'Creator',
        };

        const mockCreator = { id: 'creator-id', email: 'creator@test.com', name: 'Creator' };
        const mockParticipantUser = { id: 'p1-id', email: 'p1@test.com', name: 'p1' };
        const mockEvent = { id: 'event-id', ...eventData };

        mockFindOrCreateUserUseCase.execute.mockResolvedValueOnce({ user: mockCreator, created: true });
        mockEventRepo.createEvent.mockResolvedValue(mockEvent);
        mockFindOrCreateUserUseCase.execute.mockResolvedValueOnce({ user: mockParticipantUser, created: true });

        const result = await useCase.execute(eventData);

        expect(mockFindOrCreateUserUseCase.execute).toHaveBeenCalledWith('creator@test.com', 'Creator');
        expect(mockEventRepo.createEvent).toHaveBeenCalled();
        expect(mockParticipantRepo.createParticipant).toHaveBeenCalledWith(
            'event-id',
            'p1-id',
            expect.any(String)
        );
        expect(result.event.id).toBe('event-id');
        expect(result.failedParticipants).toHaveLength(0);
    });

    it('should throw error if user exists and no authenticatedUser is provided', async () => {
        const eventData: CreateEventDto = {
            title: 'Test Event',
            start_date: '2026-02-01',
            end_date: '2026-02-05',
            participantEmails: [],
            creatorEmail: 'existing@test.com',
            creatorName: 'Existing',
        };

        mockFindOrCreateUserUseCase.execute.mockResolvedValue({ user: { id: 'existing-id', email: 'existing@test.com' }, created: false });

        await expect(useCase.execute(eventData)).rejects.toThrow('This user already exists');
    });

    it('should automatically create users for participants who do not exist', async () => {
        const eventData: CreateEventDto = {
            title: 'Community Meeting',
            start_date: '2026-03-01',
            end_date: '2026-03-02',
            participantEmails: ['new-user@test.com'],
            creatorEmail: 'creator@test.com',
            creatorName: 'Creator',
            authenticatedUser: { id: 'creator-id', email: 'creator@test.com', name: 'Creator', session_token: 'abc', created_at: '' }
        };

        const mockCreator = { id: 'creator-id', email: 'creator@test.com', name: 'Creator' };
        const mockNewUser = { id: 'new-user-id', email: 'new-user@test.com', name: 'new-user' };
        const mockEvent = { id: 'event-id', ...eventData };

        // Creator is already authenticated and exists
        mockFindOrCreateUserUseCase.execute.mockResolvedValueOnce({ user: mockCreator, created: false });
        mockEventRepo.createEvent.mockResolvedValue(mockEvent);

        // Participant check
        mockFindOrCreateUserUseCase.execute.mockResolvedValueOnce({ user: mockNewUser, created: true });

        await useCase.execute(eventData);

        expect(mockFindOrCreateUserUseCase.execute).toHaveBeenCalledWith('new-user@test.com', 'new-user');

        expect(mockParticipantRepo.createParticipant).toHaveBeenCalledWith(
            'event-id',
            'new-user-id',
            expect.any(String)
        );
    });

    it('should collect failures when participant creation fails', async () => {
        const eventData: CreateEventDto = {
            title: 'Test Event',
            description: 'Test Description',
            start_date: '2026-02-01',
            end_date: '2026-02-05',
            participantEmails: ['valid@test.com', 'invalid@test.com'],
            creatorEmail: 'creator@test.com',
            creatorName: 'Creator',
        };

        const mockCreator = { id: 'creator-id', email: 'creator@test.com', name: 'Creator' };
        const mockValidParticipant = { id: 'valid-id', email: 'valid@test.com', name: 'valid' };
        const mockEvent = { id: 'event-id', ...eventData };

        mockFindOrCreateUserUseCase.execute
            .mockResolvedValueOnce({ user: mockCreator, created: true });
        mockEventRepo.createEvent.mockResolvedValue(mockEvent);
        
        mockFindOrCreateUserUseCase.execute
            .mockResolvedValueOnce({ user: mockValidParticipant, created: true });
        mockParticipantRepo.createParticipant.mockResolvedValueOnce(undefined);
        
        mockFindOrCreateUserUseCase.execute
            .mockResolvedValueOnce({ user: { id: 'invalid-id' }, created: false });
        mockParticipantRepo.createParticipant.mockRejectedValueOnce(
            new Error('Database constraint violation')
        );

        const result = await useCase.execute(eventData);

        expect(result.event.id).toBe('event-id');
        expect(result.failedParticipants).toHaveLength(1);
        expect(result.failedParticipants[0]).toEqual({
            email: 'invalid@test.com',
            reason: 'Database constraint violation',
        });
    });

    it('should return empty failedParticipants when all participants succeed', async () => {
        const eventData: CreateEventDto = {
            title: 'Test Event',
            start_date: '2026-02-01',
            end_date: '2026-02-05',
            participantEmails: ['p1@test.com', 'p2@test.com'],
            creatorEmail: 'creator@test.com',
            creatorName: 'Creator',
        };

        const mockCreator = { id: 'creator-id', email: 'creator@test.com', name: 'Creator' };
        const mockEvent = { id: 'event-id', ...eventData };

        mockFindOrCreateUserUseCase.execute
            .mockResolvedValueOnce({ user: mockCreator, created: true });
        mockEventRepo.createEvent.mockResolvedValue(mockEvent);
        mockFindOrCreateUserUseCase.execute
            .mockResolvedValueOnce({ user: { id: 'p1-id' }, created: true });
        mockFindOrCreateUserUseCase.execute
            .mockResolvedValueOnce({ user: { id: 'p2-id' }, created: true });
        mockParticipantRepo.createParticipant
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(undefined);

        const result = await useCase.execute(eventData);

        expect(result.failedParticipants).toHaveLength(0);
    });

    it('should handle all participants failing gracefully', async () => {
        const eventData: CreateEventDto = {
            title: 'Test Event',
            start_date: '2026-02-01',
            end_date: '2026-02-05',
            participantEmails: ['fail1@test.com', 'fail2@test.com'],
            creatorEmail: 'creator@test.com',
            creatorName: 'Creator',
        };

        const mockCreator = { id: 'creator-id', email: 'creator@test.com', name: 'Creator' };
        const mockEvent = { id: 'event-id', ...eventData };

        mockFindOrCreateUserUseCase.execute
            .mockResolvedValueOnce({ user: mockCreator, created: true });
        mockEventRepo.createEvent.mockResolvedValue(mockEvent);

        mockFindOrCreateUserUseCase.execute
            .mockResolvedValueOnce({ user: { id: 'fail1-id' }, created: false });
        mockParticipantRepo.createParticipant.mockRejectedValueOnce(
            new Error('Connection error')
        );

        mockFindOrCreateUserUseCase.execute
            .mockResolvedValueOnce({ user: { id: 'fail2-id' }, created: false });
        mockParticipantRepo.createParticipant.mockRejectedValueOnce(
            new Error('Connection error')
        );

        const result = await useCase.execute(eventData);

        expect(result.event.id).toBe('event-id');
        expect(result.failedParticipants).toHaveLength(2);
    });
});
