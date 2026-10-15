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
  username: z.string().trim().min(1, 'Vpiši uporabniško ime.'),
  password: z.string().min(1, 'Vpiši geslo.'),
})

type FormValues = z.infer<typeof schema>

export function StudentLoginPage() {
  const login = useAuthMutation<FormValues>('/auth/student/login')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <AuthLayout
      role="student"
      title="Živjo! 👋"
      subtitle="Prijavi se in začni reševati kvize."
      footer={
        <>
          <p>
            Še nimaš računa?{' '}
            <Link to="/registracija/ucenec" className="font-semibold text-primary hover:underline">
              Ustvari ga
            </Link>
          </p>
          <p>
            Si učitelj?{' '}
            <Link to="/prijava/ucitelj" className="font-semibold text-primary hover:underline">
              Prijava za učitelje
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
        <FormField id="username" label="Uporabniško ime" error={errors.username?.message}>
          <Input
            id="username"
            autoComplete="username"
            autoFocus
            className="h-11 text-base"
            aria-invalid={!!errors.username}
            {...register('username')}
          />
        </FormField>
        <FormField id="password" label="Geslo" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            className="h-11 text-base"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </FormField>
        <Button type="submit" size="lg" className="mt-2 h-11 text-base" disabled={login.isPending}>
          {login.isPending ? 'Prijavljam …' : 'Prijava'}
        </Button>
      </form>
    </AuthLayout>
  )
}
