"use client"

import Link from "next/link"
import Image from "next/image"
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
  Linkedin,
  Github,
  MoveRight,
  ArrowRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Logo } from "@/components/logo"
import { motion, useScroll, useTransform, Variants, useSpring } from "framer-motion"
import { useRef } from "react"

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
}

export default function HomePage() {
  const t = useTranslations("HomePage")
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  // Smooth out the scroll progress with a spring for mobile/performance
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const y = useTransform(smoothProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(smoothProgress, [0, 0.8], [1, 0])

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
      {/* Decorative Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-accent/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link href="/dashboard">{t("goToDashboard")}</Link>
            </Button>
            <Button asChild className="shadow-lg shadow-primary/20">
              <Link href="/create">{t("createEvent")}</Link>
            </Button>
            <div className="h-6 w-px bg-border/40 mx-2" />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section ref={heroRef} className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
          <motion.div style={{ y, opacity }} className="container mx-auto px-4 relative z-10 will-change-transform will-change-opacity">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-6 border border-primary/20"
                >
                  <Sparkles className="h-4 w-4 animate-spin-slow" />
                  {t("tagline")}
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                >
                  {t("title")}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="max-w-2xl text-lg text-muted-foreground md:text-xl mb-10 leading-relaxed"
                >
                  {t("description")}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                >
                  <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
                    <Link href="/create">
                      {t("createEvent")}
                      <MoveRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold bg-background/50 backdrop-blur-sm">
                    <Link href="/dashboard">
                      {t("goToDashboard")}
                    </Link>
                  </Button>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                className="flex-1 relative"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-muted/30">
                    <Image
                      src="/mindyourevent-hero.png"
                      alt="Mind Your Event Dashboard"
                      width={800}
                      height={600}
                      priority
                      className="w-full h-auto transform transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* Floating elements for extra detail */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -top-6 -right-6 hidden sm:block glass-card p-4 rounded-xl shadow-xl border border-primary/20"
                  >
                    <Calendar className="h-8 w-8 text-primary" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-8 -left-8 hidden sm:block glass-card p-4 rounded-xl shadow-xl border border-accent/20"
                  >
                    <Users className="h-8 w-8 text-accent" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Subtle bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* How it works */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="mb-20 text-center"
            >
              <motion.h2 variants={itemVariants} className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
                {t("howItWorks.title")}
              </motion.h2>
              <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-xl text-muted-foreground">
                {t("howItWorks.description")}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3"
            >
              {[
                { icon: Calendar, title: t("howItWorks.step1.title"), description: t("howItWorks.step1.description") },
                { icon: Users, title: t("howItWorks.step2.title"), description: t("howItWorks.step2.description") },
                { icon: TrendingUp, title: t("howItWorks.step3.title"), description: t("howItWorks.step3.description") }
              ].map((step, index) => (
                <motion.div key={index} variants={itemVariants} className="relative group p-8 rounded-3xl transition-colors hover:bg-muted/50 border border-transparent hover:border-border/40">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner group-hover:scale-110 transition-transform">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>

                  {index < 2 && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-muted-foreground/30">
                      <ArrowRight className="h-8 w-8" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 bg-muted/40 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="mb-20 text-center"
            >
              <motion.h2 variants={itemVariants} className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
                {t("everythingYouNeedTitle")}
              </motion.h2>
              <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-xl text-muted-foreground">
                {t("everythingYouNeedDescription")}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {featureKeys.map((key) => {
                const { icon: Icon, color } = featureDetails[key]
                return (
                  <motion.div key={key} variants={itemVariants}>
                    <Card
                      className="group h-full p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 glass-card border-white/10"
                    >
                      <div
                        className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:rotate-6 ${colorClasses[color as keyof typeof colorClasses]}`}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mb-3 text-2xl font-bold group-hover:text-primary transition-colors">
                        {t(`features.${key}.title`)}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-[17px]">
                        {t(`features.${key}.description`)}
                      </p>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="mb-20 text-center"
            >
              <motion.h2 variants={itemVariants} className="text-4xl font-bold tracking-tight md:text-5xl mb-4 text-gradient">
                {t("testimonials.title")}
              </motion.h2>
              <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-xl text-muted-foreground">
                {t("testimonials.description")}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3"
            >
              {[1, 2, 3].map((num) => (
                <motion.div key={num} variants={itemVariants}>
                  <Card className="p-8 h-full bg-card/50 backdrop-blur-sm border-border/40 relative overflow-hidden group hover:border-primary/30 transition-colors">
                    <Quote className="h-10 w-10 text-primary/10 absolute -top-2 -left-2 transform -rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-110" />
                    <div className="relative z-10">
                      <p className="mb-8 text-lg text-foreground italic leading-relaxed">
                        "{t(`testimonials.person${num}.quote`)}"
                      </p>
                      <div className="flex items-center gap-4 border-t border-border/40 pt-6">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {t(`testimonials.person${num}.name`)[0]}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {t(`testimonials.person${num}.name`)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t(`testimonials.person${num}.title`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="container mx-auto px-4 text-center max-w-4xl"
          >
            <div className="glass-card p-12 md:p-20 rounded-[3rem] border-primary/10 shadow-3xl">
              <h2 className="text-4xl font-black tracking-tight md:text-6xl mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("finalCta.title")}
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground mb-12">
                {t("finalCta.description")}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                <Button asChild size="lg" className="h-16 px-12 text-xl font-bold shadow-2xl shadow-primary/30 rounded-2xl">
                  <Link href="/create">{t("createEvent")}</Link>
                </Button>
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span className="text-lg font-medium text-muted-foreground">100% Gratuito</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80 backdrop-blur-md pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
            <div className="col-span-1 md:col-span-2">
              <Logo />
              <p className="mt-6 text-muted-foreground max-w-sm mx-auto md:mx-0">
                Simplificando a organização de eventos e a sincronização de agendas para todos.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-foreground">Conecte-se</h4>
              <div className="flex justify-center md:justify-start gap-4">
                <Link href="https://github.com/guimaraesr-y" className="p-3 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all">
                  <Github className="h-6 w-6" />
                </Link>
                <Link href="https://www.linkedin.com/in/guimaraesry/" className="p-3 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all">
                  <Linkedin className="h-6 w-6" />
                </Link>
                <Link href="mailto:ryanguimaraesprofissional@gmail.com" className="p-3 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all">
                  <Mail className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground">
            <p className="text-sm font-medium">{t("footer.copyright")}</p>
            <div className="flex gap-8 text-sm">
              <Link href="#" className="hover:text-foreground transition-colors">Termos</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
