import { useHostNavigation, useHostLocation } from "@paperclipai/plugin-sdk/ui";
import type { PluginSidebarProps } from "@paperclipai/plugin-sdk/ui";

export function SidebarLink(_props: PluginSidebarProps) {
  const nav = useHostNavigation();
  const location = useHostLocation();
  const href = nav.resolveHref("/batch-agent-config");
  const linkProps = nav.linkProps("/batch-agent-config");
  const isActive = location.pathname.includes("batch-agent-config");

  return (
    <a
      {...linkProps}
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 pointer-coarse:py-1.5 text-[13px] font-medium transition-colors ${isActive ? "text-foreground bg-accent/50" : "text-foreground/80 hover:bg-accent/50 hover:text-foreground"}`}
    >
      <span className="relative shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24" height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-user-check h-4 w-4"
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 3 18 5 22 1" />
        </svg>
      </span>
      Batch Config
    </a>
  );
}
