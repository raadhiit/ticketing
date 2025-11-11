import { useEffect, useRef } from "react";
import { usePage } from "@inertiajs/react";
import toast from "@/libs/toast";

type ToastProp = { message?: string; type?: 'success' | 'error' | 'info' | 'warning' };

export default function ToastListener() {
  const { toast: flash } = usePage().props as {
      toast?: {
          message?: string;
          type?: 'success' | 'error' | 'info' | 'warning';
      };
  };
  useEffect(() => {
      toast.from(flash);
  }, [flash]);
  return null;
}