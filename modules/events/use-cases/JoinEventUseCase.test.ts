import { describe, it, expect, vi, beforeEach } from 'vitest';
import JoinEventUseCase from './JoinEventUseCase';
import { ApiException } from '@/lib/exceptions/api';

describe('JoinEventUseCase', () => {
    let useCase: JoinEventUseCase;
    let mockUserRepo: any;
    let mockEventRepo: any;
    let mockParticipantRepo: any;
    let mockT: any;

    beforeEach(() => {
        mockUserRepo = {
            getUserByEmail: vi.fn(),
            createUser: vi.fn(),
        };
        mockEventRepo = {
            getEventByInviteToken: vi.fn(),
        };
        mockParticipantRepo = {
            createParticipant: vi.fn(),
            getParticipantByEventAndUser: vi.fn(),
        };
        mockT = vi.fn((key: string) => key);

        useCase = new JoinEventUseCase(
            mockUserRepo,
            mockEventRepo,
            mockParticipantRepo,
            Promise.resolve(mockT)
        );
    });

    it('should allow a new user to join an event', async () => {
        const request = {
            token: 'event-token',
            name: 'New User',
            email: 'new@test.com'
        };

        const mockEvent = { id: 'event-id', title: 'Test Event' };
        const mockNewUser = { id: 'user-id', email: 'new@test.com', name: 'New User' };
        const mockParticipant = { invite_token: 'participant-token' };

        mockEventRepo.getEventByInviteToken.mockResolvedValue(mockEvent);
        mockUserRepo.getUserByEmail.mockResolvedValue(null);
        mockUserRepo.createUser.mockResolvedValue(mockNewUser);
        mockParticipantRepo.getParticipantByEventAndUser.mockResolvedValue(null);
        mockParticipantRepo.createParticipant.mockResolvedValue(mockParticipant);

        const result = await useCase.execute(request);

        expect(mockEventRepo.getEventByInviteToken).toHaveBeenCalledWith('event-token');
        expect(mockUserRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@test.com' }));
        expect(mockParticipantRepo.createParticipant).toHaveBeenCalledWith('event-id', 'user-id', expect.any(String));
        expect(result).toBe(mockParticipant);
    });

    it('should allow an existing user to join if they are authenticated', async () => {
        const existingUser = { id: 'user-id', email: 'existing@test.com', name: 'Existing User' };
        const request = {
            token: 'event-token',
            name: 'Existing User',
            email: 'existing@test.com',
            authenticatedUser: { ...existingUser, session_token: 'abc', created_at: '' }
        };

        const mockEvent = { id: 'event-id', title: 'Test Event' };
        const mockParticipant = { invite_token: 'participant-token' };

        mockEventRepo.getEventByInviteToken.mockResolvedValue(mockEvent);
        mockUserRepo.getUserByEmail.mockResolvedValue(existingUser);
        mockParticipantRepo.getParticipantByEventAndUser.mockResolvedValue(null);
        mockParticipantRepo.createParticipant.mockResolvedValue(mockParticipant);

        const result = await useCase.execute(request);

        expect(mockUserRepo.createUser).not.toHaveBeenCalled();
        expect(result).toBe(mockParticipant);
    });

    it('should throw an error if an existing user is not authenticated', async () => {
        const existingUser = { id: 'user-id', email: 'existing@test.com', name: 'Existing User' };
        const request = {
            token: 'event-token',
            name: 'Existing User',
            email: 'existing@test.com'
            // no authenticatedUser
        };

        const mockEvent = { id: 'event-id', title: 'Test Event' };

        mockEventRepo.getEventByInviteToken.mockResolvedValue(mockEvent);
        mockUserRepo.getUserByEmail.mockResolvedValue(existingUser);

        await expect(useCase.execute(request)).rejects.toThrow('alreadyRegistered');
        await expect(useCase.execute(request)).rejects.toBeInstanceOf(ApiException);
    });

    it('should throw an error if authenticated user does not match the email', async () => {
        const existingUser = { id: 'user-id', email: 'existing@test.com', name: 'Existing User' };
        const request = {
            token: 'event-token',
            name: 'Existing User',
            email: 'existing@test.com',
            authenticatedUser: { id: 'other-id', email: 'other@test.com', name: 'Other', session_token: 'abc', created_at: '' }
        };

        const mockEvent = { id: 'event-id', title: 'Test Event' };

        mockEventRepo.getEventByInviteToken.mockResolvedValue(mockEvent);
        mockUserRepo.getUserByEmail.mockResolvedValue(existingUser);

        await expect(useCase.execute(request)).rejects.toThrow('alreadyRegistered');
    });

    it('should return existing participant if they are already registered', async () => {
        const request = {
            token: 'event-token',
            name: 'New User',
            email: 'new@test.com'
        };

        const mockEvent = { id: 'event-id', title: 'Test Event' };
        const mockUser = { id: 'user-id', email: 'new@test.com', name: 'New User' };
        const mockParticipant = { id: 'p-id', invite_token: 'existing-p-token' };

        mockEventRepo.getEventByInviteToken.mockResolvedValue(mockEvent);
        mockUserRepo.getUserByEmail.mockResolvedValue(null);
        mockUserRepo.createUser.mockResolvedValue(mockUser);
        mockParticipantRepo.getParticipantByEventAndUser.mockResolvedValue(mockParticipant);

        const result = await useCase.execute(request);

        expect(result).toBe(mockParticipant);
        expect(mockParticipantRepo.createParticipant).not.toHaveBeenCalled();
    });

    it('should throw an error if event does not exist', async () => {
        const request = {
            token: 'invalid-token',
            name: 'User',
            email: 'user@test.com'
        };

        mockEventRepo.getEventByInviteToken.mockResolvedValue(null);

        await expect(useCase.execute(request)).rejects.toThrow('eventNotFound');
    });
});
