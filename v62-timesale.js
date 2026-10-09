(()=>{
const TARGET='https://swen55swen-stack.github.io/rakuten-room-tool/v62.html';
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
 for(let attempt=0;attempt<3;attempt++){
  try{
   const r=await w.callRakuten(url);
   if(r?.data?.error)throw new Error(r.data.error_description||r.data.error);
   return w.itemArray(r.data);
  }catch(e){
   const msg=String(e?.message||e);
   if(/429|rate limit/i.test(msg) && attempt<2){
    await sleep(1800+(attempt*1200));
    continue;
   }
   throw e;
  }
 }
 return [];
}
function norm(s){
 return String(s||'').toLowerCase()
  .replace(/https?:\/\/[^\s]+/g,' ')
  .replace(/[【】\[\]（）()「」『』〈〉<>]/g,' ')
  .replace(/[★☆♪♡❤♥︎⭐️✨🔥💰🎁🛍️]/g,' ')
  .replace(/[%％]/g,' ')
  .replace(/[^0-9a-zぁ-んァ-ヶ一-龠ー]+/g,' ')
  .replace(/\s+/g,' ').trim();
}
function tokens(s){
 return norm(s).split(' ').filter(v=>v.length>=2).slice(0,30);
}
function similarity(a,b){
 const A=tokens(a),B=new Set(tokens(b));
 if(!A.length)return 0;
 let hit=0,weighted=0;
 A.forEach((t,i)=>{const w=Math.max(1,6-Math.floor(i/4));weighted+=w;if(B.has(t)){hit+=w}else{
   for(const x of B){if((x.includes(t)||t.includes(x))&&Math.min(x.length,t.length)>=3){hit+=w*.65;break}}
 }});
 return Math.round((hit/Math.max(1,weighted))*100);
}
function candidateScore(x,p,v){
 let score=0;
 const code=String(x.itemCode||'').toLowerCase();
 const url=String(x.itemUrl||x.affiliateUrl||'');
 let xu=null;try{xu=new URL(url)}catch(e){}
 const xpath=(xu?.pathname||'').replace(/\/$/,'').toLowerCase();
 const targetPath=(new URL(p.url)).pathname.replace(/\/$/,'').toLowerCase();

 if(xpath===targetPath)score+=120;
 else if(xpath&&p.id&&xpath.includes('/'+p.id.toLowerCase()))score+=85;

 if(code.startsWith(p.shop.toLowerCase()+':'))score+=45;
 if(code.includes(p.id.toLowerCase()))score+=75;

 const simTitle=similarity(v.t,x.itemName);
 const simDesc=similarity(v.d,(x.itemName||'')+' '+(x.catchcopy||'')+' '+(x.itemCaption||''));
 score+=Math.round(simTitle*.8+simDesc*.25);

 if(v.t && /楽天 商品|ありがとうございます|^Ray|^なっちゃん|^かり|^ちいろ|^ゆづ/i.test(v.t))score-=20;
 return {score,simTitle,simDesc};
}
async function collectCandidates(w,app,key,affiliate,p,v){
 const groups=[];
 const queries=[];
 if(p.shop&&p.id){
  queries.push({shopCode:p.shop,keyword:p.id});
  const idParts=p.id.replace(/[-_]/g,' ').split(/\s+/).filter(Boolean);
  if(idParts.length>1)queries.push({shopCode:p.shop,keyword:idParts.join(' ')});
 }
 const vt=norm(v.t);
 if(p.shop&&vt&&vt.length>=4)queries.push({shopCode:p.shop,keyword:vt.slice(0,90)});
 if(p.id)queries.push({keyword:p.id});
 
 for(const q of queries){
  try{
   const items=await apiRequest(w,app,key,affiliate,q);
   groups.push(...items);
  }catch(e){}
  await sleep(1350);
 }
 const map=new Map();
 for(const x of groups){
  const k=String(x.itemCode||x.itemUrl||Math.random());
  if(!map.has(k))map.set(k,x);
 }
 return [...map.values()];
}
async function enrich(w,app,key,affiliate,v){
 const p=parseUrl(v.u);
 if(!p.shop||!p.id)return {...fallback(v),_confidence:0,_matchReason:'URL解析不可'};
 const candidates=await collectCandidates(w,app,key,affiliate,p,v);
 if(!candidates.length)return {...fallback(v),_confidence:0,_matchReason:'候補なし'};

 const ranked=candidates.map(x=>({x,...candidateScore(x,p,v)})).sort((a,b)=>b.score-a.score);
 const best=ranked[0];
 const second=ranked[1];
 const gap=best.score-(second?.score||0);

 // High confidence requires URL/code/shop evidence, or a strong title match with clear margin.
 const confident =
   best.score>=120 ||
   (best.score>=95 && gap>=18) ||
   (best.score>=80 && best.simTitle>=65 && gap>=25);

 if(!confident){
   return {...fallback(v),_confidence:Math.max(0,best.score),_matchReason:'一致度不足 '+best.score,_candidateName:best.x?.itemName||''};
 }
 const eventPrice=extractEventSalePrice(v);
 return {...best.x,_sourceUrl:v.u,_enriched:true,_confidence:best.score,_matchReason:'照合OK '+best.score,_eventPrice:eventPrice};
}
function extractEventSalePrice(v){
 const t=String(v?.t||'')+' '+String(v?.d||'');
 let m=t.match(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})\s*円?\s*[→⇒＞>]\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})\s*円?/);
 if(m)return Number(m[2].replace(/,/g,''));
 m=t.match(/(?:タイムセール|SALE|セール|限定価格|特価)[^0-9]{0,20}([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})\s*円/i);
 if(m)return Number(m[1].replace(/,/g,''));
 m=t.match(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})\s*円\s*(?:税込)?(?:\s|$)/);
 return m?Number(m[1].replace(/,/g,'')):0;
}
function compactTitle(v){
 let raw=(String(v?.t||'')+' '+String(v?.d||'')).replace(/\s+/g,' ').trim();

 // Strip hashtags and obvious ROOM chatter first.
 let t=raw
  .replace(/#\S+/g,' ')
  .replace(/[⭐️✨🔥💫☘️♡❤♥︎🉐👀💕🥰🌟🌷◻︎𓂃◌𓈒𓐍🧸˚✧₊・]+/g,' ')
  .replace(/\s+/g,' ')
  .trim();

 // High-confidence product-specific patterns.
 let m;
 m=t.match(/(?:70g\s*[×xX]\s*3袋(?:set)?[^。]{0,35})?(?:無添加[^。]{0,50})?(?:ドライ)?マンゴー(?:100[%％])?[^。]{0,30}/i);
 if(m){
   const q=(t.match(/70g\s*[×xX]\s*3袋(?:set)?/i)||[])[0]||'';
   return ('無添加ドライマンゴー '+q).replace(/\s+/g,' ').trim().slice(0,100);
 }

 m=t.match(/トミカプレミアム\s*unlimited\s*10\s*よろしくメカドック\s*セリカ\s*XX/i);
 if(m)return 'トミカプレミアム unlimited 10 よろしくメカドック セリカ XX';

 m=t.match(/みなとみらいドーナツ\s*ミルクマロン[^。]{0,30}/i);
 if(m){
   const q=(m[0].match(/\d+個入/)||[])[0]||'';
   return ('みなとみらいドーナツ ミルクマロン '+q).replace(/\s+/g,' ').trim();
 }

 if(/ワイヤレスイヤホン|Bluetoothイヤホン/i.test(t)){
   const parts=[];
   if(/ノイズキャンセリング|ノイキャン/i.test(t))parts.push('ノイズキャンセリング');
   parts.push('ワイヤレスイヤホン');
   const bt=(t.match(/Bluetooth\s*6(?:\.0)?/i)||[])[0];
   if(bt)parts.push(bt.replace(/\s+/g,''));
   if(/AAC対応/i.test(t))parts.push('AAC対応');
   return parts.join(' ').slice(0,110);
 }

 // Generic product-title extraction for future unmatched items.
 const productWords=[
  'ドライマンゴー','マンゴー','トミカ','ドーナツ','イヤホン','ヘッドホン','バッグ','ショルダーバッグ',
  'ジャケット','ブルゾン','カーディガン','ニット','スナック','おせち','クレンジング','シャンプー',
  '化粧水','美容液','スニーカー','財布','おもちゃ','フィギュア','タオル','毛布','布団'
 ];
 for(const w of productWords){
   const idx=t.toLowerCase().indexOf(w.toLowerCase());
   if(idx>=0){
     let start=Math.max(0,idx-35),end=Math.min(t.length,idx+90);
     let part=t.slice(start,end)
       .replace(/^.*?(?:タイムセール|SALE|セール|限定)[^ぁ-んァ-ヶ一-龠A-Za-z0-9]{0,8}/i,'')
       .replace(/(?:ありがとうございます|おすすめ|買って良かった|リピ中商品|オリジナル写真).*$/i,'')
       .replace(/\s+/g,' ').trim();
     if(part.length>=6)return part.slice(0,120);
   }
 }

 // Last resort: never use an entire ROOM post as a title.
 t=t
  .replace(/^.*?(?:タイムセール|SALE|セール)\s*/i,'')
  .replace(/(?:ありがとうございます|よろしくお願いします|おすすめ|買って良かった|リピ中商品|オリジナル写真).*$/i,'')
  .replace(/\s+/g,' ').trim();

 const chunks=t.split(/[。！？!?]/).map(x=>x.trim()).filter(x=>x.length>=6);
 const best=chunks.find(x=>x.length<=100)||chunks[0]||'楽天タイムセール商品';
 return best.slice(0,100);
}
function fallback(v){
 const p=parseUrl(v.u);
 const price=extractEventSalePrice(v);
 return {
  itemName:compactTitle(v),
  itemPrice:price,
  itemUrl:v.u||'',affiliateUrl:'',itemCaption:v.d||'',
  reviewCount:0,reviewAverage:0,
  mediumImageUrls:v.i&&!/\/t\.gif/i.test(v.i)?[{imageUrl:v.i}]:[],
  _enriched:false,_eventPrice:price,_sourceUrl:v.u||''
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

 // 明確な専門カテゴリを先に判定
 if(/まつげ美容液|まつ毛美容液|ハイドロキノン|ヒト幹細胞|cica|シカ|アゼライン酸|ヒアルロン酸|美容液|化粧水|乳液|クレンジング|洗顔|シャンプー|トリートメント|ヘアオイル|ファンデ|リップ|スキンケア|コスメ|美肌/.test(t))return 'beauty';

 if(/シート収納|シートボックス|助手席|車内|カー用品|ドライブ|トランク収納|車載|シートクッションボックス/.test(t))return 'car';

 if(/部屋着|ルームウェア|ルームウエア|パジャマ|ナイトウェア|ナイトウエア|寝巻き|寝間着|腹巻付き|リラックスウェア/.test(t))return 'roomwear';

 if(/グリーンティー|緑茶|お茶|機能性表示食品|内臓脂肪|ウエスト径|bmi|水分補給|飲料|ドリンク/.test(t))return 'drink';

 if(/水切りマット|水切りラック|水筒スタンド|ボトルスタンド|キッチンクロス|キッチンタオル|キッチン用品|収納ボックス|収納ケース|折りたたみ収納/.test(t))return 'home';

 if(/イヤホン|ヘッドホン|bluetooth|充電器|モバイルバッテリー|スマホ|掃除機|家電|ドライヤー/.test(t))return 'electronics';

 if(/トミカ|おもちゃ|玩具|キッズ|ベビー|子供|知育|ぬいぐるみ|ブロック/.test(t))return 'kids';

 if(/バッグ|財布|ポーチ|アクセサリー|ネックレス|ピアス|coach|コーチ/.test(t))return 'goods';

 if(/ニット|セーター|シャツ|トップス|ジャケット|ブルゾン|コート|パンツ|スカート|ワンピース|カーディガン|パーカー|スウェット|tシャツ|カットソー|ブラウス|デニム|アウター|レディース|メンズ/.test(t))return 'fashion';

 // 食品は最後
 if(/マンゴー|ドライフルーツ|おせち|ドーナツ|スイーツ|お菓子|食品|グルメ|肉|魚|鮭|鯖|米|白米|ブレンド米|パン|コーヒー|カレー|麺|惣菜|冷凍|低糖質|グルテンフリー|スナック|大豆ミート|ソイミート/.test(t))return 'food';

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
 const type=typeOf(x),facts=saleFacts(x),price=Number(x._eventPrice||x.itemPrice||0),rc=Number(x.reviewCount||0),ra=Number(x.reviewAverage||0);
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
 }else if(type==='car'){
  lines.push('車内をすっきり使いたい時に便利そうなカー収納アイテム🚗');
  lines.push('助手席やシートまわりの小物をまとめやすく、旅行やドライブ、家族でのお出かけ時にも活躍しそう。収納力だけでなく、固定方法や使わない時のしまいやすさもチェックしたいところです。');
  lines.push('サイズ・固定方法・容量・保冷保温などの仕様は商品ページで確認してみてください♪');
  tags.push('#カー用品','#車内収納','#ドライブグッズ');
 }else if(type==='roomwear'){
  lines.push('おうち時間をゆったり過ごしたい日に使いやすそうなルームウェア🛋️');
  lines.push('上下セットや腹巻付きなど、リラックスしやすさと冷え対策を両立できる仕様なら秋冬にも活躍しそう。部屋着にもパジャマにも使いやすいか、着心地やサイズ感を見ながら選びたいですね。');
  lines.push('カラー・サイズ・素材・洗濯方法を商品ページで確認してみてください♪');
  tags.push('#ルームウェア','#パジャマ','#おうち時間');
 }else if(type==='drink'){
  lines.push('毎日の習慣に取り入れやすそうな機能性ドリンク・お茶🍵');
  lines.push('普段飲んでいるお茶を置き換える感覚で続けやすいのがポイント。体型管理や健康習慣を意識している人は、機能性表示の内容や摂取目安も見ながら選びたいですね。');
  lines.push('機能性表示の内容・1日の摂取目安・原材料・飲み方は商品ページで確認してみてください♪');
  tags.push('#機能性表示食品','#お茶','#健康習慣');
 }else if(type==='home'){
  lines.push('毎日の家事をちょっとラクにしてくれそうな生活・キッチン便利グッズ✨');
  lines.push('省スペースで使えるものや、使わない時に片付けやすいタイプは普段使いしやすいのが魅力。サイズや収納性、お手入れのしやすさまで見ながら選びたいですね。');
  lines.push('サイズ・素材・お手入れ方法・対応範囲を商品ページで確認してみてください♪');
  tags.push('#便利グッズ','#キッチングッズ','#収納');
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
 if(w.__v62Installed)return;w.__v62Installed=true;
 const first=d.querySelector('section.panel');
 if(first&&!d.getElementById('v62box')){
  const box=d.createElement('div');box.id='v62box';box.className='warning';box.style.cssText='background:#fff1e6;border:2px solid #ff8a1f';
  const bm=bookmarklet().replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  box.innerHTML='<b style="font-size:16px">🔥 V62 タイムセール正式商品情報版</b><br>商品URLごとに楽天APIを複数パターンで照合し、さらにタイムセールページの価格を優先します。照合できない商品はROOM投稿文をそのまま使わず、商品名らしい部分だけを要約して表示します。<br><br><a class="btnlink" href="'+bm+'" style="background:#e86f00;color:#fff">🔥V62タイムセール取込</a>';
  first.parentNode.insertBefore(box,first);
 }
 if(!payload.length)return;
 const app=d.getElementById('appId')?.value.trim()||'',key=d.getElementById('accessKey')?.value.trim()||'',affiliate=d.getElementById('affiliateId')?.value.trim()||'';
 const panel=d.createElement('div');panel.className='warning';panel.style.cssText='background:#fffaf5;border-color:#ffb46b';
 panel.innerHTML='<b>🔥 タイムセール商品 '+payload.length+'件</b><div id="v62nav" style="display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap"><button id="v62prev">← 前の10件</button><b id="v62info"></b><button id="v62next">次の10件 →</button></div><div id="v62load" style="margin-top:8px"></div>';
 first.parentNode.insertBefore(panel,first);
 const results=d.getElementById('results');results.innerHTML='';
 const cache=new Map();let page=0,busy=false;
 async function loadPage(){
  if(busy)return;busy=true;
  const start=page*10,end=Math.min(start+10,payload.length),rows=[];
  panel.querySelector('#v62info').textContent=(start+1)+'〜'+end+'件目 / 全'+payload.length+'件';
  panel.querySelector('#v62prev').disabled=page===0;
  panel.querySelector('#v62next').disabled=end>=payload.length;
  results.innerHTML='<div class="empty">正式な商品情報を取得しています…</div>';
  for(let i=start;i<end;i++){
   panel.querySelector('#v62load').textContent='高精度照合中… '+(i-start+1)+' / '+(end-start)+'（1商品ずつ確認しています）';
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
   const no=start+j+1,img=imageUrl(x),copy=makeCopy(w,x),price=Number(x._eventPrice||x.itemPrice||0);
   const card=d.createElement('article');card.className='card';
   card.innerHTML='<div class="top"><div class="rank">'+no+'位</div>'+(img?'<img class="thumb" src="'+esc(img)+'" referrerpolicy="no-referrer">':'')+
    '<div class="meta"><h3>'+esc(cleanName(x.itemName))+'</h3><div class="chips"><span class="chip" style="background:#fff0e6;color:#b54708;font-weight:900">🔥 タイムセール実掲載</span>'+
    (price?'<span class="chip">'+(x._eventPrice?'タイムセール価格 ':'')+esc(w.yen(price))+'</span>':'<span class="chip">価格は商品ページで確認</span>')+
    (x.reviewCount?'<span class="chip">レビュー '+Number(x.reviewCount).toLocaleString()+'件</span>':'')+
    (x.reviewAverage?'<span class="chip">評価 '+Number(x.reviewAverage).toFixed(2)+'</span>':'')+
    (x._enriched?'<span class="chip" style="background:#edf9f0;color:#146b2e">照合済 '+esc(x._confidence||'')+'</span>':'<span class="chip" style="background:#fff4e5;color:#9a4f00">未照合・商品名を要約</span>')+'</div></div></div>'+
    '<textarea id="v62copy-'+no+'" readonly>'+esc(copy)+'</textarea><div class="cardstatus">文字数：'+copy.length+' / 500</div>'+
    '<div class="actions"><button class="primary" id="v62prepare-'+no+'">この内容で投稿準備</button><button class="gray" id="v62copybtn-'+no+'">文章コピー</button></div><div class="cardstatus" id="v62status-'+no+'"></div>';
   results.appendChild(card);
   card.querySelector('#v62copybtn-'+no).addEventListener('click',async()=>{const ok=await copyText(copy);card.querySelector('#v62status-'+no).textContent=ok?'✅ コピーしました。':'コピーできませんでした。'});
   card.querySelector('#v62prepare-'+no).addEventListener('click',async()=>{await copyText(copy);window.open(x.itemUrl||x._sourceUrl||payload[start+j].u,'_blank');});
  });
  panel.querySelector('#v62load').textContent=xSummary(rows);
  let bottom=d.getElementById('v62bottom');
  if(!bottom){bottom=d.createElement('div');bottom.id='v62bottom';bottom.style.cssText='display:flex;gap:8px;justify-content:center;align-items:center;margin:20px 0 30px';results.after(bottom)}
  bottom.innerHTML='<button id="v62prevB">← 前の10件</button><b>'+(start+1)+'〜'+end+'件目 / 全'+payload.length+'件</b><button id="v62nextB">次の10件 →</button>';
  bottom.querySelector('#v62prevB').disabled=page===0;bottom.querySelector('#v62nextB').disabled=end>=payload.length;
  bottom.querySelector('#v62prevB').onclick=()=>{if(page>0){page--;loadPage();panel.scrollIntoView({behavior:'smooth'})}};
  bottom.querySelector('#v62nextB').onclick=()=>{if(end<payload.length){page++;loadPage();panel.scrollIntoView({behavior:'smooth'})}};
  busy=false;
 }
 function xSummary(rows){const n=rows.filter(x=>x._enriched).length;return '高精度照合：'+n+' / '+rows.length+'件を確定しました。'+(rows.length-n?' 未確定の商品は「要確認」と表示しています。':'')+(app&&key?'':' Application ID / Access Keyを入力すると補完できます。')}
 panel.querySelector('#v62prev').onclick=()=>{if(page>0){page--;loadPage()}};
 panel.querySelector('#v62next').onclick=()=>{if((page+1)*10<payload.length){page++;loadPage()}};
 loadPage();
 const h=d.querySelector('h1');if(h)h.textContent='楽天ROOM 自動リサーチ＋連続投稿 V62 軽量版';
}
const payload=getPayload();
function boot(){
 try{if(typeof window.callRakuten==='function'&&typeof window.itemArray==='function'){install(window,document,payload);return}}catch(e){console.error(e)}
 setTimeout(boot,150);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();