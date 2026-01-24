import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateEventUseCase from './createEventUseCase';
import { CreateEventDto } from '../event';

describe('CreateEventUseCase', () => {
    let useCase: CreateEventUseCase;
    let mockUserRepo: any;
    let mockEventRepo: any;
    let mockParticipantRepo: any;

    beforeEach(() => {
        mockUserRepo = {
            getUserByEmail: vi.fn(),
            createUser: vi.fn(),
        };
        mockEventRepo = {
            createEvent: vi.fn(),
        };
        mockParticipantRepo = {
            createParticipant: vi.fn(),
        };

        useCase = new CreateEventUseCase(mockUserRepo, mockEventRepo, mockParticipantRepo);
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

        mockUserRepo.getUserByEmail.mockResolvedValueOnce(null); // Creator not found
        mockUserRepo.createUser.mockResolvedValueOnce(mockCreator); // Create creator

        mockEventRepo.createEvent.mockResolvedValue(mockEvent);

        // For participant loop
        mockUserRepo.getUserByEmail.mockResolvedValueOnce(null); // Participant not found
        mockUserRepo.createUser.mockResolvedValueOnce(mockParticipantUser); // Create participant

        const result = await useCase.execute(eventData);

        expect(mockUserRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'creator@test.com' }));
        expect(mockEventRepo.createEvent).toHaveBeenCalled();
        expect(mockParticipantRepo.createParticipant).toHaveBeenCalledWith(
            'event-id',
            'p1-id',
            expect.any(String)
        );
        expect(result.id).toBe('event-id');
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

        mockUserRepo.getUserByEmail.mockResolvedValue({ id: 'existing-id', email: 'existing@test.com' });

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
        mockUserRepo.getUserByEmail.mockResolvedValueOnce(mockCreator);
        mockEventRepo.createEvent.mockResolvedValue(mockEvent);

        // Participant check
        mockUserRepo.getUserByEmail.mockResolvedValueOnce(null); // Doesn't exist
        mockUserRepo.createUser.mockResolvedValueOnce(mockNewUser); // Should be created

        await useCase.execute(eventData);

        expect(mockUserRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({
            email: 'new-user@test.com',
            name: 'new-user'
        }));

        expect(mockParticipantRepo.createParticipant).toHaveBeenCalledWith(
            'event-id',
            'new-user-id',
            expect.any(String)
        );
    });
});
