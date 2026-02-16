import { createBrowserRouter } from 'react-router';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AppShell from './pages/AppShell';
import Trips from './pages/Trips';
import AddTrip from './pages/AddTrip';
import EditTrip from './pages/EditTrip';
import Vehicles from './pages/Vehicles';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/app",
    Component: AppShell,
    children: [
      {
        index: true,
        Component: Trips,
      },
      {
        path: "trips",
        Component: Trips,
      },
      {
        path: "add-trip",
        Component: AddTrip,
      },
      {
        path: "edit-trip/:id",
        Component: EditTrip,
      },
      {
        path: "vehicles",
        Component: Vehicles,
      },
      {
        path: "reports",
        Component: Reports,
      },
      {
        path: "settings",
        Component: Settings,
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
