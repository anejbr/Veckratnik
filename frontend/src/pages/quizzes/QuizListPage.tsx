import { useAuth } from '@/auth/auth-context'

export function QuizListPage() {
  const { user } = useAuth()
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-extrabold">Živjo, {user?.full_name.split(' ')[0]}!</h1>
      <p className="text-muted-foreground">Seznam kvizov pride kmalu.</p>
    </div>
  )
}
