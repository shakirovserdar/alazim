/* Al Azim — application handler
   1) e-mails the application (with documents) via Resend
   2) auto-creates the application in AgentsCRM agent portal
   Env vars (Vercel → Settings → Environment Variables):
     RESEND_API_KEY      — from resend.com (required for e-mail)
     BASVURU_EMAIL       — where applications arrive (default below)
     RESEND_FROM         — verified sender, e.g. "Al Azim <basvuru@alazimdanismanlik.com>"
     AGENTPORTAL_TOKEN   — AgentsCRM API token (optional; skips portal if missing)
     AGENTPORTAL_URL     — default https://agentportal-apply.com
*/

const LEVEL_MAP = { 'Lisans':'bachelor', 'Önlisans':'diploma', 'Yüksek Lisans':'master', 'Doktora':'phd' };
const DOC_LABEL = { passport:'Pasaport', diploma:'Lise Diploması', transcript:'Transkript', photo:'Biyometrik Foto', other:'Diğer' };

function esc(s){ return String(s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function emailHtml(p){
  const row=(k,v)=>v?`<tr><td style="padding:7px 14px;color:#8a8375;font-size:13px;white-space:nowrap">${k}</td><td style="padding:7px 14px;color:#1c1c1c;font-size:14px;font-weight:600">${esc(v)}</td></tr>`:'';
  const sec=t=>`<tr><td colspan="2" style="padding:16px 14px 6px;color:#a8801f;font-size:12px;letter-spacing:.12em;font-weight:700">${t}</td></tr>`;
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e8e2d4;border-radius:12px;overflow:hidden">
  <div style="background:#0a0a0c;padding:22px 26px">
    <div style="color:#d4af6a;font-size:11px;letter-spacing:.3em;font-weight:700">AL AZIM CONSULTING</div>
    <div style="color:#fff;font-size:21px;font-weight:700;margin-top:6px">Yeni Başvuru — ${esc(p.university)}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;background:#fbf9f4">
    ${sec('BAŞVURU')}
    ${row('Üniversite',p.university)}${row('Program Türü',p.degree)}${row('Eğitim Dili',p.language)}${row('Dönem',p.semester)}
    ${row('1. Tercih',p.p1)}${row('2. Tercih',p.p2)}${row('3. Tercih',p.p3)}
    ${sec('ÖĞRENCİ')}
    ${row('Ad Soyad',p.name+' '+p.surname)}${row('Baba Adı',p.father)}${row('Anne Adı',p.mother)}
    ${row('Doğum Tarihi',p.dob)}${row('Cinsiyet',p.gender)}${row('E-posta',p.email)}${row('Telefon',p.phone)}
    ${row('Vatandaşlık',p.nationality)}${row('İkamet',p.residence)}${row('Pasaport No',p.passport)}
    ${sec('EĞİTİM')}
    ${row('Durum',p.grad)}${row('Okul',p.school)}${row('Not',p.gpa)}
    ${p.notes?sec('EK NOT')+row('Not',p.notes):''}
    ${sec('BELGELER')}
    ${row('Ekler',(p.files&&p.files.length)?p.files.map(f=>`${DOC_LABEL[f.doc]||f.doc}: ${f.name}`).join(' · '):'Belge yüklenmedi — WhatsApp/e-posta ile gelecek')}
    ${row('Portal',p._portalResult||'—')}
  </table>
  <div style="background:#f1ece0;padding:12px 26px;color:#8a8375;font-size:12px">alazimdanismanlik.com başvuru formu · dil: ${esc(p.lang)}</div>
</div>`;
}

async function sendMail(p){
  const key=process.env.RESEND_API_KEY;
  if(!key) return {ok:false,skip:true};
  const to=(process.env.BASVURU_EMAIL||'alazimdanismanlik@gmail.com').split(',').map(s=>s.trim()).filter(Boolean);
  const from=process.env.RESEND_FROM||'Al Azim Basvuru <onboarding@resend.dev>';
  const body={
    from, to,
    reply_to: p.email||undefined,
    subject:`📋 Başvuru: ${p.name} ${p.surname} — ${p.university} (${p.p1||p.degree})`,
    html: emailHtml(p),
    attachments:(p.files||[]).map(f=>({filename:f.name,content:f.data}))
  };
  const r=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  return {ok:r.ok, status:r.status, detail:r.ok?null:await r.text().catch(()=>null)};
}

async function sendPortal(p){
  const token=process.env.AGENTPORTAL_TOKEN;
  if(!token) return {ok:false,skip:true};
  const level=LEVEL_MAP[p.degree];
  if(!level) return {ok:false,skip:true,reason:'level not supported (Dil Kursu → mail only)'};
  const base=(process.env.AGENTPORTAL_URL||'https://agentportal-apply.com').replace(/\/$/,'');
  const fd=new FormData();
  fd.append('name',`${p.name} ${p.surname}`.trim());
  fd.append('passport_number',p.passport||'');
  fd.append('email',p.email||'');
  fd.append('level',level);
  fd.append('semester',p.semester||'Fall 2026-2027');
  if(p.father) fd.append('father_name',p.father);
  if(p.mother) fd.append('mother_name',p.mother);
  if(p.gender) fd.append('gender',p.gender==='Erkek'?'male':p.gender==='Kadın'?'female':p.gender);
  if(p.dob) fd.append('birthdate',p.dob);
  if(p.phone) fd.append('phone',p.phone);
  const noteBits=[
    `Üniversite: ${p.university}`,
    `Eğitim dili: ${p.language}`,
    p.p1?`1.Tercih: ${p.p1}`:null, p.p2?`2.Tercih: ${p.p2}`:null, p.p3?`3.Tercih: ${p.p3}`:null,
    `Vatandaşlık: ${p.nationality} / İkamet: ${p.residence}`,
    p.grad?`Eğitim: ${p.grad} — ${p.school||''} ${p.gpa?('Not: '+p.gpa):''}`:null,
    p.notes?`Öğrenci notu: ${p.notes}`:null,
    'Kaynak: alazimdanismanlik.com'
  ].filter(Boolean).join(' | ');
  fd.append('notes',noteBits);
  for(const f of (p.files||[])){
    try{
      const buf=Buffer.from(f.data,'base64');
      fd.append('attachments[]',new Blob([buf],{type:f.type||'application/octet-stream'}),f.name);
    }catch(e){}
  }
  const r=await fetch(base+'/api/agents/applications',{
    method:'POST',
    headers:{'Authorization':`Bearer ${token}`,'Accept':'application/json'},
    body:fd
  });
  let j=null; try{ j=await r.json(); }catch(e){}
  return {ok:r.ok&&j&&j.success!==false, status:r.status,
          appNumber:j&&j.application&&j.application.number||'',
          detail:r.ok?null:(j&&(j.message||JSON.stringify(j.errors||j)))||null};
}

module.exports = async (req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){res.statusCode=204;return res.end();}
  if(req.method!=='POST'){res.statusCode=405;return res.end(JSON.stringify({ok:false,error:'POST only'}));}

  /* read body (works with or without platform body parsing) */
  let p=req.body;
  if(!p||typeof p==='string'){
    try{
      if(typeof p!=='string'){
        const chunks=[]; for await (const c of req) chunks.push(c);
        p=Buffer.concat(chunks).toString('utf8');
      }
      p=JSON.parse(p);
    }catch(e){res.statusCode=400;return res.end(JSON.stringify({ok:false,error:'bad json'}));}
  }

  /* minimal validation */
  for(const k of ['name','surname','email','phone','passport','degree','semester']){
    if(!p[k]||!String(p[k]).trim()){res.statusCode=422;return res.end(JSON.stringify({ok:false,error:'missing '+k}));}
  }
  /* size guard */
  const total=(p.files||[]).reduce((a,f)=>a+(f.data?f.data.length:0),0);
  if(total>4.6*1024*1024){res.statusCode=413;return res.end(JSON.stringify({ok:false,error:'files too large'}));}

  /* 1) portal first (to include APP number in the e-mail) */
  let portal={ok:false,skip:true};
  try{ portal=await sendPortal(p); }catch(e){ portal={ok:false,detail:String(e)}; }
  p._portalResult = portal.skip ? 'Portala gönderilmedi (manuel girilecek)'
    : portal.ok ? ('AgentsCRM ✓ '+(portal.appNumber||'')) : ('AgentsCRM HATA: '+(portal.detail||portal.status));

  /* 2) e-mail */
  let mail={ok:false,skip:true};
  try{ mail=await sendMail(p); }catch(e){ mail={ok:false,detail:String(e)}; }

  const ok = mail.ok || portal.ok;
  res.statusCode = ok?200:502;
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify({ok, appNumber:portal.appNumber||'', mailed:!!mail.ok, portal:!!portal.ok}));
};