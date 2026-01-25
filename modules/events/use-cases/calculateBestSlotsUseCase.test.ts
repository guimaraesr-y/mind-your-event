import { describe, it, expect } from 'vitest';
import { CalculateBestSlotsUseCase } from './calculateBestSlotsUseCase';

describe('CalculateBestSlotsUseCase', () => {
    const useCase = new CalculateBestSlotsUseCase();

    it('should correctly calculate and sort overlapping slots', () => {
        const availabilitySlots = [
            { date: '2026-02-01', start_time: '10:00', end_time: '11:00', users: { name: 'User 1' } },
            { date: '2026-02-01', start_time: '10:00', end_time: '11:00', users: { name: 'User 2' } },
            { date: '2026-02-01', start_time: '14:00', end_time: '15:00', users: { name: 'User 1' } },
            { date: '2026-02-02', start_time: '10:00', end_time: '11:00', users: { name: 'User 3' } },
        ];
        const totalParticipants = 3;

        const result = useCase.execute({ availabilitySlots, totalParticipants });

        expect(result).toHaveLength(3);

        // Best slot: 2026-02-01 10:00-11:00 (2 participants)
        expect(result[0].count).toBe(2);
        expect(result[0].date).toBe('2026-02-01');
        expect(result[0].startTime).toBe('10:00');
        expect(result[0].percentage).toBeCloseTo(66.67, 1);
        expect(result[0].participants).toContain('User 1');
        expect(result[0].participants).toContain('User 2');
    });

    it('should return empty array if no slots provided', () => {
        const result = useCase.execute({ availabilitySlots: [], totalParticipants: 5 });
        expect(result).toEqual([]);
    });

    it('should handle zero participants safely', () => {
        const availabilitySlots = [
            { date: '2026-02-01', start_time: '10:00', end_time: '11:00', users: { name: 'User 1' } },
        ];
        const result = useCase.execute({ availabilitySlots, totalParticipants: 0 });
        expect(result[0].percentage).toBe(0);
    });
});
