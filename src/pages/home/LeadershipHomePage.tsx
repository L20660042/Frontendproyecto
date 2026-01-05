import { Link } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";

export default function LeadershipHomePage({ title }: { title: string }) {
  return (
    <DashboardLayout title={title}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Panel directivo</CardTitle>
            <CardDescription>Acceso a analítica académica, IA, calidad docente y quejas.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
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
