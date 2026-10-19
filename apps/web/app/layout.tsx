import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campus Connect — Management & Broadcasting Portal',
  description: 'Centralized administrative and faculty portal for SRMIST Ramapuram',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className="min-h-screen bg-[#070B14] font-sans antialiased text-slate-100 selection:bg-sky-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
