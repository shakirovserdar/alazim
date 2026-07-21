/* Al Azim — application handler
   1) e-mails the application (with documents) via Resend
   2) auto-creates the application in AgentsCRM agent portal
   3) saves student + application into Al Azim Portal (Supabase)
   4) sends the student a 4-language confirmation e-mail
   Env vars (Vercel → Settings → Environment Variables):
     RESEND_API_KEY      — from resend.com (required for e-mail)
     BASVURU_EMAIL       — where applications arrive (default below)
     RESEND_FROM         — verified sender, e.g. "Al Azim <basvuru@alazimdanismanlik.com>"
     AGENTPORTAL_TOKEN   — AgentsCRM API token (optional; skips portal if missing)
     AGENTPORTAL_URL     — default https://agentportal-apply.com
     SB_URL              — https://gydvyqtynsetictrucfp.supabase.co
     SB_SECRET           — Supabase secret key (sb_secret_...)
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
    ${row('Al Azim Portal',p._sbResult||'—')}
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

/* ---------- student confirmation e-mail (4 languages) ---------- */
const STUDENT_TXT = {
  tr: { subj:u=>`Başvurunuz alındı — ${u}`, hello:n=>`Sayın ${n},`,
        body:u=>`Al Azim Danışmanlık aracılığıyla <b>${u}</b> başvurunuz başarıyla alınmıştır. 🎉`,
        next:'Başvurunuz değerlendirme sürecindedir. Kabul, depozito ve kayıt aşamalarındaki tüm gelişmeler bu e-posta adresine bildirilecektir.',
        foot:'Sorularınız için bize her zaman ulaşabilirsiniz.', team:'Al Azim Danışmanlık Ekibi' },
  en: { subj:u=>`Your application has been received — ${u}`, hello:n=>`Dear ${n},`,
        body:u=>`Your application to <b>${u}</b> through Al Azim Consulting has been successfully received. 🎉`,
        next:'Your application is now being processed. All updates — acceptance, deposit and enrollment — will be sent to this e-mail address.',
        foot:'Feel free to contact us anytime.', team:'Al Azim Consulting Team' },
  ru: { subj:u=>`Ваша заявка получена — ${u}`, hello:n=>`Уважаемый(ая) ${n},`,
        body:u=>`Ваша заявка в <b>${u}</b> через Al Azim Consulting успешно получена. 🎉`,
        next:'Ваша заявка находится в обработке. Все обновления — зачисление, депозит и регистрация — будут отправлены на этот адрес.',
        foot:'Вы всегда можете связаться с нами.', team:'Команда Al Azim Consulting' },
  tk: { subj:u=>`Arzaňyz kabul edildi — ${u}`, hello:n=>`Hormatly ${n},`,
        body:u=>`Al Azim Consulting arkaly <b>${u}</b> üçin arzaňyz üstünlikli kabul edildi. 🎉`,
        next:'Arzaňyz seredilýär. Kabul, depozit we hasaba alyş baradaky ähli täzelikler şu e-poçta salgysyna iberiler.',
        foot:'Islendik wagt biz bilen habarlaşyp bilersiňiz.', team:'Al Azim Consulting topary' }
};

async function sendStudentMail(p){
  const key=process.env.RESEND_API_KEY;
  if(!key||!p.email) return {ok:false,skip:true};
  const L=STUDENT_TXT[p.lang]||STUDENT_TXT.tk;
  const name=`${p.name} ${p.surname}`.trim();
  const html=`
  <div style="background:#0e1526;padding:32px 16px;font-family:Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#d4af37,#b8962e);padding:22px;text-align:center">
        <div style="font-size:20px;font-weight:800;color:#0e1526;letter-spacing:.5px">AL AZIM</div>
        <div style="font-size:12px;color:#0e1526;opacity:.75">alazimdanismanlik.com</div>
      </div>
      <div style="padding:28px 26px;color:#1c2333;font-size:15px;line-height:1.7">
        <p style="margin:0 0 12px"><b>${esc(L.hello(name))}</b></p>
        <p style="margin:0 0 16px">${L.body(esc(p.university))}</p>
        <div style="background:#f6f1df;border-left:4px solid #d4af37;padding:14px 16px;border-radius:8px;font-size:14px">
          ${L.next}
        </div>
        <p style="margin:18px 0 0;color:#5a6478;font-size:13.5px">${L.foot}</p>
        <p style="margin:22px 0 0;font-weight:700">${L.team}</p>
      </div>
      <div style="background:#f2f4f9;padding:14px;text-align:center;color:#8a93a8;font-size:12px">
        Şirinevler Mah. Meriç Sok. No:20, İstanbul · +90 534 689 84 93
      </div>
    </div>
  </div>`;
  const r=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
    body:JSON.stringify({
      from:process.env.RESEND_FROM||'Al Azim <onboarding@resend.dev>',
      to:[p.email],
      subject:L.subj(p.university),
      html
    })
  });
  return {ok:r.ok,status:r.status};
}

/* ---------- Al Azim Portal (Supabase) ---------- */
async function sendSupabase(p){
  const url=process.env.SB_URL, key=process.env.SB_SECRET;
  if(!url||!key) return {ok:false,skip:true};
  const H={'apikey':key,'Authorization':`Bearer ${key}`,'Content-Type':'application/json','Prefer':'return=representation'};

  /* 1) student */
  const sRes=await fetch(url+'/rest/v1/students',{
    method:'POST',headers:H,
    body:JSON.stringify({
      first_name:p.name, last_name:p.surname,
      father_name:p.father||'', mother_name:p.mother||'',
      birth_date:p.dob||null, gender:p.gender||'',
      email:p.email||'', phone:p.phone||'',
      passport_no:p.passport||'', citizenship:p.nationality||'',
      residence:p.residence||'', lang:['en','tr','tk','ru'].includes(p.lang)?p.lang:'tk'
    })
  });
  if(!sRes.ok) return {ok:false,detail:'student: '+await sRes.text().catch(()=>sRes.status)};
  const student=(await sRes.json())[0];

  /* 2) application */
  const aRes=await fetch(url+'/rest/v1/applications',{
    method:'POST',headers:H,
    body:JSON.stringify({
      student_id:student.id, university:p.university||'',
      program1:p.p1||'', program2:p.p2||'', program3:p.p3||'',
      level:p.degree||'', edu_lang:p.language||'', semester:p.semester||'',
      note:[p.grad?`Eğitim: ${p.grad} ${p.school||''} ${p.gpa?('Not:'+p.gpa):''}`:null,
            p.notes||null,
            (p.files&&p.files.length)?('Belgeler mailde: '+p.files.map(f=>f.name).join(', ')):null]
           .filter(Boolean).join(' | ')
    })
  });
  if(!aRes.ok) return {ok:false,detail:'application: '+await aRes.text().catch(()=>aRes.status)};
  const app=(await aRes.json())[0];
  return {ok:true, id:app.id};
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

  /* 1) AgentsCRM first (to include APP number in the e-mail) */
  let portal={ok:false,skip:true};
  try{ portal=await sendPortal(p); }catch(e){ portal={ok:false,detail:String(e)}; }
  p._portalResult = portal.skip ? 'Portala gönderilmedi (manuel girilecek)'
    : portal.ok ? ('AgentsCRM ✓ '+(portal.appNumber||'')) : ('AgentsCRM HATA: '+(portal.detail||portal.status));

  /* 2) Al Azim Portal (Supabase) */
  let supa={ok:false,skip:true};
  try{ supa=await sendSupabase(p); }catch(e){ supa={ok:false,detail:String(e)}; }
  p._sbResult = supa.skip ? 'Kapalı (env eksik)'
    : supa.ok ? 'Portala kaydedildi ✓' : ('HATA: '+(supa.detail||''));

  /* 3) office e-mail */
  let mail={ok:false,skip:true};
  try{ mail=await sendMail(p); }catch(e){ mail={ok:false,detail:String(e)}; }

  /* 4) student confirmation e-mail (best effort, never blocks) */
  let smail={ok:false,skip:true};
  try{ smail=await sendStudentMail(p); }catch(e){ smail={ok:false}; }

  const ok = mail.ok || portal.ok || supa.ok;
  res.statusCode = ok?200:502;
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify({ok, appNumber:portal.appNumber||'', mailed:!!mail.ok,
                          portal:!!portal.ok, alazimPortal:!!supa.ok, studentMailed:!!smail.ok}));
};