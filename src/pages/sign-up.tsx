import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'

const signUpSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type SignUpForm = z.infer<typeof signUpSchema>

export function SignUpPage() {
  const navigate = useNavigate()
  const signup = useAuthStore((state) => state.signup)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpForm) => {
    try {
      await signup(data.email, data.password, data.name)
      toast.success('Cuenta creada exitosamente')
      navigate('/dashboard')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-field-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo.png" alt="AgroFiles Logo" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AgroFiles</h1>
          <p className="text-gray-600">Tu registro histórico agropecuario</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>
              Completa tus datos para empezar a usar AgroFiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <div className="text-sm text-center text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/sign-in" className="text-[rgb(var(--primary-500))] hover:text-[rgb(var(--primary-600))] font-medium">
                Inicia sesión
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Al crear una cuenta, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  )
}
