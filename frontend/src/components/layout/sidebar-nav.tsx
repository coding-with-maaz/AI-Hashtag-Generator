import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  History,
  BarChart3,
  Settings,
  Smartphone,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SidebarNavProps {
  className?: string;
  isMobile?: boolean;
}

export function SidebarNav({ className, isMobile = false }: SidebarNavProps) {
  const location = useLocation();
  const [admobExpanded, setAdmobExpanded] = useState(false);

  // Navigation items with their icons and paths
  const navItems = [
    { 
      icon: <LayoutDashboard className="h-4 w-4" />, 
      label: "Dashboard", 
      path: "/" 
    },
    { 
      icon: <Search className="h-4 w-4" />, 
      label: "Keyword Search", 
      path: "/search" 
    },
    { 
      icon: <Bookmark className="h-4 w-4" />, 
      label: "Trending Keywords", 
      path: "/trending-keywords" 
    },
    // { 
    //   icon: <History className="h-4 w-4" />, 
    //   label: "Search History", 
    //   path: "/search-history" 
    // },
    { 
      icon: <BarChart3 className="h-4 w-4" />, 
      label: "Statistics", 
      path: "/statistics" 
    },
    {
      icon: <Smartphone className="h-4 w-4" />,
      label: "AdMob Config",
      path: "/admob-config",
      expandable: true,
      expanded: admobExpanded,
      toggleExpand: () => setAdmobExpanded(!admobExpanded),
      children: [
        { 
          label: "Test Environment", 
          path: "/admob-config?tab=test" 
        },
        { 
          label: "Production", 
          path: "/admob-config?tab=production" 
        },
      ],
    },
    // { 
    //   icon: <Download className="h-4 w-4" />, 
    //   label: "Export Data", 
    //   path: "/export" 
    // },
    // { 
    //   icon: <Settings className="h-4 w-4" />, 
    //   label: "Settings", 
    //   path: "/settings" 
    // },
  ];

  return (
    <nav className={cn("space-y-1", className)}>
      {navItems.map((item, index) => {
        const isActive = item.expandable 
          ? location.pathname.startsWith(item.path)
          : location.pathname === item.path;
        
        return (
          <div key={index} className="space-y-1">
            {item.expandable ? (
              <>
                <button
                  className={cn(
                    "flex w-full items-center justify-between rounded-md p-2 text-sm",
                    isActive
                      ? "bg-muted font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-primary"
                  )}
                  onClick={item.toggleExpand}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className={cn("ml-2", isMobile && !isActive && "sr-only")}>
                      {item.label}
                    </span>
                  </div>
                  {item.expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {item.expanded && (
                  <div className="ml-4 space-y-1 pl-2 border-l">
                    {item.children?.map((child, childIndex) => {
                      const isChildActive = location.pathname + location.search === child.path;
                      
                      return (
                        <NavLink
                          key={childIndex}
                          to={child.path}
                          className={cn(
                            "flex items-center rounded-md p-2 text-sm",
                            isChildActive
                              ? "bg-muted font-medium text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-primary"
                          )}
                        >
                          <span className={cn(isMobile && !isChildActive && "sr-only")}>
                            {child.label}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                className={cn(
                  "flex items-center rounded-md p-2 text-sm",
                  isActive
                    ? "bg-muted font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                )}
              >
                {item.icon}
                <span className={cn("ml-2", isMobile && !isActive && "sr-only")}>
                  {item.label}
                </span>
              </NavLink>
            )}
          </div>
        );
      })}
    </nav>
  );
}