export class TimeSlot {
    constructor(
        private readonly date: string,
        private readonly startTime: string,
        private readonly endTime: string
    ) { }

    public toString(): string {
        return `${this.date}-${this.startTime}-${this.endTime}`;
    }

    public getDate(): string { return this.date; }
    public getStartTime(): string { return this.startTime; }
    public getEndTime(): string { return this.endTime; }
}

export interface OverlappingSlotData {
    date: string;
    startTime: string;
    endTime: string;
    count: number;
    percentage: number;
    participants: string[];
}

export class OverlappingSlot {
    private count: number = 0;
    private participants: string[] = [];

    constructor(
        private readonly timeSlot: TimeSlot,
        private readonly totalParticipants: number
    ) { }

    public addParticipant(name: string): void {
        this.count++;
        this.participants.push(name);
    }

    public getCount(): number {
        return this.count;
    }

    public getPercentage(): number {
        if (this.totalParticipants === 0) return 0;
        return (this.count / this.totalParticipants) * 100;
    }

    public toJSON(): OverlappingSlotData {
        return {
            date: this.timeSlot.getDate(),
            startTime: this.timeSlot.getStartTime(),
            endTime: this.timeSlot.getEndTime(),
            count: this.count,
            percentage: this.getPercentage(),
            participants: this.participants,
        };
    }

    public compare(other: OverlappingSlot): number {
        if (other.count !== this.count) return other.count - this.count;

        const thisDate = String(this.timeSlot.getDate());
        const otherDate = String(other.timeSlot.getDate());

        if (thisDate !== otherDate) {
            return thisDate.localeCompare(otherDate);
        }

        const thisStart = String(this.timeSlot.getStartTime());
        const otherStart = String(other.timeSlot.getStartTime());

        return thisStart.localeCompare(otherStart);
    }
}

export class OverlappingSlotCollection {
    private slots: Map<string, OverlappingSlot> = new Map();

    constructor(private readonly totalParticipants: number) { }

    public addSlot(timeSlot: TimeSlot, participantName: string): void {
        const key = timeSlot.toString();
        const slot = this.getOrCreateSlot(key, timeSlot);
        slot.addParticipant(participantName);
    }

    private getOrCreateSlot(key: string, timeSlot: TimeSlot): OverlappingSlot {
        const existing = this.slots.get(key);
        if (existing) return existing;

        const newSlot = new OverlappingSlot(timeSlot, this.totalParticipants);
        this.slots.set(key, newSlot);
        return newSlot;
    }

    public getBest(limit: number): OverlappingSlotData[] {
        return Array.from(this.slots.values())
            .sort((a, b) => a.compare(b))
            .slice(0, limit)
            .map(slot => slot.toJSON());
    }
}

export interface CalculateBestSlotsInput {
    availabilitySlots: any[];
    totalParticipants: number;
}

export class CalculateBestSlotsUseCase {
    public execute(input: CalculateBestSlotsInput): OverlappingSlotData[] {
        const collection = new OverlappingSlotCollection(input.totalParticipants);

        input.availabilitySlots.forEach((slot) => {
            // Ensure date is a string, handle Date objects from Prisma
            const dateStr = slot.date instanceof Date
                ? slot.date.toISOString().split('T')[0]
                : String(slot.date);

            const timeSlot = new TimeSlot(dateStr, slot.start_time, slot.end_time);
            collection.addSlot(timeSlot, slot.users?.name || "Anonymous");
        });

        return collection.getBest(5);
    }
}
