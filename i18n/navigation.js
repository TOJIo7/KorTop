import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Link, useRouter и т.д., которые сами подставляют /tg или /ru
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
