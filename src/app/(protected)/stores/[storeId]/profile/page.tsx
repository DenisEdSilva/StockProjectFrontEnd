'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { User, ShieldCheck, Loader2, Save } from "lucide-react"

import { userService } from "@/services/user/user"
import { useAuth } from "@/hooks/useAuth"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const profileSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const { storeId } = useParams()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: userService.getUserProfile,
  })

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || "",
      email: profile?.email || "",
    }
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (user?.type === 'OWNER') {
        return userService.updateUserProfile(user.id, data)
      } else {
        return userService.updateStoreUserProfile(Number(storeId), data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      alert("Perfil atualizado com sucesso!")
    },
    onError: () => {
      alert("Erro ao atualizar perfil. Verifique os dados.")
    }
  })

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-100">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Meu Perfil</h1>
        <p className="text-slate-500">Gerencie suas informações pessoais e segurança da conta.</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 p-1 text-slate-400 border border-slate-800">
          <TabsTrigger value="personal" className="data-[state=active]:bg-slate-800">
            <User className="w-4 h-4 mr-2" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-slate-800">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="bg-slate-900 border-slate-800">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <CardHeader>
                <CardTitle className="text-slate-100">Informações Básicas</CardTitle>
                <CardDescription>Atualize seu nome de exibição e endereço de e-mail.</CardDescription>
                <div className="flex items-center gap-4 py-4 mb-4 border-b border-slate-800/50">
                    <div className="h-16 w-16 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xl">
                        {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-200">Foto de Perfil</h3>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Nome Completo</Label>
                  <Input 
                    id="name" 
                    {...profileForm.register("name")} 
                    className="bg-slate-950 border-slate-800 focus:border-amber-500 text-slate-100"
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-red-500">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email"
                    {...profileForm.register("email")} 
                    className="bg-slate-950 border-slate-800 focus:border-amber-500 text-slate-100"
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-xs text-red-500">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-800 mt-6 pt-6">
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-slate-900 border-slate-800">
            <form onSubmit={passwordForm.handleSubmit((data) => console.log(data))}>
              <CardHeader>
                <CardTitle className="text-slate-100">Alterar Senha</CardTitle>
                <CardDescription>Certifique-se de usar uma senha forte para proteger sua conta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current" className="text-slate-300">Senha Atual</Label>
                  <Input 
                    id="current" 
                    type="password"
                    {...passwordForm.register("currentPassword")}
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new" className="text-slate-300">Nova Senha</Label>
                  <Input 
                    id="new" 
                    type="password"
                    {...passwordForm.register("newPassword")}
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-slate-300">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirm" 
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-800 mt-6 pt-6">
                <Button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold">
                  Atualizar Senha
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}