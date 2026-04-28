'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { LayoutGrid, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

import { signUpSchema, SignUpFormData } from '@/lib/validations/auth';
import { signUpService } from '@/services/auth/signUpService';
import { useAuth } from '@/hooks/useAuth'; 
import { isAxiosError } from 'axios';

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(data: SignUpFormData) {
    try {
      setLoading(true);
      await signUpService.register(data);
      
      await signIn({ email: data.email, password: data.password });
      
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Erro ao criar conta. Verifique os dados e tente novamente.');
      } 
      else if (error instanceof Error) {
        alert(error.message);
      } 
      else {
        alert('Ocorreu um erro inesperado ao tentar criar a conta.');
      }
      
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-500 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-125 h-125 rounded-full bg-blue-600 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="p-2 bg-amber-500 rounded-lg">
            <LayoutGrid className="w-6 h-6 text-slate-950" />
          </div>
          <span className="text-xl font-bold tracking-tight">StockProject</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold leading-tight mb-6">
            O controle total do seu negócio começa aqui.
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              <p className="text-slate-300">Gestão Multi-tenant inteligente</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              <p className="text-slate-300">Auditoria completa e segurança (RBAC)</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-slate-500">
            © 2026 Denis Eduardo da Silva.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Criar Conta
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Cadastre-se para iniciar a gestão do seu estoque.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nome Completo</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="João da Silva"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all dark:text-white"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">E-mail Comercial</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="nome@empresa.com"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all dark:text-white"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Senha</label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all dark:text-white"
                />
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Criar minha conta <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Já possui uma conta?{' '}
            <Link href="/auth/signin" className="font-semibold text-amber-500 hover:text-amber-600 transition-colors">
              Fazer login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}