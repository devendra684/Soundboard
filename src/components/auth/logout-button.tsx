import { signOut } from "next-auth/react";
import { DropdownItem, DropdownLabel } from "../common/dropdown";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/20/solid";
import { Button } from "../common/button";

export function LogoutButton() {
  return (
    // <button
    //   onClick={() =>
    //     // this will clear the session cookie and redirect to your home page
    //     signOut({ callbackUrl: "/" })
    //   }
    // >
    //   Logout
    // </button>
    <DropdownItem
      onClick={() =>
        // this will clear the session cookie and redirect to your home page
        signOut({ callbackUrl: "/" })
      }
    >
      <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
      <DropdownLabel>Sign Out</DropdownLabel>
    </DropdownItem>
  );
}

export function NavbarLogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/" })} 
    >
      <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
      <span >Sign Out</span>
      
    </Button>
  );
}
