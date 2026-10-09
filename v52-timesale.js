(()=>{
const TARGET='https://swen55swen-stack.github.io/rakuten-room-tool/v52.html';

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
 "const out=[];const clean=s=>String(s||'').replace(/\\s+/g,' ').trim();"+
 "const itemLink=a=>{try{const u=new URL(a.href,location.href);return u.hostname==='item.rakuten.co.jp'?u:null}catch(e){return null}};"+
 "const pickTitle=(a,box)=>{const vals=[];const im=a.querySelector('img')||box?.querySelector('img');if(im){vals.push(im.alt,im.title)}vals.push(a.getAttribute('title'),a.innerText);for(const el of box?.querySelectorAll?.('h1,h2,h3,h4,strong,b,p,span')||[]){const t=clean(el.innerText);if(t&&t.length>=8&&t.length<=140&&!/^(税込|送料無料|ポイント|￥|¥|[0-9,]+円)/.test(t))vals.push(t)}return vals.map(clean).filter(Boolean).sort((x,y)=>y.length-x.length)[0]||'楽天タイムセール商品'};"+
 "const add=(a,box)=>{const u=itemLink(a);if(!u)return;const bare=u.origin+u.pathname;if(out.some(x=>x.u===bare))return;const raw=clean(box?.innerText||a.innerText||'');const title=pickTitle(a,box).replace(/24時間限定プライス|24時間限定|タイムセール|超目玉アイテム|目玉アイテム/g,' ').replace(/\\s+/g,' ').trim().slice(0,160);const nums=[...raw.matchAll(/(?:税込)?\\s*[￥¥]?\\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})\\s*円/g)].map(m=>Number(m[1].replace(/,/g,''))).filter(n=>n>0);const price=nums.length?Math.min(...nums):0;const img=(a.querySelector('img')?.src||box?.querySelector('img')?.src||'');out.push({t:title,p:price,u:bare,i:img,d:raw.slice(0,1200)});};"+
 "const icons=[...document.querySelectorAll('img,[alt],[title]')].filter(el=>/24時間限定プライス|24時間限定|タイムセール/i.test((el.alt||'')+' '+(el.title||'')));for(const icon of icons){let box=icon;for(let lv=0;lv<8&&box;lv++,box=box.parentElement){const links=[...box.querySelectorAll('a[href*=\\\"item.rakuten.co.jp/\\\"]')];if(links.length){for(const a of links)add(a,box);break}}}"+
 "if(!out.length){const heads=[...document.querySelectorAll('h1,h2,h3,h4,[role=heading]')].filter(h=>/超目玉アイテム|目玉アイテム/.test(h.textContent||''));for(const h of heads){let n=h.nextElementSibling,steps=0;while(n&&steps<12){for(const a of n.querySelectorAll?.('a[href*=\\\"item.rakuten.co.jp/\\\"]')||[])add(a,n);n=n.nextElementSibling;steps++}}}"+
 "if(!out.length){alert('タイムセール商品を見つけられませんでした。商品が見える位置までスクロールしてからもう一度押してください。');return}"+
 "window.open('https://swen55swen-stack.github.io/rakuten-room-tool/v52.html#tsd='+encodeURIComponent(JSON.stringify(out.slice(0,10))),'_blank');"+
 "})()";
}

function timesaleCopy(w,x){
 const text=(String(x.itemName||'')+' '+String(x.itemCaption||'')).replace(/\\s+/g,' ');
 const lines=['🔥 楽天24時間タイムセール掲載'];
 const price=Number(x.itemPrice||0);
 if(price>0)lines.push('💰 価格：'+w.yen(price));
 lines.push('',String(x.itemName||'楽天タイムセール商品').slice(0,180),'');
 let tags=['#楽天ROOM','#楽天市場','#タイムセール'];

 const fashion=/ニット|セーター|シャツ|トップス|ジャケット|ブルゾン|コート|パンツ|スカート|ワンピース|カーディガン|パーカー|スウェット|Tシャツ|カットソー|ブラウス|デニム/i.test(text);
 const food=/食品|グルメ|肉|魚|鮭|鯖|米|パン|スイーツ|お菓子|コーヒー|お茶|マンゴー|カレー|麺|惣菜|冷凍/i.test(text);
 const beauty=/コスメ|美容|化粧水|乳液|美容液|クレンジング|洗顔|シャンプー|トリートメント|ヘアオイル|ファンデ|リップ|スキンケア/i.test(text);

 if(fashion){
  lines.push('タイムセールでチェックしたいファッションアイテム🛍️');
  lines.push('デザインだけでなく、サイズ感や素材もしっかり見て選びたいですね。');
  lines.push('気になったら、カラー・サイズ・素材・洗濯表示を商品ページで確認してみてください♪');
  tags.push('#ファッション','#コーデ');
 }else if(food){
  lines.push('タイムセールでお得にチェックしたいグルメ・食品アイテム🍴');
  lines.push('普段使いはもちろん、ストック用やお試しにも候補に入れやすいですね。');
  lines.push('気になったら、内容量・原材料・賞味期限・保存方法を商品ページで確認してみてください♪');
  tags.push('#グルメ','#お取り寄せ');
 }else if(beauty){
  lines.push('タイムセール中にチェックしておきたい美容アイテム✨');
  lines.push('毎日使うものだからこそ、使い方や容量まで見ながら選びたいですね。');
  lines.push('気になったら、成分・容量・使用方法を商品ページで確認してみてください♪');
  tags.push('#美容','#コスメ');
 }else{
  lines.push('24時間タイムセールで見つけた注目アイテム✨');
  lines.push('通常時よりお得に買えるタイミングなら、気になっていた人はチェックしておきたいところ。');
  lines.push('詳しいサイズ・仕様・利用条件は商品ページで確認してみてください♪');
  tags.push('#お買い得');
 }

 const m=text.match(/(\\d{1,2})\\s*%\\s*OFF/i);
 if(m){lines.splice(1,0,'✨ '+m[1]+'%OFF');tags.push('#'+m[1]+'OFF')}
 let body=lines.join('\\n').replace(/\\n{3,}/g,'\\n\\n').trim();
 while(tags.length>3&&body.length+2+tags.join(' ').length>500)tags.pop();
 if(body.length+2+tags.join(' ').length>500)body=body.slice(0,500-2-tags.join(' ').length-1)+'…';
 return body+'\\n\\n'+tags.join(' ');
}
function makeItem(v,idx){
 return {
  itemCode:'v52-timesale-'+idx,
  itemName:v.t||'楽天タイムセール商品',
  itemPrice:Number(v.p||0),
  itemUrl:v.u||'',
  affiliateUrl:'',
  catchcopy:'楽天24時間タイムセール実掲載',
  itemCaption:(v.d||'楽天24時間タイムセールページに掲載されている商品'),
  reviewCount:0,
  reviewAverage:0,
  availability:1,
  pointRate:1,
  mediumImageUrls:v.i?[{imageUrl:v.i}]:[],
  smallImageUrls:v.i?[{imageUrl:v.i}]:[],
  rank:idx+1,
  _score:100-idx,
  _room:100-idx,
  _v52Timesale:true
 };
}
function install(w,d,payload){
 if(w.__v52Installed)return;
 w.__v52Installed=true;
 const first=d.querySelector('section.panel');
 if(first&&!d.getElementById('v52box')){
  const box=d.createElement('div');box.id='v52box';box.className='warning';
  box.style.cssText='background:#fff1e6;border:2px solid #ff8a1f';
  const bm=bookmarklet().replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  box.innerHTML='<b style="font-size:16px">🔥 V52 タイムセール商品をそのまま取込</b><br>'+
   '<b>楽天APIの商品コード変換は使いません。</b><br>'+
   'タイムセールページに表示されている商品名・価格・URLをそのままV52へ渡します。<br><br>'+
   '<a class="btnlink" href="'+bm+'" style="background:#e86f00;color:#fff">🔥V52タイムセール取込</a>'+
   '<div style="margin-top:8px;font-size:12px">旧V47〜V50のお気に入りは使わず、これを新しく登録してください。</div>';
  first.parentNode.insertBefore(box,first);
 }
 if(payload.length){
  const items=payload.map(makeItem);
  let panel=d.getElementById('v52received');
  if(!panel){
   panel=d.createElement('div');panel.id='v52received';panel.className='warning';
   panel.style.cssText='background:#fffaf5;border-color:#ffb46b';
   panel.innerHTML='<b>🔥 タイムセール実掲載商品を '+items.length+'件受け取りました</b>'+
    '<div style="margin-top:7px;font-size:12px">'+items.map((x,i)=>(i+1)+'. '+(x.itemName||'').slice(0,70)+(x.itemPrice?' / '+x.itemPrice.toLocaleString()+'円':'')).join('<br>')+'</div>'+
    '<button type="button" id="v52ShowBtn" style="margin-top:10px;background:#e86f00;color:#fff">🔥 この商品をそのまま表示</button>';
   first.parentNode.insertBefore(panel,first);
   panel.querySelector('#v52ShowBtn').addEventListener('click',()=>{
    w.__roomCandidates=items;
    w.eval('candidates = window.__roomCandidates; render();');
    setTimeout(()=>{
     [...d.querySelectorAll('article.card')].forEach((card,i)=>{
      const x=items[i];if(!x)return;
      const chips=card.querySelector('.chips');
      if(chips&&!chips.querySelector('.v52exact')){
       const a=d.createElement('span');a.className='chip v52exact';a.textContent='🔥 タイムセール実掲載';
       a.style.cssText='background:#fff0e6;color:#b54708;font-weight:900';chips.prepend(a);
      }
      const ta=card.querySelector("textarea[id^='copy-']");
      if(ta){
       ta.value=timesaleCopy(w,x).slice(0,500);
       const scope=ta.closest('article.card')||ta.parentElement;
       const counter=[...(scope?.querySelectorAll('*')||[])].find(el=>/^文字数[:：]/.test((el.textContent||'').trim()));
       if(counter)counter.textContent='文字数：'+ta.value.length+' / 500（V52実掲載商品）';
      }
     });
    },150);
    w.status('完了：タイムセールページで見えていた商品を、そのまま表示しました。楽天APIによる商品置換はしていません。');
   });
  }
 }
 const h=d.querySelector('h1');if(h)h.textContent='楽天ROOM 自動リサーチ＋連続投稿 V52';
 const sub=d.querySelector('header .sub');if(sub)sub.textContent='タイムセールの商品カード情報から、その商品専用のROOM紹介文を生成';
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