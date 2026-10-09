(()=>{
const TARGET_URL='https://swen55swen-stack.github.io/rakuten-room-tool/v47.html';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function deepest(frame){
 let win=frame?.contentWindow,doc=frame?.contentDocument;
 for(let i=0;i<7&&doc;i++){
  const next=doc.getElementById('appframe');
  if(!next)break;
  win=next.contentWindow;doc=next.contentDocument;
 }
 return {w:win,d:doc};
}
function getCodes(){
 const m=(location.hash||'').match(/(?:^#|[&#])ts=([^&]+)/);
 if(!m)return [];
 try{return decodeURIComponent(m[1]).split(',').map(v=>v.trim()).filter(Boolean).slice(0,30)}catch(e){return []}
}
function bookmarklet(){
 return "javascript:(()=>{const A=[...document.querySelectorAll('a[href]')];const out=[];for(const a of A){let u;try{u=new URL(a.href,location.href)}catch(e){continue}if(u.hostname!=='item.rakuten.co.jp')continue;const p=u.pathname.split('/').filter(Boolean);if(p.length<2)continue;const href=(a.getAttribute('href')||'')+' '+u.href;let near='';let el=a;for(let i=0;i<5&&el;i++,el=el.parentElement){near+=' '+(el.innerText||'');try{near+=' '+[...el.querySelectorAll('img')].map(x=>(x.alt||'')+' '+(x.title||'')).join(' ')}catch(e){}}const isTs=/timesale/i.test(href)||/24時間限定プライス|24時間タイムセール|タイムセール/i.test(near);if(!isTs)continue;const code=p[0]+':'+p[1];if(!out.some(x=>x.code===code))out.push({code,url:u.href})}if(!out.length){alert('タイムセール対象の商品リンクだけを見つけられませんでした。ページの「超目玉アイテム」「目玉アイテム」付近までスクロールして、もう一度押してください。');return}location.href='https://swen55swen-stack.github.io/rakuten-room-tool/v47.html#ts='+encodeURIComponent(out.slice(0,30).map(x=>x.code).join(','));})()";
}
async function fetchItem(w,app,key,affiliate,itemCode){
 const q=new URLSearchParams({applicationId:app,accessKey:key,format:'json',formatVersion:'1',itemCode});
 if(affiliate)q.set('affiliateId',affiliate);
 const url='https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?'+q.toString();
 const r=await w.callRakuten(url);
 const items=w.itemArray(r.data);
 return items[0]||null;
}
function score(w,x,index){
 let s=100-index*2;
 const rc=Number(x.reviewCount||0),ra=Number(x.reviewAverage||0),price=Number(x.itemPrice||0);
 if(rc>=1000)s+=24; else if(rc>=100)s+=16; else if(rc>=20)s+=8;
 if(ra>=4.6)s+=18; else if(ra>=4.4)s+=12; else if(ra>=4.1)s+=6;
 if(price>=800&&price<=8000)s+=12; else if(price<=20000)s+=6;
 if(Number(x.pointRate||1)>=3)s+=6;
 if(w.hasConcreteProductInfo?.(x))s+=8;
 return Math.round(s);
}
function markTimesale(x){
 x._v47Timesale=true;
 x._timesaleLabel='🔥 楽天24時間タイムセール掲載';
 return x;
}
async function importTimesale(w,d,codes){
 const app=d.getElementById('appId')?.value.trim()||'';
 const key=d.getElementById('accessKey')?.value.trim()||'';
 const affiliate=d.getElementById('affiliateId')?.value.trim()||'';
 if(!app||!key){
  w.status('Application IDとAccess Keyを入力してから「🔥 取り込む」を押してください。');
  return;
 }
 const btn=d.getElementById('v47ImportBtn');
 if(btn){btn.disabled=true;btn.textContent='🔥 取込中…'}
 try{
  w.status('楽天24時間タイムセール掲載商品を取得しています… 0 / '+codes.length);
  const all=[];
  for(let i=0;i<codes.length;i++){
   try{
    const x=await fetchItem(w,app,key,affiliate,codes[i]);
    if(x){markTimesale(x);x._room=score(w,x,i);x._score=x._room;all.push(x)}
   }catch(e){console.warn('V47 item fetch failed',codes[i],e)}
   w.status('楽天24時間タイムセール掲載商品を取得しています… '+(i+1)+' / '+codes.length);
   await sleep(350);
  }
  if(!all.length)throw new Error('商品情報を取得できませんでした。タイムセールページを再読み込みして、取込ボタンをもう一度押してください。');
  const top=all.slice(0,10);
  w.__roomCandidates=top;
  w.eval('candidates = window.__roomCandidates; render();');
  setTimeout(()=>{
   [...d.querySelectorAll('article.card')].forEach((card,i)=>{
    const x=top[i]; if(!x)return;
    const chips=card.querySelector('.chips');
    if(chips&&!chips.querySelector('.v47tschip')){
     const a=d.createElement('span');a.className='chip v47tschip';a.textContent='🔥 タイムセール実掲載';
     a.style.cssText='background:#fff0e6;color:#b54708;font-weight:900';
     chips.prepend(a);
    }
    const ta=card.querySelector("textarea[id^='copy-']");
    if(ta&&!/^🔥 楽天24時間タイムセール掲載/m.test(ta.value)){
     ta.value=('🔥 楽天24時間タイムセール掲載\n'+ta.value).slice(0,500);
     const counter=ta.nextElementSibling;
     if(counter&&counter.textContent.includes('文字数'))counter.textContent='文字数：'+ta.value.length+' / 500（V47タイムセール）';
    }
   });
  },250);
  w.status('完了：楽天24時間タイムセールページに掲載されていた順番のまま、商品を'+top.length+'件取り込みました。');
 }catch(e){
  console.error(e);w.status('タイムセール取込に失敗しました。\n\n'+(e.message||e));
 }finally{
  if(btn){btn.disabled=false;btn.textContent='🔥 受け取ったタイムセール商品を取り込む'}
 }
}
function install(w,d,codes){
 if(w.__v47Installed)return;
 w.__v47Installed=true;
 const first=d.querySelector('section.panel');
 if(first&&!d.getElementById('v47box')){
  const box=d.createElement('div');box.id='v47box';box.className='warning';
  box.style.cssText='background:#fff6ed;border-color:#ffbf80';
  const bm=bookmarklet().replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  box.innerHTML='<b>🔥 V47 楽天24時間タイムセール取込</b><br>'+
   '① 下の「🔥V47へ取込」をお気に入りバーへドラッグ<br>'+
   '② 楽天24時間タイムセールページを開く<br>'+
   '③ お気に入りの「🔥V47へ取込」を押す<br>'+
   '④ V47に戻ったら商品を自動取得します<br><br>'+
   '<a id="v47Bookmarklet" class="btnlink" href="'+bm+'" style="background:#f28c00;color:#fff">🔥V47へ取込</a>'+
   '<span style="margin-left:8px;font-size:12px">タイムセール対象リンクだけを、ページ順のまま最大30件読み込みます</span>';
  first.parentNode.insertBefore(box,first);
 }
 if(codes.length){
  let panel=d.getElementById('v47received');
  if(!panel){
   panel=d.createElement('div');panel.id='v47received';panel.className='warning';
   panel.style.cssText='background:#fff4e8;border-color:#f2a65a';
   panel.innerHTML='<b>🔥 タイムセール商品を受け取りました：</b> '+codes.length+'件<br>'+
    '<button type="button" id="v47ImportBtn" style="margin-top:8px;background:#f28c00;color:white">🔥 受け取ったタイムセール商品を取り込む</button>';
   first.parentNode.insertBefore(panel,first);
   panel.querySelector('#v47ImportBtn').addEventListener('click',()=>importTimesale(w,d,codes));
  }
  setTimeout(()=>{
   const app=d.getElementById('appId')?.value.trim(),key=d.getElementById('accessKey')?.value.trim();
   if(app&&key)importTimesale(w,d,codes);
  },1200);
 }
 const h=d.querySelector('h1');if(h)h.textContent='楽天ROOM 自動リサーチ＋連続投稿 V47';
 const sub=d.querySelector('header .sub');if(sub)sub.textContent='楽天24時間タイムセール掲載商品も直接取り込める';
}
const root=document.getElementById('appframe');
const codes=getCodes();
let tries=0;
const timer=setInterval(()=>{
 tries++;
 try{
  const {w,d}=deepest(root);
  if(w&&d&&typeof w.callRakuten==='function'&&typeof w.itemArray==='function'&&typeof w.render==='function'){
   install(w,d,codes);clearInterval(timer);
  }
 }catch(e){}
 if(tries>160)clearInterval(timer);
},250);
})();