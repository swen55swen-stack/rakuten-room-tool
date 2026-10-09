(()=>{
const TARGET_URL='https://swen55swen-stack.github.io/rakuten-room-tool/v48.html';
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
 return "javascript:(()=>{const A=[...document.querySelectorAll('a[href*=\\\"item.rakuten.co.jp/\\\"]')];const out=[];for(const a of A){let u;try{u=new URL(a.href,location.href)}catch(e){continue}if(u.hostname!=='item.rakuten.co.jp')continue;const sid=(u.searchParams.get('s-id')||u.searchParams.get('l-id')||'');if(!/^timesale/i.test(sid)&&!/timesale/i.test(u.href))continue;const p=u.pathname.split('/').filter(Boolean);if(p.length<2)continue;const code=p[0]+':'+p[1];if(!out.includes(code))out.push(code)}if(!out.length){alert('s-id=timesale の商品リンクが見つかりませんでした。タイムセール商品が表示されている位置までスクロールしてから、もう一度押してください。');return}window.open('"+TARGET_URL+"#ts='+encodeURIComponent(out.slice(0,30).join(',')),'_blank');})()";
}
async function fetchItem(w,app,key,affiliate,itemCode){
 const q=new URLSearchParams({applicationId:app,accessKey:key,format:'json',formatVersion:'1',itemCode});
 if(affiliate)q.set('affiliateId',affiliate);
 const url='https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?'+q.toString();
 const r=await w.callRakuten(url);
 const items=w.itemArray(r.data);
 return items[0]||null;
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
 const btn=d.getElementById('v48ImportBtn');
 if(btn){btn.disabled=true;btn.textContent='🔥 商品情報を取得中…'}
 try{
  const all=[];
  for(let i=0;i<codes.length;i++){
   w.status('タイムセール実掲載商品を取得中… '+(i+1)+' / '+codes.length+'\n'+codes[i]);
   try{
    const x=await fetchItem(w,app,key,affiliate,codes[i]);
    if(x){
     x._v48Timesale=true;
     x._score=exactScore(x,i);
     x._room=x._score;
     x._sourceOrder=i+1;
     x._sourceCode=codes[i];
     all.push(x);
    }
   }catch(e){console.warn('V48 fetch failed',codes[i],e)}
   await sleep(300);
  }
  if(!all.length)throw new Error('楽天APIから商品情報を取得できませんでした。');
  // 絶対に並べ替えない。タイムセールページで拾った順番を維持。
  const top=all.slice(0,10);
  w.__roomCandidates=top;
  w.eval('candidates = window.__roomCandidates; render();');
  setTimeout(()=>{
   [...d.querySelectorAll('article.card')].forEach((card,i)=>{
    const x=top[i];if(!x)return;
    const chips=card.querySelector('.chips');
    if(chips&&!chips.querySelector('.v48exact')){
      const a=d.createElement('span');a.className='chip v48exact';
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
      if(counter&&counter.textContent.includes('文字数'))counter.textContent='文字数：'+ta.value.length+' / 500（V48実掲載）';
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
 if(w.__v48Installed)return;
 w.__v48Installed=true;
 const first=d.querySelector('section.panel');
 if(first&&!d.getElementById('v48box')){
  const box=d.createElement('div');box.id='v48box';box.className='warning';
  box.style.cssText='background:#fff1e6;border:2px solid #ff9d42';
  const bm=strictBookmarklet().replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  box.innerHTML='<b style="font-size:16px">🔥 V48 タイムセール実掲載商品だけ取込</b><br>'+
   '<b>旧V47のお気に入りは使わないでください。</b><br>'+
   '① 「🔥V48実掲載取込」をお気に入りバーへドラッグ<br>'+
   '② 楽天24時間タイムセールページで商品が見える位置までスクロール<br>'+
   '③ お気に入りの「🔥V48実掲載取込」を押す<br><br>'+
   '<a class="btnlink" href="'+bm+'" style="background:#e86f00;color:#fff">🔥V48実掲載取込</a>'+
   '<div style="margin-top:8px;font-size:12px">URLに <b>s-id=timesale...</b> が付いた商品だけ取得します。</div>';
  first.parentNode.insertBefore(box,first);
 }
 if(codes.length){
  let p=d.getElementById('v48received');
  if(!p){
   p=d.createElement('div');p.id='v48received';p.className='warning';
   p.style.cssText='background:#fffaf4;border-color:#ffb66e';
   p.innerHTML='<b>取得したタイムセール商品コード：'+codes.length+'件</b>'+
    '<div style="max-height:180px;overflow:auto;margin:8px 0;padding:8px;background:#fff;border-radius:8px;font-family:monospace;font-size:12px">'+
    codes.map((x,i)=>(i+1)+'. '+x).join('<br>')+'</div>'+
    '<button type="button" id="v48ImportBtn" style="background:#e86f00;color:#fff">🔥 この商品をそのまま取り込む</button>';
   first.parentNode.insertBefore(p,first);
   p.querySelector('#v48ImportBtn').addEventListener('click',()=>importExact(w,d,codes));
  }
 }
 const h=d.querySelector('h1');if(h)h.textContent='楽天ROOM 自動リサーチ＋連続投稿 V48';
 const sub=d.querySelector('header .sub');if(sub)sub.textContent='s-id=timesale の実掲載商品だけを、ページ順のまま取り込む';
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