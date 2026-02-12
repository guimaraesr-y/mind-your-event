import prisma from "@/lib/db";
import { IParticipantRepository } from "./interfaces/participant-repository.interface";

export default class ParticipantRepository implements IParticipantRepository {

    async createParticipant(eventId: string, userId: string, inviteToken: string) {
        return await prisma.eventParticipant.create({
            data: {
                event_id: eventId,
                user_id: userId,
                invite_token: inviteToken,
            }
        });
    }

    async getParticipantsByEventId(eventId: string): Promise<any[]> {
        return await prisma.eventParticipant.findMany({
            where: { event_id: eventId },
            include: { user: { select: { name: true, email: true } } }
        });
    }

    async getParticipatingEventsByUserId(userId: string): Promise<any[]> {
        return await prisma.eventParticipant.findMany({
            where: { user_id: userId },
            include: {
                event: {
                    include: {
                        creator: { select: { name: true, email: true } },
                        _count: { select: { participants: true } },
                        availabilities: { where: { user_id: userId } }
                    }
                }
            }
        });
    }

    async getParticipantByInviteToken(token: string): Promise<any | null> {
        return await prisma.eventParticipant.findUnique({
            where: { invite_token: token },
            include: {
                event: true,
                user: { select: { name: true, email: true } }
            }
        });
    }

    async updateParticipantStatus(eventId: string, userId: string, hasSubmitted: boolean): Promise<void> {
        await prisma.eventParticipant.updateMany({
            where: {
                event_id: eventId,
                user_id: userId
            },
            data: { has_submitted: hasSubmitted }
        });
    }

    async updateRsvp(eventId: string, inviteToken: string, willAttend: boolean): Promise<void> {
        await prisma.eventParticipant.update({
            where: { invite_token: inviteToken },
            data: { will_attend: willAttend }
        });
    }

    async getParticipantByEventAndUser(eventId: string, userId: string): Promise<any | null> {
        return await prisma.eventParticipant.findUnique({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: userId
                }
            }
        });
    }

    async deleteParticipant(eventId: string, userId: string): Promise<void> {
        // AvailabilitySlot records are linked to Event and User directly.
        // We must delete them explicitly as they don't cascade from EventParticipant.
        await prisma.availabilitySlot.deleteMany({
            where: {
                event_id: eventId,
                user_id: userId
            }
        });

        await prisma.eventParticipant.delete({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: userId
                }
            }
        });
    }
}
