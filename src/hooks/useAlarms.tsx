
import { useQuery } from "@tanstack/react-query";
import { alarmService } from "@/services/alarmService";

export function useAlarms() {
  const { data: alarms = [] } = useQuery({
    queryKey: ["alarms"],
    queryFn: alarmService.getAlarms,
  });

  return { alarms };
}
