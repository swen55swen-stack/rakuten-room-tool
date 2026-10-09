(()=>{
const TARGET_URL='https://swen55swen-stack.github.io/rakuten-room-tool/v50.html';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function deepest(frame){
 let win=frame?.contentWindow,doc=frame?.contentDocument;
 for(let i=0;i<8&&doc;i++){
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
function strictBookmarklet(){
 return "javascript:(()=>{"+
 "const decode=s=>{try{return decodeURIComponent(s)}catch(e){return s}};"+
 "const itemFrom=s=>{s=String(s||'');for(let i=0;i<3;i++)s=decode(s);const m=s.match(/https?:\\/\\/item\\.rakuten\\.co\\.jp\\/([^\\/?#]+)\\/([^\\/?#]+)/i);return m?m[1]+':'+m[2]:''};"+
 "const out=[];const add=v=>{if(v&&!out.includes(v))out.push(v)};"+
 "const icons=[...document.querySelectorAll('img,[alt],[title]')].filter(el=>/24時間限定プライス|24時間限定|タイムセール/i.test((el.alt||'')+' '+(el.title||'')));"+
 "for(const icon of icons){let box=icon;for(let level=0;level<8&&box;level++,box=box.parentElement){const links=[...box.querySelectorAll('a[href]')];let found=false;for(const a of links){const code=itemFrom(a.href)||itemFrom(a.getAttribute('href'));if(code){add(code);found=true}}if(found)break}}"+
 "if(!out.length){const heads=[...document.querySelectorAll('h1,h2,h3,h4,[role=heading]')].filter(h=>/超目玉アイテム|目玉アイテム/.test(h.textContent||''));for(const h of heads){let n=h.nextElementSibling,steps=0;while(n&&steps<12){if(/^H[1-4]$/.test(n.tagName)&&!/超目玉アイテム|目玉アイテム/.test(n.textContent||''))break;for(const a of n.querySelectorAll?.('a[href]')||[]){add(itemFrom(a.href)||itemFrom(a.getAttribute('href')))}n=n.nextElementSibling;steps++}}}"+
 "if(!out.length){for(const a of document.querySelectorAll('a[href]')){const txt=(a.innerText||'')+' '+(a.querySelector('img')?.alt||'');if(/24時間限定|タイムセール|限定価格/.test(txt))add(itemFrom(a.href)||itemFrom(a.getAttribute('href')))}}"+
 "if(!out.length){alert('タイムセール商品を見つけられませんでした。ページを一番上から「超目玉アイテム」「目玉アイテム」が表示される位置までスクロールしてから、もう一度押してください。');return}"+
 "window.open('https://swen55swen-stack.github.io/rakuten-room-tool/v50.html#ts='+encodeURIComponent(out.slice(0,30).join(',')),'_blank');"+
 "})()";
}
async function fetchItem(w,app,key,affiliate,itemCode){
 const parts=String(itemCode||"").split(":");
 const shop=parts.shift()||"";
 const itemId=parts.join(":")||"";
 async function request(params){
  const q=new URLSearchParams({applicationId:app,accessKey:key,format:"json",formatVersion:"1",...params});
  if(affiliate)q.set("affiliateId",affiliate);
  const url="https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?"+q.toString();
  const r=await w.callRakuten(url);
  if(r?.data?.error)throw new Error(r.data.error_description||r.data.error);
  return w.itemArray(r.data);
 }
 // 1. Official exact itemCode lookup.
 let items=await request({itemCode});
 if(items.length)return items.find(x=>String(x.itemCode||"")===itemCode)||items[0];

 // 2. Some event links use a path ID that differs from the returned itemCode.
 // Search inside the same shop using the path item ID as a keyword.
 if(shop&&itemId){
  items=await request({shopCode:shop,keyword:itemId,hits:"30"});
  if(items.length){
   const exact=items.find(x=>String(x.itemCode||"")===itemCode);
   if(exact)return exact;
   const byUrl=items.find(x=>{
    const u=String(x.itemUrl||x.affiliateUrl||"").toLowerCase();
    return u.includes("/"+itemId.toLowerCase()+"/")||u.includes(itemId.toLowerCase());
   });
   if(byUrl)return byUrl;
   return items[0];
  }
 }

 // 3. Last fallback: search only by path item ID.
 if(itemId){
  items=await request({keyword:itemId,hits:"30"});
  const exact=items.find(x=>String(x.itemCode||"")===itemCode);
  if(exact)return exact;
  const byShop=items.find(x=>String(x.itemCode||"").startsWith(shop+":"));
  if(byShop)return byShop;
  if(items.length)return items[0];
 }
 return null;
}
function exactScore(x,index){
 const rc=Number(x.reviewCount||0),ra=Number(x.reviewAverage||0),price=Number(x.itemPrice||0);
 let s=100-index;
 if(rc>=1000)s+=12;else if(rc>=100)s+=8;else if(rc>=20)s+=4;
 if(ra>=4.6)s+=10;else if(ra>=4.4)s+=7;else if(ra>=4.1)s+=4;
 if(price>0&&price<=10000)s+=5;
 return s;
}
async function importExact(w,d,codes){
 const app=d.getElementById('appId')?.value.trim()||'';
 const key=d.getElementById('accessKey')?.value.trim()||'';
 const affiliate=d.getElementById('affiliateId')?.value.trim()||'';
 if(!app||!key){w.status('Application IDとAccess Keyを入力してください。');return}
 const btn=d.getElementById('v50ImportBtn');
 if(btn){btn.disabled=true;btn.textContent='🔥 商品情報を取得中…'}
 try{
  const all=[];
  const xErrors=[];
  for(let i=0;i<codes.length;i++){
   w.status('タイムセール実掲載商品を取得中… '+(i+1)+' / '+codes.length+'\n'+codes[i]);
   try{
    const x=await fetchItem(w,app,key,affiliate,codes[i]);
    if(x){
     x._v50Timesale=true;
     x._score=exactScore(x,i);
     x._room=x._score;
     x._sourceOrder=i+1;
     x._sourceCode=codes[i];
     all.push(x);
    }
   }catch(e){console.warn('V50 fetch failed',codes[i],e);xErrors.push(codes[i]+" → "+(e.message||e))}
   await sleep(300);
  }
  if(!all.length){
   const detail=(xErrors.length?"\n\n"+xErrors.slice(0,5).join("\n"):"");
   throw new Error("楽天APIから商品情報を取得できませんでした。取得コード："+codes.slice(0,5).join(", ")+detail);
  }
  // 絶対に並べ替えない。タイムセールページで拾った順番を維持。
  const top=all.slice(0,10);
  w.__roomCandidates=top;
  w.eval('candidates = window.__roomCandidates; render();');
  setTimeout(()=>{
   [...d.querySelectorAll('article.card')].forEach((card,i)=>{
    const x=top[i];if(!x)return;
    const chips=card.querySelector('.chips');
    if(chips&&!chips.querySelector('.v50exact')){
      const a=d.createElement('span');a.className='chip v50exact';
      a.textContent='🔥 タイムセール実掲載 '+x._sourceOrder;
      a.style.cssText='background:#fff0e6;color:#b54708;font-weight:900';
      chips.prepend(a);
    }
    const ta=card.querySelector("textarea[id^='copy-']");
    if(ta){
      let txt=ta.value||w.makeCopy(x);
      txt=txt.replace(/^🔥 楽天24時間タイムセール掲載\n?/,'');
      ta.value=('🔥 楽天24時間タイムセール掲載\n'+txt).slice(0,500);
      const counter=ta.nextElementSibling;
      if(counter&&counter.textContent.includes('文字数'))counter.textContent='文字数：'+ta.value.length+' / 500（V50実掲載）';
    }
   });
  },250);
  w.status('完了：タイムセールページで実際に拾った商品を、その順番のまま'+top.length+'件表示しました。');
 }catch(e){
  console.error(e);
  w.status('タイムセール取込に失敗しました。\n\n'+(e.message||e));
 }finally{
  if(btn){btn.disabled=false;btn.textContent='🔥 この商品をそのまま取り込む'}
 }
}
function install(w,d,codes){
 if(w.__v50Installed)return;
 w.__v50Installed=true;
 const first=d.querySelector('section.panel');
 if(first&&!d.getElementById('v50box')){
  const box=d.createElement('div');box.id='v50box';box.className='warning';
  box.style.cssText='background:#fff1e6;border:2px solid #ff9d42';
  const bm=strictBookmarklet().replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  box.innerHTML='<b style="font-size:16px">🔥 V50 タイムセール実掲載商品だけ取込</b><br>'+
   '<b>旧V47/V48/V49のお気に入りは使わないでください。</b><br>'+
   '① 「🔥V50実掲載取込」をお気に入りバーへドラッグ<br>'+
   '② 楽天24時間タイムセールページで商品が見える位置までスクロール<br>'+
   '③ お気に入りの「🔥V50実掲載取込」を押す<br><br>'+
   '<a class="btnlink" href="'+bm+'" style="background:#e86f00;color:#fff">🔥V50実掲載取込</a>'+
   '<div style="margin-top:8px;font-size:12px">楽天ページ上の <b>「24時間限定プライス」表示</b> が付いた商品カードを探して取得します。</div>';
  first.parentNode.insertBefore(box,first);
 }
 if(codes.length){
  let p=d.getElementById('v50received');
  if(!p){
   p=d.createElement('div');p.id='v50received';p.className='warning';
   p.style.cssText='background:#fffaf4;border-color:#ffb66e';
   p.innerHTML='<b>取得したタイムセール商品コード：'+codes.length+'件</b>'+
    '<div style="max-height:180px;overflow:auto;margin:8px 0;padding:8px;background:#fff;border-radius:8px;font-family:monospace;font-size:12px">'+
    codes.map((x,i)=>(i+1)+'. '+x).join('<br>')+'</div>'+
    '<button type="button" id="v50ImportBtn" style="background:#e86f00;color:#fff">🔥 この商品をそのまま取り込む</button>';
   first.parentNode.insertBefore(p,first);
   p.querySelector('#v50ImportBtn').addEventListener('click',()=>importExact(w,d,codes));
  }
 }
 const h=d.querySelector('h1');if(h)h.textContent='楽天ROOM 自動リサーチ＋連続投稿 V50';
 const sub=d.querySelector('header .sub');if(sub)sub.textContent='24時間限定プライス表示の実掲載商品だけを、ページ順のまま取り込む';
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