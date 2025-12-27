import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";

type ImportError = {
  row: number;
  message: string | string[];
  data?: any;
};

type ImportResult = {
  entity: "students" | "class-assignments" | "schedule-blocks";
  dryRun: boolean;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ImportError[];
};

type TabKey = "students" | "class-assignments" | "schedule-blocks";

function toMessage(x: any) {
  if (Array.isArray(x)) return x.join(" | ");
  return String(x ?? "");
}

function downloadText(filename: string, content: string, mime = "text/plain;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(v: any) {
  const s = String(v ?? "");
  const needs = /[",\n]/.test(s);
  const cleaned = s.replace(/"/g, '""');
  return needs ? `"${cleaned}"` : cleaned;
}

function downloadErrorsCsv(entity: string, errors: ImportError[]) {
  const headers = ["row", "message", "data_json"];
  const lines = [
    headers.join(","),
    ...errors.map((e) => {
      const row = e.row ?? "";
      const msg = toMessage(e.message);
      const dataJson = e.data ? JSON.stringify(e.data) : "";
      return [row, msg, dataJson].map(escapeCsv).join(",");
    }),
  ].join("\n");

  downloadText(`errores_${entity}.csv`, lines, "text/csv;charset=utf-8;");
}

function templateFor(tab: TabKey) {
  if (tab === "students") {
    // Mínimo: controlNumber,name,careerCode
    // Opcional: status,periodName,groupName
    return {
      filename: "template_students.csv",
      content: [
        "controlNumber,name,careerCode,status,periodName,groupName",
        "20660001,Juan Perez,ISC,active,AGO-DIC 2025,5A",
      ].join("\n"),
      required: ["controlNumber", "name", "careerCode"],
      optional: ["status", "periodName", "groupName"],
      endpoint: "/academic/import/students",
      description:
        "Importa/actualiza alumnos por No. Control. Opcionalmente asigna groupId si envías periodName + groupName.",
    };
  }

  if (tab === "class-assignments") {
    // periodName,careerCode,groupName,subjectCode,teacherEmployeeNumber,status?
    return {
      filename: "template_class_assignments.csv",
      content: [
        "periodName,careerCode,groupName,subjectCode,teacherEmployeeNumber,status",
        "AGO-DIC 2025,ISC,5A,ISC-101,12345,active",
      ].join("\n"),
      required: ["periodName", "careerCode", "groupName", "subjectCode", "teacherEmployeeNumber"],
      optional: ["status"],
      endpoint: "/academic/import/class-assignments",
      description:
        "Importa/actualiza cargas (grupo–materia–docente) por periodo. Hace upsert por (periodo + grupo + materia).",
    };
  }

  // schedule-blocks
  return {
    filename: "template_schedule_blocks.csv",
    content: [
      "periodName,careerCode,groupName,subjectCode,teacherEmployeeNumber,dayOfWeek,startTime,endTime,room",
      "AGO-DIC 2025,ISC,5A,ISC-101,12345,1,07:00,08:00,A-12",
    ].join("\n"),
    required: [
      "periodName",
      "careerCode",
      "groupName",
      "subjectCode",
      "teacherEmployeeNumber",
      "dayOfWeek",
      "startTime",
      "endTime",
    ],
    optional: ["room"],
    endpoint: "/academic/import/schedule-blocks",
    description:
      "Importa/actualiza bloques de horario. Upsert por (periodo + grupo + materia + docente + día + hora inicio/fin).",
  };
}

export default function ImportacionCsvPage() {
  const [tab, setTab] = React.useState<TabKey>("students");
  const meta = React.useMemo(() => templateFor(tab), [tab]);

  const [dryRun, setDryRun] = React.useState(true);
  const [file, setFile] = React.useState<File | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<ImportResult | null>(null);

  const canImport = React.useMemo(() => {
    // Reglas operativas:
    // - Debe existir archivo
    // - Debe haberse validado (result.dryRun=true) y sin failed
    // - Debe estar en el mismo tab/entity
    if (!file) return false;
    if (!result) return false;
    if (!result.dryRun) return false;
    if (result.failed > 0) return false;

    const expectedEntity = tab;
    return result.entity === expectedEntity;
  }, [file, result, tab]);

  const resetForTab = React.useCallback(() => {
    setError("");
    setResult(null);
    setFile(null);
    setDryRun(true);
  }, []);

  React.useEffect(() => {
    resetForTab();
  }, [tab, resetForTab]);

  const submit = async (mode: "validate" | "import") => {
    setError("");
    setLoading(true);

    try {
      if (!file) {
        setError("Selecciona un archivo CSV.");
        return;
      }

      const form = new FormData();
      form.append("file", file);

      const doDryRun = mode === "validate" ? true : false;

      const res = await api.post(meta.endpoint, form, {
        params: { dryRun: doDryRun ? "1" : "0" },
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data as ImportResult);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Error al importar";
      setError(toMessage(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Importación CSV (Control Escolar)">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Centro de importación</CardTitle>
            <CardDescription>
              Flujo recomendado: descarga plantilla → llena CSV → Validar (Dry run) → corregir errores → Importar.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              <Button variant={tab === "students" ? "default" : "secondary"} onClick={() => setTab("students")}>
                Alumnos
              </Button>
              <Button
                variant={tab === "class-assignments" ? "default" : "secondary"}
                onClick={() => setTab("class-assignments")}
              >
                Cargas
              </Button>
              <Button
                variant={tab === "schedule-blocks" ? "default" : "secondary"}
                onClick={() => setTab("schedule-blocks")}
              >
                Horario
              </Button>
            </div>

            {/* Info de columnas */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm font-medium">Descripción</div>
                <div className="text-sm text-muted-foreground">{meta.description}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Columnas requeridas</div>
                <ul className="text-sm text-muted-foreground list-disc pl-5">
                  {meta.required.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Columnas opcionales</div>
                <ul className="text-sm text-muted-foreground list-disc pl-5">
                  {meta.optional.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Button
                variant="secondary"
                onClick={() => downloadText(meta.filename, meta.content, "text/csv;charset=utf-8;")}
              >
                Descargar plantilla CSV
              </Button>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  id="dryRun"
                />
                <Label htmlFor="dryRun">Dry run (recomendado)</Label>
              </div>
            </div>

            {/* File picker */}
            <div className="space-y-2">
              <Label>Archivo CSV</Label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
              <div className="text-sm text-muted-foreground">
                Importante: exporta CSV con separador de coma. Si Excel te genera con “;”, cambia el separador al exportar.
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => submit("validate")}
                disabled={loading || !file}
                variant="secondary"
              >
                Validar (Dry run)
              </Button>

              <Button
                onClick={() => submit("import")}
                disabled={loading || !file || !canImport}
              >
                Importar (Aplicar cambios)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
            <CardDescription>Se muestra el reporte de la última ejecución.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!result ? (
              <div className="text-sm text-muted-foreground">Aún no has validado/importado un archivo.</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-5">
                  <div>
                    <div className="text-sm text-muted-foreground">Modo</div>
                    <div className="font-medium">{result.dryRun ? "Dry run" : "Importación real"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="font-medium">{result.total}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Creados</div>
                    <div className="font-medium">{result.created}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Actualizados</div>
                    <div className="font-medium">{result.updated}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Omitidos</div>
                    <div className="font-medium">{result.skipped}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Fallidos</div>
                    <div className="font-medium">{result.failed}</div>
                  </div>
                </div>

                {result.errors?.length ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium">Errores</div>
                      <Button
                        variant="secondary"
                        onClick={() => downloadErrorsCsv(result.entity, result.errors)}
                      >
                        Descargar errores CSV
                      </Button>
                    </div>

                    <div className="overflow-auto border border-border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="text-left p-3">Fila</th>
                            <th className="text-left p-3">Mensaje</th>
                            <th className="text-left p-3">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.errors.map((e, idx) => (
                            <tr key={idx} className="border-t border-border align-top">
                              <td className="p-3">{e.row}</td>
                              <td className="p-3">{toMessage(e.message)}</td>
                              <td className="p-3">
                                <details>
                                  <summary className="cursor-pointer text-muted-foreground">Ver</summary>
                                  <pre className="mt-2 whitespace-pre-wrap text-xs">
                                    {JSON.stringify(e.data ?? {}, null, 2)}
                                  </pre>
                                </details>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Sin errores.
                    {result.dryRun && result.failed === 0 ? " Puedes proceder a Importar." : null}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
