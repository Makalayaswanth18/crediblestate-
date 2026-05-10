export default function Loading() {
  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '60px 5vw 80px', color: '#fff', minHeight: '300px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ height: '50px', width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px' }} />
          <div style={{ height: '20px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
        </div>
      </section>
      <section style={{ padding: '64px 5vw', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '24px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '0.5px solid #DDD7CF', overflow: 'hidden' }}>
              <div style={{ height: '200px', background: '#F0EBE3', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ padding: '16px' }}>
                <div style={{ height: '18px', width: '80%', background: '#F0EBE3', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ height: '14px', width: '50%', background: '#F0EBE3', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.6 } }`}</style>
      </section>
    </>
  )
}
