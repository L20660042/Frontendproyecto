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
  semester: number;     // normalizado
  periodId: any;        // puede venir string u objeto poblado
  careerId: any;        // puede venir string u objeto poblado
};

function idOf(v: any): string {
  if (!v) return "";
  return typeof v === "string" ? v : v._id;
}

function parseSemesterFromAny(g: any): number {
  const raw =
    g?.semester ??
    g?.semestre ??
    g?.semesterNumber ??
    g?.semester_no ??
    g?.semester_index;

  const n =
    typeof raw === "number"
      ? raw
      : Number(String(raw ?? "").trim());

  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function normalizeGroup(g: any): Group {
  return {
    _id: String(g?._id ?? ""),
    name: String(g?.name ?? ""),
    semester: parseSemesterFromAny(g),
    periodId: g?.periodId ?? g?.period ?? g?.period_id ?? null,
    careerId: g?.careerId ?? g?.career ?? g?.career_id ?? null,
  };
}

function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl">
          <div className="p-5 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">{title}</div>
                {description ? <div className="text-sm text-muted-foreground mt-1">{description}</div> : null}
              </div>
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
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

  // modal crear
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createPeriodId, setCreatePeriodId] = React.useState("");
  const [createCareerId, setCreateCareerId] = React.useState("");
  const [createName, setCreateName] = React.useState("");
  const [createSemester, setCreateSemester] = React.useState<string>("1");

  const loadCombos = React.useCallback(async () => {
    setError("");
    try {
      const [p, c] = await Promise.all([api.get("/academic/periods"), api.get("/academic/careers")]);
      const pList: Period[] = p.data ?? [];
      const cList: Career[] = c.data ?? [];

      setPeriods(pList);
      setCareers(cList);

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
      const list = (res.data ?? []).map(normalizeGroup);
      setItems(list);
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
    if (!createName.trim()) return setError("Nombre del grupo requerido.");

    const semNum = Number(createSemester);
    if (!Number.isFinite(semNum) || semNum < 1) return setError("Semestre inválido.");

    setLoading(true);
    try {
      await api.post("/academic/groups", {
        name: createName.trim(),
        semester: semNum,
        periodId: createPeriodId,
        careerId: createCareerId,
      });

      setCreateName("");
      setCreateSemester("1");
      setCreateOpen(false);
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

        {/* Barra superior */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de grupos</CardTitle>
            <CardDescription>Filtra, crea y administra grupos (periodo, carrera y semestre).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 lg:max-w-3xl">
                <div className="space-y-2">
                  <Label>Periodo</Label>
                  <select
                    className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground"
                    value={filterPeriodId}
                    onChange={(e) => setFilterPeriodId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Todos</option>
                    {periods.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                        {p.isActive ? " (Activo)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Carrera</Label>
                  <select
                    className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground"
                    value={filterCareerId}
                    onChange={(e) => setFilterCareerId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Todas</option>
                    {careers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
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
                <Button onClick={() => setCreateOpen(true)} disabled={loading}>
                  Nuevo grupo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos registrados</CardTitle>
            <CardDescription>{loading ? "Cargando..." : `${items.length} registro(s)`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm min-w-[980px]">
                <thead className="bg-muted/60">
                  <tr className="[&>th]:p-3 [&>th]:text-left">
                    <th className="w-[220px]">Grupo</th>
                    <th className="w-[120px]">Semestre</th>
                    <th className="w-[320px]">Carrera</th>
                    <th className="w-[280px]">Periodo</th>
                    <th className="w-[220px]">Acciones</th>
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

            <div className="mt-3 text-xs text-muted-foreground">
              Nota: si tu backend manda el semestre con otro nombre (ej. <code>semestre</code> o <code>semesterNumber</code>),
              aquí ya se normaliza para que no quede en blanco.
            </div>
          </CardContent>
        </Card>

        {/* Modal crear */}
        <Modal
          open={createOpen}
          title="Nuevo grupo"
          description="Define un grupo por periodo, carrera y semestre. Ejemplo: 4A."
          onClose={() => setCreateOpen(false)}
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Periodo</Label>
                <select
                  className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground"
                  value={createPeriodId}
                  onChange={(e) => setCreatePeriodId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecciona...</option>
                  {periods.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                      {p.isActive ? " (Activo)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Carrera</Label>
                <select
                  className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground"
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre del grupo</Label>
                <Input
                  className="h-11"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="4A"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label>Semestre</Label>
                <Input
                  className="h-11"
                  type="number"
                  min={1}
                  max={20}
                  value={createSemester}
                  onChange={(e) => setCreateSemester(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button
                onClick={create}
                disabled={loading || !createPeriodId || !createCareerId || !createName.trim()}
              >
                Crear grupo
              </Button>
            </div>
          </div>
        </Modal>
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
  const [semester, setSemester] = React.useState<string>(String(g.semester ?? 1));
  const [periodId, setPeriodId] = React.useState(idOf(g.periodId));
  const [careerId, setCareerId] = React.useState(idOf(g.careerId));

  const semNum = Number(semester);
  const canSave =
    !!name.trim() &&
    Number.isFinite(semNum) &&
    semNum >= 1 &&
    !!periodId &&
    !!careerId;

  return (
    <tr className="border-t border-border align-top">
      <td className="p-3">
        <Input className="h-10" value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
      </td>

      <td className="p-3">
        <Input
          className="h-10 w-[110px]"
          type="number"
          min={1}
          max={20}
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          disabled={disabled}
        />
        <div className="mt-1 text-xs text-muted-foreground">
          Actual: {String(g.semester ?? 1)}
        </div>
      </td>

      <td className="p-3">
        <select
          className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground"
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

      <td className="p-3">
        <select
          className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground"
          value={periodId}
          onChange={(e) => setPeriodId(e.target.value)}
          disabled={disabled}
        >
          <option value="">Selecciona...</option>
          {periods.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
              {p.isActive ? " (Activo)" : ""}
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
                semester: semNum,
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
