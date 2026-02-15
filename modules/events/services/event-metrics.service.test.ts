import { describe, it, expect, vi } from 'vitest';
import { EventMetricsService } from './event-metrics.service';
import { CalculateBestSlotsUseCase } from '../use-cases/calculateBestSlotsUseCase';
import { EventParticipant } from '../eventParticipants';

describe('EventMetricsService', () => {
    it('should calculate metrics correctly', () => {
        const mockBestSlots = [
            { date: '2026-02-01', startTime: '10:00', endTime: '11:00', count: 2, percentage: 100, participants: ['User 1', 'User 2'] }
        ];

        const mockUseCase = {
            execute: vi.fn().mockReturnValue(mockBestSlots)
        } as unknown as CalculateBestSlotsUseCase;

        const service = new EventMetricsService(mockUseCase);

        const participants: EventParticipant[] = [
            { id: '1', event_id: 'e1', user_id: 'u1', has_submitted: true, will_attend: true, invite_token: 't1', created_at: '' },
            { id: '2', event_id: 'e1', user_id: 'u2', has_submitted: true, will_attend: true, invite_token: 't2', created_at: '' },
            { id: '3', event_id: 'e1', user_id: 'u3', has_submitted: false, will_attend: null, invite_token: 't3', created_at: '' },
        ];

        const availabilitySlots = [
            { date: '2026-02-01', start_time: '10:00', end_time: '11:00', user_id: 'u1' },
            { date: '2026-02-01', start_time: '10:00', end_time: '11:00', user_id: 'u2' },
        ];

        const metrics = service.calculate(participants, availabilitySlots);

        expect(metrics.totalParticipants).toBe(3);
        expect(metrics.submittedCount).toBe(2);
        expect(metrics.responseRate).toBe(67); // Math.round(2/3 * 100)
        expect(metrics.bestSlots).toEqual(mockBestSlots);
        expect(metrics.dateAvailability.get('2026-02-01')).toBe(2);
        expect(mockUseCase.execute).toHaveBeenCalledWith({
            availabilitySlots,
            totalParticipants: 3
        });
    });

    it('should handle zero participants safely', () => {
        const mockUseCase = {
            execute: vi.fn().mockReturnValue([])
        } as unknown as CalculateBestSlotsUseCase;

        const service = new EventMetricsService(mockUseCase);
        const metrics = service.calculate([], []);

        expect(metrics.totalParticipants).toBe(0);
        expect(metrics.submittedCount).toBe(0);
        expect(metrics.responseRate).toBe(0);
        expect(metrics.bestSlots).toEqual([]);
        expect(metrics.dateAvailability.size).toBe(0);
    });
});
