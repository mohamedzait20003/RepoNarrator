import { Outlet } from "@tanstack/react-router";

import { ProfileSidebar } from "../components/ProfileSidebar";

/**
 * Two-column profile shell: a section sidebar (Settings / Resume / Billing /
 * Security) beside the active page. The outer chrome (global Navbar) and the
 * page container come from root.tsx.
 */
export function ProfileLayout() {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <ProfileSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
