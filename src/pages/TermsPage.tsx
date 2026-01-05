import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Términos y condiciones</CardTitle>
            <CardDescription>Documento informativo. Sustituye este contenido por el texto oficial de tu institución.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground">
            <p>
              Al utilizar Metricamps, aceptas hacer uso responsable del sistema, proteger tus credenciales y respetar la
              confidencialidad de la información académica.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>No compartas contraseñas ni tokens de acceso.</li>
              <li>La información mostrada es de uso institucional y puede estar sujeta a auditoría.</li>
              <li>Reporta incidentes o errores a la administración del sistema.</li>
            </ul>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button asChild variant="secondary">
                <Link to="/login">Volver al login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
