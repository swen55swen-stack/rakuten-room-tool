(()=>{
const TARGET='https://swen55swen-stack.github.io/rakuten-room-tool/v56.html';

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
 "const itemUrl=a=>{try{const u=new URL(a.href,location.href);return u.hostname==='item.rakuten.co.jp'?u:null}catch(e){return null}};"+
 "const uniqLinks=el=>{const set=new Set();for(const a of el.querySelectorAll?.('a[href*=\\\"item.rakuten.co.jp/\\\"]')||[]){const u=itemUrl(a);if(u)set.add(u.origin+u.pathname)}return set.size};"+
 "const cardFor=a=>{let el=a;for(let i=0;i<7&&el;i++,el=el.parentElement){const n=uniqLinks(el);if(n===1&&(el.innerText||'').length<1800)return el}return a.parentElement||a};"+
 "const pickTitle=(a,box)=>{const vals=[];const imgs=[...a.querySelectorAll('img'),...box.querySelectorAll?.('img')||[]];for(const im of imgs){const v=clean(im.alt||im.title);if(v&&v.length>=6)vals.push(v)}for(const v of [a.getAttribute('title'),a.innerText]){const t=clean(v);if(t&&t.length>=6)vals.push(t)}for(const el of box.querySelectorAll?.('h1,h2,h3,h4,strong,b,p,span')||[]){const t=clean(el.innerText);if(t&&t.length>=8&&t.length<=180&&!/^(税込|送料無料|ポイント|残り|あと|レビュー|評価)/.test(t))vals.push(t)}vals.sort((x,y)=>{const hx=/#|ROOM|購入品/.test(x)?1:0,hy=/#|ROOM|購入品/.test(y)?1:0;if(hx!==hy)return hx-hy;return y.length-x.length});return (vals[0]||'楽天タイムセール商品').slice(0,180)};"+
 "const priceFrom=raw=>{const nums=[];for(const m of raw.matchAll(/[￥¥]\\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})/g))nums.push(Number(m[1].replace(/,/g,'')));for(const m of raw.matchAll(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})\\s*円/g))nums.push(Number(m[1].replace(/,/g,'')));return nums.length?Math.min(...nums.filter(n=>n>=100)):0};"+
 "const add=a=>{const u=itemUrl(a);if(!u)return;const bare=u.origin+u.pathname;if(out.some(x=>x.u===bare))return;const box=cardFor(a),raw=clean(box.innerText||a.innerText||'');const t=pickTitle(a,box).replace(/24時間限定プライス|24時間限定|タイムセール|超目玉アイテム|目玉アイテム/g,' ').replace(/\\s+/g,' ').trim();const p=priceFrom(raw);const img=(a.querySelector('img')?.src||box.querySelector('img')?.src||'');out.push({t,p,u:bare,i:img,d:raw.slice(0,1000)});};"+
 "const icons=[...document.querySelectorAll('img,[alt],[title]')].filter(el=>/24時間限定プライス|24時間限定|タイムセール/i.test((el.alt||'')+' '+(el.title||'')));for(const icon of icons){let box=icon;for(let lv=0;lv<8&&box;lv++,box=box.parentElement){const links=[...box.querySelectorAll('a[href*=\\\"item.rakuten.co.jp/\\\"]')];if(links.length){for(const a of links)add(a);break}}}"+
 "if(out.length<10){for(const h of [...document.querySelectorAll('h1,h2,h3,h4,[role=heading]')].filter(h=>/超目玉アイテム|目玉アイテム/.test(h.textContent||''))){let n=h.nextElementSibling,steps=0;while(n&&steps<20&&out.length<30){for(const a of n.querySelectorAll?.('a[href*=\\\"item.rakuten.co.jp/\\\"]')||[])add(a);n=n.nextElementSibling;steps++}}}"+
 "if(!out.length){alert('タイムセール商品を見つけられませんでした。商品が見える位置までスクロールしてからもう一度押してください。');return}"+
 "window.open('https://swen55swen-stack.github.io/rakuten-room-tool/v56.html#tsd='+encodeURIComponent(JSON.stringify(out.slice(0,30))),'_blank');"+
 "})()";
}

function detectType(x){
 const t=String(x.itemName||'');
 if(/マンゴー|ドライフルーツ|おせち|ドーナツ|スイーツ|お菓子|食品|グルメ|肉|魚|鮭|鯖|米|パン|コーヒー|お茶|カレー|麺|惣菜|冷凍|低糖質|グルテンフリー|スナック/i.test(t))return 'food';
 if(/イヤホン|ヘッドホン|Bluetooth|充電器|モバイルバッテリー|スマホ|家電|掃除機|ドライヤー/i.test(t))return 'electronics';
 if(/トミカ|おもちゃ|玩具|キッズ|ベビー|子供|知育|ぬいぐるみ|ブロック/i.test(t))return 'kids';
 if(/バッグ|財布|ポーチ|アクセサリー|ネックレス|ピアス|COACH|コーチ/i.test(t))return 'fashionGoods';
 if(/ニット|セーター|シャツ|トップス|ジャケット|ブルゾン|コート|パンツ|スカート|ワンピース|カーディガン|パーカー|スウェット|Tシャツ|カットソー|ブラウス|デニム|アウター|レディース|メンズ/i.test(t))return 'fashion';
 if(/コスメ|美容|化粧水|乳液|美容液|クレンジング|洗顔|シャンプー|トリートメント|ヘアオイル|ファンデ|リップ|スキンケア/i.test(t))return 'beauty';
 return 'other';
}
function saleFacts(x){
 const t=String(x.itemName||'')+' '+String(x.itemCaption||'');
 const facts=[];
 let m=t.match(/(\\d{1,2})\\s*%\\s*OFF/i);if(m)facts.push(m[1]+'%OFF');
 m=t.match(/([0-9,]{3,})\\s*円?\\s*[→⇒]\\s*([0-9,]{3,})\\s*円?/);if(m)facts.push(m[1]+'円→'+m[2]+'円');
 if(/クーポン/i.test(t))facts.push('クーポン情報あり');
 return [...new Set(facts)].slice(0,2);
}
function timesaleCopy(w,x){
 const type=detectType(x),facts=saleFacts(x),price=Number(x.itemPrice||0);
 const lines=['🔥 楽天24時間タイムセール掲載'];
 if(facts.length)lines.push('✨ '+facts.join(' / '));
 if(price>0)lines.push('💰 価格：'+w.yen(price));
 lines.push('',String(x.itemName||'楽天タイムセール商品').slice(0,180),'');
 let tags=['#楽天ROOM','#楽天市場','#タイムセール'];

 if(type==='fashion'){
  lines.push('ふわっと羽織れるアウターや着回しやすいトップスは、季節の変わり目にも使いやすいですよね🛍️');
  lines.push('タイムセール対象なら、気になっていたカラーやサイズをチェックするいいタイミング。普段使い・通勤・休日コーデなど、手持ちの服と合わせやすいか想像しながら選びたいアイテムです。');
  lines.push('サイズ感は人によって変わるので、着丈・身幅・素材・洗濯表示まで商品ページで確認してみてください♪');
  tags.push('#ファッション','#秋冬コーデ','#着回し');
 }else if(type==='fashionGoods'){
  lines.push('バッグや小物は、見た目だけじゃなく収納力や持ちやすさまで気になりますよね👜');
  lines.push('タイムセール中なら、普段使い用はもちろん、ちょっとしたお出かけ用やプレゼント候補としてもチェックしたいところ。デザインと実用性のバランスを見ながら選びたいアイテムです。');
  lines.push('気になったら、サイズ・素材・収納・ストラップ仕様を商品ページで確認してみてください♪');
  tags.push('#バッグ','#ファッション小物','#お出かけ');
 }else if(type==='food'){
  lines.push('タイムセールで見つけると、ついチェックしたくなるグルメ・食品アイテム🍴');
  lines.push('おやつ・ストック・家族で楽しむ用など、用途に合わせて選びやすいのがうれしいところ。割引やクーポンがある商品は、通常時との価格差も見ながら選びたいですね。');
  lines.push('内容量・原材料・賞味期限・保存方法、セット内容を商品ページで確認してから選ぶのがおすすめです♪');
  tags.push('#グルメ','#お取り寄せ','#食品');
 }else if(type==='electronics'){
  lines.push('タイムセールで家電やデジタル用品がお得になっていると気になりますよね🎧');
  lines.push('毎日使うものなら、価格だけでなく使いやすさや必要な機能がそろっているかも大事。普段使い・通勤・持ち運びなど、自分の使い方に合うか確認して選びたいアイテムです。');
  lines.push('対応機種・接続方式・充電時間・付属品など、詳しい仕様を商品ページで確認してみてください♪');
  tags.push('#家電','#便利グッズ','#デジタル');
 }else if(type==='kids'){
  lines.push('子ども向けアイテムは、遊びやすさや年齢に合っているかまで見て選びたいですよね🎁');
  lines.push('タイムセール中なら、誕生日や季節イベントのプレゼント候補にもチェックしやすいところ。好きなシリーズや遊び方に合うか見ながら選びたいアイテムです。');
  lines.push('対象年齢・サイズ・セット内容・注意事項を商品ページで確認してみてください♪');
  tags.push('#キッズ','#おもちゃ','#プレゼント');
 }else if(type==='beauty'){
  lines.push('毎日使う美容アイテムだからこそ、タイムセール中にお得にチェックできるとうれしいですよね✨');
  lines.push('価格だけでなく、容量や使い方、自分の好みに合いそうかも見ながら選びたいところ。いつも使っているものの買い足しや、気になっていた商品のきっかけにも◎');
  lines.push('成分・容量・使用方法・香りなどを商品ページで確認してみてください♪');
  tags.push('#美容','#コスメ','#スキンケア');
 }else{
  lines.push('24時間タイムセールで見つけた注目アイテム✨');
  lines.push('限られた時間だけの価格なら、前から気になっていた人にはチェックしやすいタイミング。値段だけで決めず、サイズや仕様、使い方まで確認して自分に合うか見ておきたいですね。');
  lines.push('詳しい商品仕様・セット内容・利用条件を商品ページで確認してみてください♪');
  tags.push('#お買い得','#セール情報');
 }
 let body=lines.join('\\n').replace(/\\n{3,}/g,'\\n\\n').trim();
 while(tags.length>3&&body.length+2+tags.join(' ').length>500)tags.pop();
 if(body.length+2+tags.join(' ').length>500)body=body.slice(0,500-2-tags.join(' ').length-1)+'…';
 return body+'\\n\\n'+tags.join(' ');
}
function makeItem(v,idx){
 return {
  itemCode:'v56-timesale-'+idx,
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
  _v56Timesale:true
 };
}
function syncCounters(d){
 [...d.querySelectorAll('article.card')].forEach(card=>{
  const ta=card.querySelector("textarea[id^='copy-']");
  if(!ta)return;
  const counter=[...card.querySelectorAll('.cardstatus')].find(el=>/^文字数[:：]/.test((el.textContent||'').trim()));
  if(counter)counter.textContent='文字数：'+ta.value.length+' / 500';
 });
}
function install(w,d,payload){
 if(w.__v56Installed)return;
 w.__v56Installed=true;
 d.addEventListener('input',e=>{
  if(e.target&&e.target.matches&&e.target.matches("textarea[id^='copy-']")){
   const card=e.target.closest('article.card');
   if(!card)return;
   const counter=[...card.querySelectorAll('.cardstatus')].find(el=>/^文字数[:：]/.test((el.textContent||'').trim()));
   if(counter)counter.textContent='文字数：'+e.target.value.length+' / 500';
  }
 });
 setTimeout(()=>syncCounters(d),300);
 const first=d.querySelector('section.panel');
 if(first&&!d.getElementById('v56box')){
  const box=d.createElement('div');box.id='v56box';box.className='warning';
  box.style.cssText='background:#fff1e6;border:2px solid #ff8a1f';
  const bm=bookmarklet().replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  box.innerHTML='<b style="font-size:16px">🔥 V56 タイムセール商品をそのまま取込</b><br>'+
   '<b>楽天APIの商品コード変換は使いません。</b><br>'+
   'タイムセールページに表示されている商品名・価格・URLをそのままV56へ渡します。<br><br>'+
   '<a class="btnlink" href="'+bm+'" style="background:#e86f00;color:#fff">🔥V56タイムセール取込</a>'+
   '<div style="margin-top:8px;font-size:12px">旧V47〜V50のお気に入りは使わず、これを新しく登録してください。</div>';
  first.parentNode.insertBefore(box,first);
 }
 if(payload.length){
  const allItems=payload.slice(0,30).map(makeItem);
  let page=0;
  const pageSize=10;
  function showPage(){
   const items=allItems.slice(page*pageSize,(page+1)*pageSize);
   w.__roomCandidates=items;
   w.eval('candidates = window.__roomCandidates; render();');
   setTimeout(()=>{
    [...d.querySelectorAll('article.card')].forEach((card,i)=>{
     const x=items[i];if(!x)return;
     const chips=card.querySelector('.chips');
     if(chips&&!chips.querySelector('.v56exact')){
      const a=d.createElement('span');a.className='chip v56exact';a.textContent='🔥 タイムセール実掲載 '+(page*10+i+1);
      a.style.cssText='background:#fff0e6;color:#b54708;font-weight:900';chips.prepend(a);
     }
     const ta=card.querySelector("textarea[id^='copy-']");
     if(ta){
      ta.value=timesaleCopy(w,x).slice(0,500);
      const counter=[...card.querySelectorAll('.cardstatus')].find(el=>/^文字数[:：]/.test((el.textContent||'').trim()));
      if(counter)counter.textContent='文字数：'+ta.value.length+' / 500';
     }
    });
    const nav=d.getElementById('v56pager');
    if(nav){
      nav.querySelector('#v56PageInfo').textContent=(page*10+1)+'〜'+Math.min((page+1)*10,allItems.length)+'件目 / 全'+allItems.length+'件';
      nav.querySelector('#v56Prev').disabled=page===0;
      nav.querySelector('#v56Next').disabled=(page+1)*pageSize>=allItems.length;
    }
   },100);
   w.status('タイムセール実掲載商品 '+(page*10+1)+'〜'+Math.min((page+1)*10,allItems.length)+'件目を表示中。全'+allItems.length+'件。');
  }
  let panel=d.getElementById('v56received');
  if(!panel){
   panel=d.createElement('div');panel.id='v56received';panel.className='warning';
   panel.style.cssText='background:#fffaf5;border-color:#ffb46b';
   panel.innerHTML='<b>🔥 タイムセール実掲載商品を '+allItems.length+'件受け取りました</b>'+
    '<div id="v56pager" style="display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap">'+
    '<button type="button" id="v56Prev">← 前の10件</button>'+
    '<b id="v56PageInfo"></b>'+
    '<button type="button" id="v56Next">次の10件 →</button></div>';
   first.parentNode.insertBefore(panel,first);
   panel.querySelector('#v56Prev').addEventListener('click',()=>{if(page>0){page--;showPage();window.scrollTo({top:panel.offsetTop,behavior:'smooth'})}});
   panel.querySelector('#v56Next').addEventListener('click',()=>{if((page+1)*pageSize<allItems.length){page++;showPage();window.scrollTo({top:panel.offsetTop,behavior:'smooth'})}});
   setTimeout(showPage,100);
  }
 }
 const h=d.querySelector('h1');if(h)h.textContent='楽天ROOM 自動リサーチ＋連続投稿 V56';
 const sub=d.querySelector('header .sub');if(sub)sub.textContent='タイムセールの商品カード情報から、その商品専用のROOM紹介文を生成';
}
const payload=getPayload();
function boot(){
 try{
  if(typeof window.render==='function'&&typeof window.makeCopy==='function'){
   install(window,document,payload);
   return;
  }
 }catch(e){console.error(e)}
 setTimeout(boot,150);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();