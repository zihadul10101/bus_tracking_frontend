import { authService } from "@/src/services/authService";
import { useMutation } from "@tanstack/react-query";


export const useRegister = () => {
  return useMutation({
    mutationFn: (data: any) =>
      authService.registerStudent(data),
  });
};