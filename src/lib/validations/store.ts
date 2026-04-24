import { z } from 'zod';

export const storeSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  city: z.string().min(2, { message: 'Informe a cidade' }),
  state: z.string().length(2, { message: 'Use a sigla do estado (Ex: SP)' }).transform(v => v.toUpperCase()),
  zipCode: z.string()
    .min(8, { message: 'CEP incompleto' })
    .max(9, { message: 'CEP inválido' })
    .transform(v => v.replace(/\D/g, '')),
});

export type StoreFormData = z.infer<typeof storeSchema>;