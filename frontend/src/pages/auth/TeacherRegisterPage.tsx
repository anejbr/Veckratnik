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

const schema = z
  .object({
    full_name: z.string().trim().min(2, 'Vpiši ime in priimek.'),
    email: z.email('Vpiši veljaven e-naslov.'),
    password: z.string().min(8, 'Geslo naj ima vsaj 8 znakov.'),
    confirm: z.string(),
    teacher_code: z.string().trim().min(1, 'Vpiši učiteljsko kodo.'),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Gesli se ne ujemata.' })

type FormValues = z.infer<typeof schema>
type RegisterBody = Omit<FormValues, 'confirm'>

export function TeacherRegisterPage() {
  const registration = useAuthMutation<RegisterBody>('/auth/teacher/register')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <AuthLayout
      role="teacher"
      title="Nov učiteljski račun"
      subtitle="Z učiteljskim računom lahko sestavljaš svoje kvize in spremljaš statistiko."
      footer={
        <p>
          Že imaš račun?{' '}
          <Link to="/prijava/ucitelj" className="font-semibold text-primary hover:underline">
            Prijavi se
          </Link>
        </p>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={handleSubmit(({ confirm: _confirm, ...body }) => registration.mutate(body))}
        noValidate
      >
        {registration.isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(registration.error)}</AlertDescription>
          </Alert>
        )}
        <FormField id="full_name" label="Ime in priimek" error={errors.full_name?.message}>
          <Input id="full_name" autoFocus className="h-11 text-base" aria-invalid={!!errors.full_name} {...register('full_name')} />
        </FormField>
        <FormField id="email" label="E-naslov" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" className="h-11 text-base" aria-invalid={!!errors.email} {...register('email')} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="password" label="Geslo" error={errors.password?.message}>
            <PasswordInput id="password" autoComplete="new-password" className="h-11 text-base" aria-invalid={!!errors.password} {...register('password')} />
          </FormField>
          <FormField id="confirm" label="Ponovi geslo" error={errors.confirm?.message}>
            <PasswordInput id="confirm" autoComplete="new-password" className="h-11 text-base" aria-invalid={!!errors.confirm} {...register('confirm')} />
          </FormField>
        </div>
        <FormField
          id="teacher_code"
          label="Učiteljska koda"
          error={errors.teacher_code?.message}
          hint="Kodo potrebuješ tudi ob vsaki prijavi."
        >
          <PasswordInput id="teacher_code" autoComplete="off" className="h-11 text-base" aria-invalid={!!errors.teacher_code} {...register('teacher_code')} />
        </FormField>
        <Button type="submit" size="lg" className="mt-2 h-11 text-base" disabled={registration.isPending}>
          {registration.isPending ? 'Ustvarjam račun …' : 'Ustvari račun'}
        </Button>
      </form>
    </AuthLayout>
  )
}
