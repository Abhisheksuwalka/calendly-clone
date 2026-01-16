import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Clock,
    Users,
    Zap,
    CheckCircle2,
    ArrowRight,
    Play,
    Star,
} from "lucide-react";

const features = [
    {
        icon: Calendar,
        title: "Easy Scheduling",
        description:
            "Share your availability and let others book time with you instantly.",
    },
    {
        icon: Clock,
        title: "Time Zone Smart",
        description:
            "Automatically detects and adjusts for different time zones worldwide.",
    },
    {
        icon: Users,
        title: "Team Scheduling",
        description:
            "Coordinate meetings across your entire team with round-robin and collective events.",
    },
    {
        icon: Zap,
        title: "Integrations",
        description:
            "Connect with Google Calendar, Zoom, Teams, and 100+ other apps.",
    },
];

const testimonials = [
    {
        quote:
            "Calendly has completely transformed how we book meetings. No more back-and-forth emails!",
        author: "Sarah Johnson",
        role: "Marketing Director",
        company: "TechCorp",
    },
    {
        quote:
            "The time zone detection alone saves us hours every week. Essential for remote teams.",
        author: "Michael Chen",
        role: "CEO",
        company: "StartupXYZ",
    },
    {
        quote:
            "Our sales team closes deals faster now that scheduling is frictionless.",
        author: "Emily Williams",
        role: "VP of Sales",
        company: "GrowthCo",
    },
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-foreground">Calendly</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a
                                href="#features"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#pricing"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Pricing
                            </a>
                            <a
                                href="#testimonials"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Testimonials
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link to="/dashboard">
                                <Button variant="ghost">Log in</Button>
                            </Link>
                            <Link to="/dashboard">
                                <Button variant="hero">Get Started Free</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 gradient-hero">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8">
                            <Star className="w-4 h-4" />
                            Trusted by 10M+ professionals
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
                            Easy scheduling
                            <span className="block text-primary">ahead</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Calendly is your scheduling automation platform for eliminating
                            the back-and-forth emails to find the perfect time — and so much
                            more.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/dashboard">
                                <Button variant="hero" size="xl">
                                    Start for free
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Button variant="hero-outline" size="xl">
                                <Play className="w-5 h-5" />
                                Watch demo
                            </Button>
                        </div>
                    </div>

                    {/* Hero Image/Preview */}
                    <div className="mt-16 relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
                        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden max-w-5xl mx-auto">
                            <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
                                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                                <div className="w-3 h-3 rounded-full bg-warning/60" />
                                <div className="w-3 h-3 rounded-full bg-success/60" />
                            </div>
                            <div className="p-8 grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-lg font-bold text-primary">JD</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground">
                                        John Doe
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-lg border border-border hover:border-primary hover:shadow-card-hover transition-all duration-200 cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1 h-12 rounded-full bg-primary" />
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        30 Minute Meeting
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        30 min, Web conferencing
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-lg border border-border hover:border-primary hover:shadow-card-hover transition-all duration-200 cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1 h-12 rounded-full bg-success" />
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        60 Minute Meeting
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        60 min, Web conferencing
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-secondary/30 rounded-xl p-6">
                                    <p className="text-sm font-medium text-muted-foreground mb-4">
                                        January 2025
                                    </p>
                                    <div className="grid grid-cols-7 gap-2 text-center text-sm">
                                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                            <div key={i} className="text-muted-foreground font-medium py-2">
                                                {d}
                                            </div>
                                        ))}
                                        {Array.from({ length: 31 }, (_, i) => (
                                            <div
                                                key={i}
                                                className={`py-2 rounded-lg cursor-pointer transition-colors ${i === 14
                                                    ? "bg-primary text-primary-foreground font-medium"
                                                    : "hover:bg-accent"
                                                    }`}
                                            >
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-secondary/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Everything you need to schedule smarter
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Powerful features that help you save time and focus on what
                            matters most.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border group"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-6 h-6 text-accent-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                                Schedule meetings without the back-and-forth
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                Calendly works with your calendar to automatically check
                                availability, so you never double-book. Share your link and let
                                invitees pick a time that works for both of you.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Eliminate scheduling conflicts",
                                    "Reduce no-shows with automatic reminders",
                                    "Sync with Google, Outlook, and more",
                                    "Customize your booking page",
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-success" />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-accent via-accent/50 to-transparent rounded-2xl p-8">
                            <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Calendar className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">Your booking link</h4>
                                        <p className="text-sm text-muted-foreground">
                                            calendly.com/yourname
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                        <span className="text-sm text-foreground">Quick Chat</span>
                                        <span className="text-xs text-muted-foreground">15 min</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                        <span className="text-sm text-foreground">Discovery Call</span>
                                        <span className="text-xs text-muted-foreground">30 min</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                        <span className="text-sm text-foreground">Deep Dive</span>
                                        <span className="text-xs text-muted-foreground">60 min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 bg-secondary/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Loved by teams everywhere
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            See what our customers have to say about Calendly.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-card rounded-xl p-6 shadow-card border border-border"
                            >
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-5 h-5 text-warning fill-warning"
                                        />
                                    ))}
                                </div>
                                <p className="text-foreground mb-6">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-medium text-primary">
                                            {testimonial.author
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground text-sm">
                                            {testimonial.author}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {testimonial.role} at {testimonial.company}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                        Ready to simplify your scheduling?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10">
                        Join millions of professionals who trust Calendly for their
                        scheduling needs.
                    </p>
                    <Link to="/dashboard">
                        <Button variant="hero" size="xl">
                            Get started for free
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-foreground">Calendly</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2025 Calendly. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
