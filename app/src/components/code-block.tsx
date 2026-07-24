import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const COPIED_RESET_MS = 1400

type CodeBlockProps = {
  code: string
  className?: string
  copyable?: boolean
  label?: string
}

export function CodeBlock({ code, className, copyable = true, label = 'code' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Copied to clipboard')
      window.setTimeout(() => setCopied(false), COPIED_RESET_MS)
    } catch {
      toast.error('Could not copy — copy manually')
    }
  }

  return (
    <div
      className={cn(
        'group relative rounded-md border border-border bg-[color-mix(in_srgb,var(--muted),transparent_20%)]',
        className,
      )}
    >
      <pre className="overflow-x-auto p-3 pr-11 font-mono text-[0.8125rem] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
      {copyable && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Copy ${label}`}
          onClick={handleCopy}
          className="absolute right-1.5 top-1.5 size-7 text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      )}
    </div>
  )
}
