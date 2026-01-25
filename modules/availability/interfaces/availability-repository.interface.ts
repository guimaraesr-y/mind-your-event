export interface AvailabilitySlot {
    date: string;
    startTime: string;
    endTime: string;
}

export interface IAvailabilityRepository {
    deleteAvailabilities(eventId: string, userId: string): Promise<void>;
    insertAvailabilities(eventId: string, userId: string, slots: AvailabilitySlot[]): Promise<void>;
    getEventAvailabilities(eventId: string): Promise<any[]>;
    getUserAvailabilitiesForEvent(userId: string, eventId: string): Promise<any[]>;
}
