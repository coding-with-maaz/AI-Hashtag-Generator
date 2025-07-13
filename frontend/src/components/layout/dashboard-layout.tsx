import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";
import { 
  BarChart3, 
  Database, 
  Search, 
  Bookmark, 
  Settings, 
  LayoutDashboard, 
  Package, 
  FileText,
  Menu, 
  X
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  {
    title: "Overview",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Search",
    href: "/search",
    icon: <Search className="h-5 w-5" />,
  },
  {
    title: "Data Management",
    icon: <Database className="h-5 w-5" />,
  },
  {
    title: "Saved Keywords",
    href: "/saved-keywords",
    icon: <Bookmark className="h-5 w-5" />,
  },
  {
    title: "Search History",
    href: "/search-history",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Analytics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Statistics",
    href: "/statistics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Export Data",
    href: "/export",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "AdMob Configuration",
    href: "/admob-config",
    icon: <Package className="h-5 w-5" />,
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Function to get current page title based on path
  const getCurrentPageTitle = () => {
    const currentItem = sidebarItems.find(item => item.href === location.pathname);
    return currentItem ? currentItem.title : "Dashboard";
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4 lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <div className="px-2 py-4">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <Search className="h-6 w-6" />
                  <span className="text-lg">AI Hashtag Generator</span>
                </Link>
              </div>
              <SidebarNav items={sidebarItems} className="px-2 flex-1" />
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Search className="h-6 w-6" />
            <span className="sr-only md:not-sr-only md:text-lg">AI Hashtag Generator</span>
          </Link>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Search className="h-6 w-6" />
            <span className="text-lg">AI Hashtag Generator</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden md:flex">
            <span className="text-sm font-medium">{getCurrentPageTitle()}</span>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:flex border-r bg-background w-64 flex-col">
          <div className="flex flex-col gap-2 py-2">
            <div className="px-2 py-4 border-b">
              <h2 className="px-4 text-lg font-semibold tracking-tight">
                Dashboard
              </h2>
            </div>
            <SidebarNav items={sidebarItems} className="px-2 py-2" />
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
          <div className="flex-1 space-y-4 p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}