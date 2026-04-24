'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { signInSchema, SignInFormData } from '@/lib/validations/auth';
import { LayoutGrid, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const { signIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(data: SignInFormData) {
    try {
      setLoading(true);
      await signIn(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || 'Falha na autenticação');
      } else {
        alert('Ocorreu um erro inesperado');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl border border-border shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-primary/10 rounded-lg mb-4">
            <LayoutGrid className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            StockProject
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestão Multi-tenant de Estoque
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <input
                {...register('email')}
                type="email"
                placeholder="nome@empresa.com"
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-foreground transition-all"
              />
              {errors.email && (
                <p className="text-xs text-primary font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-foreground transition-all"
              />
              {errors.password && (
                <p className="text-xs text-primary font-medium">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-md hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}