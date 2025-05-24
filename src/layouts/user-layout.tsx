"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/common/avatar";
import {
  Navbar,
  NavbarItem,
  NavbarSection,
} from "@/components/common/navbar";
import { NavbarLayout } from "@/components/common/navbar-layout";
import {
  Square2StackIcon,
  ChartBarIcon,
} from "@heroicons/react/20/solid";
import { NavbarLogoutButton } from "@/components/auth/logout-button";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <NavbarLayout
      navbar={
        <Navbar className="w-full">
          {/* Left Section: Logo and Brand */}
          <NavbarSection>
            <NavbarItem href="/" className="items-center gap-2">
              <Avatar src="/logo.png" className="h-8 w-8" />
              <span className="text-2xl font-extrabold text-white drop-shadow-lg">SoundBoard</span>
              <span className="ml-2 px-2 py-1 rounded bg-secondary/80 text-secondary-foreground text-xs font-semibold shadow-md backdrop-blur">Collaborative Studio</span>
            </NavbarItem>
          </NavbarSection>

          {/* Center Section: Main Navigation */}
          <NavbarSection className="hidden lg:flex items-center gap-1 mx-auto">
            <NavbarItem href="/analytics" className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 transition-all duration-200 shadow-lg hover:shadow-xl">
              <ChartBarIcon className="h-5 w-5" />
              <span className="text-white ml-2 font-medium">Analytics</span>
            </NavbarItem>
            <NavbarItem href="/rooms" className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Square2StackIcon className="h-5 w-5" />
              <span className="text-white ml-2 font-medium">Rooms</span>
            </NavbarItem>
          </NavbarSection>

          {/* Right Section: User Menu */}
          <NavbarSection className="ml-auto flex items-center gap-3">
            {session?.user?.name && (
              <span className="text-white font-medium mr-1">{session.user.name}</span>
            )}
            <NavbarLogoutButton />
          </NavbarSection>
        </Navbar>
      }
    >
      {children}
    </NavbarLayout>
  );
}
