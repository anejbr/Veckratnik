import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-6xl">🤔</p>
      <h1 className="text-2xl font-bold">Te strani ni</h1>
      <p className="text-muted-foreground">Povezava je morda napačna ali pa stran ne obstaja več.</p>
      <Button asChild>
        <Link to="/">Nazaj na začetek</Link>
      </Button>
    </div>
  )
}
