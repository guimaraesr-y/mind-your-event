import { OverlappingSlotData, CalculateBestSlotsUseCase } from "../use-cases/calculateBestSlotsUseCase";
import { EventParticipant } from "../eventParticipants";

export interface EventMetrics {
    totalParticipants: number;
    submittedCount: number;
    responseRate: number;
    bestSlots: OverlappingSlotData[];
    dateAvailability: Map<string, number>;
}

export class EventMetricsService {
    constructor(
        private readonly calculateBestSlotsUseCase: CalculateBestSlotsUseCase = new CalculateBestSlotsUseCase()
    ) { }

    public calculate(participants: EventParticipant[], availabilitySlots: any[]): EventMetrics {
        const totalParticipants = participants.length;
        const submittedCount = participants.filter((p) => p.has_submitted).length;
        const responseRate = totalParticipants > 0
            ? Math.round((submittedCount / totalParticipants) * 100)
            : 0;

        const bestSlots = this.calculateBestSlotsUseCase.execute({
            availabilitySlots,
            totalParticipants
        });

        const dateAvailability = this.calcuateDateAvailability(availabilitySlots);

        return {
            totalParticipants,
            submittedCount,
            responseRate,
            bestSlots,
            dateAvailability
        };
    }

    private calcuateDateAvailability(availabilitySlots: any[]): Map<string, number> {
        const dateAvailability = new Map<string, number>();
        availabilitySlots.forEach((slot) => {
            const dateStr = slot.date instanceof Date
                ? slot.date.toISOString().split('T')[0]
                : String(slot.date);

            const count = dateAvailability.get(dateStr) || 0;
            dateAvailability.set(dateStr, count + 1);
        });
        return dateAvailability;
    }
}
