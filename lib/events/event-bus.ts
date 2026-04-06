import { DomainEvent, DomainEventType } from './domain-events';

export interface IEventBus {
    publish(event: DomainEvent): Promise<void>;
    subscribe<T extends DomainEvent>(
        eventType: T['type'],
        handler: (event: T) => Promise<void>
    ): void;
}

export class EventBus implements IEventBus {
    private handlers = new Map<DomainEventType, Array<(event: DomainEvent) => Promise<void>>>();

    async publish(event: DomainEvent): Promise<void> {
        const handlers = this.handlers.get(event.type) || [];
        await Promise.all(handlers.map(handler => handler(event)));
    }

    subscribe<T extends DomainEvent>(
        eventType: T['type'],
        handler: (event: T) => Promise<void>
    ): void {
        const handlers = this.handlers.get(eventType) || [];
        handlers.push(handler as (event: DomainEvent) => Promise<void>);
        this.handlers.set(eventType, handlers);
    }
}

export const eventBus = new EventBus();
