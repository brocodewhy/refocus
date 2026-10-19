import type { Metadata } from "next";
import "./globals.css";
import "./signal.css";

export const metadata: Metadata = {
  title: "REFOCUS — Notice. Refocus. Continue.",
  description: "A calmer way to understand digital habits and build focus routines.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('refocus-theme')==='dark')document.documentElement.dataset.theme='dark'}catch{}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
