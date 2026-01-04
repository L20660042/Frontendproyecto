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
  "SUPERADMIN",
  "ADMIN",
  "SERVICIOS_ESCOLARES",
  "DOCENTE",
  "ALUMNO",
  "JEFE",
  "SUBDIRECCION",
  "DESARROLLO_ACADEMICO",
];

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Inicio",
    items: [
      { label: "Inicio", to: "/dashboard/superadmin", roles: ["SUPERADMIN"] },
      { label: "Inicio", to: "/dashboard/admin", roles: ["ADMIN"] },
      { label: "Inicio", to: "/control-escolar", roles: ["SERVICIOS_ESCOLARES"] },
      { label: "Inicio", to: "/docente", roles: ["DOCENTE"] },
      { label: "Inicio", to: "/estudiante", roles: ["ALUMNO"] },
      { label: "Inicio", to: "/jefe-academico", roles: ["JEFE"] },
      { label: "Inicio", to: "/subdireccion", roles: ["SUBDIRECCION"] },
      { label: "Inicio", to: "/desarrollo-academico", roles: ["DESARROLLO_ACADEMICO"] },
    ],
  },
  {
    title: "Operación académica",
    items: [
      { label: "Horarios (bloques)", to: "/horarios", roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"] },
      {
        label: "Cargas: grupo–materia–docente",
        to: "/catalogos/cargas",
        roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"],
      },
      {
        label: "Inscripciones por grupo",
        to: "/catalogos/enrollments",
        roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"],
      },
      {
        label: "Inscripciones por materia",
        to: "/catalogos/inscripciones",
        roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"],
      },
      {
        label: "Resumen por grupo",
        to: "/catalogos/resumen-grupo",
        roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"],
      },

      { label: "Mis cargas", to: "/docente/cargas", roles: ["DOCENTE"] },
      { label: "Mi horario", to: "/docente/horario", roles: ["DOCENTE"] },

      { label: "Mi horario", to: "/estudiante/horario", roles: ["ALUMNO"] },
      { label: "Mis materias", to: "/estudiante/materias", roles: ["ALUMNO"] },
      { label: "Kardex", to: "/estudiante/kardex", roles: ["ALUMNO"] },
    ],
  },
  {
    title: "Extraescolares",
    items: [
      {
        label: "Administrar actividades",
        to: "/catalogos/actividades",
        roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"],
      },
      { label: "Mis actividades", to: "/estudiante/actividades", roles: ["ALUMNO"] },
    ],
  },
  {
    title: "Configuración",
    items: [
      { label: "Periodos", to: "/catalogos/periodos", roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"] },
      { label: "Carreras", to: "/catalogos/carreras", roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"] },
      { label: "Grupos", to: "/catalogos/grupos", roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"] },
      { label: "Materias", to: "/catalogos/materias", roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"] },
      { label: "Alumnos", to: "/catalogos/alumnos", roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"] },
      { label: "Importación CSV", to: "/catalogos/importacion", roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"] },
    ],
  },
  {
    title: "Analítica",
    items: [
      {
        label: "Dashboard académico",
        to: "/dashboard/academico",
        roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES", "JEFE", "SUBDIRECCION", "DESARROLLO_ACADEMICO"],
      },
      {
        label: "Calidad docente",
        to: "/admin/analytics",
        roles: ["SUPERADMIN", "ADMIN", "JEFE", "SUBDIRECCION", "DESARROLLO_ACADEMICO"],
      },
      {
        label: "Dashboard IA",
        to: "/dashboard/ia",
        roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES", "JEFE", "SUBDIRECCION", "DESARROLLO_ACADEMICO"],
      },
      {
        label: "Bandeja de quejas",
        to: "/admin/quejas",
        roles: ["SUPERADMIN", "ADMIN", "JEFE", "SUBDIRECCION", "DESARROLLO_ACADEMICO"],
      },

      { label: "Evaluación docente", to: "/estudiante/evaluacion", roles: ["ALUMNO"] },
      { label: "Quejas y sugerencias", to: "/estudiante/quejas", roles: ["ALUMNO"] },
      { label: "Retroalimentación (IA)", to: "/docente/retro", roles: ["DOCENTE"] },
    ],
  },
  {
    title: "Administración",
    items: [{ label: "Usuarios", to: "/dashboard/usuarios", roles: ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"] }],
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

function hasAccess(userRoles: AppRole[], itemRoles: AppRole[]) {
  return userRoles.some((r) => itemRoles.includes(r));
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

export default function DashboardLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const { user, clearSession } = useAuth();
  const location = useLocation();

  const [navSearch, setNavSearch] = React.useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sections = React.useMemo(() => {
    if (!user) return [];
    const q = navSearch.trim().toLowerCase();
    const hasQuery = q.length > 0;

    return NAV_SECTIONS.map((sec) => {
      const items = sec.items.filter((it) => {
        if (!hasAccess(user.roles, it.roles)) return false;
        if (!hasQuery) return true;
        return it.label.toLowerCase().includes(q);
      });
      return { ...sec, items };
    }).filter((sec) => sec.items.length > 0);
  }, [user, navSearch]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
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

      <main className="flex-1">
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
