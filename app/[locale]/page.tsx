import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, Sparkles, BarChart3, CheckCircle, LinkIcon, Mail, Shield, Smartphone } from "lucide-react"
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const featureDetails: Record<string, { icon: React.ElementType; color: string }> = {
  visualAvailability: { icon: BarChart3, color: "primary" },
  easySharing: { icon: LinkIcon, color: "secondary" },
  emailVerification: { icon: Shield, color: "accent" },
  smartNotifications: { icon: Mail, color: "destructive" },
  mobileOptimized: { icon: Smartphone, color: "primary" },
  rsvpTracking: { icon: CheckCircle, color: "secondary" }
};

const featureKeys = Object.keys(featureDetails);

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-chart-3/10 text-chart-3",
  accent: "bg-accent/10 text-accent",
  destructive: "bg-destructive/10 text-destructive"
};

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen flex flex-col animated-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">MindYourEvent</h1>
          </div>
          <Button asChild variant="secondary">
            <Link href="/dashboard">{t("goToDashboard")}</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              {t('tagline')}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance text-foreground">
              {t('title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base transition-transform duration-300 ease-in-out hover:scale-105">
              <Link href="/create">{t('createEvent')}</Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/60 border border-border/40 backdrop-blur-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{t('easySetupTitle')}</h3>
              <p className="text-sm text-muted-foreground text-center text-balance">
                {t('easySetupDescription')}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/60 border border-border/40 backdrop-blur-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">{t('collaborativeTitle')}</h3>
              <p className="text-sm text-muted-foreground text-center text-balance">
                {t('collaborativeDescription')}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/60 border border-border/40 backdrop-blur-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <div className="h-12 w-12 rounded-full bg-chart-3/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="font-semibold text-foreground">{t('smartResultsTitle')}</h3>
              <p className="text-sm text-muted-foreground text-center text-balance">
                {t('smartResultsDescription')}
              </p>
            </div>
          </div>
        </div>
      </main>

      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('everythingYouNeedTitle')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('everythingYouNeedDescription')}
            </p>
          </div>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featureKeys.map((key) => {
              const { icon: Icon, color } = featureDetails[key];
              return (
                <Card
                  key={key}
                  className="p-6 hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t(`features.${key}.title`)}</h3>
                  <p className="text-muted-foreground">{t(`features.${key}.description`)}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80 backdrop-blur-lg py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t('footer')}</p>
        </div>
      </footer>
    </div>
  )
}
