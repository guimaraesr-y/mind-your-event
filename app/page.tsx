import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, Sparkles, BarChart3, CheckCircle, LinkIcon, Mail, Shield, Smartphone } from "lucide-react"
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: BarChart3,
    title: "Visual Availability",
    description: "Beautiful graphs and heatmaps show when most people are free",
    color: "primary"
  },
  {
    icon: LinkIcon,
    title: "Easy Sharing",
    description: "Share a unique link - no account needed for guests",
    color: "secondary"
  },
  {
    icon: Shield,
    title: "Email Verification",
    description: "Secure access with email-based authentication",
    color: "accent"
  },
  {
    icon: Mail,
    title: "Smart Notifications",
    description: "Automatic emails when the event time is finalized",
    color: "destructive"
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Perfect experience on any device, anywhere",
    color: "primary"
  },
  {
    icon: CheckCircle,
    title: "RSVP Tracking",
    description: "See who's attending after the time is set",
    color: "secondary"
  }
];

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-chart-3/10 text-chart-3",
  accent: "bg-accent/10 text-accent",
  destructive: "bg-destructive/10 text-destructive"
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col animated-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">MindYourEvent</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Find the perfect time, together
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance text-foreground">
              Schedule events without the back-and-forth
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Create an event, share a link, and let everyone pick their available times. We'll show you when most
              people can make it.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base transition-transform duration-300 ease-in-out hover:scale-105">
              <Link href="/create">Create an Event</Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/60 border border-border/40 backdrop-blur-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Easy Setup</h3>
              <p className="text-sm text-muted-foreground text-center text-balance">
                Create an event in seconds with a date range and optional time preferences
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/60 border border-border/40 backdrop-blur-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Collaborative</h3>
              <p className="text-sm text-muted-foreground text-center text-balance">
                Share a unique link with participants to collect their availability
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/60 border border-border/40 backdrop-blur-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <div className="h-12 w-12 rounded-full bg-chart-3/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="font-semibold text-foreground">Smart Results</h3>
              <p className="text-sm text-muted-foreground text-center text-balance">
                Visualize overlapping availability and find the best time for everyone
              </p>
            </div>
          </div>
        </div>
      </main>

      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make event scheduling simple and enjoyable
            </p>
          </div>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80 backdrop-blur-lg py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>MindYourEvent - Making scheduling simple</p>
        </div>
      </footer>
    </div>
  )
}
