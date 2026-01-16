import { useContextProvider } from "@/context/contextProvider";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleDollarSign,
  Clock,
  HelpCircle,
  Link as LinkIcon,
  Menu,
  MessageCircle,
  Plus,
  Route,
  Settings,
  UserPlus,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Calendly Cool Grey Design System Colors
const colors = {
  navy: "#0a2540",      // Deep Navy - primary text
  slate: "#476788",     // Slate Blue-Grey - secondary text
  blue: "#0069ff",      // Action Blue - links, buttons
  blueHover: "#0055cc", // Blue hover state
  border: "#d4e0ed",    // Ice Blue - borders
  bgPage: "#f8f9fa",    // Page background
  bgCard: "#ffffff",    // Card background
  bgHover: "#f0f6ff",   // Hover background
  bgActive: "#e6f2ff",  // Active background
  avatarBg: "#e7edf6",  // Avatar background
  avatarText: "#004eba",// Avatar text
  muted: "#999999",     // Muted text
};

const navigation = [
  { name: "Scheduling", href: "/event-types", icon: LinkIcon },
  { name: "Meetings", href: "/scheduled-events", icon: Calendar },
  { name: "Availability", href: "/availability", icon: Clock },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Workflows", href: "/workflows", icon: Workflow },
  { name: "Integrations & apps", href: "/integrations", icon: Zap },
  { name: "Routing", href: "/routing", icon: Route },
];

const bottomNav = [
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Admin center", href: "/admin", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle, hasDropdown: true },
];

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const { api } = useContextProvider();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  const sidebarWidth = sidebarCollapsed ? "w-[72px]" : "w-[220px]";
  const mainPadding = sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[220px]";

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bgPage }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Ice Blue border */}
      <aside
        className={cn(
          `fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-white flex flex-col transform transition-all duration-200 ease-in-out lg:translate-x-0`,
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ borderRight: `1px solid ${colors.border}` }}
      >
        {/* Logo & Collapse */}
        <div 
          className="flex h-[56px] items-center justify-between px-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <Link to="/" className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.blue }}
            >
              <Calendar className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span 
                className="text-[17px] font-semibold"
                style={{ color: colors.navy }}
              >
                Calendly
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex w-6 h-6 items-center justify-center transition-colors"
            style={{ color: colors.slate }}
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{ color: colors.slate }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Button - Calendly Blue with Ice Blue border */}
        <div className="px-3 py-3">
          <Link to="/event-types">
            <button
              className={cn(
                "flex items-center justify-center gap-2 w-full h-[40px] rounded-full border-2 font-semibold text-[14px] transition-colors",
                sidebarCollapsed && "px-0"
              )}
              style={{ 
                borderColor: colors.blue, 
                color: colors.blue,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Plus className="w-4 h-4" />
              {!sidebarCollapsed && "Create"}
            </button>
          </Link>
        </div>

        {/* Navigation - Slate Blue text, Ice Blue active bar */}
        <nav className="flex-1 px-2 py-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href === "/event-types" && location.pathname === "/event-types");
            return (
              <Link
                key={item.name}
                to={item.href}
                className="relative flex items-center gap-3 px-3 h-[40px] rounded-lg text-[14px] transition-colors mb-0.5"
                style={{ 
                  backgroundColor: isActive ? colors.bgHover : 'transparent',
                  color: isActive ? colors.blue : colors.navy,
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {/* Active indicator - 4px blue bar */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[24px] rounded-r-full"
                    style={{ backgroundColor: colors.blue }}
                  />
                )}
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Plan Box */}
        {!sidebarCollapsed && (
          <div 
            className="mx-3 mb-3 p-3 rounded-lg"
            style={{ backgroundColor: colors.bgHover }}
          >
            <div className="flex items-center gap-2" style={{ color: colors.blue }}>
              <CircleDollarSign className="w-5 h-5" />
              <span className="text-[14px] font-semibold">Upgrade plan</span>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="px-2 py-2" style={{ borderTop: `1px solid ${colors.border}` }}>
          {bottomNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center gap-3 px-3 h-[40px] rounded-lg text-[14px] font-normal transition-colors"
              style={{ color: colors.navy }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  {item.name}
                  {item.hasDropdown && <ChevronDown className="w-4 h-4 ml-auto" />}
                </>
              )}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className={mainPadding}>
        {/* Top header bar with user section */}
        <header 
          className="hidden lg:flex sticky top-0 z-30 h-14 items-center justify-end gap-3 px-6"
          style={{ backgroundColor: colors.bgPage }}
        >
          <button 
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: colors.navy }}
          >
            <UserPlus className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1 cursor-pointer">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-semibold"
              style={{ backgroundColor: colors.avatarBg, color: colors.avatarText }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <ChevronDown className="w-4 h-4" style={{ color: colors.navy }} />
          </div>
        </header>

        {/* Mobile header */}
        <header 
          className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-white px-4 lg:hidden"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ color: colors.slate }}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.blue }}
            >
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span 
              className="text-[16px] font-semibold"
              style={{ color: colors.navy }}
            >
              Calendly
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen">{children}</main>
      </div>

      {/* Chat Bubble - Calendly Blue */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
        style={{ backgroundColor: colors.blue }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.blueHover}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.blue}
      >
        <MessageCircle className="w-6 h-6 text-white fill-white" />
      </button>
    </div>
  );
}
