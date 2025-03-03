
import { toast as sonnerToast } from "sonner";
import { type ToastProps } from "@/components/ui/toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function generateId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type Toast = Omit<ToasterToast, "id">;

export function useToast() {
  function toast({ ...props }: Toast) {
    const id = generateId();

    sonnerToast(props.title, {
      id,
      description: props.description,
      action: props.action,
      className: props.className,
      duration: props.duration,
    });

    return {
      id,
      dismiss: () => sonnerToast.dismiss(id),
      update: (props: ToasterToast) => {
        sonnerToast(props.title || "", {
          id,
          description: props.description,
          action: props.action,
        });
      },
    };
  }

  return {
    toast,
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  };
}
