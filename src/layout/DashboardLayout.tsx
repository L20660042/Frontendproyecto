import React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../components/button";
import { useAuth } from "../auth/AuthContext";
import type { AppRole } from "../services/authService";

type NavItem = {
  label: string;
  to: string;
  roles: AppRole[];
};
const ALL_ROLES: AppRole[] = ["superadmin","admin","docente","estudiante","jefe_departamento","tutor","control_escolar","capacitacion"];

const NAV: NavItem[] = [
  // Home por rol
  { label: "Catálogo: Alumnos", to: "/catalogos/alumnos", roles: ["superadmin", "admin", "control_escolar"] },
  { label: "Mis cargas (Docente)", to: "/docente/cargas", roles: ["docente"] },
  { label: "Cambiar contraseña", to: "/mi-cuenta/password", roles: ALL_ROLES },
  { label: "Grupo → Cargas → Inscritos", to: "/catalogos/resumen-grupo", roles: ["superadmin", "admin", "control_escolar"] },
  { label: "Mis materias (Estudiante)", to: "/estudiante/materias", roles: ["estudiante"] },
  { label: "Inicio (Superadmin)", to: "/dashboard/superadmin", roles: ["superadmin"] },
  { label: "Inicio (Admin)", to: "/dashboard/admin", roles: ["admin"] },
  { label: "Inicio (Control Escolar)", to: "/control-escolar", roles: ["control_escolar"] },
  { label: "Inscripciones por materia", to: "/catalogos/inscripciones", roles: ["superadmin", "admin", "control_escolar"] },
  { label: "Cargas", to: "/catalogos/cargas", roles: ["superadmin", "admin", "control_escolar"] },
  { label: "Inicio (Docente)", to: "/docente", roles: ["docente"] },
  { label: "Inicio (Estudiante)", to: "/estudiante", roles: ["estudiante"] },
  { label: "Horarios", to: "/horarios", roles: ["superadmin", "admin", "control_escolar"] },
  { label: "Catálogo: Periodos", to: "/catalogos/periodos", roles: ["superadmin", "admin", "control_escolar"] },
  { label: "Catálogo: Carreras", to: "/catalogos/carreras", roles: ["superadmin", "admin", "control_escolar"] },
  { label: "Catálogo: Grupos", to: "/catalogos/grupos", roles: ["superadmin", "admin", "control_escolar"] },
  { label: "Catálogo: Materias", to: "/catalogos/materias", roles: ["superadmin", "admin", "control_escolar"] },
  { label: "Usuarios", to: "/dashboard/usuarios", roles: ["superadmin", "admin", "control_escolar"] },
  { label: "Cargas (Grupo-Materia-Docente)", to: "/horarios/cargas", roles: ["superadmin", "admin", "control_escolar"] },
  { label: "Mi horario (Docente)", to: "/docente/horario", roles: ["docente"] },
  { label: "Mi horario (Estudiante)", to: "/estudiante/horario", roles: ["estudiante"] },
];

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground border border-border">
      {role}
    </span>
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

  const items = React.useMemo(() => {
    if (!user) return [];
    return NAV.filter((i) => i.roles.includes(user.role));
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-border bg-card">
        <div className="w-full p-4">
          <div className="mb-4">
            <div className="text-lg font-semibold">MetriCampus</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              {user?.role ? <RoleBadge role={user.role} /> : null}
            </div>
          </div>

          <nav className="space-y-1">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) =>
                  [
                    "block rounded-lg px-3 py-2 text-sm border",
                    isActive ? "bg-muted border-border font-medium" : "border-transparent hover:bg-muted/60",
                  ].join(" ")
                }
              >
                {it.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6">
            <Button variant="destructive" className="w-full" onClick={clearSession}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">Panel de trabajo</p>
            </div>

            <div className="md:hidden">
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
