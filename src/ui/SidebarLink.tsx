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
          className="lucide lucide-pencil h-4 w-4"
          aria-hidden="true"
        >
          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
          <path d="m15 5 4 4" />
        </svg>
      </span>
      Batch Config
    </a>
  );
}
