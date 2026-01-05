import React from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Alert, AlertDescription } from "../../components/alert";
import { Button } from "../../components/button";

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function AdminHomePage({ title }: { title: string }) {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [counts, setCounts] = React.useState({
    students: 0,
    teachers: 0,
    groups: 0,
    subjects: 0,
    careers: 0,
  });

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [st, te, gr, su, ca] = await Promise.all([
          api.get("/academic/students"),
          api.get("/academic/teachers"),
          api.get("/academic/groups"),
          api.get("/academic/subjects"),
          api.get("/academic/careers"),
        ]);

        setCounts({
          students: (st.data ?? []).length,
          teachers: (te.data ?? []).length,
          groups: (gr.data ?? []).length,
          subjects: (su.data ?? []).length,
          careers: (ca.data ?? []).length,
        });
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "No se pudieron cargar métricas generales");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout title={title}>
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Resumen institucional</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Métricas rápidas para operación y control"}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Alumnos" value={counts.students} />
            <StatCard label="Docentes" value={counts.teachers} />
            <StatCard label="Grupos" value={counts.groups} />
            <StatCard label="Materias" value={counts.subjects} />
            <StatCard label="Carreras" value={counts.careers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
            <CardDescription>Operación, analítica y calidad</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link to="/catalogos/importacion">Importación CSV</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/catalogos/grupos">Grupos</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/catalogos/cargas">Cargas</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/catalogos/inscripciones">Inscripciones</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/academico">Dashboard académico</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/ia">Dashboard IA</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/analytics">Calidad docente</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/quejas">Bandeja de quejas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
