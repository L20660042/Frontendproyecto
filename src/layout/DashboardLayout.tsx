import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { useAuth } from "../auth/AuthContext";
import type { AppRole } from "../services/authService";

type NavItem = {
  label: string;
  to: string;
  roles: AppRole[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const ALL_ROLES: AppRole[] = [
  "superadmin",
  "admin",
  "docente",
  "estudiante",
  "jefe_departamento",
  "tutor",
  "control_escolar",
  "capacitacion",
];

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Inicio",
    items: [
      { label: "Inicio", to: "/dashboard/superadmin", roles: ["superadmin"] },
      { label: "Inicio", to: "/dashboard/admin", roles: ["admin"] },
      { label: "Inicio", to: "/control-escolar", roles: ["control_escolar"] },
      { label: "Inicio", to: "/docente", roles: ["docente"] },
      { label: "Inicio", to: "/estudiante", roles: ["estudiante"] },
      { label: "Inicio", to: "/jefe-academico", roles: ["jefe_departamento"] },
      { label: "Inicio", to: "/tutor", roles: ["tutor"] },
      { label: "Inicio", to: "/desarrollo-academico", roles: ["capacitacion"] },
    ],
  },
  {
    title: "Operación académica",
    items: [
      { label: "Horarios", to: "/horarios", roles: ["superadmin", "admin", "control_escolar"] },
      {
        label: "Cargas: grupo–materia–docente",
        to: "/horarios/cargas",
        roles: ["superadmin", "admin", "control_escolar"],
      },
      {
        label: "Inscripciones por grupo",
        to: "/catalogos/enrollments",
        roles: ["superadmin", "admin", "control_escolar"],
      },
      {
        label: "Inscripciones por materia",
        to: "/catalogos/inscripciones",
        roles: ["superadmin", "admin", "control_escolar"],
      },
      {
        label: "Resumen por grupo",
        to: "/catalogos/resumen-grupo",
        roles: ["superadmin", "admin", "control_escolar"],
      },
      { label: "Mis cargas", to: "/docente/cargas", roles: ["docente"] },
      { label: "Mi horario", to: "/docente/horario", roles: ["docente"] },
      { label: "Mi horario", to: "/estudiante/horario", roles: ["estudiante"] },
      { label: "Mis materias", to: "/estudiante/materias", roles: ["estudiante"] },
      { label: "Kardex", to: "/estudiante/kardex", roles: ["estudiante"] },
    ],
  },
  {
    title: "Extraescolares",
    items: [
      {
        label: "Administrar actividades",
        to: "/catalogos/actividades",
        roles: ["superadmin", "admin", "control_escolar"],
      },
      { label: "Mis actividades", to: "/estudiante/actividades", roles: ["estudiante"] },
    ],
  },
  {
    title: "Configuración",
    items: [
      { label: "Periodos", to: "/catalogos/periodos", roles: ["superadmin", "admin", "control_escolar"] },
      { label: "Carreras", to: "/catalogos/carreras", roles: ["superadmin", "admin", "control_escolar"] },
      { label: "Grupos", to: "/catalogos/grupos", roles: ["superadmin", "admin", "control_escolar"] },
      { label: "Materias", to: "/catalogos/materias", roles: ["superadmin", "admin", "control_escolar"] },
      { label: "Alumnos", to: "/catalogos/alumnos", roles: ["superadmin", "admin", "control_escolar"] },
      { label: "Importación CSV", to: "/catalogos/importacion", roles: ["superadmin", "admin", "control_escolar"] },
    ],
  },
  {
    title: "Analítica",
    items: [
      {
        label: "Dashboard académico",
        to: "/dashboard/academico",
        roles: ["superadmin", "admin", "control_escolar", "jefe_departamento", "capacitacion"],
      },
      {
        label: "Calidad docente",
        to: "/admin/analytics",
        roles: ["superadmin", "admin", "jefe_departamento", "capacitacion"],
      },
      {
        label: "Dashboard IA",
        to: "/dashboard/ia",
        roles: ["superadmin", "admin", "control_escolar", "jefe_departamento", "capacitacion"],
      },
      {
        label: "Bandeja de quejas",
        to: "/admin/quejas",
        roles: ["superadmin", "admin", "jefe_departamento", "capacitacion"],
      },
      { label: "Evaluación docente", to: "/estudiante/evaluacion", roles: ["estudiante"] },
      { label: "Quejas y sugerencias", to: "/estudiante/quejas", roles: ["estudiante"] },
      { label: "Retroalimentación (IA)", to: "/docente/retro", roles: ["docente"] },
    ],
  },
  {
    title: "Administración",
    items: [{ label: "Usuarios", to: "/dashboard/usuarios", roles: ["superadmin", "admin", "control_escolar"] }],
  },
  {
    title: "Cuenta",
    items: [{ label: "Cambiar contraseña", to: "/mi-cuenta/password", roles: ALL_ROLES }],
  },
];

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground border border-border">
      {role}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pt-4 pb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </div>
  );
}

function NavItemLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block rounded-lg px-3 py-2 text-sm border transition-colors",
          isActive ? "bg-muted border-border font-medium" : "border-transparent hover:bg-muted/60",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

function Sidebar({
  role,
  email,
  sections,
  onLogout,
  onNavigate,
  search,
  setSearch,
}: {
  role?: string;
  email?: string;
  sections: NavSection[];
  onLogout: () => void;
  onNavigate?: () => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <div className="text-lg font-semibold">MetriCampus</div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {email ? <span className="text-sm text-muted-foreground">{email}</span> : null}
          {role ? <RoleBadge role={role} /> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar en el menú..." />
      </div>

      <nav className="mt-3 pr-1 max-h-[calc(100vh-220px)] overflow-y-auto">
        {sections.map((sec) => (
          <div key={sec.title}>
            <SectionTitle>{sec.title}</SectionTitle>
            <div className="space-y-1">
              {sec.items.map((it) => (
                <div key={it.to} onClick={onNavigate}>
                  <NavItemLink to={it.to} label={it.label} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6">
        <Button variant="destructive" className="w-full" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { user, clearSession } = useAuth();
  const location = useLocation();

  const [navSearch, setNavSearch] = React.useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    // Cierra el menú móvil al cambiar de ruta.
    setMobileOpen(false);
  }, [location.pathname]);

  const sections = React.useMemo(() => {
    if (!user) return [];
    const q = navSearch.trim().toLowerCase();
    const hasQuery = q.length > 0;

    return NAV_SECTIONS.map((sec) => {
      const items = sec.items.filter((it) => {
        if (!it.roles.includes(user.role)) return false;
        if (!hasQuery) return true;
        return it.label.toLowerCase().includes(q);
      });
      return { ...sec, items };
    }).filter((sec) => sec.items.length > 0);
  }, [user, navSearch]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-80 border-r border-border bg-card">
        <Sidebar
          role={user?.role}
          email={user?.email}
          sections={sections}
          onLogout={clearSession}
          search={navSearch}
          setSearch={setNavSearch}
        />
      </aside>

      {/* Sidebar mobile (overlay) */}
      {mobileOpen ? (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] border-r border-border bg-card shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="text-sm font-semibold">Menú</div>
              <Button variant="secondary" onClick={() => setMobileOpen(false)}>
                Cerrar
              </Button>
            </div>
            <Sidebar
              role={user?.role}
              email={user?.email}
              sections={sections}
              onLogout={clearSession}
              onNavigate={() => setMobileOpen(false)}
              search={navSearch}
              setSearch={setNavSearch}
            />
          </div>
        </div>
      ) : null}

      {/* Main */}
      <main className="flex-1">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="px-6 py-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">Panel de trabajo</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="md:hidden">
                <Button variant="secondary" onClick={() => setMobileOpen(true)}>
                  Menú
                </Button>
              </div>
              <Button variant="destructive" onClick={clearSession}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
