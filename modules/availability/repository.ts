import prisma from "@/lib/db";
import { IAvailabilityRepository, AvailabilitySlot } from "./interfaces/availability-repository.interface";

export default class AvailabilityRepository implements IAvailabilityRepository {

    async deleteAvailabilities(eventId: string, userId: string): Promise<void> {
        await prisma.availabilitySlot.deleteMany({
            where: {
                event_id: eventId,
                user_id: userId
            }
        });
    }

    async insertAvailabilities(eventId: string, userId: string, slots: AvailabilitySlot[]): Promise<void> {
        await prisma.availabilitySlot.createMany({
            data: slots.map(slot => ({
                event_id: eventId,
                user_id: userId,
                date: new Date(slot.date),
                start_time: slot.startTime,
                end_time: slot.endTime,
            }))
        });
    }

    async getEventAvailabilities(eventId: string): Promise<any[]> {
        return await prisma.availabilitySlot.findMany({
            where: { event_id: eventId },
            include: { user: { select: { name: true, email: true } } }
        });
    }

    async getUserAvailabilitiesForEvent(userId: string, eventId: string): Promise<any[]> {
        return await prisma.availabilitySlot.findMany({
            where: { event_id: eventId, user_id: userId }
        });
    }
}
