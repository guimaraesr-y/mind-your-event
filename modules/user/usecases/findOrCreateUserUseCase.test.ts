import { describe, it, expect, vi, beforeEach } from 'vitest';
import FindOrCreateUserUseCase from './findOrCreateUserUseCase';
import { IUserRepository } from '../interfaces/user-repository.interface';

describe('FindOrCreateUserUseCase', () => {
    let useCase: FindOrCreateUserUseCase;
    let mockUserRepo: IUserRepository;

    beforeEach(() => {
        mockUserRepo = {
            getUserByEmail: vi.fn(),
            createUser: vi.fn(),
            updateUser: vi.fn(),
            getUserBySessionToken: vi.fn(),
            getUserByEmailAndSessionToken: vi.fn(),
            getUserByInviteToken: vi.fn(),
            updateSessionToken: vi.fn(),
        };
        useCase = new FindOrCreateUserUseCase(mockUserRepo);
    });

    it('should return existing user if found', async () => {
        const mockUser = { id: 'user-1', email: 'test@test.com', name: 'Test User', session_token: '', created_at: '' };
        (mockUserRepo.getUserByEmail as any).mockResolvedValue(mockUser);

        const result = await useCase.execute('test@test.com', 'Test User');

        expect(result.user).toEqual(mockUser);
        expect(result.created).toBe(false);
        expect(mockUserRepo.createUser).not.toHaveBeenCalled();
    });

    it('should create and return new user if not found', async () => {
        const mockNewUser = { id: 'new-id', email: 'new@test.com', name: 'New User', session_token: '', created_at: '' };
        (mockUserRepo.getUserByEmail as any).mockResolvedValue(null);
        (mockUserRepo.createUser as any).mockResolvedValue(mockNewUser);

        const result = await useCase.execute('new@test.com', 'New User');

        expect(result.user).toEqual(mockNewUser);
        expect(result.created).toBe(true);
        expect(mockUserRepo.createUser).toHaveBeenCalledWith({
            email: 'new@test.com',
            name: 'New User',
            session_token: undefined,
        });
    });
});
