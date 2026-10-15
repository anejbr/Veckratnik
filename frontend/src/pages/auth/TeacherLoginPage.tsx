import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { useAuthMutation } from '@/components/auth/useAuthMutation'
import { FormField } from '@/components/form/FormField'
import { PasswordInput } from '@/components/form/PasswordInput'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { errorMessage } from '@/lib/api'

const schema = z.object({
  email: z.string().trim().min(1, 'Vpiši e-naslov.'),
  password: z.string().min(1, 'Vpiši geslo.'),
  teacher_code: z.string().trim().min(1, 'Vpiši učiteljsko kodo.'),
})

type FormValues = z.infer<typeof schema>

export function TeacherLoginPage() {
  const login = useAuthMutation<FormValues>('/auth/teacher/login')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <AuthLayout
      role="teacher"
      title="Prijava za učitelje"
      subtitle="Za vstop potrebuješ še učiteljsko kodo šole."
      footer={
        <>
          <p>
            Nov učitelj?{' '}
            <Link to="/registracija/ucitelj" className="font-semibold text-primary hover:underline">
              Ustvari učiteljski račun
            </Link>
          </p>
          <p>
            Si učenec?{' '}
            <Link to="/prijava/ucenec" className="font-semibold text-primary hover:underline">
              Prijava za učence
            </Link>
          </p>
        </>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit((values) => login.mutate(values))} noValidate>
        {login.isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(login.error)}</AlertDescription>
          </Alert>
        )}
        <FormField id="email" label="E-naslov" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" autoFocus className="h-11 text-base" aria-invalid={!!errors.email} {...register('email')} />
        </FormField>
        <FormField id="password" label="Geslo" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" className="h-11 text-base" aria-invalid={!!errors.password} {...register('password')} />
        </FormField>
        <FormField
          id="teacher_code"
          label="Učiteljska koda"
          error={errors.teacher_code?.message}
          hint="Kodo dobiš pri skrbniku aplikacije na šoli."
        >
          <PasswordInput id="teacher_code" autoComplete="off" className="h-11 text-base" aria-invalid={!!errors.teacher_code} {...register('teacher_code')} />
        </FormField>
        <Button type="submit" size="lg" className="mt-2 h-11 text-base" disabled={login.isPending}>
          {login.isPending ? 'Prijavljam …' : 'Prijava'}
        </Button>
      </form>
    </AuthLayout>
  )
}
