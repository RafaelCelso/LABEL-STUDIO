import { authClient } from "@/lib/auth/client";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Label Studio Elite",
  description: "Criação de etiquetas de alimentos de forma profissional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const neonAuthClient = authClient as any;

  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full flex flex-col font-sans overflow-hidden">
        <NeonAuthUIProvider authClient={neonAuthClient} redirectTo="/" emailOTP>
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
