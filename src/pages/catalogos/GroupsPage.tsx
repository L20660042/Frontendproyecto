import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";
import { api } from "../../api/client";

type Period = { _id: string; name: string; isActive: boolean };
type Career = { _id: string; name: string; code: string };

type Group = {
  _id: string;
  name: string;
  semester: number;
  periodId: any;
  careerId: any;
};

function idOf(v: any): string {
  if (!v) return "";
  return typeof v === "string" ? v : v._id;
}

export default function GroupsPage() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [items, setItems] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // filtros
  const [filterPeriodId, setFilterPeriodId] = React.useState("");
  const [filterCareerId, setFilterCareerId] = React.useState("");

  // creación
  const [createPeriodId, setCreatePeriodId] = React.useState("");
  const [createCareerId, setCreateCareerId] = React.useState("");
  const [name, setName] = React.useState("");
  const [semester, setSemester] = React.useState<number>(1);

  const loadCombos = React.useCallback(async () => {
    setError("");
    try {
      const [p, c] = await Promise.all([api.get("/academic/periods"), api.get("/academic/careers")]);
      const pList: Period[] = p.data ?? [];
      const cList: Career[] = c.data ?? [];

      setPeriods(pList);
      setCareers(cList);

      // defaults
      const activePeriod = pList.find((x) => x.isActive);
      if (activePeriod) {
        setCreatePeriodId((prev) => prev || activePeriod._id);
        setFilterPeriodId((prev) => prev || activePeriod._id);
      }
      if (cList.length > 0) {
        setCreateCareerId((prev) => prev || cList[0]._id);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar catálogos base");
    }
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = {};
      if (filterPeriodId) params.periodId = filterPeriodId;
      if (filterCareerId) params.careerId = filterCareerId;

      const res = await api.get("/academic/groups", { params });
      setItems(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar grupos");
    } finally {
      setLoading(false);
    }
  }, [filterPeriodId, filterCareerId]);

  React.useEffect(() => {
    loadCombos();
  }, [loadCombos]);

  React.useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setError("");
    if (!createPeriodId || !createCareerId) return setError("Selecciona Periodo y Carrera.");
    if (!name.trim()) return setError("Nombre del grupo requerido.");
    if (!semester || semester < 1) return setError("Semestre inválido.");

    setLoading(true);
    try {
      await api.post("/academic/groups", {
        name: name.trim(),
        semester: Number(semester),
        periodId: createPeriodId,
        careerId: createCareerId,
      });
      setName("");
      setSemester(1);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al crear grupo";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, patch: Partial<Group>) => {
    setError("");
    setLoading(true);
    try {
      await api.patch(`/academic/groups/${id}`, patch);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al actualizar grupo";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string, label: string) => {
    if (!confirm(`¿Eliminar el grupo "${label}"? Esto puede afectar inscripciones y cargas.`)) return;
    setError("");
    setLoading(true);
    try {
      await api.delete(`/academic/groups/${id}`);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al eliminar grupo";
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

  const periodLabelById = React.useCallback(
    (id: string) => {
      const p = periods.find((x) => x._id === id);
      return p ? `${p.name}${p.isActive ? " (Activo)" : ""}` : id;
    },
    [periods]
  );

  return (
    <DashboardLayout title="Grupos">
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Crear grupo</CardTitle>
              <CardDescription>
                Los grupos se definen por <strong>periodo</strong>, <strong>carrera</strong> y <strong>semestre</strong>. Ejemplo: “4A”.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Periodo</Label>
                  <select
                    className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                    value={createPeriodId}
                    onChange={(e) => setCreatePeriodId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Selecciona...</option>
                    {periods.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}{p.isActive ? " (Activo)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Nombre del grupo</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="4A" disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label>Semestre</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button className="w-full" onClick={create} disabled={loading || !createPeriodId || !createCareerId || !name.trim()}>
                Crear grupo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grupos registrados</CardTitle>
              <CardDescription>{loading ? "Cargando..." : "Filtra, edita o elimina"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Periodo</Label>
                  <select
                    className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                    value={filterPeriodId}
                    onChange={(e) => setFilterPeriodId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Todos</option>
                    {periods.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}{p.isActive ? " (Activo)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

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

                <div className="flex items-end gap-2">
                  <Button variant="secondary" onClick={load} disabled={loading}>
                    Refrescar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterPeriodId("");
                      setFilterCareerId("");
                    }}
                    disabled={loading}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              <div className="overflow-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left p-3">Grupo</th>
                      <th className="text-left p-3">Sem</th>
                      <th className="text-left p-3">Carrera</th>
                      <th className="text-left p-3">Periodo</th>
                      <th className="text-left p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-muted-foreground">
                          Sin grupos
                        </td>
                      </tr>
                    ) : (
                      items.map((g) => (
                        <GroupRowItem
                          key={g._id}
                          g={g}
                          disabled={loading}
                          periods={periods}
                          careers={careers}
                          careerLabelById={careerLabelById}
                          periodLabelById={periodLabelById}
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

function GroupRowItem({
  g,
  disabled,
  periods,
  careers,
  careerLabelById,
  periodLabelById,
  onSave,
  onDelete,
}: {
  g: Group;
  disabled: boolean;
  periods: Period[];
  careers: Career[];
  careerLabelById: (id: string) => string;
  periodLabelById: (id: string) => string;
  onSave: (id: string, patch: Partial<Group>) => Promise<void>;
  onDelete: (id: string, label: string) => Promise<void>;
}) {
  const [name, setName] = React.useState(g.name ?? "");
  const [semester, setSemester] = React.useState<number>(Number(g.semester ?? 1));
  const [periodId, setPeriodId] = React.useState(idOf(g.periodId));
  const [careerId, setCareerId] = React.useState(idOf(g.careerId));

  const canSave = name.trim() && semester >= 1 && !!periodId && !!careerId;

  return (
    <tr className="border-t border-border">
      <td className="p-3 w-44">
        <Input className="h-10" value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
      </td>
      <td className="p-3 w-24">
        <Input
          className="h-10"
          type="number"
          min={1}
          max={20}
          value={semester}
          onChange={(e) => setSemester(Number(e.target.value))}
          disabled={disabled}
        />
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
        <div className="mt-1 text-xs text-muted-foreground">Actual: {careerLabelById(idOf(g.careerId))}</div>
      </td>
      <td className="p-3 min-w-[220px]">
        <select
          className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm"
          value={periodId}
          onChange={(e) => setPeriodId(e.target.value)}
          disabled={disabled}
        >
          <option value="">Selecciona...</option>
          {periods.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}{p.isActive ? " (Activo)" : ""}
            </option>
          ))}
        </select>
        <div className="mt-1 text-xs text-muted-foreground">Actual: {periodLabelById(idOf(g.periodId))}</div>
      </td>
      <td className="p-3">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              onSave(g._id, {
                name: name.trim(),
                semester: Number(semester),
                periodId,
                careerId,
              })
            }
            disabled={disabled || !canSave}
          >
            Guardar
          </Button>
          <Button variant="destructive" onClick={() => onDelete(g._id, g.name)} disabled={disabled}>
            Eliminar
          </Button>
        </div>
      </td>
    </tr>
  );
}
