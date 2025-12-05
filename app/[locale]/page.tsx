import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  Sparkles,
  BarChart3,
  CheckCircle,
  LinkIcon,
  Mail,
  Shield,
  Smartphone,
  TrendingUp,
  Quote,
  Twitter,
  Linkedin,
  Github,
  MoveRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Logo } from "@/components/logo"

const featureDetails: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  visualAvailability: { icon: BarChart3, color: "primary" },
  easySharing: { icon: LinkIcon, color: "secondary" },
  emailVerification: { icon: Shield, color: "accent" },
  smartNotifications: { icon: Mail, color: "destructive" },
  mobileOptimized: { icon: Smartphone, color: "primary" },
  rsvpTracking: { icon: CheckCircle, color: "secondary" },
}

const featureKeys = Object.keys(featureDetails)

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-chart-3/10 text-chart-3",
  accent: "bg-accent/10 text-accent",
  destructive: "bg-destructive/10 text-destructive",
}

export default function HomePage() {
  const t = useTranslations("HomePage")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/dashboard">{t("goToDashboard")}</Link>
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="animated-gradient py-20 md:py-32">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              {t("tagline")}
            </div>
            <h1 className="mt-4 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {t("description")}
            </p>
            <Button asChild size="lg" className="mt-8 text-base">
              <Link href="/create">
                {t("createEvent")}
                <MoveRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold md:text-5xl">
                {t("howItWorks.title")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
                {t("howItWorks.description")}
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">
                  {t("howItWorks.step1.title")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t("howItWorks.step1.description")}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">
                  {t("howItWorks.step2.title")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t("howItWorks.step2.description")}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">
                  {t("howItWorks.step3.title")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t("howItWorks.step3.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold md:text-5xl">
                {t("everythingYouNeedTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
                {t("everythingYouNeedDescription")}
              </p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featureKeys.map((key) => {
                const { icon: Icon, color } = featureDetails[key]
                return (
                  <Card
                    key={key}
                    className="transform p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">
                      {t(`features.${key}.title`)}
                    </h3>
                    <p className="text-muted-foreground">
                      {t(`features.${key}.description`)}
                    </p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold md:text-5xl">
                {t("testimonials.title")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
                {t("testimonials.description")}
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
              <Card className="p-6">
                <Quote className="h-8 w-8 text-primary" />
                <p className="mt-4 text-lg text-foreground">
                  {t("testimonials.person1.quote")}
                </p>
                <div className="mt-6">
                  <p className="font-semibold">
                    {t("testimonials.person1.name")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("testimonials.person1.title")}
                  </p>
                </div>
              </Card>
              <Card className="p-6">
                <Quote className="h-8 w-8 text-primary" />
                <p className="mt-4 text-lg text-foreground">
                  {t("testimonials.person2.quote")}
                </p>
                <div className="mt-6">
                  <p className="font-semibold">
                    {t("testimonials.person2.name")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("testimonials.person2.title")}
                  </p>
                </div>
              </Card>
              <Card className="p-6">
                <Quote className="h-8 w-8 text-primary" />
                <p className="mt-4 text-lg text-foreground">
                  {t("testimonials.person3.quote")}
                </p>
                <div className="mt-6">
                  <p className="font-semibold">
                    {t("testimonials.person3.name")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("testimonials.person3.title")}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-muted py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">
              {t("finalCta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
              {t("finalCta.description")}
            </p>
            <Button asChild size="lg" className="mt-8 text-base">
              <Link href="/create">{t("createEvent")}</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Logo />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6">
                {/* <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("footer.features")}
                </Link> */}
                {/* <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("footer.pricing")}
                </Link> */}
                <Link
                  href="mailto:ryanguimaraesprofissional@gmail.com"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {/* {t("footer.contact")} */}
                  <Mail className="h-6 w-6 text-muted-foreground transition-colors hover:text-foreground" />
                </Link>
              </div>
              {/* <Link href="#" aria-label="Twitter">
                <Twitter className="h-6 w-6 text-muted-foreground transition-colors hover:text-foreground" />
              </Link> */}
              <Link href="https://github.com/guimaraesr-y" aria-label="GitHub">
                <Github className="h-6 w-6 text-muted-foreground transition-colors hover:text-foreground" />
              </Link>
              <Link href="https://www.linkedin.com/in/guimaraesry/" aria-label="LinkedIn">
                <Linkedin className="h-6 w-6 text-muted-foreground transition-colors hover:text-foreground" />
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}