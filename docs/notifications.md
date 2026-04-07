# Notifications & Confirmations

Este documento descreve o sistema completo de notificações e confirmações do MindYourEvent, cobrindo notificações in-app e emails transacionais.

---

## 1. Visão Geral

O sistema de notificações e confirmações do MindYourEvent fornece comunicação em tempo real para atividades relacionadas a eventos. Este documento abrange a arquitetura completa, endpoints de API, emails transacionais e detalhes de integração.

### 1.1 O Sistema de Notificações

O sistema de notificações é construído sobre um padrão de **Domain Events** que desacopla o acionamento de notificações da lógica de negócio. Quando eventos de domínio ocorrem (como um usuário submetendo disponibilidade), o evento é publicado em um barramento de eventos, e os manipuladores de notificações processam esses eventos de forma assíncrona para criar notificações para os usuários.

### 1.2 Canais de Notificação

O sistema utiliza dois canais complementares para confirmar ações do usuário:

| Canal | Descrição | Status |
|-------|-----------|--------|
| **In-App Notification** | Notificação em tempo real no aplicativo | Implementado |
| **Email Confirmation** | Email detalhado com informações do evento | Implementado |

Esta abordagem dual garante que o participante receba confirmação mesmo que não verifique o aplicativo imediatamente, proporcionando fechamento completo da experiência.

### 1.3 Objetivos do Sistema

1. **Confirmação imediata**: Notificação in-app fornece feedback instantâneo
2. **Informação detalhada**: Email inclui todos os detalhes do evento
3. **Ação**: Links para submeter disponibilidade nos emails
4. **Resiliência**: Falha em um canal não afeta o outro
5. **Internacionalização**: Suporte a múltiplos idiomas

---

## 2. Arquitetura

### 2.1 Padrão Domain Events

A arquitetura segue o padrão de Domain Events para desacoplamento:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Use Cases                                  │
│  (AddUserAvailability, FinalizeEvent, SaveRsvp, JoinEvent,          │
│   CreateEvent)                                                      │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ emits domain event
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Event Bus                                    │
│                      (lib/events/event-bus.ts)                      │
│         ┌─────────────────────────────────────────┐                 │
│         │  Handlers Map                           │                 │
│         │  AVAILABILITY_SUBMITTED → [handler]     │                 │
│         │  EVENT_FINALIZED → [handler]            │                 │
│         │  RSVP_SUBMITTED → [handler]             │                 │
│         │  JOIN_EVENT → [handler]                 │                 │
│         │  NEW_EVENT_INVITE → [handler]           │                 │
│         └─────────────────────────────────────────┘                 │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ subscribes
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Notification Handlers                            │
│  - AvailabilitySubmittedHandler                                     │
│  - EventFinalizedHandler                                            │
│  - RsvpSubmittedHandler                                             │
│  - JoinEventHandler                                                 │
│  - NewEventInviteHandler                                            │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ creates notification / sends email
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Notification Module                              │
│  ┌─────────────────┐  ┌──────────────────┐                          │
│  │ Repository      │  │ Service          │                          │
│  │ (CRUD)          │  │ (Domain Logic)   │                          │
│  └─────────────────┘  └──────────────────┘                          │
│                                                                     │
│                    Email Module                                     │
│  ┌─────────────────┐  ┌──────────────────┐                          │
│  │ Template        │  │ Retry Service    │                          │
│  └─────────────────┘  └──────────────────┘                          │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ persists / sends
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Database + Email Provider                     │
│                 (PostgreSQL via Prisma + SMTP)                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Fluxo de Dados

**Para Notificações In-App:**

```typescript
// 1. Use case executa operação principal
const participant = await joinEventUseCase.execute({
    token: inviteToken,
    name: "John Doe",
    email: "john@example.com"
});

// 2. Emite domain event para notificação in-app
await eventBus.publish({
    type: DomainEventType.JOIN_EVENT,
    payload: { eventId, eventTitle, userId },
    timestamp: new Date()
});

// 3. Handler processa evento e cria notificação
// Notification created in database
```

**Para Email de Confirmação:**

```typescript
// Email enviado de forma não-bloqueante
this.sendConfirmationEmail(user, event, inviteToken)
    .catch(error => console.error("Email failed:", error));
```

### 2.3 Estrutura de Módulos

```
lib/events/                          # Event Bus Infrastructure
├── index.ts                         # Module exports
├── domain-events.ts                 # Domain event types and interfaces
└── event-bus.ts                     # Pub/sub implementation

modules/notifications/
├── index.ts                         # Module entry + handler registration
├── types/
│   └── notification.types.ts       # TypeScript interfaces
├── interfaces/
│   ├── notification-repository.interface.ts  # ISP: Repository interface
│   └── notification-service.interface.ts    # ISP: Service interface
├── repository/
│   └── notification-repository.ts   # Prisma implementation
├── services/
│   └── notification-service.ts     # Domain notification methods
└── handlers/
    ├── availability-submitted-handler.ts
    ├── event-finalized-handler.ts
    ├── rsvp-submitted-handler.ts
    ├── join-event-handler.ts
    └── new-event-invite-handler.ts

modules/events/
├── emails/
│   └── participant-confirmation-email.tsx  # Email template
└── use-cases/
    ├── JoinEventUseCase.ts         # Orchestrates notification + email
    └── email/
        └── sendParticipantConfirmationEmail.ts  # Email use case

app/api/notifications/
├── route.ts                         # GET (list), PATCH (mark all read)
├── unread-count/
│   └── route.ts                     # GET unread count
└── [id]/
    └── route.ts                     # PATCH (mark read), DELETE
```

---

## 3. Tipos de Notificação

### 3.1 Notificações In-App

| Type | Trigger | Recipient | Description |
|------|---------|-----------|-------------|
| `AVAILABILITY_SUBMITTED` | Participant submits availability | Organizer | Notifies when participant submits their availability |
| `EVENT_FINALIZED` | Organizer finalizes event | All participants | Notifies when event date/time is confirmed |
| `RSVP_SUBMITTED` | Participant responds to RSVP | Organizer | Notifies when participant confirms/declines attendance |
| `JOIN_EVENT_CONFIRMATION` | User joins event | Participant | Confirmation that user has successfully joined |
| `NEW_EVENT_INVITE` | Organizer creates event | Invitee | Notifies when user is invited to an event |
| `PRODUCT_ANNOUNCEMENT` | Admin trigger | All users | New feature releases (future) |
| `SYSTEM_UPDATE` | Admin trigger | All users | System maintenance/notices (future) |
| `USER_ONBOARDING` | Auto-trigger | New users | Welcome tips for new users (future) |

### 3.2 Emails Transacionais

| Email | Trigger | Recipient | Description |
|-------|---------|-----------|-------------|
| **Participant Confirmation** | User joins event | Participant | Confirmation email with event details and availability link |

### 3.3 Mapeamento: Evento → Notificação → Email

| Use Case | Domain Event | In-App Notification | Email |
|----------|--------------|---------------------|-------|
| `addUserAvailabilityUseCase.ts` | `AVAILABILITY_SUBMITTED` | ✅ (organizer receives) | ❌ |
| `finalizeEventUseCase.ts` | `EVENT_FINALIZED` | ✅ (all participants) | ❌ |
| `SaveRsvpUseCase.ts` | `RSVP_SUBMITTED` | ✅ (organizer receives) | ❌ |
| `JoinEventUseCase.ts` | `JOIN_EVENT` | ✅ (participant receives) | ✅ (participant receives) |
| `createEventUseCase.ts` | `NEW_EVENT_INVITE` | ✅ (invitee receives) | ❌ |

---

## 4. Banco de Dados

### 4.1 Schema Prisma

```prisma
// prisma/schema.prisma

enum NotificationType {
  AVAILABILITY_SUBMITTED
  EVENT_FINALIZED
  RSVP_SUBMITTED
  PRODUCT_ANNOUNCEMENT
  SYSTEM_UPDATE
  USER_ONBOARDING
  JOIN_EVENT_CONFIRMATION
  NEW_EVENT_INVITE
}

model Notification {
  id         String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id    String           @db.Uuid
  type       NotificationType
  title      String
  message    String
  data       Json?
  is_read    Boolean          @default(false)
  created_at DateTime         @default(now()) @db.Timestamptz(6)
  user       User             @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, is_read])
  @@index([user_id, created_at])
  @@map("notifications")
}

model User {
  id            String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String             @unique
  name          String
  session_token String?            @unique
  created_at    DateTime?          @default(now()) @db.Timestamptz(6)
  events        Event[]
  participants  EventParticipant[]
  availabilities AvailabilitySlot[]
  notifications Notification[]

  @@map("users")
}
```

### 4.2 Modelo Notification

O modelo `Notification` contém os seguintes campos:

| Campo | Tipo | Descrição |
|-------|------|------------|
| `id` | UUID | Identificador único |
| `user_id` | UUID | Usuário que recebe a notificação |
| `type` | Enum | Tipo da notificação |
| `title` | String | Título da notificação |
| `message` | String | Corpo da mensagem |
| `data` | JSON | Dados adicionais (eventId, link, etc.) |
| `is_read` | Boolean | Status de leitura |
| `created_at` | Timestamp | Data de criação |

### 4.3 Índices e Performance

Os índices criados otimizam as consultas mais comuns:

```prisma
@@index([user_id, is_read])    // Para busca de não lidas por usuário
@@index([user_id, created_at]) // Para paginação por cursor
```

---

## 5. API de Notificações In-App

### 5.1 GET /api/notifications

Get paginated notifications for the authenticated user.

**Authentication:** Required (session cookie)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| cursor | string | No | - | ISO timestamp for cursor-based pagination |
| limit | number | No | 20 | Max items to return (max: 100) |
| includeRead | boolean | No | false | Include already-read notifications |

**Response:**

```typescript
{
  items: Array<{
    id: string;
    userId: string;
    type: "AVAILABILITY_SUBMITTED" | "EVENT_FINALIZED" | ...;
    title: string;
    message: string;
    data: {
      eventId?: string;
      eventTitle?: string;
      participantName?: string;
      link?: string;
    } | null;
    isRead: boolean;
    createdAt: string; // ISO 8601
  }>;
  nextCursor: string | null;
  hasMore: boolean;
}
```

**Example Request:**

```bash
curl -H "Cookie: session_token=..." \
  "https://localhost:3000/api/notifications?limit=20&includeRead=false"
```

**Example Response:**

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "type": "AVAILABILITY_SUBMITTED",
      "title": "Availability Submitted",
      "message": "John Doe has submitted their availability for \"Team Meeting\"",
      "data": {
        "eventId": "550e8400-e29b-41d4-a716-446655440002",
        "eventTitle": "Team Meeting",
        "participantName": "John Doe"
      },
      "isRead": false,
      "createdAt": "2026-04-05T10:30:00.000Z"
    }
  ],
  "nextCursor": "2026-04-05T10:30:00.000Z",
  "hasMore": true
}
```

---

### 5.2 GET /api/notifications/unread-count

Get the count of unread notifications for the badge display.

**Authentication:** Required (session cookie)

**Response:**

```typescript
{
  unreadCount: number
}
```

**Example:**

```bash
curl -H "Cookie: session_token=..." \
  "https://localhost:3000/api/notifications/unread-count"
```

```json
{
  "unreadCount": 5
}
```

---

### 5.3 PATCH /api/notifications/:id

Mark a single notification as read.

**Authentication:** Required (session cookie)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Notification UUID |

**Response:**

```typescript
{
  success: boolean
}
```

**Example:**

```bash
curl -X PATCH -H "Cookie: session_token=..." \
  "https://localhost:3000/api/notifications/550e8400-e29b-41d4-a716-446655440000"
```

```json
{
  "success": true
}
```

---

### 5.4 DELETE /api/notifications/:id

Delete a notification.

**Authentication:** Required (session cookie)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Notification UUID |

**Response:**

```typescript
{
  success: boolean
}
```

**Example:**

```bash
curl -X DELETE -H "Cookie: session_token=..." \
  "https://localhost:3000/api/notifications/550e8400-e29b-41d4-a716-446655440000"
```

```json
{
  "success": true
}
```

---

### 5.5 PATCH /api/notifications (Bulk)

Mark all notifications as read.

**Authentication:** Required (session cookie)

**Request Body:**

```typescript
{
  action: "markAllRead"
}
```

**Response:**

```typescript
{
  success: boolean
}
```

**Example:**

```bash
curl -X PATCH -H "Cookie: session_token=..." -H "Content-Type: application/json" \
  -d '{"action": "markAllRead"}' \
  "https://localhost:3000/api/notifications"
```

```json
{
  "success": true
}
```

---

### 5.6 Respostas de Erro

All endpoints return consistent error responses:

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `Invalid action` | Invalid bulk action |
| 401 | `Unauthorized` | Missing or invalid session |
| 500 | `Internal server error` | Server-side failure |

**Example Error Response:**

```json
{
  "error": "Unauthorized"
}
```

---

## 6. Email de Confirmação de Evento

### 6.1 Quando é enviado

O email de confirmação é enviado quando um participante entra em um evento via link de convite ou acesso compartilhado. O envio é **não-bloqueante**, ou seja, não atrasa a resposta ao usuário.

**Fluxo de execução:**

```typescript
// 1. Participante entra no evento via link de convite
const participant = await joinEventUseCase.execute({
    token: inviteToken,
    name: "John Doe",
    email: "john@example.com"
});

// 2. JoinEventUseCase executa duas operações em paralelo:
//    a) Emite domínio de evento para notificação in-app
await eventBus.publish({
    type: DomainEventType.JOIN_EVENT,
    payload: { eventId, eventTitle, userId },
    timestamp: new Date()
});

//    b) Envia email de confirmação (não-bloqueante)
this.sendConfirmationEmail(user, event, inviteToken)
    .catch(error => console.error("Email failed:", error));
```

### 6.2 Template do Email

**Arquivo**: `modules/events/emails/participant-confirmation-email.tsx`

Este componente React server-side rendering que gera o HTML do email de confirmação.

```typescript
interface ParticipantConfirmationEmailTemplateProps {
    userName: string;          // Nome do participante
    eventTitle: string;        // Título do evento
    eventDescription: string;  // Descrição do evento
    eventStartDate: string;    // Data de início (ISO 8601)
    eventEndDate: string;      // Data de término (ISO 8601)
    organizerName: string;     // Nome do organizador
    availabilityLink: string; // URL para submeter disponibilidade
}
```

**Features do template**:

- Suporte a internacionalização (i18n) via `next-intl`
- Formatação de datas localizada
- Estilos inline para compatibilidade máxima
- Design responsivo
- Botão de chamada para ação (CTA)
- Fallback para link alternativo

**Exemplo de traduções** (en.json):

```json
{
  "Email": {
    "Event": {
      "ParticipantConfirmationEmail": {
        "title": "You're In!",
        "subtitle": "Event confirmation from MindYourEvent",
        "greeting": "Hello, {userName}!",
        "youJoined": "You have successfully joined {eventTitle}",
        "eventDetails": "Event Details",
        "dateRange": "Date",
        "organizer": "Organizer",
        "submitAvailability": "Click the button below to submit your availability.",
        "submitAvailabilityButton": "Submit My Availability",
        "linkNotWorking": "If the button above doesn't work,",
        "clickHere": "click here."
      }
    }
  }
}
```

### 6.3 Uso em Código

**Use Case de Envio de Email:**

**Arquivo**: `modules/events/use-cases/email/sendParticipantConfirmationEmail.ts`

```typescript
export class SendParticipantConfirmationEmailUseCase {
    constructor(
        private emailService: EmailService = EmailServiceFactory.create(),
        private translations = getTranslations("Email.Event.ParticipantConfirmationEmail"),
        private template = ParticipantConfirmationEmailTemplate,
    ) {}

    // Envio básico (sem retry)
    public async execute(params: SendParticipantConfirmationEmailParams)

    // Envio com retry automático
    public async executeWithRetry(params: SendParticipantConfirmationEmailParams)
}
```

**Parâmetros de entrada**:

```typescript
interface SendParticipantConfirmationEmailParams {
    email: string;            // Email do participante
    userName: string;         // Nome do participante
    eventTitle: string;       // Título do evento
    eventDescription: string; // Descrição do evento
    eventStartDate: string;  // Data de início
    eventEndDate: string;    // Data de término
    organizerName: string;   // Nome do organizador
    availabilityLink: string; // Link para disponibilidade
}
```

**Serviço de Retry:**

**Arquivo**: `lib/email/email-retry.service.ts`

```typescript
export class EmailRetryService {
    private readonly DEFAULT_MAX_RETRIES = 3;
    private readonly DEFAULT_BASE_DELAY = 1000; // 1 segundo

    async executeWithRetry<T>(fn: () => Promise<T>): Promise<T>
}
```

**Estratégia de retry**:

- **Máximo de tentativas**: 3 (configurável)
- **Delay entre tentativas**: 1000ms, 2000ms, 4000ms (exponencial)
- **Tratamento de erros**: Apenas falha após todas as tentativas

**Exemplo de integração em novo código:**

```typescript
import { SendParticipantConfirmationEmailUseCase } from "./email/sendParticipantConfirmationEmail";
import { emailRetryService } from "@/lib/email/email-retry.service";

class MyNewUseCase {
    private sendConfirmationEmail = new SendParticipantConfirmationEmailUseCase();

    async myMethod() {
        // Enviar email com retry automático
        await emailRetryService.executeWithRetry(() =>
            this.sendConfirmationEmail.execute({
                email: "user@example.com",
                userName: "John",
                eventTitle: "My Event",
                eventDescription: "Event description",
                eventStartDate: "2024-01-01",
                eventEndDate: "2024-01-02",
                organizerName: "Organizer",
                availabilityLink: "https://app.example.com/invite/abc123"
            })
        );
    }
}
```

### 6.4 Adicionar Novas Traduções

Para adicionar suporte a um novo idioma, adicione as traduções em `messages/{locale}.json`:

```json
{
  "Email": {
    "Event": {
      "ParticipantConfirmationEmail": {
        "title": "Você entrou!",
        "subtitle": "Confirmação de evento do MindYourEvent",
        "greeting": "Olá, {userName}!",
        "youJoined": "Você entrou com sucesso em {eventTitle}",
        "eventDetails": "Detalhes do Evento",
        "dateRange": "Data",
        "organizer": "Organizador",
        "submitAvailability": "Clique no botão abaixo para enviar sua disponibilidade.",
        "submitAvailabilityButton": "Enviar Minha Disponibilidade",
        "linkNotWorking": "Se o botão acima não funcionar,",
        "clickHere": "clique aqui."
      }
    }
  }
}
```

---

## 7. Domain Events

### 7.1 Tipos de Evento

O sistema define cinco tipos de eventos de domínio em `lib/events/domain-events.ts`:

```typescript
export enum DomainEventType {
  AVAILABILITY_SUBMITTED = 'AVAILABILITY_SUBMITTED',
  EVENT_FINALIZED = 'EVENT_FINALIZED',
  RSVP_SUBMITTED = 'RSVP_SUBMITTED',
  JOIN_EVENT = 'JOIN_EVENT',
  NEW_EVENT_INVITE = 'NEW_EVENT_INVITE',
}
```

### 7.2 Payloads

Cada tipo de evento possui uma estrutura de payload específica:

```typescript
// AVAILABILITY_SUBMITTED
{
  type: "AVAILABILITY_SUBMITTED",
  payload: {
    eventId: string;
    eventTitle: string;
    participantId: string;
    participantName: string;
    organizerId: string;
  },
  timestamp: Date;
}

// EVENT_FINALIZED
{
  type: "EVENT_FINALIZED",
  payload: {
    eventId: string;
    eventTitle: string;
    participantIds: string[];
  },
  timestamp: Date;
}

// RSVP_SUBMITTED
{
  type: "RSVP_SUBMITTED",
  payload: {
    eventId: string;
    eventTitle: string;
    participantId: string;
    participantName: string;
    organizerId: string;
    willAttend: boolean;
  },
  timestamp: Date;
}

// JOIN_EVENT
{
  type: "JOIN_EVENT",
  payload: {
    eventId: string;
    eventTitle: string;
    userId: string;
  },
  timestamp: Date;
}

// NEW_EVENT_INVITE
{
  type: "NEW_EVENT_INVITE",
  payload: {
    eventId: string;
    eventTitle: string;
    userId: string;
    organizerName: string;
  },
  timestamp: Date;
}
```

### 7.3 Handler Registration

Os manipuladores são registrados quando o módulo de notificações é carregado:

```typescript
// modules/notifications/index.ts
export function registerNotificationHandlers(): void {
  new AvailabilitySubmittedHandler(notificationService);
  new EventFinalizedHandler(notificationService);
  new RsvpSubmittedHandler(notificationService);
  new JoinEventHandler(notificationService);
  new NewEventInviteHandler(notificationService);
}
```

Os manipuladores são inicializados em cada rota de API:

```typescript
// app/api/notifications/route.ts
import { registerNotificationHandlers } from "@/modules/notifications";

registerNotificationHandlers();
```

### 7.4 Tratamento de Erros

**Regra Crítica:** Os manipuladores de eventos devem **NUNCA** lançar exceções. Notificações são "best-effort", e a operação principal deve sempre ter sucesso.

```typescript
// modules/notifications/handlers/availability-submitted-handler.ts
async handle(event: AvailabilitySubmittedEvent): Promise<void> {
  try {
    await this.notificationService.notifyAvailabilitySubmitted(...);
  } catch (error) {
    console.error('Failed to send availability notification:', error);
    // Do NOT re-throw - main operation must succeed
  }
}
```

---

## 8. Decisões de Design

### 8.1 Por que Domain Events?

1. **Desacoplamento:** Use cases não precisam conhecer notificações. Eles apenas emitem eventos.
2. **Extensibilidade:** Adicionar novos manipuladores sem modificar código existente.
3. **Testabilidade:** Testar lógica de negócio sem efeitos colaterais de notificações.
4. **Isolamento de Erros:** Falhas de notificação não afetam operações core.

### 8.2 Por que Cursor Pagination?

- **Performance:** Lookup O(1) vs O(n) offset para grandes datasets
- **Estabilidade:** Resultados não se alteram quando novas notificações chegam
- **Escalabilidade:** Funciona eficientemente com milhões de notificações

### 8.3 Por que ISP-Compliant?

- **Dependencies Limpas:** Use cases importam apenas o que precisam
- **Flexibilidade:** Trocar implementações sem alterar consumidores
- **Testagem:** Fácil criar mocks de interfaces específicas

### 8.4 Email Não-Bloqueante

- **Resposta rápida:** Usuário recebe confirmação imediatamente
- **Resiliência:** Falha no email não afeta a experiência do usuário
- **Melhor esforço:** Tentativas de retry sem bloquear operação principal

---

## 9. Testes

### 9.1 Unit Tests

**Teste Unitário do Template de Email:**

```typescript
import { ParticipantConfirmationEmailTemplate } from './participant-confirmation-email';

describe('ParticipantConfirmationEmailTemplate', () => {
    it('renders correctly with all props', async () => {
        const html = await renderComponent(
            <ParticipantConfirmationEmailTemplate
                userName="John"
                eventTitle="Team Meeting"
                eventDescription="Monthly sync"
                eventStartDate="2024-01-15"
                eventEndDate="2024-01-15"
                organizerName="Jane"
                availabilityLink="https://app.com/invite/abc"
            />
        );

        expect(html).toContain('John');
        expect(html).toContain('Team Meeting');
        expect(html).toContain('Submit My Availability');
    });
});
```

**Teste de Repository (Notificações):**

```typescript
describe('NotificationRepository', () => {
    it('creates notification with correct data', async () => {
        const notification = await repository.create({
            userId: 'user-123',
            type: NotificationType.EVENT_FINALIZED,
            title: 'Event Finalized',
            message: 'Your event has been confirmed',
            data: { eventId: 'event-456' }
        });

        expect(notification.id).toBeDefined();
        expect(notification.type).toBe(NotificationType.EVENT_FINALIZED);
    });
});
```

### 9.2 Integration Tests

**Teste de Integração do Use Case de Email:**

```typescript
describe('SendParticipantConfirmationEmailUseCase', () => {
    it('sends email with correct parameters', async () => {
        const mockEmailService = {
            sendMail: jest.fn().mockResolvedValue(undefined)
        };

        const useCase = new SendParticipantConfirmationEmailUseCase(
            mockEmailService as any
        );

        await useCase.execute({
            email: 'test@example.com',
            userName: 'John',
            eventTitle: 'Event',
            eventDescription: 'Desc',
            eventStartDate: '2024-01-01',
            eventEndDate: '2024-01-02',
            organizerName: 'Organizer',
            availabilityLink: 'https://app.com/invite/abc'
        });

        expect(mockEmailService.sendMail).toHaveBeenCalledWith(
            'test@example.com',
            expect.any(String),
            expect.any(String)
        );
    });
});
```

**Teste de API de Notificações:**

```typescript
describe('GET /api/notifications', () => {
    it('returns paginated notifications', async () => {
        const response = await request(app)
            .get('/api/notifications?limit=10')
            .set('Cookie', 'session_token=valid-token');

        expect(response.status).toBe(200);
        expect(response.body.items).toBeDefined();
        expect(response.body.hasMore).toBeDefined();
    });
});
```

### 9.3 E2E Tests

**Teste de Retry:**

```typescript
describe('EmailRetryService', () => {
    it('retries failed operations', async () => {
        const mockFn = jest.fn()
            .mockRejectedValueOnce(new Error('First attempt'))
            .mockResolvedValueOnce('success');

        const result = await emailRetryService.executeWithRetry(mockFn);

        expect(mockFn).toHaveBeenCalledTimes(2);
        expect(result).toBe('success');
    });

    it('throws after max retries', async () => {
        const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));

        await expect(
            emailRetryService.executeWithRetry(mockFn)
        ).rejects.toThrow();

        expect(mockFn).toHaveBeenCalledTimes(3);
    });
});
```

**Fluxo Completo de Notificação:**

```typescript
describe('Notification Flow E2E', () => {
    it('complete flow: trigger -> create -> view -> mark read', async () => {
        // 1. User joins event
        const participant = await joinEventUseCase.execute({
            token: 'valid-token',
            name: 'John',
            email: 'john@example.com'
        });

        // 2. Notification should be created
        const notifications = await notificationService.getByUserId(participant.user_id);
        expect(notifications).toHaveLength(1);
        expect(notifications[0].type).toBe(NotificationType.JOIN_EVENT_CONFIRMATION);

        // 3. User views notification via API
        const response = await request(app)
            .get('/api/notifications')
            .set('Cookie', sessionCookie);

        expect(response.body.items).toHaveLength(1);

        // 4. User marks as read
        const markReadResponse = await request(app)
            .patch(`/api/notifications/${notifications[0].id}`)
            .set('Cookie', sessionCookie);

        expect(markReadResponse.body.success).toBe(true);
    });
});
```

---

## 10. Futuras Melhorias

| Melhoria | Descrição | Prioridade |
|----------|-----------|------------|
| **WebSocket em Tempo Real** | Push notifications instantaneamente ao invés de polling | Alta |
| **Email Digest** | Resumo diário/semanal de notificações por email | Média |
| **Push Notifications Mobile** | Notificações push para app mobile | Média |
| **Admin UI** | Dashboard para criar anúncios de produtos | Baixa |
| **Preferências de Notificação** | Configurações de usuário por tipo de notificação | Média |
| **Composição de Emails** | Usar @react-email para templates mais robustos | Média |
| **Template Transacional** | Sistema de templates flexíveis | Alta |
| **Estatísticas de Entrega** | Dashboard de entrega de emails | Média |

---

## Referências

- [TODO.md da Task 06](./tasks/06-confirmation/TODO.md) - Especificação original
- [UX Roadmap](./ux-roadmap.md) - Contexto do produto