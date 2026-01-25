import prisma from "@/lib/db";
import { IEventRepository } from "./interfaces/event-repository.interface";
import { EventInterface } from "./event";

export default class EventRepository implements IEventRepository {

    async createEvent(eventData: Partial<EventInterface>): Promise<EventInterface> {
        const event = await prisma.event.create({
            data: {
                title: eventData.title!,
                description: eventData.description,
                creator_id: eventData.creator_id!,
                start_date: new Date(eventData.start_date!),
                end_date: new Date(eventData.end_date!),
                start_time: eventData.start_time,
                end_time: eventData.end_time,
            }
        });

        return this.mapToEventInterface(event);
    }

    async updateEvent(eventId: string, eventData: Partial<EventInterface>): Promise<EventInterface> {
        const updateData: any = { ...eventData };
        if (eventData.start_date) updateData.start_date = new Date(eventData.start_date);
        if (eventData.end_date) updateData.end_date = new Date(eventData.end_date);
        if (eventData.finalized_date) updateData.finalized_date = new Date(eventData.finalized_date);

        // Remove id and created_at from update data if they exist
        delete updateData.id;
        delete updateData.created_at;

        const event = await prisma.event.update({
            where: { id: eventId },
            data: updateData
        });

        return this.mapToEventInterface(event);
    }

    async getEventById(eventId: string): Promise<any | null> {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { creator: { select: { name: true, email: true } } }
        });

        return event;
    }

    async getEventsByCreatorId(userId: string): Promise<any[]> {
        return await prisma.event.findMany({
            where: { creator_id: userId },
            include: {
                creator: { select: { name: true, email: true } },
                _count: { select: { participants: true } }
            }
        });
    }

    async isEventOwner(userId: string, eventId: string): Promise<boolean> {
        const event = await prisma.event.findFirst({
            where: { id: eventId, creator_id: userId }
        });
        return !!event;
    }

    async isEventFinalized(eventId: string): Promise<boolean> {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { is_finalized: true }
        });

        return !!event?.is_finalized;
    }

    private mapToEventInterface(data: any): EventInterface {
        return {
            id: data.id,
            title: data.title,
            description: data.description || "",
            creator_id: data.creator_id,
            start_date: data.start_date.toISOString().split('T')[0],
            end_date: data.end_date.toISOString().split('T')[0],
            start_time: data.start_time || "",
            end_time: data.end_time || "",
            is_finalized: !!data.is_finalized,
            finalized_date: data.finalized_date?.toISOString().split('T')[0] || "",
            finalized_start_time: data.finalized_start_time || "",
            finalized_end_time: data.finalized_end_time || "",
            created_at: data.created_at.toISOString(),
            updated_at: data.updated_at.toISOString()
        };
    }
}
