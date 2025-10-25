import { CreateEventForm } from "@/components/create-event-form"
import { Header } from "@/components/header";
import { useTranslations } from "next-intl"

export default function CreateEventPage() {
  const t = useTranslations("CreateEventPage");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-2 mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("title")}</h2>
            <p className="text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <CreateEventForm />
        </div>
      </main>
    </div>
  )
}
