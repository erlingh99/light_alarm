
import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { AlarmForm } from "@/components/AlarmForm";
import { Alarm, IntensityCurve, RecurrencePattern } from "@/types/alarm";

interface AlarmHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingAlarm: Alarm | null;
  setEditingAlarm: (alarm: Alarm | null) => void;
  onSubmit: (data: {
    name: string;
    time: string;
    color: string;
    length: number;
    intensityCurve: IntensityCurve;
    recurrence: RecurrencePattern;
  }) => void;
}

export const AlarmHeader: React.FC<AlarmHeaderProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  editingAlarm,
  setEditingAlarm,
  onSubmit
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Alarms</h1>
        <p className="text-muted-foreground mt-2">Schedule and manage your alarms</p>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingAlarm(null)}
              className="bg-sage hover:bg-sage-light transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Alarm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAlarm ? "Edit Alarm" : "Create New Alarm"}
              </DialogTitle>
            </DialogHeader>
            <AlarmForm
              onSubmit={onSubmit}
              initialData={editingAlarm || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
