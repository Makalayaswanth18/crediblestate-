export default function Loading() {
  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)', padding: '40px 5vw 0', color: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ height: '14px', width: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '24px' }} />
          <div style={{ height: '24px', width: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '14px' }} />
          <div style={{ height: '50px', width: '70%', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px' }} />
          <div style={{ height: '18px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '32px' }} />
          <div style={{ height: '420px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', marginBottom: '-60px' }} />
        </div>
      </section>
      <section style={{ padding: '100px 5vw 80px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(280px,1fr)', gap: '40px' }}>
          <div>
            <div style={{ background: '#fff', height: '120px', borderRadius: '16px', border: '0.5px solid #DDD7CF', marginBottom: '24px' }} />
            <div style={{ background: '#fff', height: '200px', borderRadius: '16px', border: '0.5px solid #DDD7CF', marginBottom: '24px' }} />
            <div style={{ background: '#fff', height: '160px', borderRadius: '16px', border: '0.5px solid #DDD7CF' }} />
          </div>
          <div style={{ background: '#fff', height: '300px', borderRadius: '20px', border: '0.5px solid #DDD7CF' }} />
        </div>
      </section>
    </>
  )
}
