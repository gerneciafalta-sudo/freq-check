import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, getEnrollments, getClassroomByCode, insertEnrollment } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BookOpen, LogOut, Plus, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ClassroomCard } from "@/components/ClassroomCard";

interface Profile {
  name: string;
  user_type: string;
}

interface Enrollment {
  id: string;
  classroom: {
    id: string;
    name: string;
    code: string;
    period: string;
    schedule: string | null;
    max_absences: number;
    total_classes: number;
  };
}

const AlunoDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [classroomCode, setClassroomCode] = useState("");

  useEffect(() => {
    checkAuth();
    loadEnrollments();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await getProfile(session.user.id);

    // @ts-expect-error - Temporary until types are regenerated
    if (!profileData || profileData.user_type === "professor") {
      navigate("/professor");
      return;
    }

    setProfile(profileData);
    setLoading(false);
  };

  const loadEnrollments = async () => {
    const { data, error } = await getEnrollments();

    if (error) {
      toast.error("Erro ao carregar salas");
    } else {
      setEnrollments(data || []);
    }
  };

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Find classroom by code
    const { data: classroom, error: classroomError } = await getClassroomByCode(
      classroomCode.toUpperCase()
    );

    if (classroomError || !classroom) {
      toast.error("Código de sala inválido");
      return;
    }

    const { error } = await insertEnrollment({
      // @ts-expect-error - Temporary until types are regenerated
      classroom_id: classroom.id,
      student_id: session.user.id,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("Você já está matriculado nesta sala");
      } else {
        toast.error("Erro ao entrar na sala: " + error.message);
      }
    } else {
      toast.success("Você entrou na sala com sucesso!");
      setDialogOpen(false);
      setClassroomCode("");
      loadEnrollments();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Dashboard do Aluno</h1>
              <p className="text-sm text-muted-foreground">Bem-vindo, {profile?.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <StatsCard
            title="Salas Matriculadas"
            value={enrollments.length}
            icon={<BookOpen className="w-5 h-5" />}
            trend="neutral"
          />
          <StatsCard
            title="Frequência Geral"
            value="0%"
            icon={<AlertTriangle className="w-5 h-5" />}
            trend="neutral"
          />
          <StatsCard
            title="Alertas"
            value="0"
            icon={<AlertTriangle className="w-5 h-5" />}
            trend="neutral"
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Minhas Salas</h2>
            <p className="text-muted-foreground">Acompanhe sua frequência em todas as disciplinas</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Entrar em Sala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Entrar em uma Sala</DialogTitle>
                <DialogDescription>
                  Digite o código da sala fornecido pelo professor
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleJoinClassroom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código da Sala</Label>
                  <Input
                    id="code"
                    value={classroomCode}
                    onChange={(e) => setClassroomCode(e.target.value.toUpperCase())}
                    placeholder="Ex: ABC123"
                    maxLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Entrar na Sala
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma sala encontrada</h3>
              <p className="text-muted-foreground mb-4">Entre em uma sala usando o código fornecido pelo professor</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <ClassroomCard
                key={enrollment.id}
                classroom={enrollment.classroom}
                onClick={() => navigate(`/sala/${enrollment.classroom.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AlunoDashboard;