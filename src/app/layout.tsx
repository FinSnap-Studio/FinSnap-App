import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinSnap",
  description: "The Ultimate Automated Money Tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('finsnap-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                  var ct = localStorage.getItem('finsnap-color-theme');
                  if (ct && ct !== 'slate') {
                    document.documentElement.setAttribute('data-theme', ct);
                  }
                  var locale = localStorage.getItem('finsnap-locale');
                  if (locale) {
                    document.documentElement.lang = locale;
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
