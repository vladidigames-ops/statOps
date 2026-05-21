import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Authenticated, Refine } from "@refinedev/core";
import {
  ErrorComponent,
  ThemedLayoutV2,
  notificationProvider as mantineNotificationProvider,
} from "@refinedev/mantine";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { IconBuildingStore, IconDashboard, IconPlugConnected } from "@tabler/icons-react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import { DashboardPage } from "@/pages/dashboard";
import { theme } from "@/theme";
import { EstablishmentCreatePage } from "@/pages/establishments/create";
import { EstablishmentEditPage } from "@/pages/establishments/edit";
import { EstablishmentListPage } from "@/pages/establishments/list";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { SourceCreatePage } from "@/pages/sources/create";
import { SourceEditPage } from "@/pages/sources/edit";
import { SourceListPage } from "@/pages/sources/list";
import { authProvider } from "@/providers/authProvider";
import { dataProvider } from "@/providers/dataProvider";

export default function App() {
  return (
    <BrowserRouter>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications />
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
          routerProvider={routerBindings}
          notificationProvider={mantineNotificationProvider}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            disableTelemetry: true,
          }}
          resources={[
            {
              name: "dashboard",
              list: "/dashboard",
              meta: { label: "Дашборд", icon: <IconDashboard size={18} /> },
            },
            {
              name: "establishments",
              list: "/establishments",
              create: "/establishments/new",
              edit: "/establishments/:id/edit",
              meta: { label: "Заведения", icon: <IconBuildingStore size={18} /> },
            },
            {
              name: "sources",
              list: "/sources",
              create: "/sources/new",
              edit: "/sources/:id/edit",
              meta: { label: "Источники", icon: <IconPlugConnected size={18} /> },
            },
          ]}
        >
          <Routes>
            <Route
              element={
                <Authenticated key="auth-inner" fallback={<CatchAllNavigate to="/login" />}>
                  <ThemedLayoutV2 Title={({ collapsed }) => <Brand collapsed={collapsed} />}>
                    <Outlet />
                  </ThemedLayoutV2>
                </Authenticated>
              }
            >
              <Route index element={<NavigateToResource resource="dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/establishments">
                <Route index element={<EstablishmentListPage />} />
                <Route path="new" element={<EstablishmentCreatePage />} />
                <Route path=":id/edit" element={<EstablishmentEditPage />} />
              </Route>
              <Route path="/sources">
                <Route index element={<SourceListPage />} />
                <Route path="new" element={<SourceCreatePage />} />
                <Route path=":id/edit" element={<SourceEditPage />} />
              </Route>
              <Route path="*" element={<ErrorComponent />} />
            </Route>

            <Route
              element={
                <Authenticated key="auth-outer" fallback={<Outlet />}>
                  <NavigateToResource resource="dashboard" />
                </Authenticated>
              }
            >
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Routes>
          <UnsavedChangesNotifier />
          <DocumentTitleHandler />
        </Refine>
      </MantineProvider>
    </BrowserRouter>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "var(--mantine-color-emerald-6)",
          color: "#0a1316",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 16,
        }}
      >
        sO
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "var(--mantine-color-emerald-6)",
          color: "#0a1316",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 16,
        }}
      >
        sO
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>statOps</span>
        <span style={{ fontSize: 11, color: "var(--mantine-color-dimmed)" }}>
          Аналитика общепита
        </span>
      </div>
    </div>
  );
}
