import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { CitizenDashboard } from "./pages/CitizenDashboard";
import { OfficerDashboard } from "./pages/OfficerDashboard";
import { ShopDashboard } from "./pages/ShopDashboard";
import { ApplicationForm } from "./pages/ApplicationForm";
import { ApplicationsList } from "./pages/ApplicationsList";
import { ApplicationDetails } from "./pages/ApplicationDetails";
import { WeaponRegistration } from "./pages/WeaponRegistration";
import { WeaponRegistry } from "./pages/WeaponRegistry";
import { DecisionPage } from "./pages/DecisionPage";
import { ShopVerification } from "./pages/ShopVerification";
import { NotFound } from "./pages/NotFound";
import { PermitApplicationForm } from "./pages/PermitApplicationForm";
import { PromiseApplicationForm } from "./pages/PromiseApplicationForm";
import { PromisesView } from "./pages/PromisesView";
import { TransfersList } from "./pages/TransfersList";
import { MedicalAlertsView } from "./pages/MedicalAlertsView";
import { WPASearchPage } from "./pages/WPASearchPage";
import { CitizenDetailsWPA } from "./pages/CitizenDetailsWPA";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LoginPage },
      { path: "citizen", Component: CitizenDashboard },
      { path: "officer", Component: OfficerDashboard },
      { path: "shop", Component: ShopDashboard },
      { path: "shop/verify", Component: ShopVerification },

      // Old form (deprecated)
      { path: "application/new", Component: ApplicationForm },

      // New forms - separate permit and promise applications
      { path: "application/new-permit", Component: PermitApplicationForm },
      { path: "application/new-promise", Component: PromiseApplicationForm },

      { path: "applications", Component: ApplicationsList },
      { path: "applications/:id", Component: ApplicationDetails },
      { path: "promises", Component: PromisesView },
      { path: "transfers", Component: TransfersList },
      { path: "medical-alerts", Component: MedicalAlertsView },
      { path: "weapon/register", Component: WeaponRegistration },
      { path: "weapons", Component: WeaponRegistry },
      { path: "decision/:id", Component: DecisionPage },

      // WPA Officer routes
      { path: "wpa/search", Component: WPASearchPage },
      { path: "wpa/citizens/:id", Component: CitizenDetailsWPA },

      { path: "*", Component: NotFound },
    ],
  },
]);
