import './globals.css';
import { poppins } from '@/shared/lib/fonts';

// Root layout — must have <html> and <body>.
// Locale-specific settings (lang attribute, providers) live in [locale]/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className={poppins.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
