import { Link, useRouterState } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { bottomNav } from "./nav-config";
import { useSidebar } from "@/components/ui/sidebar";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile } = useSidebar();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <ul className="grid grid-cols-5">
        {bottomNav.map((item) => {
          const active = pathname.startsWith(item.url);
          return (
            <li key={item.title}>
              <Link
                to={item.url}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            onClick={() => setOpenMobile(true)}
            className="flex w-full flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground"
          >
            <MoreHorizontal className="h-5 w-5" />
            Mais
          </button>
        </li>
      </ul>
    </nav>
  );
}
