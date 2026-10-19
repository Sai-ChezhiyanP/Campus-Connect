'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { store } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [role, setRole] = useState<string>(store.getCurrentRole());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRole(store.getCurrentRole());

    // Check if authenticated
    if (!store.isAuthenticated()) {
      router.replace('/login');
    }

    const unsub = store.subscribe(() => {
      setRole(store.getCurrentRole());
      if (!store.isAuthenticated()) {
        router.replace('/login');
      }
    });

    return () => unsub();
  }, [router]);

  const handleRoleSwitch = (newRole: string) => {
    store.setCurrentUser(newRole);
    setRole(newRole);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#070B14] text-slate-100 selection:bg-sky-500 selection:text-slate-950 overflow-hidden">
      {/* Background Cosmic Glows for Glass Refraction */}
      <div className="fixed top-[-50px] left-[15%] w-[450px] h-[450px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-50px] right-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-[40%] right-[30%] w-[350px] h-[350px] bg-violet-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar currentRole={role} onRoleSwitch={handleRoleSwitch} />
        <div className="flex flex-1">
          <Sidebar currentRole={role} />
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
