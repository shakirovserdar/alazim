/* Al Azim Consulting — shared translations (EN default) */
window.I18N = {
en:{
 nav_prog:"Programs",nav_why:"Why Turkey",nav_faq:"FAQ",nav_home:"Home",nav_about:"About",nav_services:"Services",nav_uni:"Universities",nav_denklik:"Equivalency",nav_news:"News",nav_contact:"Contact",
 apply:"Apply Now",learn:"Learn More",send_wa:"Send via WhatsApp",
 f_about:"Al Azim Consulting supports international students with university admission, residence and work permits, and legal guidance in Turkey. Official representative of universities in Turkey.",
 f_links:"Quick Links",f_contact:"Contact & Office",f_addr:"Hürriyet Mah. Mahmutbey Cad. Kırçıklar İş Merkezi No:13/404, Bahçelievler / İstanbul",
 f_rights:"All rights reserved.",
 cta_title:"Begin your journey to Turkey",cta_sub:"Contact us today and let's start your acceptance process at universities in Turkey — free application, no exams.",cta_call:"Talk to an Advisor",
 st_students:"Students Placed",st_uni:"Partner Universities",st_rate:"First-Choice Approval",st_countries:"Countries Served",
 uni_lab:"Partner Universities in Turkey"
},
tr:{
 nav_prog:"Programlar",nav_why:"Neden Türkiye",nav_faq:"SSS",nav_home:"Ana Sayfa",nav_about:"Hakkımızda",nav_services:"Hizmetler",nav_uni:"Üniversiteler",nav_denklik:"Denklik",nav_news:"Gündem",nav_contact:"İletişim",
 apply:"Hemen Başvur",learn:"Daha Fazla",send_wa:"WhatsApp ile Gönder",
 f_about:"Al Azim Consulting; üniversite kabulü, oturum ve çalışma izinleri ile Türkiye'deki hukuki süreçlerde uluslararası öğrencilere destek verir. Türkiye'deki üniversitelerin resmi temsilcisi.",
 f_links:"Hızlı Bağlantılar",f_contact:"İletişim & Ofis",f_addr:"Hürriyet Mah. Mahmutbey Cad. Kırçıklar İş Merkezi No:13/404, Bahçelievler / İstanbul",
 f_rights:"Tüm hakları saklıdır.",
 cta_title:"Türkiye yolculuğuna başla",cta_sub:"Bugün bizimle iletişime geçin, Türkiye'deki üniversitelere kabul sürecinizi başlatalım — sınavsız, ücretsiz başvuru.",cta_call:"Danışmanla Görüş",
 st_students:"Yerleştirilen Öğrenci",st_uni:"Partner Üniversite",st_rate:"İlk Tercihte Kabul",st_countries:"Hizmet Verilen Ülke",
 uni_lab:"Türkiye'deki Partner Üniversiteler"
},
tk:{
 nav_prog:"Maksatnamalar",nav_why:"Näme üçin Türkiýe",nav_faq:"Soraglar",nav_home:"Baş sahypa",nav_about:"Biz barada",nav_services:"Hyzmatlar",nav_uni:"Uniwersitetler",nav_denklik:"Deňlik",nav_news:"Habarlar",nav_contact:"Habarlaşmak",
 apply:"Ýüz tutmak",learn:"Giňişleýin",send_wa:"WhatsApp arkaly iber",
 f_about:"Al Azim Consulting uniwersitete kabul, ýaşaýyş we iş rugsatlary hem-de Türkiýedäki hukuk meselelerinde halkara talyplara goldaw berýär. Türkiýedäki uniwersitetleriň resmi wekili.",
 f_links:"Çalt baglanyşyklar",f_contact:"Habarlaşmak & Ofis",f_addr:"Hürriyet Mah. Mahmutbey Cad. Kırçıklar İş Merkezi No:13/404, Bahçelievler / Stambul",
 f_rights:"Ähli hukuklar goralan.",
 cta_title:"Türkiýä syýahatyňyza başlaň",cta_sub:"Şu gün biz bilen habarlaşyň — synagsyz, mugt ýüz tutma bilen Türkiýedäki uniwersitetlere kabul prosesiňizi başladalyň.",cta_call:"Maslahatçy bilen gepleş",
 st_students:"Ýerleşdirilen talyp",st_uni:"Hyzmatdaş uniwersitet",st_rate:"Ilkinji saýlawda kabul",st_countries:"Hyzmat edilýän ýurt",
 uni_lab:"Türkiýedäki hyzmatdaş uniwersitetler"
},
ru:{
 nav_prog:"Программы",nav_why:"Почему Турция",nav_faq:"Вопросы",nav_home:"Главная",nav_about:"О нас",nav_services:"Услуги",nav_uni:"Университеты",nav_denklik:"Признание диплома",nav_news:"Новости",nav_contact:"Контакты",
 apply:"Подать заявку",learn:"Подробнее",send_wa:"Отправить в WhatsApp",
 f_about:"Al Azim Consulting помогает иностранным студентам с поступлением в университеты, видом на жительство, разрешением на работу и юридическим сопровождением в Турции. Официальный представитель университетов Турции.",
 f_links:"Быстрые ссылки",f_contact:"Контакты и офис",f_addr:"Hürriyet Mah. Mahmutbey Cad. Kırçıklar İş Merkezi No:13/404, Бахчелиэвлер / Стамбул",
 f_rights:"Все права защищены.",
 cta_title:"Начните свой путь в Турцию",cta_sub:"Свяжитесь с нами сегодня — бесплатная заявка без экзаменов, и мы начнём ваш процесс поступления в университеты Турции.",cta_call:"Поговорить с консультантом",
 st_students:"Зачислено студентов",st_uni:"Университетов-партнёров",st_rate:"Одобрение по 1-му выбору",st_countries:"Стран обслуживания",
 uni_lab:"Университеты-партнёры в Турции"
}
};

window.applyLang = function(l){
  const dict = Object.assign({}, I18N[l]||I18N.en, (window.PAGE_I18N&&window.PAGE_I18N[l])||{});
  document.documentElement.lang = l;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.getAttribute('data-i18n');
    if(dict[k]!==undefined) el.innerHTML=dict[k];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const k=el.getAttribute('data-i18n-ph');
    if(dict[k]!==undefined) el.placeholder=dict[k];
  });
  document.querySelectorAll('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.l===l));
  try{localStorage.setItem('alazim_lang',l)}catch(e){}
};
