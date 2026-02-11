import { notFound, redirect } from "next/navigation";
import { CreateEventForm } from "@/components/create-event-form";
import { retrieveEventById, retrieveEventParticipants } from "@/actions/event/retrieve";
import { getCurrentUser } from "@/actions/user/get-current-user";
import { Header } from "@/components/header";
import { getTranslations } from "next-intl/server";

interface PageProps {
    params: Promise<{ eventId: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
    const { eventId } = await params;
    const t = await getTranslations("EditEventPage");

    const user = await getCurrentUser();
    if (!user) {
        redirect("/verify");
    }

    const event = await retrieveEventById(eventId);
    if (!event) {
        notFound();
    }

    if (event.creator_id !== user.id) {
        notFound();
    }

    const participants = await retrieveEventParticipants(eventId);

    const initialData = {
        id: event.id,
        title: event.title,
        description: event.description || "",
        startDate: new Date(event.start_date).toISOString().split('T')[0],
        endDate: new Date(event.end_date).toISOString().split('T')[0],
        startTime: event.start_time || "",
        endTime: event.end_time || "",
        creatorName: event.creator.name,
        creatorEmail: event.creator.email,
        participantEmails: participants.map(p => p.users.email).join(', '),
        participants: participants.map(p => ({
            email: p.users.email,
            hasSubmitted: !!p.has_submitted
        })),
        isConfirmed: !!event.is_finalized
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 px-4 py-8 md:py-12">
                <div className="max-w-4xl mx-auto space-y-8 text-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                        <p className="text-muted-foreground">
                            {event.is_finalized
                                ? t("isConfirmed")
                                : t("description")}
                        </p>
                    </div>

                    <CreateEventForm initialData={initialData} />
                </div>
            </main>
        </div>
    );
}
