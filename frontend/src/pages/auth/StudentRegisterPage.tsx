import { Controller, useForm } from 'react-hook-form'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { errorMessage } from '@/lib/api'

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const schema = z
  .object({
    full_name: z.string().trim().min(2, 'Vpiši ime in priimek.'),
    username: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9._-]{3,30}$/, 'Od 3 do 30 znakov: črke brez šumnikov, številke ter . _ -'),
    grade: z.string().min(1, 'Izberi razred.'),
    password: z.string().min(6, 'Geslo naj ima vsaj 6 znakov.'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Gesli se ne ujemata.' })

type FormValues = z.infer<typeof schema>
type RegisterBody = { full_name: string; username: string; password: string; grade: number }

export function StudentRegisterPage() {
  const registration = useAuthMutation<RegisterBody>('/auth/student/register')
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { grade: '' } })

  const onSubmit = ({ full_name, username, password, grade }: FormValues) =>
    registration.mutate({ full_name, username, password, grade: Number(grade) })

  return (
    <AuthLayout
      role="student"
      title="Nov račun za učenca"
      subtitle="Izberi uporabniško ime in geslo ter si ju zapiši na varno mesto."
      footer={
        <p>
          Že imaš račun?{' '}
          <Link to="/prijava/ucenec" className="font-semibold text-primary hover:underline">
            Prijavi se
          </Link>
        </p>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {registration.isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(registration.error)}</AlertDescription>
          </Alert>
        )}
        <FormField id="full_name" label="Ime in priimek" error={errors.full_name?.message}>
          <Input id="full_name" autoFocus className="h-11 text-base" aria-invalid={!!errors.full_name} {...register('full_name')} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <FormField id="username" label="Uporabniško ime" error={errors.username?.message}>
            <Input id="username" autoComplete="username" className="h-11 text-base" aria-invalid={!!errors.username} {...register('username')} />
          </FormField>
          <FormField id="grade" label="Razred" error={errors.grade?.message}>
            <Controller
              control={control}
              name="grade"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="grade" className="h-11! w-full text-base" aria-invalid={!!errors.grade}>
                    <SelectValue placeholder="Izberi" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        {g}. razred
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>
        <FormField id="password" label="Geslo" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" className="h-11 text-base" aria-invalid={!!errors.password} {...register('password')} />
        </FormField>
        <FormField id="confirm" label="Ponovi geslo" error={errors.confirm?.message}>
          <PasswordInput id="confirm" autoComplete="new-password" className="h-11 text-base" aria-invalid={!!errors.confirm} {...register('confirm')} />
        </FormField>
        <Button type="submit" size="lg" className="mt-2 h-11 text-base" disabled={registration.isPending}>
          {registration.isPending ? 'Ustvarjam račun …' : 'Ustvari račun'}
        </Button>
      </form>
    </AuthLayout>
  )
}
