import { Copy, Lock } from 'lucide-react'
import { toast } from 'sonner'

export function AccessCodeChip({ code }: { code: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Koda je skopirana.')
    } catch {
      toast.error('Kode ni bilo mogoče skopirati.')
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      title="Kopiraj kodo"
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-900 hover:bg-amber-200"
    >
      <Lock className="size-3" /> {code} <Copy className="size-3 opacity-60" />
    </button>
  )
}
