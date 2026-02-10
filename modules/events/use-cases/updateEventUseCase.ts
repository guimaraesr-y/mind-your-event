import { UpdateEventDto, EventInterface, updateEventSchema } from "../event";
import { ApiException } from "@/lib/exceptions/api";
import { IEventRepository } from "../interfaces/event-repository.interface";
import EventRepository from "../repository";

export default class UpdateEventUseCase {

    constructor(
        private eventRepository: IEventRepository = new EventRepository(),
    ) { }

    public async execute(eventId: string, userId: string, eventData: UpdateEventDto): Promise<EventInterface> {
        const validatedData = updateEventSchema.parse(eventData);

        const isOwner = await this.eventRepository.isEventOwner(userId, eventId);

        if (!isOwner) {
            throw new ApiException("You are not authorized to edit this event.", 403);
        }

        const event = await this.eventRepository.updateEvent(eventId, validatedData);

        return event;
    }

}
