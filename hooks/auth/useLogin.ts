import { authService } from "@/src/services/authService";
import { useMutation } from "@tanstack/react-query";


export const useLogin = () => {
  return useMutation({
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => authService.login(email, password),
  });
};