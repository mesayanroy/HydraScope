import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HydraScope",
  description:
    "HydraScope: graph-native developer security intelligence for transitive blast-radius analysis.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
