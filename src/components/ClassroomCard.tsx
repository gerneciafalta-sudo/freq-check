import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Clock } from "lucide-react";

interface ClassroomCardProps {
  classroom: {
    id: string;
    name: string;
    code: string;
    period: string;
    schedule: string | null;
    max_absences: number;
    total_classes: number;
  };
  onClick: () => void;
}

export const ClassroomCard = ({ classroom, onClick }: ClassroomCardProps) => {
  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 duration-200"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg mb-1">{classroom.name}</h3>
            <p className="text-sm text-muted-foreground">{classroom.period}</p>
          </div>
          <Badge variant="secondary" className="font-mono">
            {classroom.code}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {classroom.schedule && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{classroom.schedule}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{classroom.total_classes} aulas no total</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Máximo de {classroom.max_absences} faltas</span>
        </div>
      </CardContent>
    </Card>
  );
};