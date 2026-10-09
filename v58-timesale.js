(()=>{
const TARGET='https://swen55swen-stack.github.io/rakuten-room-tool/v58.html';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function getPayload(){
 const m=(location.hash||'').match(/(?:^#|[&#])tsd=([^&]+)/);
 if(!m)return [];
 try{
  const arr=JSON.parse(decodeURIComponent(m[1]));
  return Array.isArray(arr)?arr.slice(0,30):[];
 }catch(e){return []}
}
function bookmarklet(){
 return "javascript:(()=>{"+
 "const out=[];const clean=s=>String(s||'').replace(/\\s+/g,' ').trim();"+
 "const itemUrl=a=>{try{const u=new URL(a.href,location.href);return u.hostname==='item.rakuten.co.jp'?u:null}catch(e){return null}};"+
 "const add=a=>{const u=itemUrl(a);if(!u)return;const bare=u.origin+u.pathname;if(out.some(x=>x.u===bare))return;let box=a;for(let i=0;i<6&&box.parentElement;i++){const p=box.parentElement;if((p.innerText||'').length>1800)break;box=p}const raw=clean(box.innerText||a.innerText||'');const im=a.querySelector('img')||box.querySelector('img');out.push({u:bare,t:clean(im?.alt||a.getAttribute('title')||a.innerText||''),i:im?.src||'',d:raw.slice(0,700)});};"+
 "const icons=[...document.querySelectorAll('img,[alt],[title]')].filter(el=>/24時間限定プライス|24時間限定|タイムセール/i.test((el.alt||'')+' '+(el.title||'')));for(const icon of icons){let box=icon;for(let lv=0;lv<8&&box;lv++,box=box.parentElement){const links=[...box.querySelectorAll('a[href*=\\\"item.rakuten.co.jp/\\\"]')];if(links.length){for(const a of links)add(a);break}}}"+
 "for(const h of [...document.querySelectorAll('h1,h2,h3,h4,[role=heading]')].filter(h=>/超目玉アイテム|目玉アイテム/.test(h.textContent||''))){let n=h.nextElementSibling,steps=0;while(n&&steps<30&&out.length<30){for(const a of n.querySelectorAll?.('a[href*=\\\"item.rakuten.co.jp/\\\"]')||[])add(a);n=n.nextElementSibling;steps++}}"+
 "if(!out.length){alert('タイムセール商品を見つけられませんでした。商品が見える位置までスクロールしてからもう一度押してください。');return}"+
 "window.open('"+TARGET+"#tsd='+encodeURIComponent(JSON.stringify(out.slice(0,30))),'_blank');"+
 "})()";
}
function parseUrl(url){
 try{
  const u=new URL(url),p=u.pathname.split('/').filter(Boolean);
  return {shop:p[0]||'',id:p[1]||'',url:u.origin+u.pathname};
 }catch(e){return {shop:'',id:'',url:url||''}}
}
async function apiRequest(w,app,key,affiliate,params){
 const q=new URLSearchParams({applicationId:app,accessKey:key,format:'json',formatVersion:'1',hits:'30',...params});
 if(affiliate)q.set('affiliateId',affiliate);
 const url='https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?'+q.toString();
 const r=await w.callRakuten(url);
 if(r?.data?.error)throw new Error(r.data.error_description||r.data.error);
 return w.itemArray(r.data);
}
async function enrich(w,app,key,affiliate,v){
 const p=parseUrl(v.u);
 if(!p.shop||!p.id)return fallback(v);
 let items=[];
 try{
  items=await apiRequest(w,app,key,affiliate,{shopCode:p.shop,keyword:p.id});
 }catch(e){
  if(/429|rate limit/i.test(String(e?.message||e))){
   await sleep(1400);
   try{items=await apiRequest(w,app,key,affiliate,{shopCode:p.shop,keyword:p.id})}catch(e2){}
  }
 }
 let hit=items.find(x=>{
  try{
   const u=new URL(x.itemUrl||x.affiliateUrl||'');
   return (u.origin+u.pathname).replace(/\/$/,'')===p.url.replace(/\/$/,'');
  }catch(e){return false}
 });
 if(!hit&&items.length===1)hit=items[0];
 if(!hit){
  try{
   items=await apiRequest(w,app,key,affiliate,{keyword:p.id});
   hit=items.find(x=>String(x.itemCode||'').startsWith(p.shop+':'))||items.find(x=>{
    try{return new URL(x.itemUrl||'').pathname.includes('/'+p.id+'/')}catch(e){return false}
   });
  }catch(e){}
 }
 if(!hit)return fallback(v);
 return {...hit,_sourceUrl:v.u,_enriched:true};
}
function fallback(v){
 const p=parseUrl(v.u);
 return {
  itemName:(v.t&&!/楽天 商品|ありがとうございます|^Ray|^なっちゃん|^かり|^ちいろ|^ゆづ/i.test(v.t))?v.t:('楽天タイムセール商品（'+(p.shop||'商品')+'）'),
  itemPrice:0,itemUrl:v.u||'',affiliateUrl:'',itemCaption:v.d||'',
  reviewCount:0,reviewAverage:0,mediumImageUrls:v.i&&!/\/t\.gif/i.test(v.i)?[{imageUrl:v.i}]:[],
  _enriched:false
 };
}
function imageUrl(x){
 const a=x.mediumImageUrls||x.smallImageUrls||[];
 if(!a.length)return '';
 const v=a[0];return typeof v==='string'?v:(v?.imageUrl||v?.url||'');
}
function cleanName(s){
 return String(s||'').replace(/【[^】]{0,60}】/g,' ').replace(/\s+/g,' ').trim();
}
function typeOf(x){
 const t=(String(x.itemName||'')+' '+String(x.itemCaption||'')).toLowerCase();
 if(/マンゴー|ドライフルーツ|おせち|ドーナツ|スイーツ|お菓子|食品|グルメ|肉|魚|鮭|鯖|米|パン|コーヒー|お茶|カレー|麺|惣菜|冷凍|低糖質|グルテンフリー|スナック/.test(t))return 'food';
 if(/イヤホン|ヘッドホン|bluetooth|充電器|モバイルバッテリー|スマホ|掃除機|家電/.test(t))return 'electronics';
 if(/トミカ|おもちゃ|玩具|キッズ|ベビー|子供|知育|ぬいぐるみ|ブロック/.test(t))return 'kids';
 if(/バッグ|財布|ポーチ|アクセサリー|ネックレス|ピアス|coach|コーチ/.test(t))return 'goods';
 if(/ニット|セーター|シャツ|トップス|ジャケット|ブルゾン|コート|パンツ|スカート|ワンピース|カーディガン|パーカー|スウェット|tシャツ|カットソー|ブラウス|デニム|アウター|レディース|メンズ/.test(t))return 'fashion';
 if(/コスメ|美容|化粧水|乳液|美容液|クレンジング|洗顔|シャンプー|トリートメント|ヘアオイル|ファンデ|リップ|スキンケア/.test(t))return 'beauty';
 return 'other';
}
function saleFacts(x){
 const t=String(x.itemName||'')+' '+String(x.itemCaption||'');
 const a=[];
 let m=t.match(/(\d{1,2})\s*%\s*OFF/i);if(m)a.push(m[1]+'%OFF');
 m=t.match(/([0-9,]{3,})\s*円?\s*[→⇒＞>]\s*([0-9,]{3,})\s*円?/);if(m)a.push(m[1]+'円→'+m[2]+'円');
 if(/クーポン/i.test(t))a.push('クーポン情報あり');
 return [...new Set(a)].slice(0,2);
}
function makeCopy(w,x){
 const type=typeOf(x),facts=saleFacts(x),price=Number(x.itemPrice||0),rc=Number(x.reviewCount||0),ra=Number(x.reviewAverage||0);
 const lines=['🔥 楽天24時間タイムセール掲載'];
 if(facts.length)lines.push('✨ '+facts.join(' / '));
 if(price>0)lines.push('💰 価格：'+w.yen(price));
 if(rc>0&&ra>0)lines.push('⭐ レビュー'+rc.toLocaleString()+'件・評価'+Number(ra).toFixed(2));
 lines.push('',cleanName(x.itemName).slice(0,170),'');
 let tags=['#楽天ROOM','#楽天市場','#タイムセール'];
 if(type==='fashion'){
  lines.push('タイムセールでチェックしたいファッションアイテム🛍️');
  lines.push('普段使いしやすいか、手持ちの服と合わせやすいかを想像しながら選びたいですね。デザインだけでなく、着丈やシルエット、素材感まで見ておくと選びやすそうです。');
  lines.push('カラー・サイズ・素材・洗濯表示を商品ページで確認してみてください♪');
  tags.push('#ファッション','#着回し','#コーデ');
 }else if(type==='food'){
  lines.push('タイムセールで見つけると気になるグルメ・食品アイテム🍴');
  lines.push('おやつやストック、家族で楽しむ用など、使う場面を考えながら選びたいところ。セット商品なら1袋あたりの量や個数も見ておくと比較しやすいですね。');
  lines.push('内容量・原材料・賞味期限・保存方法を商品ページで確認してみてください♪');
  tags.push('#グルメ','#食品','#お取り寄せ');
 }else if(type==='electronics'){
  lines.push('タイムセール中にチェックしたいデジタル・家電アイテム🎧');
  lines.push('価格だけでなく、普段の使い方に必要な機能がそろっているかも大事。持ち運びやすさや充電方法、対応機器なども見ながら選びたいですね。');
  lines.push('対応機種・接続方式・充電時間・付属品を商品ページで確認してみてください♪');
  tags.push('#家電','#便利グッズ','#デジタル');
 }else if(type==='kids'){
  lines.push('タイムセールで見つけたキッズ向けアイテム🎁');
  lines.push('誕生日や季節イベントのプレゼント候補にもチェックしやすいですね。好きなシリーズか、年齢に合った遊び方ができそうかも見ながら選びたいところ。');
  lines.push('対象年齢・サイズ・セット内容・注意事項を商品ページで確認してみてください♪');
  tags.push('#キッズ','#おもちゃ','#プレゼント');
 }else if(type==='goods'){
  lines.push('タイムセール中にチェックしたいバッグ・ファッション小物👜');
  lines.push('見た目だけでなく、収納力や持ちやすさも大事なポイント。普段使いか、お出かけ用かを考えながら、手持ちの服に合わせやすいデザインを選びたいですね。');
  lines.push('サイズ・素材・収納・ストラップ仕様を商品ページで確認してみてください♪');
  tags.push('#バッグ','#ファッション小物','#お出かけ');
 }else if(type==='beauty'){
  lines.push('毎日使う美容アイテムは、タイムセール中にチェックできるとうれしいですよね✨');
  lines.push('買い足し用はもちろん、気になっていた商品を試すきっかけにも。価格だけでなく、容量や使い方、自分の好みに合いそうかまで見て選びたいところです。');
  lines.push('成分・容量・使用方法・香りなどを商品ページで確認してみてください♪');
  tags.push('#美容','#コスメ','#スキンケア');
 }else{
  lines.push('24時間タイムセールで見つけた注目アイテム✨');
  lines.push('限られた時間だけの価格なら、気になっていた人にはチェックしやすいタイミング。価格だけで決めず、商品ページで特徴や仕様まで見ながら自分に合うか確認したいですね。');
  lines.push('サイズ・仕様・セット内容・利用条件を商品ページで確認してみてください♪');
  tags.push('#お買い得','#セール情報');
 }
 let body=lines.join('\n').replace(/\n{3,}/g,'\n\n').trim();
 while(tags.length>3&&body.length+2+tags.join(' ').length>500)tags.pop();
 if(body.length+2+tags.join(' ').length>500)body=body.slice(0,500-2-tags.join(' ').length-1)+'…';
 return body+'\n\n'+tags.join(' ');
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function copyText(text){
 try{await navigator.clipboard.writeText(text);return true}catch(e){}
 const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();
 let ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();return ok;
}
function install(w,d,payload){
 if(w.__v58Installed)return;w.__v58Installed=true;
 const first=d.querySelector('section.panel');
 if(first&&!d.getElementById('v58box')){
  const box=d.createElement('div');box.id='v58box';box.className='warning';box.style.cssText='background:#fff1e6;border:2px solid #ff8a1f';
  const bm=bookmarklet().replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  box.innerHTML='<b style="font-size:16px">🔥 V58 タイムセール正式商品情報版</b><br>商品URLを取得後、表示する10件だけ楽天APIで正式な商品名・価格・画像・レビューを補完します。<br><br><a class="btnlink" href="'+bm+'" style="background:#e86f00;color:#fff">🔥V58タイムセール取込</a>';
  first.parentNode.insertBefore(box,first);
 }
 if(!payload.length)return;
 const app=d.getElementById('appId')?.value.trim()||'',key=d.getElementById('accessKey')?.value.trim()||'',affiliate=d.getElementById('affiliateId')?.value.trim()||'';
 const panel=d.createElement('div');panel.className='warning';panel.style.cssText='background:#fffaf5;border-color:#ffb46b';
 panel.innerHTML='<b>🔥 タイムセール商品 '+payload.length+'件</b><div id="v58nav" style="display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap"><button id="v58prev">← 前の10件</button><b id="v58info"></b><button id="v58next">次の10件 →</button></div><div id="v58load" style="margin-top:8px"></div>';
 first.parentNode.insertBefore(panel,first);
 const results=d.getElementById('results');results.innerHTML='';
 const cache=new Map();let page=0,busy=false;
 async function loadPage(){
  if(busy)return;busy=true;
  const start=page*10,end=Math.min(start+10,payload.length),rows=[];
  panel.querySelector('#v58info').textContent=(start+1)+'〜'+end+'件目 / 全'+payload.length+'件';
  panel.querySelector('#v58prev').disabled=page===0;
  panel.querySelector('#v58next').disabled=end>=payload.length;
  results.innerHTML='<div class="empty">正式な商品情報を取得しています…</div>';
  for(let i=start;i<end;i++){
   panel.querySelector('#v58load').textContent='商品情報を取得中… '+(i-start+1)+' / '+(end-start);
   let x=cache.get(i);
   if(!x){
    if(app&&key)x=await enrich(w,app,key,affiliate,payload[i]); else x=fallback(payload[i]);
    cache.set(i,x);
    if(i<end-1)await sleep(1200);
   }
   rows.push(x);
  }
  results.innerHTML='';
  rows.forEach((x,j)=>{
   const no=start+j+1,img=imageUrl(x),copy=makeCopy(w,x),price=Number(x.itemPrice||0);
   const card=d.createElement('article');card.className='card';
   card.innerHTML='<div class="top"><div class="rank">'+no+'位</div>'+(img?'<img class="thumb" src="'+esc(img)+'" referrerpolicy="no-referrer">':'')+
    '<div class="meta"><h3>'+esc(cleanName(x.itemName))+'</h3><div class="chips"><span class="chip" style="background:#fff0e6;color:#b54708;font-weight:900">🔥 タイムセール実掲載</span>'+
    (price?'<span class="chip">'+esc(w.yen(price))+'</span>':'<span class="chip">価格は商品ページで確認</span>')+
    (x.reviewCount?'<span class="chip">レビュー '+Number(x.reviewCount).toLocaleString()+'件</span>':'')+
    (x.reviewAverage?'<span class="chip">評価 '+Number(x.reviewAverage).toFixed(2)+'</span>':'')+
    (!x._enriched?'<span class="chip">商品情報補完なし</span>':'')+'</div></div></div>'+
    '<textarea id="v58copy-'+no+'" readonly>'+esc(copy)+'</textarea><div class="cardstatus">文字数：'+copy.length+' / 500</div>'+
    '<div class="actions"><button class="primary" id="v58prepare-'+no+'">この内容で投稿準備</button><button class="gray" id="v58copybtn-'+no+'">文章コピー</button></div><div class="cardstatus" id="v58status-'+no+'"></div>';
   results.appendChild(card);
   card.querySelector('#v58copybtn-'+no).addEventListener('click',async()=>{const ok=await copyText(copy);card.querySelector('#v58status-'+no).textContent=ok?'✅ コピーしました。':'コピーできませんでした。'});
   card.querySelector('#v58prepare-'+no).addEventListener('click',async()=>{await copyText(copy);window.open(x.itemUrl||x._sourceUrl||payload[start+j].u,'_blank');});
  });
  panel.querySelector('#v58load').textContent=xSummary(rows);
  let bottom=d.getElementById('v58bottom');
  if(!bottom){bottom=d.createElement('div');bottom.id='v58bottom';bottom.style.cssText='display:flex;gap:8px;justify-content:center;align-items:center;margin:20px 0 30px';results.after(bottom)}
  bottom.innerHTML='<button id="v58prevB">← 前の10件</button><b>'+(start+1)+'〜'+end+'件目 / 全'+payload.length+'件</b><button id="v58nextB">次の10件 →</button>';
  bottom.querySelector('#v58prevB').disabled=page===0;bottom.querySelector('#v58nextB').disabled=end>=payload.length;
  bottom.querySelector('#v58prevB').onclick=()=>{if(page>0){page--;loadPage();panel.scrollIntoView({behavior:'smooth'})}};
  bottom.querySelector('#v58nextB').onclick=()=>{if(end<payload.length){page++;loadPage();panel.scrollIntoView({behavior:'smooth'})}};
  busy=false;
 }
 function xSummary(rows){const n=rows.filter(x=>x._enriched).length;return '正式商品情報を '+n+' / '+rows.length+'件補完しました。'+(app&&key?'':' Application ID / Access Keyを入力すると補完できます。')}
 panel.querySelector('#v58prev').onclick=()=>{if(page>0){page--;loadPage()}};
 panel.querySelector('#v58next').onclick=()=>{if((page+1)*10<payload.length){page++;loadPage()}};
 loadPage();
 const h=d.querySelector('h1');if(h)h.textContent='楽天ROOM 自動リサーチ＋連続投稿 V58 軽量版';
}
const payload=getPayload();
function boot(){
 try{if(typeof window.callRakuten==='function'&&typeof window.itemArray==='function'){install(window,document,payload);return}}catch(e){console.error(e)}
 setTimeout(boot,150);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();