
import { useQuery } from "@tanstack/react-query";
import { alarmService } from "@/services/alarmService";
import { toast } from "sonner";

export function useAlarms() {
  const { 
    data: alarms = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["alarms"],
    queryFn: alarmService.getAlarms,
    onError: (error: Error) => {
      console.error("Error fetching alarms:", error);
      toast.error(`Failed to load alarms: ${error.message}`, {
        style: { backgroundColor: 'var(--destructive)', color: 'white' }
      });
    },
  });

  return { 
    alarms, 
    isLoading, 
    isError, 
    error 
  };
}
