import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Link as LinkIcon,
  Bell,
  Calendar,
  Shield,
  CreditCard,
  Trash2,
} from "lucide-react";

const settingsSections = [
  {
    id: "profile",
    icon: User,
    title: "Profile",
    description: "Manage your public profile information",
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    description: "Configure email and push notifications",
  },
  {
    id: "calendar",
    icon: Calendar,
    title: "Calendar Sync",
    description: "Connect your calendars",
  },
  {
    id: "security",
    icon: Shield,
    title: "Security",
    description: "Password and authentication",
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Billing",
    description: "Manage your subscription",
  },
];

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${section.id === "profile"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                >
                  <section.icon className="w-5 h-5" />
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Section */}
            <div className="bg-card rounded-xl shadow-card border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Profile Information
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This information will be displayed on your booking page
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">JD</span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, GIF or PNG. Max size 2MB
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <Input defaultValue="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <Input type="email" defaultValue="john@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Bio
                  </label>
                  <Textarea
                    rows={3}
                    defaultValue="Product Manager at TechCorp. Let's schedule a time to chat!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Booking URL
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-input bg-secondary text-sm text-muted-foreground">
                      calendly.com/
                    </span>
                    <Input
                      className="rounded-l-none"
                      defaultValue="johndoe"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-card rounded-xl shadow-card border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Email Notifications
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose what notifications you receive
                </p>
              </div>
              <div className="divide-y divide-border">
                {[
                  {
                    title: "New booking confirmations",
                    description: "Get notified when someone books a meeting",
                    enabled: true,
                  },
                  {
                    title: "Booking reminders",
                    description: "Receive reminders before your scheduled events",
                    enabled: true,
                  },
                  {
                    title: "Cancellation notifications",
                    description: "Get notified when someone cancels a meeting",
                    enabled: true,
                  },
                  {
                    title: "Daily digest",
                    description: "Summary of your upcoming events each morning",
                    enabled: false,
                  },
                ].map((notification) => (
                  <div
                    key={notification.title}
                    className="p-6 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {notification.description}
                      </p>
                    </div>
                    <Switch defaultChecked={notification.enabled} />
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Calendars */}
            <div className="bg-card rounded-xl shadow-card border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Connected Calendars
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Sync your calendars to avoid double bookings
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#4285F4]/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#4285F4]" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Google Calendar
                      </p>
                      <p className="text-sm text-muted-foreground">
                        john@gmail.com
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
                <Button variant="outline" className="gap-2 w-full">
                  <LinkIcon className="w-4 h-4" />
                  Connect another calendar
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card rounded-xl shadow-card border border-destructive/20">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-destructive">
                  Danger Zone
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Irreversible and destructive actions
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Delete Account</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button variant="hero">Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
