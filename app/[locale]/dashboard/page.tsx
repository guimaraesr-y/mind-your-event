'use client';

import { AuthGuard } from "@/components/auth-guard";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { EventParticipantWithEvent, retrieveEventsByCreatorId, retrieveParticipatingEventsByUserId } from "@/actions/event/retrieve";
import { CreatedEvents } from "@/components/created-events";
import { ParticipatingEvents } from "@/components/participating-events";
import { EventInterface } from "@/modules/events/event";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { CircleUserRound, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { updateUser } from "@/actions/user/update";

export default function DashboardPage() {
  const t = useTranslations("DashboardPage");
  const { user, isLoading, updateUserStatus } = useAuth();
  const [pendingCreatedEvents, setPendingCreatedEvents] = useState<EventInterface[]>([]);
  const [finalizedCreatedEvents, setFinalizedCreatedEvents] = useState<EventInterface[]>([]);
  const [pendingParticipatingEvents, setPendingParticipatingEvents] = useState<EventParticipantWithEvent[]>([]);
  const [finalizedParticipatingEvents, setFinalizedParticipatingEvents] = useState<EventParticipantWithEvent[]>([]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState(user?.name || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      setEditableName(user.name || "");
    }
  }, [user, isLoading]);

  const handleUpdateName = async () => {
    if (!user || editableName.trim() === "" || editableName === user.name) {
      setIsEditingName(false);
      return;
    }

    setIsUpdatingName(true);
    try {
      await updateUser(user.id, { name: editableName });
      await updateUserStatus();
      toast.success(t("updateNameSuccess"));
      setIsEditingName(false);
    } catch (error) {
      toast.error(t("updateNameError"));
      setEditableName(user.name || "");
    } finally {
      setIsUpdatingName(false);
    }
  };

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    (async () => {
      const [created, participating] = await Promise.all([
        retrieveEventsByCreatorId(user!.id),
        retrieveParticipatingEventsByUserId(user!.id),
      ]);

      setPendingCreatedEvents(created.filter(e => !e.is_finalized));
      setFinalizedCreatedEvents(created.filter(e => e.is_finalized));

      setPendingParticipatingEvents(participating.filter(e => !e.events.is_finalized));
      setFinalizedParticipatingEvents(participating.filter(e => e.events.is_finalized));
    })();

    return () => {
      setPendingCreatedEvents([]);
      setFinalizedCreatedEvents([]);
      setPendingParticipatingEvents([]);
      setFinalizedParticipatingEvents([]);
    }
  }, [isLoading, user])

  const eventHasAvailability = (participant: EventParticipantWithEvent): boolean => {
    const event = participant.events;
    return Boolean(event?.availability_slots.length > 0)
  }

  const participantWillAttend = (participant: EventParticipantWithEvent): boolean => {
    return Boolean(participant.will_attend)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-4">
                <CircleUserRound className="h-12 w-12 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    {t("hello", { name: user?.name || "there" })}
                    {user && (
                      isEditingName ? (
                        <Input
                          value={editableName}
                          onChange={(e) => setEditableName(e.target.value)}
                          onBlur={handleUpdateName}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateName();
                            if (e.key === 'Escape') {
                              setIsEditingName(false);
                              setEditableName(user.name || "");
                            }
                          }}
                          className="text-2xl md:text-3xl font-bold w-48"
                          disabled={isUpdatingName}
                          autoFocus
                        />
                      ) : (
                        <>
                          <span className="text-3xl md:text-4xl font-bold text-foreground">{user.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditingName(true)}
                            className="h-8 w-8 text-muted-foreground"
                            aria-label={t("editName")}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </>
                      )
                    )}
                  </h1>
                </div>
              </div>
              <div>
                <Button asChild>
                  <Link href="/create">{t("createEvent")}</Link>
                </Button>
              </div>
            </div>

            <div className="w-full inline-flex items-center gap-2 px-4 py-2">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {t("title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("description")}
                </p>
              </div>
            </div>

            <Tabs defaultValue="my-events">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger className="cursor-pointer" value="my-events">{t("tabs.myEvents")}</TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="invitations">{t("tabs.invitations")}</TabsTrigger>
              </TabsList>

              <TabsContent value="my-events">
                <Card>
                  <CardContent className="space-y-8 pt-6">
                    <div>
                      <CreatedEvents
                        title={t("pendingEvents.title")}
                        description={t("pendingEvents.createdEvents.description")}
                        events={pendingCreatedEvents}
                      />
                    </div>
                    <div>
                      <CreatedEvents
                        title={t("confirmedEvents.title")}
                        description={t("confirmedEvents.createdEvents.description")}
                        events={finalizedCreatedEvents}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invitations">
                <Card>
                  <CardContent className="space-y-8 pt-6">
                    <div>
                      <ParticipatingEvents
                        title={t("pendingEvents.title")}
                        description={t("pendingEvents.invitedToEvents.description")}
                        events={pendingParticipatingEvents}
                        participationConfirmMethod={eventHasAvailability}
                      />
                    </div>
                    <div>
                      <ParticipatingEvents
                        title={t("confirmedEvents.title")}
                        description={t("confirmedEvents.invitedToEvents.description")}
                        events={finalizedParticipatingEvents}
                        participationConfirmMethod={participantWillAttend}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}