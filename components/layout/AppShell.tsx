import { PropsWithChildren } from "react";

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
