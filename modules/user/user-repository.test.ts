import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserRepository from './repository';
import prisma from '@/lib/db';

// Mock the prisma client
vi.mock('@/lib/db', () => ({
    default: {
        user: {
            create: vi.fn(),
            update: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            upsert: vi.fn(),
        },
        eventParticipant: {
            findUnique: vi.fn(),
        }
    },
}));

describe('UserRepository', () => {
    let repository: UserRepository;

    beforeEach(() => {
        repository = new UserRepository();
        vi.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a user and return UserInterface', async () => {
            const mockData = { id: 'uuid-1', email: 'test@test.com', name: 'Test User', session_token: 'token', created_at: new Date() };
            (prisma.user.create as any).mockResolvedValue(mockData);

            const result = await repository.createUser({ email: 'test@test.com', name: 'Test User' });

            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@test.com',
                    name: 'Test User',
                    session_token: undefined
                }
            });
            expect(result.id).toBe('uuid-1');
            expect(result.email).toBe('test@test.com');
        });
    });

    describe('getUserByEmail', () => {
        it('should return user when found', async () => {
            const mockData = { id: 'uuid-1', email: 'test@test.com', name: 'Test User', session_token: '', created_at: new Date() };
            (prisma.user.findUnique as any).mockResolvedValue(mockData);

            const result = await repository.getUserByEmail('test@test.com');

            expect(result).not.toBeNull();
            expect(result?.email).toBe('test@test.com');
        });

        it('should return null when not found', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(null);

            const result = await repository.getUserByEmail('unknown@test.com');

            expect(result).toBeNull();
        });
    });
});
