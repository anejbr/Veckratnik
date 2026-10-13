import { Logo } from '@/components/layout/Logo'

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo className="scale-125" />
      <p className="max-w-md text-lg text-muted-foreground">
        Matematični kvizi za osnovnošolce – vadi poštevanko, večkratnike in še veliko več.
      </p>
    </div>
  )
}
