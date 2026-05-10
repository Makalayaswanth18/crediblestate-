export default function Loading() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 20px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#E8732F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Loading verified listings…</p>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
