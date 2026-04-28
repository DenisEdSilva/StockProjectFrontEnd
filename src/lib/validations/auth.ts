import * as z from 'zod';

export const signInSchema = z.object({
  email: z.email({ message: 'Insira um e-mail válido'}),
  password: z.string().min(6, { message:'A senha deve ter pelo menos 6 caracteres' }),
});

export const signUpSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').trim(),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, 
      'A senha precisa de letras maiúsculas, minúsculas e números'
    ),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;