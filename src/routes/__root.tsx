import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { StoreProvider } from '@/contexts/StoreContext';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kantin SMPN 45 Semarang — Sistem Kasir" },
      { name: "description", content: "Sistem Kasir Kantin SMPN 45 Semarang" },
      { property: "og:title", content: "Kantin SMPN 45 Semarang" },
      { property: "og:description", content: "Sistem Kasir Kantin SMPN 45 Semarang" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <TooltipProvider>
      <Sonner />
      <StoreProvider>
        <SidebarProvider>
          <div className="flex h-screen min-h-screen w-full overflow-hidden">
            <AppSidebar />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <header className="h-12 shrink-0 items-center border-b bg-card px-2 md:hidden flex">
                <SidebarTrigger />
              </header>
              <main className="flex-1 min-h-0 overflow-hidden">
                <Outlet />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </StoreProvider>
    </TooltipProvider>
  );
}
