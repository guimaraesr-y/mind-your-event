import { CreateEventForm } from "@/components/create-event-form"
import { Calendar } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function CreateEventPage() {
  const t = useTranslations("CreateEventPage");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">MindYourEvent</h1>
          </Link>
        </div>
      </header>

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
