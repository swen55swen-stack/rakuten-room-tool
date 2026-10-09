(()=>{
const TARGET='https://swen55swen-stack.github.io/rakuten-room-tool/v51.html';

function deepest(frame){
 let win=frame?.contentWindow,doc=frame?.contentDocument;
 for(let i=0;i<8&&doc;i++){
  const next=doc.getElementById('appframe');
  if(!next)break;
  win=next.contentWindow;doc=next.contentDocument;
 }
 return {w:win,d:doc};
}
function getPayload(){
 const m=(location.hash||'').match(/(?:^#|[&#])tsd=([^&]+)/);
 if(!m)return [];
 try{
  const arr=JSON.parse(decodeURIComponent(m[1]));
  return Array.isArray(arr)?arr.slice(0,10):[];
 }catch(e){return []}
}
function bookmarklet(){
 return "javascript:(()=>{"+
 "const out=[];"+
 "const clean=s=>String(s||'').replace(/\\s+/g,' ').trim();"+
 "const itemLink=a=>{try{const u=new URL(a.href,location.href);return u.hostname==='item.rakuten.co.jp'?u:null}catch(e){return null}};"+
 "const add=(a,box)=>{const u=itemLink(a);if(!u)return;const bare=u.origin+u.pathname; if(out.some(x=>x.u===bare))return;"+
 "const txt=clean((a.innerText||'')+' '+(box?.innerText||''));"+
 "let title=clean(a.innerText)||clean(a.querySelector('img')?.alt)||txt;"+
 "title=title.replace(/24時間限定プライス|24時間限定|タイムセール|超目玉アイテム|目玉アイテム/g,' ').replace(/\\s+/g,' ').trim().slice(0,120);"+
 "const pm=txt.match(/(?:税込)?\\s*[￥¥]?\\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})\\s*円?/);"+
 "const price=pm?Number(pm[1].replace(/,/g,'')):0;"+
 "const img=(a.querySelector('img')?.src||box?.querySelector('img')?.src||'');"+
 "out.push({t:title||'楽天タイムセール商品',p:price,u:bare,i:img});};"+
 "const icons=[...document.querySelectorAll('img,[alt],[title]')].filter(el=>/24時間限定プライス|24時間限定|タイムセール/i.test((el.alt||'')+' '+(el.title||'')));"+
 "for(const icon of icons){let box=icon;for(let lv=0;lv<8&&box;lv++,box=box.parentElement){const links=[...box.querySelectorAll('a[href*=\\\"item.rakuten.co.jp/\\\"]')];if(links.length){for(const a of links)add(a,box);break}}}"+
 "if(!out.length){const heads=[...document.querySelectorAll('h1,h2,h3,h4,[role=heading]')].filter(h=>/超目玉アイテム|目玉アイテム/.test(h.textContent||''));for(const h of heads){let n=h.nextElementSibling,steps=0;while(n&&steps<10){for(const a of n.querySelectorAll?.('a[href*=\\\"item.rakuten.co.jp/\\\"]')||[])add(a,n);n=n.nextElementSibling;steps++}}}"+
 "if(!out.length){alert('タイムセール商品を見つけられませんでした。商品が見える位置までスクロールしてからもう一度押してください。');return}"+
 "window.open('"+TARGET+"#tsd='+encodeURIComponent(JSON.stringify(out.slice(0,10))),'_blank');"+
 "})()";
}
function makeItem(v,idx){
 return {
  itemCode:'v51-timesale-'+idx,
  itemName:v.t||'楽天タイムセール商品',
  itemPrice:Number(v.p||0),
  itemUrl:v.u||'',
  affiliateUrl:'',
  catchcopy:'楽天24時間タイムセール実掲載',
  itemCaption:'楽天24時間タイムセールページに掲載されている商品',
  reviewCount:0,
  reviewAverage:0,
  availability:1,
  pointRate:1,
  mediumImageUrls:v.i?[{imageUrl:v.i}]:[],
  smallImageUrls:v.i?[{imageUrl:v.i}]:[],
  rank:idx+1,
  _score:100-idx,
  _room:100-idx,
  _v51Timesale:true
 };
}
function install(w,d,payload){
 if(w.__v51Installed)return;
 w.__v51Installed=true;
 const first=d.querySelector('section.panel');
 if(first&&!d.getElementById('v51box')){
  const box=d.createElement('div');box.id='v51box';box.className='warning';
  box.style.cssText='background:#fff1e6;border:2px solid #ff8a1f';
  const bm=bookmarklet().replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  box.innerHTML='<b style="font-size:16px">🔥 V51 タイムセール商品をそのまま取込</b><br>'+
   '<b>楽天APIの商品コード変換は使いません。</b><br>'+
   'タイムセールページに表示されている商品名・価格・URLをそのままV51へ渡します。<br><br>'+
   '<a class="btnlink" href="'+bm+'" style="background:#e86f00;color:#fff">🔥V51タイムセール取込</a>'+
   '<div style="margin-top:8px;font-size:12px">旧V47〜V50のお気に入りは使わず、これを新しく登録してください。</div>';
  first.parentNode.insertBefore(box,first);
 }
 if(payload.length){
  const items=payload.map(makeItem);
  let panel=d.getElementById('v51received');
  if(!panel){
   panel=d.createElement('div');panel.id='v51received';panel.className='warning';
   panel.style.cssText='background:#fffaf5;border-color:#ffb46b';
   panel.innerHTML='<b>🔥 タイムセール実掲載商品を '+items.length+'件受け取りました</b>'+
    '<div style="margin-top:7px;font-size:12px">'+items.map((x,i)=>(i+1)+'. '+(x.itemName||'').slice(0,70)+(x.itemPrice?' / '+x.itemPrice.toLocaleString()+'円':'')).join('<br>')+'</div>'+
    '<button type="button" id="v51ShowBtn" style="margin-top:10px;background:#e86f00;color:#fff">🔥 この商品をそのまま表示</button>';
   first.parentNode.insertBefore(panel,first);
   panel.querySelector('#v51ShowBtn').addEventListener('click',()=>{
    w.__roomCandidates=items;
    w.eval('candidates = window.__roomCandidates; render();');
    setTimeout(()=>{
     [...d.querySelectorAll('article.card')].forEach((card,i)=>{
      const x=items[i];if(!x)return;
      const chips=card.querySelector('.chips');
      if(chips&&!chips.querySelector('.v51exact')){
       const a=d.createElement('span');a.className='chip v51exact';a.textContent='🔥 タイムセール実掲載';
       a.style.cssText='background:#fff0e6;color:#b54708;font-weight:900';chips.prepend(a);
      }
      const ta=card.querySelector("textarea[id^='copy-']");
      if(ta){
       let txt=w.makeCopy(x);
       txt=txt.replace(/^🔥\s*(SALE中|楽天24時間タイムセール掲載)\n?/,'');
       ta.value=('🔥 楽天24時間タイムセール掲載\n'+txt).slice(0,500);
       const counter=ta.nextElementSibling;
       if(counter&&counter.textContent.includes('文字数'))counter.textContent='文字数：'+ta.value.length+' / 500（V51実掲載商品）';
      }
     });
    },150);
    w.status('完了：タイムセールページで見えていた商品を、そのまま表示しました。楽天APIによる商品置換はしていません。');
   });
  }
 }
 const h=d.querySelector('h1');if(h)h.textContent='楽天ROOM 自動リサーチ＋連続投稿 V51';
 const sub=d.querySelector('header .sub');if(sub)sub.textContent='タイムセール実掲載商品を、APIで置き換えずそのまま紹介';
}
const root=document.getElementById('appframe');
const payload=getPayload();
let tries=0;
const timer=setInterval(()=>{
 tries++;
 try{
  const {w,d}=deepest(root);
  if(w&&d&&typeof w.render==='function'&&typeof w.makeCopy==='function'){
   install(w,d,payload);clearInterval(timer);
  }
 }catch(e){}
 if(tries>160)clearInterval(timer);
},250);
})();