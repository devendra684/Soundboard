"use client";

import React from "react";

export function NavbarLayout({
  navbar,
  children,
}: React.PropsWithChildren<{
  navbar: React.ReactNode;
}>) {
  return (
    <div className="relative isolate flex min-h-svh w-full flex-col bg-gradient-to-br from-[#001085] via-[#006bff] to-[#00d2ff]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#23124d]/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {navbar}
        </div>
      </header>
      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 