'use client'

import { track } from '@vercel/analytics'

/**
 * Anchor that fires a Vercel Analytics custom event when clicked.
 * Use for tracking conversion actions like WhatsApp clicks, external visits, etc.
 *
 * Example:
 *   <TrackedAnchor event="whatsapp_clicked" payload={{ property_id: p.id, location: 'card' }} href="..." target="_blank">
 *     WhatsApp
 *   </TrackedAnchor>
 */
export default function TrackedAnchor({
  event,
  payload,
  onClick,
  ...rest
}: {
  event: string
  payload?: Record<string, string | number | boolean>
} & React.ComponentProps<'a'>) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        try {
          // Filter out unsupported value types just in case
          const clean: Record<string, string | number | boolean | null> = {}
          for (const [k, v] of Object.entries(payload ?? {})) {
            if (v == null) continue
            clean[k] = v
          }
          track(event, clean)
        } catch {
          // analytics failures must never block the click
        }
        onClick?.(e)
      }}
    />
  )
}
