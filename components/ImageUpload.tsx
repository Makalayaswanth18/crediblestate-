'use client'

import { useEffect, useRef, useState } from 'react'

type Preview = {
  url: string
  file: File
  originalKb: number
  compressedKb: number
  compressing: boolean
}

const MAX_DIMENSION = 1600   // long edge in px
const JPEG_QUALITY = 0.82
const SKIP_COMPRESS_UNDER_KB = 200  // already small enough, leave alone

export default function ImageUpload({ name = 'images', max = 6 }: { name?: string; max?: number }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<Preview[]>([])

  /**
   * Resize + re-encode a single image. Returns a new File with original name
   * but jpeg content. Falls back to the original file on any failure so the
   * user is never blocked.
   */
  async function compress(file: File): Promise<{ file: File; originalKb: number; compressedKb: number }> {
    const originalKb = Math.round(file.size / 1024)
    if (originalKb < SKIP_COMPRESS_UNDER_KB) {
      return { file, originalKb, compressedKb: originalKb }
    }
    try {
      const bitmap = await createImageBitmap(file)
      const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
      const w = Math.round(bitmap.width * scale)
      const h = Math.round(bitmap.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return { file, originalKb, compressedKb: originalKb }
      ctx.drawImage(bitmap, 0, 0, w, h)
      bitmap.close?.()

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
      })
      if (!blob) return { file, originalKb, compressedKb: originalKb }

      // If we somehow made it bigger (e.g. tiny PNG → JPEG), keep the original.
      if (blob.size >= file.size) return { file, originalKb, compressedKb: originalKb }

      const renamed = file.name.replace(/\.(png|webp|jpe?g)$/i, '.jpg')
      const compressedFile = new File([blob], renamed, { type: 'image/jpeg', lastModified: Date.now() })
      return { file: compressedFile, originalKb, compressedKb: Math.round(compressedFile.size / 1024) }
    } catch {
      return { file, originalKb, compressedKb: originalKb }
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    const accepted = Array.from(files)
      .filter((f) => ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type))
      .filter((f) => f.size <= 25_000_000) // accept up to 25MB raw; we'll compress aggressively
      .slice(0, max - previews.length)

    // First insert placeholders so the UI feels instant; then compress one by one.
    const placeholders: Preview[] = accepted.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      originalKb: Math.round(file.size / 1024),
      compressedKb: 0,
      compressing: true,
    }))
    setPreviews((prev) => [...prev, ...placeholders].slice(0, max))

    for (let i = 0; i < placeholders.length; i++) {
      const p = placeholders[i]
      const { file: compressedFile, originalKb, compressedKb } = await compress(p.file)
      setPreviews((prev) =>
        prev.map((row) =>
          row.url === p.url
            ? { ...row, file: compressedFile, originalKb, compressedKb, compressing: false }
            : row,
        ),
      )
    }
  }

  function remove(idx: number) {
    setPreviews((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[idx].url)
      next.splice(idx, 1)
      return next
    })
  }

  // Sync the previewed (and compressed) files back to the hidden <input> so
  // form-data submission carries the right blobs. Runs as an effect, not during
  // render — keeps lint happy and avoids ref reads during render.
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    const allReady = previews.every((p) => !p.compressing)
    if (!allReady) return
    const dt = new DataTransfer()
    previews.forEach((p) => dt.items.add(p.file))
    el.files = dt.files
  }, [previews])

  const totalSaved = previews.reduce((acc, p) => acc + Math.max(0, p.originalKb - p.compressedKb), 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#4A4238' }}>
          Property photos ({previews.length}/{max})
        </span>
        {totalSaved > 0 && (
          <span style={{ fontSize: '11px', color: '#1E4D35', fontWeight: 600 }}>
            ✓ saved {totalSaved.toLocaleString()} KB on upload
          </span>
        )}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault() }}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #DDD7CF',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          background: '#FAF7F2',
          cursor: 'pointer',
          marginBottom: previews.length > 0 ? '12px' : '0',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#100E0B', marginBottom: '4px' }}>
          {previews.length === 0 ? 'Drop photos here or click to upload' : 'Add more photos'}
        </div>
        <div style={{ fontSize: '12px', color: '#9C9488' }}>
          We&apos;ll automatically resize large photos · up to {max} images
        </div>
        <input
          ref={inputRef}
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {previews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
          {previews.map((p, i) => (
            <div key={p.url} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '10px', overflow: 'hidden', border: '0.5px solid #DDD7CF' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {p.compressing && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#100E0B' }}>
                  Compressing…
                </div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(i) }}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
              {i === 0 && (
                <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: '#B84A1E', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                  COVER
                </span>
              )}
              {!p.compressing && p.compressedKb > 0 && (
                <span style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                  {p.compressedKb} KB
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
