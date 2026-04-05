# MindYourEvent - Plano de Correções

## 🔴 Alta Prioridade (Corrigir Imediatamente)

### 1. IDOR Vulnerabilities

- [ ] **1.1** Corrigir IDOR em `/api/availability` - validar que token pertence ao eventId
  - Arquivo: `app/api/availability/route.ts`
  - Adicionar verificação: buscar participant por inviteToken + eventId antes de permitir submission
  
- [x] **1.2** Corrigir IDOR em `/api/events/[eventId]/rsvp` - validar token contra event
  - Arquivo: `app/api/events/[eventId]/rsvp/route.ts`
  - Adicionar verificação: validar que inviteToken pertence ao eventId especificado
  - ✅ Implementado em `participant-repository.ts`

### 2. Rate Limiting

- [ ] **2.1** Adicionar rate limiting em `/api/auth/send-code`
  - Limitar a 5 códigos por email por hora
  - Usar Redis ou memória em memória com TTL
  
- [ ] **2.2** Adicionar rate limiting em `/api/auth/verify-code`
  - Prevenir brute force de códigos

### 3. Fire-and-Forget Bug

- [x] **3.1** Corrigir promise não awaited em `send-event-invite-links.ts`
  - Arquivo: `actions/event/send-event-invite-links.ts`
  - Adicionar await ou tratar promise rejection
  - ✅ Implementado via EmailRetryService

### 4. Re-envio de Convites

- [ ] **4.1** Enviar emails automaticamente ao adicionar novos participantes
  - Arquivo: `modules/events/use-cases/updateEventUseCase.ts`
  - Após adicionar novos participantes, chamar SendEventInviteEmail para cada novo

---

## 🟡 Média Prioridade

### 5. Error Handling

- [x] **5.1** Corrigir error re-throw em `SaveRsvpUseCase.ts`
  - Arquivo: `modules/events/use-cases/SaveRsvpUseCase.ts:19-21`
  - Capturar ApiException separadamente
  - ✅ Implementado: melhor error handling + novos testes
  
- [x] **5.2** Adicionar tratamento de erro em participant creation failure
  - Arquivo: `modules/events/use-cases/createEventUseCase.ts:26-27`
  - Reportar falha parcial ao usuário ou collectionar erros
  - ✅ Implementado: retorna CreateEventResult com failedParticipants[]

- [x] **5.3** Adicionar retry para emails falhas em FinalizeEventUseCase
  - Arquivo: `modules/events/use-cases/finalizeEventUseCase.ts:50-68`
  - ✅ Implementado: retry com backoff exponencial (1s, 2s, 4s)

### 6. Validações

- [ ] **6.1** Validar que slots estão dentro do range do evento
  - Arquivo: `app/api/availability/route.ts`
  - Buscar evento e validar cada slot dentro de start_date/end_date e start_time/end_time

- [ ] **6.2** Verificar se evento está finalizado antes de aceitar RSVP
  - Arquivo: `app/api/events/[eventId]/rsvp/route.ts`
  - Se evento não finalizado, rejeitar ou redirecionar para availability

- [ ] **6.3** Prevenir emails duplicados ao adicionar participantes
  - Arquivo: `modules/events/use-cases/updateEventUseCase.ts`
  - Adicionar dedup de emails antes de criar participants

### 7. UX/UI

- [ ] **7.1** Adicionar modal de confirmação antes de finalizar evento
  - Mostrar alerta: "Tem certeza? Isso não pode ser desfeito"
  
- [ ] **7.2** Adicionar indicador visual em página de convite após finalização
  - Mostrar banner: "Este evento foi finalizado"

- [ ] **7.3** Adicionar botão "Reenviar convite" no dashboard

### 8. Race Conditions

- [ ] **8.1** Adicionar transaction com lock em FinalizeEventUseCase
  - Usar Prisma transaction com SELECT FOR UPDATE

- [ ] **8.2** atomicidade em AddUserAvailabilityUseCase
  - Usar transaction para delete + insert

---

## 🟢 Baixa Prioridade

### 9. Funcionalidades de Negócio

- [ ] **9.1** Adicionar mecanismo de decline explícito
  - Adicionar campo `declined_at` ou mudar RSVP para enum
  
- [ ] **9.2** Sistema de lembretes (cron job)
  - 24h antes do end_date, enviar email para quem não respondeu
  
- [ ] **9.3** Expiração de eventos
  - Auto-expire 7 dias após end_date se não finalizado
  
- [ ] **9.4** Deletion de evento pelo organizador

- [ ] **9.5** Deletion de conta (GDPR)

- [ ] **9.6** Reopen de evento finalizado

### 10. Melhorias

- [ ] **10.1** Toggle para participantes verem lista de convidados

- [ ] **10.2** Validar que event start_date não está no passado

- [ ] **10.3** Multiple session handling

---

## Checklist de Testes

Após implementar correções:

- [ ] Testar IDOR: tentar submeter availability para event diferente do token
- [x] Testar IDOR: tentar submeter RSVP para event diferente do token  
  - ✅ Corrigido via validação em participant-repository.ts  
- [ ] Testar rate limiting: tentar enviar múltiplos códigos rapidamente
- [x] Testar fire-and-forget: verificar que erros de email são tratados
  - ✅ Corrigido via EmailRetryService
- [ ] Testar re-invite: adicionar novo participante e verificar email enviado
- [ ] Testar confirmation modal: tentar finalizar evento
- [ ] Testar race condition: tentar finalizar simultaneamente (se possível)

---

## Referências

- IDs de issues são baseados na análise em docs/
- Issues de código: 3.1, 3.2, 3.3
- Issues de negócio: 1.1, 1.4, 1.5, 2.3, 2.4
- Issues de UX: 2.1, 2.3