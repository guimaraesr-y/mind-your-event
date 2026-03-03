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
import { useEffect, useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { CircleUserRound, Pencil } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { Onboarding } from "@/components/onboarding";

export default function DashboardPage() {
  const t = useTranslations("DashboardPage");
  const { user, isLoading, updateUserStatus } = useAuth();
  const [createdEvents, setCreatedEvents] = useState<EventInterface[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<EventParticipantWithEvent[]>([]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("my-events");

  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState(user?.name || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const { updateUser } = useUser();

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  const handleStepChange = useCallback((index: number) => {
    if (index === 3) {
      setActiveTab("invitations");
    }
  }, []);

  // Memoize filtered lists to prevent recalculation on every render
  const pendingCreatedEvents = useMemo(() =>
    createdEvents.filter(e => !e.is_finalized),
    [createdEvents]
  );

  const finalizedCreatedEvents = useMemo(() =>
    createdEvents.filter(e => e.is_finalized),
    [createdEvents]
  );

  const pendingParticipatingEvents = useMemo(() =>
    participatingEvents.filter(e => !e.event.is_finalized),
    [participatingEvents]
  );

  const finalizedParticipatingEvents = useMemo(() =>
    participatingEvents.filter(e => e.event.is_finalized),
    [participatingEvents]
  );

  useEffect(() => {
    if (!isLoading && user) {
      setEditableName(user.name || "");
    }
  }, [user, isLoading]);

  const handleUpdateName = useCallback(async () => {
    if (!user || editableName.trim() === "" || editableName === user.name) {
      setIsEditingName(false);
      return;
    }

    setIsUpdatingName(true);
    updateUser({
      id: user.id, name: editableName
    })
      .then(data => {
        user.name = data.name;
        updateUserStatus();
      })
      .catch((error) => {
        setEditableName(user.name || "");
        console.log('Errror updating name', error);
      })
      .finally(() => {
        setIsUpdatingName(false);
        setIsEditingName(false);
      })
  }, [user, editableName, updateUser, updateUserStatus]);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    let isMounted = true;

    (async () => {
      const [created, participating] = await Promise.all([
        retrieveEventsByCreatorId(user!.id),
        retrieveParticipatingEventsByUserId(user!.id),
      ]);

      if (isMounted) {
        setCreatedEvents(created);
        setParticipatingEvents(participating);
      }
    })();

    return () => {
      isMounted = false;
    }
  }, [isLoading, user])

  const eventHasAvailability = useCallback((participant: EventParticipantWithEvent): boolean => {
    const event = participant.event;
    return Boolean(event?.availabilities.length > 0)
  }, []);

  const participantWillAttend = useCallback((participant: EventParticipantWithEvent): boolean => {
    return Boolean(participant.will_attend)
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-background dashboard-div">
        <Header onShowTutorial={() => setShowOnboarding(true)} />
        <main className="flex-1 px-4 py-6 md:py-10">
          <Onboarding
            forceShow={showOnboarding}
            onComplete={handleOnboardingComplete}
            isLoading={isLoading}
            onStepChange={handleStepChange}
          />
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 dashboard-container">

            <div className="relative overflow-hidden rounded-3xl bg-primary/5 p-6 md:p-8 border border-primary/10">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-background border flex items-center justify-center shadow-sm">
                    <CircleUserRound className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl md:text-3xl font-bold text-foreground">
                        {t("hello_greeting")}
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
                              className="font-bold w-auto border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 h-auto inline-block"
                              disabled={isUpdatingName}
                              autoFocus
                            />
                          ) : (
                            <span className="ml-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user.name}</span>
                          )
                        )}
                      </h1>
                      {!isEditingName && user && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsEditingName(true)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                          aria-label={t("editName")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                      {t("description")}
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <Button asChild size="lg" className="w-full md:w-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all create-event-button">
                    <Link href="/create">{t("createEvent")}</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="hidden md:block w-full px-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {t("title")}
              </h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger className="cursor-pointer" value="my-events">{t("tabs.myEvents")}</TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="invitations">{t("tabs.invitations")}</TabsTrigger>
              </TabsList>

              <TabsContent value="my-events">
                <Card>
                  <CardContent className="space-y-8">
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