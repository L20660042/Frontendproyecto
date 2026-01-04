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

function idOf(v: any): string {
  if (!v) return "";
  return typeof v === "string" ? v : v._id;
}

export default function SubjectsPage() {
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [items, setItems] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // filtros
  const [filterCareerId, setFilterCareerId] = React.useState("");
  const [filterSemester, setFilterSemester] = React.useState<string>("");

  // creación
  const [createCareerId, setCreateCareerId] = React.useState("");
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [semester, setSemester] = React.useState<number>(1);

  const loadCareers = React.useCallback(async () => {
    setError("");
    try {
      const res = await api.get("/academic/careers");
      const cList: Career[] = res.data ?? [];
      setCareers(cList);
      if (cList.length > 0) setCreateCareerId((prev) => prev || cList[0]._id);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar carreras");
    }
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = {};
      if (filterCareerId) params.careerId = filterCareerId;
      if (filterSemester) params.semester = filterSemester;

      const res = await api.get("/academic/subjects", { params });
      setItems(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar materias");
    } finally {
      setLoading(false);
    }
  }, [filterCareerId, filterSemester]);

  React.useEffect(() => {
    loadCareers();
  }, [loadCareers]);

  React.useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setError("");
    if (!createCareerId) return setError("Selecciona Carrera.");
    if (!name.trim()) return setError("Nombre requerido.");
    if (!code.trim()) return setError("Código requerido.");

    setLoading(true);
    try {
      await api.post("/academic/subjects", {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        careerId: createCareerId,
        semester: Number(semester),
      });
      setName("");
      setCode("");
      setSemester(1);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al crear materia";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, patch: Partial<Subject>) => {
    setError("");
    setLoading(true);
    try {
      await api.patch(`/academic/subjects/${id}`, patch);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al actualizar materia";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string, label: string) => {
    if (!confirm(`¿Eliminar la materia "${label}"?`)) return;
    setError("");
    setLoading(true);
    try {
      await api.delete(`/academic/subjects/${id}`);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al eliminar materia";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const careerLabelById = React.useCallback(
    (id: string) => {
      const c = careers.find((x) => x._id === id);
      return c ? `${c.code} - ${c.name}` : id;
    },
    [careers]
  );

  return (
    <DashboardLayout title="Materias">
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Crear materia</CardTitle>
              <CardDescription>
                Las materias se registran por <strong>carrera</strong> y <strong>semestre</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Carrera</Label>
                <select
                  className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                  value={createCareerId}
                  onChange={(e) => setCreateCareerId(e.target.value)}
                  disabled={loading}
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
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Programación Web" disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ISC-401" disabled={loading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Semestre</Label>
                <Input type="number" min={1} max={20} value={semester} onChange={(e) => setSemester(Number(e.target.value))} disabled={loading} />
              </div>

              <Button className="w-full" onClick={create} disabled={loading || !createCareerId || !name.trim() || !code.trim()}>
                Crear materia
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Materias registradas</CardTitle>
              <CardDescription>{loading ? "Cargando..." : "Filtra, edita o elimina"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Carrera</Label>
                  <select
                    className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                    value={filterCareerId}
                    onChange={(e) => setFilterCareerId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Todas</option>
                    {careers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Semestre</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                    placeholder="(opcional)"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={load} disabled={loading}>
                  Refrescar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterCareerId("");
                    setFilterSemester("");
                  }}
                  disabled={loading}
                >
                  Limpiar
                </Button>
              </div>

              <div className="overflow-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left p-3">Código</th>
                      <th className="text-left p-3">Nombre</th>
                      <th className="text-left p-3">Sem</th>
                      <th className="text-left p-3">Carrera</th>
                      <th className="text-left p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-muted-foreground">
                          Sin materias
                        </td>
                      </tr>
                    ) : (
                      items.map((s) => (
                        <SubjectRowItem
                          key={s._id}
                          s={s}
                          disabled={loading}
                          careers={careers}
                          careerLabelById={careerLabelById}
                          onSave={update}
                          onDelete={remove}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SubjectRowItem({
  s,
  disabled,
  careers,
  careerLabelById,
  onSave,
  onDelete,
}: {
  s: Subject;
  disabled: boolean;
  careers: Career[];
  careerLabelById: (id: string) => string;
  onSave: (id: string, patch: Partial<Subject>) => Promise<void>;
  onDelete: (id: string, label: string) => Promise<void>;
}) {
  const [code, setCode] = React.useState(s.code ?? "");
  const [name, setName] = React.useState(s.name ?? "");
  const [semester, setSemester] = React.useState<number>(Number(s.semester ?? 1));
  const [careerId, setCareerId] = React.useState(idOf(s.careerId));

  const canSave = code.trim() && name.trim() && semester >= 1 && !!careerId;

  return (
    <tr className="border-t border-border">
      <td className="p-3 w-44">
        <Input className="h-10" value={code} onChange={(e) => setCode(e.target.value)} disabled={disabled} />
      </td>
      <td className="p-3 min-w-[260px]">
        <Input className="h-10" value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
      </td>
      <td className="p-3 w-24">
        <Input className="h-10" type="number" min={1} max={20} value={semester} onChange={(e) => setSemester(Number(e.target.value))} disabled={disabled} />
      </td>
      <td className="p-3 min-w-[220px]">
        <select
          className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm"
          value={careerId}
          onChange={(e) => setCareerId(e.target.value)}
          disabled={disabled}
        >
          <option value="">Selecciona...</option>
          {careers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code} - {c.name}
            </option>
          ))}
        </select>
        <div className="mt-1 text-xs text-muted-foreground">Actual: {careerLabelById(idOf(s.careerId))}</div>
      </td>
      <td className="p-3">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              onSave(s._id, {
                code: code.trim().toUpperCase(),
                name: name.trim(),
                semester: Number(semester),
                careerId,
              })
            }
            disabled={disabled || !canSave}
          >
            Guardar
          </Button>
          <Button variant="destructive" onClick={() => onDelete(s._id, s.code)} disabled={disabled}>
            Eliminar
          </Button>
        </div>
      </td>
    </tr>
  );
}
