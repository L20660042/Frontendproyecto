import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Button } from "../../components/button";
import { Alert, AlertDescription } from "../../components/alert";

type ImportEntity =
  | "periods"
  | "careers"
  | "subjects"
  | "teachers"
  | "groups"
  | "students"
  | "class-assignments"
  | "enrollments"
  | "schedule-blocks"
  | "activities"
  | "activity-enrollments"
  | "evaluations"
  | "complaints";

type ImportResult = {
  entity: ImportEntity | string;
  // Backend (Nest) devuelve "total" (no "totalRows").
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  // Para /feedback/import/process-pending
  processed?: number;
  errors: Array<{ row: number; message: string; data?: any }>;
};

type TabKey =
  | "periods"
  | "careers"
  | "subjects"
  | "teachers"
  | "groups"
  | "students"
  | "class-assignments"
  | "enrollments"
  | "activities"
  | "schedule-blocks"
  | "activity-enrollments"
  | "feedback-evaluations"
  | "feedback-complaints"
  | "feedback-process-ai";

function templateFor(tab: TabKey) {
  switch (tab) {
    case "periods":
      return `name,startDate,endDate,isActive
Ene-Jun 2026,2026-01-06,2026-06-30,true
`;
    case "careers":
      return `code,name,status
ISC,Ingeniería en Sistemas Computacionales,active
`;
    case "subjects":
      return `code,name,semester,careerCode,status
ISC-101,Fundamentos de Programación,1,ISC,active
`;
    case "teachers":
      return `employeeNumber,name,status
10001,Juan Pérez,active
`;
    case "groups":
      return `periodName,careerCode,name,semester,status
Ene-Jun 2026,ISC,1A,1,active
`;
    case "students":
      return `controlNumber,name,careerCode,status,periodName,groupName
20660001,Ana López,ISC,active,Ene-Jun 2026,1A
`;
    case "class-assignments":
      return `periodName,careerCode,groupName,subjectCode,teacherEmployeeNumber,status
Ene-Jun 2026,ISC,1A,ISC-101,10001,active
`;
    case "enrollments":
      return `periodName,studentControlNumber,careerCode,groupName,status
Ene-Jun 2026,20660001,ISC,1A,active
`;
    case "activities":
      return `periodName,name,type,responsibleName,capacity,status
Ene-Jun 2026,Club de Programación,club,Mtro. Juan Pérez,30,active
`;
    case "schedule-blocks":
      return `periodName,type,careerCode,groupName,subjectCode,teacherEmployeeNumber,activityName,dayOfWeek,startTime,endTime,room,deliveryMode
Ene-Jun 2026,class,ISC,1A,ISC-101,10001,,1,07:00,08:00,LAB-1,presencial
Ene-Jun 2026,extracurricular,,,,,Club de Programación,2,13:00,14:00,LAB-1,presencial
`;
    case "activity-enrollments":
      return `periodName,activityName,studentControlNumber,status
Ene-Jun 2026,Club de Programación,20660001,active
`;
    case "feedback-evaluations":
      return `periodName,careerCode,groupName,subjectCode,teacherEmployeeNumber,studentControlNumber,clarity,punctuality,respect,planning,evaluation,comment
Ene-Jun 2026,ISC,1A,ISC-101,10001,20660001,5,5,5,4,5,Explica con claridad y resuelve dudas.
`;
    case "feedback-complaints":
      return `periodName,careerCode,groupName,subjectCode,teacherEmployeeNumber,studentControlNumber,category,description
Ene-Jun 2026,ISC,1A,ISC-102,10003,20660002,impuntualidad,Llega tarde con frecuencia y no recupera el tiempo.
`;
    default:
      return "";
  }
}

const CONFIG: Record<
  Exclude<TabKey, "feedback-process-ai">,
  { title: string; endpoint: string; entity: string; description: string }
> = {
  periods: {
    title: "Periodos",
    endpoint: "/academic/import/periods",
    entity: "periods",
    description: "Importa periodos (name, startDate, endDate, isActive).",
  },
  careers: {
    title: "Carreras",
    endpoint: "/academic/import/careers",
    entity: "careers",
    description: "Importa carreras (code, name, status).",
  },
  subjects: {
    title: "Materias",
    endpoint: "/academic/import/subjects",
    entity: "subjects",
    description: "Importa materias (code, name, semester, careerCode, status).",
  },
  teachers: {
    title: "Docentes",
    endpoint: "/academic/import/teachers",
    entity: "teachers",
    description: "Importa docentes (employeeNumber, name, status).",
  },
  groups: {
    title: "Grupos",
    endpoint: "/academic/import/groups",
    entity: "groups",
    description: "Importa grupos (periodName, careerCode, name, semester, status).",
  },
  students: {
    title: "Alumnos",
    endpoint: "/academic/import/students",
    entity: "students",
    description: "Importa alumnos (controlNumber, name, careerCode, status, periodName, groupName).",
  },
  "class-assignments": {
    title: "Cargas",
    endpoint: "/academic/import/class-assignments",
    entity: "class-assignments",
    description: "Importa cargas (periodName, careerCode, groupName, subjectCode, teacherEmployeeNumber, status).",
  },
  enrollments: {
    title: "Inscripción por grupo (periodo)",
    endpoint: "/academic/import/enrollments",
    entity: "enrollments",
    description: "Inscribe alumno a su grupo base y sincroniza sus CourseEnrollments.",
  },
  activities: {
    title: "Actividades extraescolares",
    endpoint: "/academic/import/activities",
    entity: "activities",
    description: "Importa actividades (periodName, name, type, responsibleName, capacity, status).",
  },
  "schedule-blocks": {
    title: "Horario (clases + extraescolares)",
    endpoint: "/academic/import/schedule-blocks",
    entity: "schedule-blocks",
    description:
      "Importa bloques. Para clases usa type=class + group/subject/teacher; para extraescolares usa type=extracurricular + activityName.",
  },
  "activity-enrollments": {
    title: "Inscripción a actividades",
    endpoint: "/academic/import/activity-enrollments",
    entity: "activity-enrollments",
    description:
      "Inscribe alumnos a actividades (valida choques por alumno al activar).",
  },
  "feedback-evaluations": {
    title: "Evaluaciones (Feedback)",
    endpoint: "/feedback/import/evaluations",
    entity: "evaluations",
    description: "Importa evaluaciones con ratings + comment (texto para IA).",
  },
  "feedback-complaints": {
    title: "Quejas (Feedback)",
    endpoint: "/feedback/import/complaints",
    entity: "complaints",
    description: "Importa quejas (category + description) para IA.",
  },
};

export default function ImportacionCsvPage() {
  const [tab, setTab] = React.useState<TabKey>("periods");
  const [file, setFile] = React.useState<File | null>(null);
  const [dryRun, setDryRun] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<ImportResult | null>(null);

  // Procesar IA pendientes
  const [aiLimit, setAiLimit] = React.useState<number>(200);

  const cfg = tab === "feedback-process-ai" ? null : CONFIG[tab];

  function downloadTemplate() {
    const content = templateFor(tab);
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleUpload() {
    setError("");
    setResult(null);

    if (tab === "feedback-process-ai") {
      setLoading(true);
      try {
        // El backend recibe limit como query param.
        const res = await api.post(`/feedback/import/process-pending`, {}, { params: { limit: aiLimit } });
        // respuesta: { processed: number }
        setResult({
          entity: "process-pending",
          total: 0,
          created: 0,
          updated: 0,
          skipped: 0,
          failed: 0,
          errors: [],
          processed: Number(res.data?.processed ?? 0),
        } as any);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al procesar pendientes IA");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!cfg) return;
    if (!file) {
      setError("Selecciona un archivo CSV.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await api.post(cfg.endpoint + (dryRun ? "?dryRun=true" : ""), form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error en importación");
    } finally {
      setLoading(false);
    }
  }

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "periods", label: "Periodos" },
    { key: "careers", label: "Carreras" },
    { key: "subjects", label: "Materias" },
    { key: "teachers", label: "Docentes" },
    { key: "groups", label: "Grupos" },
    { key: "students", label: "Alumnos" },
    { key: "class-assignments", label: "Cargas" },
    { key: "enrollments", label: "Inscripción grupo" },
    { key: "activities", label: "Actividades" },
    { key: "schedule-blocks", label: "Horario" },
    { key: "activity-enrollments", label: "Inscripción actividades" },
    { key: "feedback-evaluations", label: "Evaluaciones (IA)" },
    { key: "feedback-complaints", label: "Quejas (IA)" },
    { key: "feedback-process-ai", label: "Procesar IA" },
  ];

  return (
    <DashboardLayout title="Importación CSV">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "secondary"}
            onClick={() => {
              setTab(t.key);
              setFile(null);
              setResult(null);
              setError("");
            }}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab !== "feedback-process-ai" && cfg ? (
        <div className="mb-4 rounded-lg border border-border p-4">
          <div className="text-sm font-medium">{cfg.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{cfg.description}</div>

          <div className="mt-4 grid gap-3">
            <label className="text-sm font-medium">Archivo CSV</label>

            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".csv,text/csv"
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-muted/80"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {file ? (
              <div className="text-xs text-muted-foreground">
                Archivo: <span className="font-medium">{file.name}</span>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                />
                Dry run (no guarda)
              </label>

              <Button variant="secondary" onClick={downloadTemplate}>
                Descargar plantilla
              </Button>

              <Button onClick={handleUpload} disabled={loading}>
                {loading ? "Importando..." : "Importar"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-border p-4">
          <div className="text-sm font-medium">Procesar pendientes IA</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Procesa evaluaciones/quejas pendientes llamando al microservicio IA (HuggingFace) y guardando análisis.
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-sm font-medium">Límite</label>
              <input
                className="mt-1 h-11 w-40 rounded-md border border-border bg-background px-3 text-sm"
                type="number"
                min={1}
                value={aiLimit}
                onChange={(e) => setAiLimit(Number(e.target.value))}
              />
            </div>

            <Button onClick={handleUpload} disabled={loading}>
              {loading ? "Procesando..." : "Procesar ahora"}
            </Button>
          </div>
        </div>
      )}

      {result ? (
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm font-medium">Resultado</div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm md:grid-cols-5">
            <div>Entidad: <b>{String(result.entity)}</b></div>
            <div>Total: <b>{result.total ?? 0}</b></div>
            <div>Creados: <b>{result.created ?? 0}</b></div>
            <div>Actualizados: <b>{result.updated ?? 0}</b></div>
            <div>Fallidos: <b>{result.failed ?? 0}</b></div>
            {typeof (result as any).processed === "number" ? (
              <div>Procesados IA: <b>{(result as any).processed}</b></div>
            ) : null}
          </div>

          {Array.isArray((result as any).errors) && (result as any).errors.length ? (
            <div className="mt-4">
              <div className="text-sm font-medium">Errores</div>
              <div className="mt-2 max-h-80 overflow-auto rounded-md border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2">Fila</th>
                      <th className="p-2">Mensaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result as any).errors.map((e: any, idx: number) => (
                      <tr key={idx} className="border-t border-border">
                        <td className="p-2">{e.row}</td>
                        <td className="p-2">{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </DashboardLayout>
  );
}
