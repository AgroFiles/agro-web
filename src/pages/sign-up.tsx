import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'

const signUpSchema = z.object({
  razonSocial: z.string().min(2, 'La razón social debe tener al menos 2 caracteres'),
  cuit: z.string().regex(/^\d{2}-\d{8}-\d$/, 'Formato: XX-XXXXXXXX-X').optional().or(z.literal('')),
  email: z.string().email('Email inválido'),
  tipo: z.enum(['PRODUCTOR', 'PRESTADOR_DE_SERVICIOS']),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type SignUpForm = z.infer<typeof signUpSchema>

function formatCuit(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
}

export function SignUpPage() {
  const navigate = useNavigate()
  const signup = useAuthStore((state) => state.signup)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { tipo: 'PRODUCTOR' },
  })

  const onSubmit = async (data: SignUpForm) => {
    try {
      await signup({
        email: data.email,
        password: data.password,
        razonSocial: data.razonSocial,
        cuit: data.cuit || undefined,
        tipo: data.tipo,
      })
      toast.success('Cuenta creada exitosamente')
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Error al crear la cuenta'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-field-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo.png" alt="AgroLinks" className="h-28 w-auto object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AgroLinks</h1>
          <p className="text-gray-600">Tu historial clínico del campo</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>Completa tus datos para empezar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="razonSocial">Razón Social / Nombre</Label>
                <Input id="razonSocial" placeholder="Mi Empresa Agropecuaria" {...register('razonSocial')} />
                {errors.razonSocial && <p className="text-sm text-red-500">{errors.razonSocial.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuit">CUIT (opcional)</Label>
                <Controller
                  name="cuit"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="cuit"
                      placeholder="20-12345678-9"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(formatCuit(e.target.value))}
                    />
                  )}
                />
                {errors.cuit && <p className="text-sm text-red-500">{errors.cuit.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de usuario</Label>
                <select
                  id="tipo"
                  {...register('tipo')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="PRODUCTOR">Productor Agropecuario</option>
                  <option value="PRESTADOR_DE_SERVICIOS">Prestador de Servicios</option>
                </select>
                {errors.tipo && <p className="text-sm text-red-500">{errors.tipo.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-center w-full text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/sign-in" className="text-[rgb(var(--primary-500))] hover:text-[rgb(var(--primary-600))] font-medium">
                Inicia sesión
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
