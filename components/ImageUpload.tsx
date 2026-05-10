'use client'

import { useRef, useState } from 'react'

export default function ImageUpload({ name = 'images', max = 6 }: { name?: string; max?: number }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([])

  function handleFiles(files: FileList | null) {
    if (!files) return
    const accepted = Array.from(files)
      .filter(f => ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type))
      .filter(f => f.size <= 5_242_880)
      .slice(0, max - previews.length)
    const newPreviews = accepted.map(file => ({ url: URL.createObjectURL(file), file }))
    setPreviews(prev => [...prev, ...newPreviews].slice(0, max))
  }

  function remove(idx: number) {
    setPreviews(prev => {
      const next = [...prev]
      URL.revokeObjectURL(next[idx].url)
      next.splice(idx, 1)
      return next
    })
  }

  // Sync the previewed files back to the hidden input when previews change
  // Using DataTransfer to construct a FileList we can attach
  function syncInput() {
    if (!inputRef.current) return
    const dt = new DataTransfer()
    previews.forEach(p => dt.items.add(p.file))
    inputRef.current.files = dt.files
  }

  // Run sync after each render where previews changed
  if (typeof window !== 'undefined') {
    queueMicrotask(syncInput)
  }

  return (
    <div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#4A4238', marginBottom: '6px' }}>
        Property photos ({previews.length}/{max})
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
          JPG, PNG, WebP · max 5 MB each · up to {max} photos
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
