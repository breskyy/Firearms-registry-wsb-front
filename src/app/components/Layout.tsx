import { Outlet, useNavigate, useLocation } from "react-router";
import { Button } from "./ui/button";
import { LogOut, ChevronLeft, Home, FileText, Shield, PlusCircle, CheckSquare, FileCheck } from "lucide-react";
import { WPA_REVIEW_BAR_PORTAL_ID } from "./wpa/WpaApplicationReviewBar";
import { contentColumnClass, mobileMainPaddingBottomClass } from "../utils/layout";
import { cn } from "./ui/utils";
import { AppLogo } from "./AppLogo";
import { getMobileBottomNav } from "../config/mobileBottomNav";
import { MobileBottomNavIcon } from "./MobileBottomNavIcon";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the login page
  const isLoginPage = location.pathname === "/";
  
  // Get role from localStorage or fallback to citizen
  const getUserRole = () => {
    return localStorage.getItem("userRole") || "citizen";
  };

  const userRole = getUserRole();

  const roleHomePath: Record<string, string> = {
    citizen: "/citizen",
    officer: "/officer",
    shop: "/shop",
  };
  const homePath = roleHomePath[userRole] ?? "/citizen";

  const isNavItemActive = (itemPath: string) => {
    const path = location.pathname;
    if (itemPath === "/applications") {
      return path === "/applications" || path.startsWith("/applications/");
    }
    if (itemPath === "/application/new") {
      return path === "/application/new";
    }
    if (itemPath === "/officer/search") {
      return path === "/officer/search" || path.startsWith("/officer/citizens/");
    }
    return path === itemPath;
  };

  const isDashboardPath = ["/citizen", "/officer", "/shop"].includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const getDesktopNavigation = () => {
    switch (userRole) {
      case "citizen":
        return [
          { label: "Pulpit", path: "/citizen", icon: Home },
          { label: "Wnioski", path: "/applications", icon: FileText },
          { label: "Broń", path: "/weapons", icon: Shield },
          { label: "Nowy", path: "/application/new", icon: PlusCircle },
        ];
      case "officer":
        return [
          { label: "Pulpit", path: "/officer", icon: Home },
          { label: "Zadania", path: "/applications", icon: CheckSquare },
          { label: "Rejestr", path: "/officer/search", icon: Shield },
        ];
      case "shop":
        return [
          { label: "Pulpit", path: "/shop", icon: Home },
          { label: "Sprzedaż", path: "/shop/sale", icon: FileCheck },
        ];
      default:
        return [];
    }
  };

  const desktopNavigation = getDesktopNavigation();
  const mobileNavigation = getMobileBottomNav(userRole);
  const navTarget = (item: { path: string; search?: string }) =>
    `${item.path}${item.search ?? ""}`;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      {/* Top App Bar - Mobile & Desktop */}
      {!isLoginPage && (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-1 md:gap-3 min-w-0">
              {!isDashboardPath && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="shrink-0 h-8 w-8 min-h-8 min-w-8 md:h-10 md:w-10 md:min-h-[44px] md:min-w-[44px] rounded-full"
                  aria-label="Wróć"
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </Button>
              )}
              <button
                type="button"
                onClick={() => navigate(homePath)}
                className="flex items-center gap-1.5 md:gap-2.5 rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-0"
                aria-label="Przejdź do pulpitu"
              >
                <AppLogo className="!h-9 !w-9 md:!h-12 md:!w-12 shrink-0" />
                <span className="text-base md:text-xl font-bold text-foreground truncate">e-Broń</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <nav className="hidden md:flex items-center gap-2 mr-4">
                {desktopNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      onClick={() => navigate(navTarget(item))}
                      variant={isNavItemActive(item.path) ? "default" : "ghost"}
                      className={`h-10 px-4 rounded-xl font-medium ${
                        isNavItemActive(item.path) ? "bg-primary text-primary-foreground shadow-sm" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>

              <Button
                onClick={handleLogout}
                variant="ghost"
                className="h-10 shrink-0 rounded-xl px-2.5 md:px-3 text-muted-foreground hover:text-foreground gap-1.5"
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden />
                <span className="text-sm font-medium">Wyloguj się</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      {!isLoginPage && (
        <div
          id={WPA_REVIEW_BAR_PORTAL_ID}
          className="sticky top-16 z-40 w-full empty:hidden border-b border-border bg-white/95 backdrop-blur-md"
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 flex flex-col pt-4",
          mobileMainPaddingBottomClass,
          "md:pb-8",
          contentColumnClass,
        )}
      >
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      {!isLoginPage && (
        <nav
          aria-label="Nawigacja główna"
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
        >
          <div className="flex h-12 items-center justify-center gap-0.5">
            {mobileNavigation.map((item) => {
              const isActive = isNavItemActive(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(navTarget(item))}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex flex-none flex-col items-center justify-center gap-0.5 min-w-[4.25rem] px-2.5 py-0.5 rounded-xl cursor-pointer",
                    "hover:bg-transparent active:bg-transparent focus-visible:bg-transparent",
                    "[-webkit-tap-highlight-color:transparent]",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <MobileBottomNavIcon
                    iconOutline={item.iconOutline}
                    iconSolid={item.iconSolid}
                    active={isActive}
                  />
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
