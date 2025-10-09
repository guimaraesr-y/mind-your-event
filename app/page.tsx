import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">EventSync</h1>
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
            <Button asChild size="lg" className="text-base">
              <Link href="/create">Create an Event</Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Easy Setup</h3>
              <p className="text-sm text-muted-foreground text-center text-balance">
                Create an event in seconds with a date range and optional time preferences
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border">
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Collaborative</h3>
              <p className="text-sm text-muted-foreground text-center text-balance">
                Share a unique link with participants to collect their availability
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border">
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

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>EventSync - Making scheduling simple</p>
        </div>
      </footer>
    </div>
  )
}
