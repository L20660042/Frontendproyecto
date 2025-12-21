import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";
import { api } from "../../api/client";

type Career = { _id: string; name: string; code: string };
type Subject = {
  _id: string;
  name: string;
  code: string;
  semester: number;
  careerId: any;
};

export default function SubjectsPage() {
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [items, setItems] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // filtros/creación
  const [careerId, setCareerId] = React.useState("");
  const [filterSemester, setFilterSemester] = React.useState<string>("");

  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [semester, setSemester] = React.useState<number>(1);

  const loadCareers = React.useCallback(async () => {
    try {
      const res = await api.get("/academic/careers");
      setCareers(res.data ?? []);
    } catch {
      // silencioso
    }
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = {};
      if (careerId) params.careerId = careerId;
      if (filterSemester) params.semester = filterSemester;

      const res = await api.get("/academic/subjects", { params });
      setItems(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar materias");
    } finally {
      setLoading(false);
    }
  }, [careerId, filterSemester]);

  React.useEffect(() => {
    loadCareers();
  }, [loadCareers]);

  React.useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setError("");
    if (!careerId) {
      setError("Selecciona Carrera para crear la materia.");
      return;
    }
    try {
      await api.post("/academic/subjects", {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        careerId,
        semester: Number(semester),
      });
      setName("");
      setCode("");
      setSemester(1);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al crear materia");
    }
  };

  return (
    <DashboardLayout title="Catálogo: Materias">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear materia</CardTitle>
            <CardDescription>Las materias se registran por carrera y semestre.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Carrera</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={careerId}
                onChange={(e) => setCareerId(e.target.value)}
              >
                <option value="">Selecciona...</option>
                {careers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Programación Web" />
              </div>
              <div className="space-y-2">
                <Label>Código</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ISC-401" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Semestre</Label>
              <Input type="number" min={1} max={20} value={semester} onChange={(e) => setSemester(Number(e.target.value))} />
            </div>

            <Button className="w-full" onClick={create}>
              Crear materia
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Materias registradas</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Filtra por carrera y/o semestre"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Filtro semestre</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  placeholder="(opcional)"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="secondary" onClick={load}>
                  Refrescar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterSemester("");
                    // careerId lo dejamos porque también es el de creación; si quieres, lo limpiamos también
                  }}
                >
                  Limpiar
                </Button>
              </div>
            </div>

            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Código</th>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">Sem</th>
                    <th className="text-left p-3">Carrera</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Sin materias
                      </td>
                    </tr>
                  ) : (
                    items.map((s) => (
                      <tr key={s._id} className="border-t border-border">
                        <td className="p-3 font-medium">{s.code}</td>
                        <td className="p-3">{s.name}</td>
                        <td className="p-3">{s.semester}</td>
                        <td className="p-3">{s.careerId?.code ?? ""}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
