import { Outlet } from "react-router";

/** Layout for /permits/:id and nested paths (e.g. renew-exams). */
export function PermitIdRouteOutlet() {
  return <Outlet />;
}
