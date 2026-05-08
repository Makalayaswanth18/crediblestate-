'use client';
import { useState } from 'react';
const PROPS = [
  { id:1, name:"Premium 2BHK Hitech City", loc:"Madhapur, Hyderabad", price:22000, type:"rent", beds:2, views:12, emoji:"🏢" },
  { id:2, name:"Luxury Villa with Pool", loc:"Banjara Hills, Hyderabad", price:85000, type:"rent", beds:4, views:4, emoji:"🏡" },
  { id:3, name:"Working Mens PG", loc:"Gachibowli, Hyderabad", price:8500, type:"rent", beds:1, views:24, emoji:"🛏️" },
  { id:4, name:"Independent Studio", loc:"Kondapur, Hyderabad", price:14000, type:"rent", beds:1, views:8, emoji:"🏘️" },
  { id:5, name:"3BHK Gated Community", loc:"Nallagandla, Hyderabad", price:32000, type:"rent", beds:3, views:19, emoji:"🏢" },
  { id:6, name:"4BHK Villa for Sale", loc:"Jubilee Hills, Hyderabad", price:9500000, type:"sale", beds:4, views:11, emoji:"🏡" },
];
export default function Home() {
  const [intent, setIntent] = useState('rent');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState('home');
  const filtered = PROPS.filter(p => p.type === intent && (search==='' || p.loc.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase())));
  const fmt = (p:number, t:string) => t==='rent' ? `₹${p.toLocaleString('en-IN')}/mo` : `₹${(p/100000).toFixed(0)}L`;
  return (
    <div style={{fontFamily:'sans-serif',background:'#FAF7F2',minHeight:'100vh'}}>
      <nav style={{position:'fixed',top:0,left:0,right:0,height:68,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 5vw',zIndex:1000,borderBottom:'1px solid #E5DDD3'}}>
        <div onClick={()=>setPage('home')} style={{fontFamily:'Georgia,serif',fontSize:22,color:'#9C3D18',cursor:'pointer',fontWeight:700}}>Credible<span style={{color:'#1A1A1A'}}>State</span></div>
        <div style={{display:'flex',gap:28,fontWeight:600,fontSize:14}}>
          <span onClick={()=>setPage('home')} style={{cursor:'pointer',color:page==='home'?'#9C3D18':'#4A4238'}}>Search</span>
          <span onClick={()=>setPage('list')} style={{cursor:'pointer',color:page==='list'?'#9C3D18':'#4A4238'}}>List Property</span>
          <span onClick={()=>setPage('dash')} style={{cursor:'pointer',color:page==='dash'?'#9C3D18':'#4A4238'}}>Dashboard</span>
        </div>
        <button onClick={()=>setPage('list')} style={{background:'#9C3D18',color:'#fff',border:'none',padding:'10px 22px',borderRadius:40,fontWeight:700,cursor:'pointer',fontSize:13}}>List Your Property</button>
      </nav>
      {page==='home' && (
        <>
          <section style={{paddingTop:130,paddingBottom:70,textAlign:'center',background:'linear-gradient(180deg,#1a0a04 0%,#2d1208 60%,#FAF7F2 100%)',color:'#fff'}}>
            <div style={{display:'inline-flex',background:'rgba(255,255,255,0.1)',padding:6,borderRadius:40,marginBottom:28,border:'1px solid rgba(255,255,255,0.2)'}}>
              {['rent','sale'].map(t=>(
                <button key={t} onClick={()=>setIntent(t)} style={{border:'none',padding:'10px 28px',borderRadius:30,fontSize:14,fontWeight:600,cursor:'pointer',background:intent===t?'#9C3D18':'transparent',color:intent===t?'#fff':'rgba(255,255,255,0.7)'}}>
                  {t==='rent'?'🏠 Rent':'🏷️ Buy'}
                </button>
              ))}
            </div>
            <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(32px,5vw,60px)',marginBottom:16,lineHeight:1.2}}>Find Your <em style={{color:'#e8845a'}}>Perfect</em><br/>Home in Hyderabad</h1>
            <p style={{color:'rgba(255,255,255,0.7)',marginBottom:36,fontSize:17}}>PGs, Flats, Houses and Villas — verified, direct from owners. Zero brokerage.</p>
            <div style={{maxWidth:680,margin:'0 auto',background:'#fff',padding:8,borderRadius:50,display:'flex',alignItems:'center',boxShadow:'0 20px 40px rgba(0,0,0,0.3)'}}>
              <span style={{padding:'0 14px',fontSize:18}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by area or locality..." style={{flex:1,border:'none',fontSize:15,outline:'none',color:'#1A1A1A',fontFamily:'sans-serif'}}/>
              <button style={{background:'#9C3D18',color:'#fff',border:'none',padding:'13px 28px',borderRadius:40,fontWeight:700,cursor:'pointer',fontSize:14}}>Search →</button>
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:50,marginTop:50,flexWrap:'wrap'}}>
              {[['4,200+','Verified Listings'],['₹0','Brokerage Fee'],['12K+','Happy Tenants'],['48hr','Avg Move-In']].map(([v,l])=>(
                <div key={l} style={{textAlign:'center'}}>
                  <div style={{fontSize:30,fontWeight:700}}>{v}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.6)',marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
          </section>
          <section style={{padding:'44px 5vw'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:26}}>
              <h2 style={{fontFamily:'Georgia,serif',fontSize:24}}>{filtered.length} Verified Properties for {intent==='rent'?'Rent':'Sale'}</h2>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:22}}>
              {filtered.map(p=>(
                <div key={p.id} style={{background:'#fff',borderRadius:18,overflow:'hidden',boxShadow:'0 8px 20px rgba(0,0,0,0.07)',border:'1px solid #E5DDD3',cursor:'pointer',transition:'transform 0.2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-5px)')}
                  onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
                  <div style={{height:190,background:'linear-gradient(135deg,#f0e6e0,#e0f0e6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:55,position:'relative'}}>
                    {p.emoji}
                    <div style={{position:'absolute',top:12,left:12,background:'#fff',padding:'4px 12px',borderRadius:30,fontWeight:700,fontSize:14,boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>{fmt(p.price,p.type)}</div>
                    <div style={{position:'absolute',bottom:10,left:10,background:'#2D5A43',color:'#fff',fontSize:9,fontWeight:700,padding:'3px 8px',borderRadius:5}}>🛡️ VERIFIED</div>
                    <div style={{position:'absolute',top:12,right:12,background:'rgba(0,0,0,0.45)',color:'#fff',fontSize:9,padding:'3px 8px',borderRadius:14}}>👁 {p.views} views</div>
                  </div>
                  <div style={{padding:18}}>
                    <div style={{fontSize:11,color:'#4A4238',marginBottom:3}}>📍 {p.loc}</div>
                    <div style={{fontWeight:700,fontSize:16,marginBottom:10}}>{p.name}</div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:12,color:'#4A4238'}}>🛏 {p.beds} BHK</span>
                      <button style={{background:'#25D366',color:'#fff',border:'none',padding:'7px 14px',borderRadius:18,fontSize:11,fontWeight:700,cursor:'pointer'}}>WhatsApp</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section style={{background:'#1a0a04',color:'#fff',padding:'70px 5vw',textAlign:'center'}}>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:32,marginBottom:12}}>Why CredibleState?</h2>
            <p style={{color:'rgba(255,255,255,0.6)',marginBottom:50}}>We verify every listing before it goes live. No fake properties. Ever.</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:24,maxWidth:860,margin:'0 auto'}}>
              {[['🛡️','Physical Verification','Our team visits every property.'],['💰','Zero Brokerage','Direct owner contact. No fees.'],['⚡','Move in 48hrs','All docs ready digitally.'],['📱','Direct WhatsApp','One click to reach the owner.']].map(([i,t,d])=>(
                <div key={t as string} style={{background:'rgba(255,255,255,0.06)',padding:26,borderRadius:14,border:'1px solid rgba(255,255,255,0.1)'}}>
                  <div style={{fontSize:32,marginBottom:10}}>{i}</div>
                  <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{t as string}</div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,0.6)',lineHeight:1.6}}>{d as string}</div>
                </div>
              ))}
            </div>
          </section>
          <footer style={{background:'#111',color:'rgba(255,255,255,0.55)',padding:'44px 5vw 24px',textAlign:'center'}}>
            <div style={{fontFamily:'Georgia,serif',fontSize:20,color:'#9C3D18',marginBottom:10}}>Credible<span style={{color:'#fff'}}>State</span></div>
            <p style={{fontSize:13,marginBottom:16}}>Hyderabad's only zero-brokerage platform with 100% physical verification.</p>
            <div style={{fontSize:12,borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:20,marginTop:20}}>© 2026 CredibleState. Made with ❤️ in Hyderabad.</div>
          </footer>
        </>
      )}
      {page==='list' && (
        <div style={{paddingTop:110,maxWidth:640,margin:'0 auto',padding:'110px 20px 60px'}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:30,marginBottom:6}}>List Your Property</h2>
          <p style={{color:'#4A4238',marginBottom:32}}>Free listing. Verified badge. Direct tenant contact.</p>
          <div style={{background:'#fff',borderRadius:18,padding:36,boxShadow:'0 8px 20px rgba(0,0,0,0.07)',border:'1px solid #E5DDD3'}}>
            <div style={{display:'grid',gap:16}}>
              {[['Property Title','e.g. 2BHK near Hitech City Metro'],['Locality','e.g. Madhapur, Hyderabad'],['Price (₹)','e.g. 22000'],['Your WhatsApp Number','e.g. 9876543210']].map(([l,ph])=>(
                <div key={l}>
                  <label style={{fontSize:12,fontWeight:700,color:'#4A4238',display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:0.5}}>{l}</label>
                  <input placeholder={ph} style={{width:'100%',padding:'11px 14px',border:'1px solid #E5DDD3',borderRadius:10,fontSize:14,fontFamily:'sans-serif',outline:'none',boxSizing:'border-box'}}/>
                </div>
              ))}
              <div style={{background:'#e8f0ec',border:'1px solid #2D5A43',borderRadius:10,padding:14,fontSize:13,color:'#2D5A43',marginTop:4}}>
                🛡️ Your listing will be verified by our team within 24 hours before going live.
              </div>
              <button onClick={()=>alert('Listing submitted! Our team will verify within 24 hours and contact you on WhatsApp.')} style={{background:'#2D5A43',color:'#fff',border:'none',padding:'14px',borderRadius:12,fontWeight:700,cursor:'pointer',fontSize:15,marginTop:4}}>
                Submit for Verification ✓
              </button>
            </div>
          </div>
        </div>
      )}
      {page==='dash' && (
        <div style={{paddingTop:110,padding:'110px 5vw 60px'}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:30,marginBottom:6}}>Agent Dashboard</h2>
          <p style={{color:'#4A4238',marginBottom:32}}>Your verified listings performance</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:18,marginBottom:36}}>
            {[['1,240','Total Views','#2D5A43'],['45','Enquiries','#2D5A43'],['12','WhatsApp Clicks','#9C3D18'],['3','Active Listings','#9C3D18']].map(([v,l,c])=>(
              <div key={l} style={{background:'#fff',padding:22,borderRadius:14,borderBottom:`4px solid ${c}`,boxShadow:'0 8px 20px rgba(0,0,0,0.07)'}}>
                <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:1,color:'#4A4238',fontWeight:700,marginBottom:6}}>{l}</div>
                <div style={{fontSize:34,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
          <h3 style={{fontWeight:700,fontSize:17,marginBottom:16}}>Your Listings</h3>
          {PROPS.slice(0,3).map(p=>(
            <div key={p.id} style={{background:'#fff',padding:18,borderRadius:14,border:'1px solid #E5DDD3',display:'flex',alignItems:'center',gap:16,marginBottom:12,flexWrap:'wrap'}}>
              <div style={{fontSize:32}}>{p.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15}}>{p.name}</div>
                <div style={{fontSize:12,color:'#4A4238',marginTop:3}}>📍 {p.loc} · {fmt(p.price,p.type)}</div>
              </div>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <span style={{background:'#e8f0ec',color:'#2D5A43',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:18}}>● VERIFIED</span>
                <span style={{fontSize:12,color:'#4A4238'}}>👁 {p.views}</span>
                <button style={{background:'#9C3D18',color:'#fff',border:'none',padding:'7px 14px',borderRadius:18,fontSize:11,fontWeight:700,cursor:'pointer'}}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
