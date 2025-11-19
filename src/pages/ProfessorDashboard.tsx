import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, getClassrooms, insertClassroom } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GraduationCap, Plus, LogOut, Users, BookOpen } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ClassroomCard } from "@/components/ClassroomCard";

interface Profile {
  name: string;
  user_type: string;
}

interface Classroom {
  id: string;
  name: string;
  code: string;
  period: string;
  schedule: string | null;
  max_absences: number;
  total_classes: number;
}

const ProfessorDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    period: "",
    schedule: "",
    max_absences: 15,
    total_classes: 60,
  });

  useEffect(() => {
    checkAuth();
    loadClassrooms();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await getProfile(session.user.id);

    if (!profileData || profileData.user_type !== "professor") {
      navigate("/aluno");
      return;
    }

    setProfile(profileData);
    setLoading(false);
  };

  const loadClassrooms = async () => {
    const { data, error } = await getClassrooms();

    if (error) {
      toast.error("Erro ao carregar salas");
    } else {
      setClassrooms(data || []);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const code = generateCode();
    
    const { error } = await insertClassroom({
      teacher_id: session.user.id,
      name: formData.name,
      code,
      period: formData.period,
      schedule: formData.schedule || null,
      max_absences: formData.max_absences,
      total_classes: formData.total_classes,
    });

    if (error) {
      toast.error("Erro ao criar sala: " + error.message);
    } else {
      toast.success("Sala criada com sucesso! Código: " + code);
      setDialogOpen(false);
      setFormData({
        name: "",
        period: "",
        schedule: "",
        max_absences: 15,
        total_classes: 60,
      });
      loadClassrooms();
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

  const activeClassrooms = classrooms;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Dashboard do Professor</h1>
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
            title="Salas Ativas"
            value={activeClassrooms.length}
            icon={<BookOpen className="w-5 h-5" />}
            trend="neutral"
          />
          <StatsCard
            title="Total de Alunos"
            value="0"
            icon={<Users className="w-5 h-5" />}
            trend="neutral"
          />
          <StatsCard
            title="Frequência Média"
            value="0%"
            icon={<GraduationCap className="w-5 h-5" />}
            trend="neutral"
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Minhas Salas</h2>
            <p className="text-muted-foreground">Gerencie suas turmas e acompanhe a frequência</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Sala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Sala</DialogTitle>
                <DialogDescription>
                  Preencha os dados da nova turma. Um código único será gerado automaticamente.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClassroom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Disciplina</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Matemática Avançada"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Período Letivo</Label>
                  <Input
                    id="period"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="Ex: 2024.1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Horário (opcional)</Label>
                  <Input
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    placeholder="Ex: Seg/Qua 14:00-16:00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_absences">Máximo de Faltas</Label>
                    <Input
                      id="max_absences"
                      type="number"
                      value={formData.max_absences}
                      onChange={(e) => setFormData({ ...formData, max_absences: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_classes">Total de Aulas</Label>
                    <Input
                      id="total_classes"
                      type="number"
                      value={formData.total_classes}
                      onChange={(e) => setFormData({ ...formData, total_classes: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Criar Sala
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {activeClassrooms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma sala criada</h3>
              <p className="text-muted-foreground mb-4">Crie sua primeira sala para começar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeClassrooms.map((classroom) => (
              <ClassroomCard
                key={classroom.id}
                classroom={classroom}
                onClick={() => navigate(`/sala/${classroom.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfessorDashboard;