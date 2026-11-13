const SB_URL='https://yhjwttinwgsekgbmdijw.supabase.co',SB_KEY='sb_publishable_KbGaMcx2t7kndWIx27giag_LYsKjtVc';
const sb=supabase.createClient(SB_URL,SB_KEY),fb=n=>sb.from('fanos_'+n);
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fa=n=>Number(n||0).toLocaleString('fa-IR');
let me=null,cur=null;
const S={cfg:{},portfolio:[],presets:[],courses:[],mine:[]};
const DEF_CFG={tag:'هر قاب، یک خاطره‌ی ماندگار؛ عکاسی، فروش پریست و آموزش عکاسی و ادیت.',about:'Studio Fanos با سال‌ها تجربه در عکاسی پرتره، خانوادگی و تبلیغاتی، همراه شماست تا لحظه‌هایتان را درخشان ثبت کنیم.',phone:'09120000000',card:'6037-0000-0000-0000',cname:'نام صاحب کارت',insta:'@studio.fanos',addr:'آدرس استودیو',locs:'استودیو مرکزی | نورپردازی حرفه‌ای\nباغ و فضای سبز | عکاسی در طبیعت\nلوکیشن دلخواه شما | هماهنگی با استودیو'};
const cfg=()=>Object.assign({},DEF_CFG,S.cfg);
const im=i=>i?`style="background-image:url('${esc(i)}')"`:'';
function toast(t){const m=$('#msg');m.textContent=t;m.style.display='block';setTimeout(()=>m.style.display='none',2600)}
async function load(c){if(c==='cfg'){const{data}=await fb('site_config').select('data').eq('id',1).maybeSingle();S.cfg=data?.data||{}}else{const{data}=await fb(c).select('*').order('created_at',{ascending:false});S[c]=(data||[]).map(x=>({...x,desc:x.descr}))}}
async function upload(f,dir){const p=dir+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,6)+'.'+(f.name.split('.').pop()||'jpg');const{error}=await sb.storage.from('fanos-media').upload(p,f);if(error)throw error;return sb.storage.from('fanos-media').getPublicUrl(p).data.publicUrl}
const NAV=[['index.html','خانه'],['portfolio.html','نمونه‌کار'],['book.html','رزرو'],['presets.html','پریست'],['courses.html','دوره‌ها']];
function chrome(){const p=location.pathname.split('/').pop()||'index.html';
document.body.insertAdjacentHTML('afterbegin',`<nav><a class="lg" href="index.html">🏮 Studio Fanos</a>${NAV.map(n=>`<a href="${n[0]}" class="${p===n[0]?'on':''}">${n[1]}</a>`).join('')}<button id="who">ورود</button></nav>`);
document.body.insertAdjacentHTML('beforeend',`<footer id="foot"></footer>
<div class="modal" id="lm"><form id="lf"><div class="w"><b>ورود / ثبت‌نام</b></div><label class="w">ایمیل<input name="email" type="email" required dir="ltr"></label><label class="w">رمز عبور<input name="pass" type="password" minlength="6" required dir="ltr"></label><div class="w"><button class="btn" data-m="in">ورود</button> <button class="btn o" data-m="up">ساخت حساب</button> <button type="button" class="btn o" id="lclose">بستن</button></div></form></div>
<div class="modal" id="mod"><form id="of"><div class="w" id="oinfo"></div><label>نام و نام خانوادگی<input name="name" required></label><label>شماره تماس<input name="phone" type="tel" required></label><label>کد پیگیری واریز<input name="ref" required></label><label>عکس رسید<input name="rcpt" type="file" accept="image/*"></label><div class="w"><button class="btn">ثبت پرداخت</button> <button type="button" class="btn o" id="oclose">بستن</button></div></form></div><div id="msg"></div>`);
$('#who').onclick=async()=>{if(me)await sb.auth.signOut();else $('#lm').style.display='flex'};
$('#lclose').onclick=()=>$('#lm').style.display='none';$('#oclose').onclick=()=>$('#mod').style.display='none';
$('#lf').onsubmit=async e=>{e.preventDefault();const m=e.submitter?.dataset.m||'in',d=Object.fromEntries(new FormData(e.target));
const r=m==='up'?await sb.auth.signUp({email:d.email,password:d.pass}):await sb.auth.signInWithPassword({email:d.email,password:d.pass});
if(r.error)return toast('خطا: '+r.error.message);$('#lm').style.display='none';toast(m==='up'&&!r.data.session?'ایمیل تایید برای شما ارسال شد':'✅ وارد شدید')};
$('#of').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),f=e.target.rcpt.files[0];
try{const rcpt=f?await upload(f,'receipts/'+me.id):'';const{error}=await fb('orders').insert({user_id:me.id,kind:cur.k==='presets'?'پریست':'دوره',item:cur.it.title,amount:cur.it.price,name:d.name,phone:d.phone,ref:d.ref,rcpt,status:'در انتظار تایید'});if(error)throw error;
$('#mod').style.display='none';e.target.reset();loadMine();toast('✅ ثبت شد؛ پس از تایید پرداخت فعال می‌شود')}catch(x){toast('خطا در ثبت')}};
document.addEventListener('click',e=>{const o=e.target.closest('[data-o]');if(o){const[k,i]=o.dataset.o.split(':');openOrder(k,i)}})}
const needLogin=()=>{if(me)return false;$('#lm').style.display='flex';toast('ابتدا وارد شوید');return true};
function openOrder(k,i){if(needLogin())return;const it=S[k].find(x=>x.id==i);if(!it)return;const c=cfg();cur={k,it};
$('#oinfo').innerHTML=`<b>${esc(it.title)}</b><br>مبلغ قابل پرداخت: <span class="price">${fa(it.price)} تومان</span><br>کارت‌به‌کارت به: <b dir="ltr">${esc(c.card)}</b><br>به نام: ${esc(c.cname)}<br><small style="color:var(--mu)">پس از واریز، کد پیگیری و عکس رسید را ثبت کنید. بعد از تایید مدیر، ${k==='presets'?'لینک دانلود در «سفارش‌های من» ظاهر می‌شود':'ثبت‌نام شما نهایی می‌شود'}.</small>`;$('#mod').style.display='flex'}
async function loadMine(){if(!me)S.mine=[];else{const{data}=await fb('orders').select('*').eq('user_id',me.id).order('created_at',{ascending:false});S.mine=data||[]}
const o=S.mine;if($('#mine'))$('#mine').style.display=o.length?'':'none';if($('#myo'))$('#myo').innerHTML=o.map(x=>`<div class="row"><div>${esc(x.item)} <span class="tag">${esc(x.status==='تایید شد'?'✅ پرداخت تایید شد':x.status)}</span></div>${x.file&&x.status==='تایید شد'?`<a class="btn s" href="${esc(x.file)}" target="_blank" rel="noopener">⬇ دانلود</a>`:''}</div>`).join('')}
async function init(cols,render){chrome();await Promise.all(['cfg',...cols].map(load));const c=cfg();$('#foot').innerHTML=`📞 ${esc(c.phone)} · ${esc(c.insta)}<br>${esc(c.addr)}<br>© Studio Fanos`;render&&render();
sb.auth.onAuthStateChange((_,s)=>{me=s?.user||null;$('#who').textContent=me?'👤 خروج':'ورود';loadMine()})}
