import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider, ToastProvider } from "@/providers";

export const metadata: Metadata = {
  title: "CAMS | College Academic Management System",
  description: "Academic management system for college.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
