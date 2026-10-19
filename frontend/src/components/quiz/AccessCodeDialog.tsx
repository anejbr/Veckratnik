import { useState } from 'react'
import { KeyRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type AccessCodeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (code: string) => void
  pending: boolean
  error: string | null
}

export function AccessCodeDialog({ open, onOpenChange, onSubmit, pending, error }: AccessCodeDialogProps) {
  const [code, setCode] = useState('')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (code.trim()) onSubmit(code.trim())
          }}
        >
          <DialogHeader>
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-800">
              <KeyRound className="size-7" />
            </span>
            <DialogTitle className="text-center text-xl">Kviz je zaklenjen</DialogTitle>
            <DialogDescription className="text-center">Vpiši kodo, ki ti jo je povedal učitelj.</DialogDescription>
          </DialogHeader>
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            autoFocus
            autoComplete="off"
            placeholder="KODA"
            aria-label="Koda za dostop"
            aria-invalid={Boolean(error)}
            className="h-14 text-center font-mono text-2xl! font-black tracking-[0.3em]"
          />
          {error && <p className="text-center text-sm font-semibold text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" size="lg" disabled={pending || !code.trim()} className="w-full">
              {pending ? 'Preverjam …' : 'Odkleni in začni'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
