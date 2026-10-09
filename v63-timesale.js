(()=>{
const TARGET='https://swen55swen-stack.github.io/rakuten-room-tool/v63.html';
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
function productSubtype(x){
 const t=(String(x.itemName||'')+' '+String(x.itemCaption||'')).toLowerCase();
 if(/おせち|お節/.test(t))return 'osechi';
 if(/ボア.*(ブルゾン|ジャケット)|もこもこ.*(ブルゾン|ジャケット)/.test(t))return 'boaOuter';
 if(/カーディガン/.test(t))return 'cardigan';
 if(/ニット|セーター/.test(t))return 'knit';
 if(/まつげ美容液|まつ毛美容液/.test(t))return 'lashSerum';
 if(/ハイドロキノン/.test(t))return 'hydroquinone';
 if(/水切りマット/.test(t))return 'dryingMat';
 if(/水筒スタンド|ボトルスタンド/.test(t))return 'bottleStand';
 if(/シート収納|シートボックス|シートクッションボックス/.test(t))return 'carStorage';
 if(/部屋着|ルームウェア|パジャマ|ナイトウェア/.test(t))return 'roomwear';
 if(/グリーンティー|緑茶|機能性表示食品|bmi|内臓脂肪/.test(t))return 'functionalTea';
 if(/ドライマンゴー|マンゴー/.test(t))return 'mango';
 if(/ドーナツ/.test(t))return 'donut';
 if(/イヤホン|bluetoothイヤホン/.test(t))return 'earphones';
 if(/トミカ/.test(t))return 'tomica';
 if(/トートバッグ/.test(t))return 'tote';
 if(/大豆ミート|ソイミート/.test(t))return 'soyMeat';
 if(/白米|ブレンド米|お米|米10kg|10kg.*米/.test(t))return 'rice';
 return typeOf(x);
}
function pickedFacts(x){
 const t=String(x.itemName||'')+' '+String(x.itemCaption||'');
 const out=[];
 const add=s=>{if(s&&!out.includes(s))out.push(s)};
 let m;
 if((m=t.match(/(\d+)人前/)))add(m[1]+'人前');
 if((m=t.match(/全\s*(\d+)品/)))add('全'+m[1]+'品');
 if((m=t.match(/(\d+(?:\.\d+)?)寸/)))add(m[1]+'寸');
 if(/二段重/.test(t))add('二段重');
 if(/冷凍/.test(t))add('冷凍');
 if(/ウォッシャブル|洗える|自宅で.*洗/.test(t))add('自宅で洗いやすい');
 if(/前後2WAY|前後２WAY/i.test(t))add('前後2WAY');
 if(/クロップド丈/.test(t))add('クロップド丈');
 if(/スタンドネック/.test(t))add('スタンドネック');
 if(/コーデュロイ/.test(t))add('コーデュロイ切替');
 if(/腹巻/.test(t))add('腹巻付き');
 if(/上下セット/.test(t))add('上下セット');
 if(/ワッフル/.test(t))add('ワッフル生地');
 if(/折りたたみ/.test(t))add('折りたたみ');
 if(/保冷/.test(t))add('保冷');
 if(/保温/.test(t))add('保温');
 if(/内ポケット/.test(t))add('内ポケット付き');
 if(/ストッパー/.test(t))add('ストッパー付き');
 if(/ヒト幹細胞/.test(t))add('ヒト幹細胞培養液配合');
 if(/アゼライン酸/.test(t))add('アゼライン酸');
 if(/cica|シカ/i.test(t))add('CICA');
 if(/ヒアルロン酸/.test(t))add('ヒアルロン酸');
 if(/60日間全額返金/.test(t))add('60日間全額返金保証');
 if(/パッチテスト/.test(t))add('パッチテスト済み表記');
 if(/無添加/.test(t))add('無添加');
 if(/砂糖不使用/.test(t))add('砂糖不使用');
 if((m=t.match(/(\d+)g\s*[×xX]\s*(\d+)袋/)))add(m[1]+'g×'+m[2]+'袋');
 if(/3層/.test(t))add('3層構造');
 if(/撥水/.test(t))add('撥水');
 if(/軽量/.test(t))add('軽量');
 if(/大容量/.test(t))add('大容量');
 if(/ファスナー付き/.test(t))add('ファスナー付き');
 if(/bluetooth\s*6(?:\.0)?/i.test(t))add('Bluetooth6.0');
 if(/aac対応/i.test(t))add('AAC対応');
 if(/ノイズキャンセリング|ノイキャン/.test(t))add('ノイズキャンセリング');
 if(/ケース.*残量表示|残量表示/.test(t))add('ケース残量表示');
 return out.slice(0,6);
}
function makeCopy(w,x){
 const subtype=productSubtype(x),facts=saleFacts(x),price=Number(x._eventPrice||x.itemPrice||0),rc=Number(x.reviewCount||0),ra=Number(x.reviewAverage||0),name=cleanName(x.itemName).slice(0,170),pf=pickedFacts(x);
 const lines=['🔥 楽天24時間タイムセール掲載'];
 if(facts.length)lines.push('✨ '+facts.join(' / '));
 if(price>0)lines.push('💰 価格：'+w.yen(price));
 if(rc>0&&ra>0)lines.push('⭐ レビュー'+rc.toLocaleString()+'件・評価'+Number(ra).toFixed(2));
 lines.push('',name,'');
 let tags=['#楽天ROOM','#楽天市場','#タイムセール'];
 const feature=pf.length?'「'+pf.slice(0,3).join('・')+'」もチェックしたいポイント。':'';

 if(subtype==='osechi'){
  lines.push('お正月の食卓を華やかにしてくれそうなおせち🎍');
  lines.push((pf.includes('3人前')?'3人前で、':'')+(pf.find(v=>/^全\d+品$/.test(v))?pf.find(v=>/^全\d+品$/.test(v))+'の品数が楽しめる内容。':'')+'和洋いろいろ楽しみたい家庭や、家族でゆっくりお正月を過ごしたい時に選びやすそうです。'+(pf.includes('冷凍')?'冷凍タイプなら予定に合わせて準備しやすいのも助かります。':''));
  lines.push('お届け日・解凍方法・保存方法・アレルギー表示・内容変更の有無を商品ページで確認してみてください♪');
  tags.push('#おせち','#お正月','#年末準備');
 }else if(subtype==='boaOuter'){
  lines.push('ふわっとした見た目が秋冬らしいボアアウター🧸');
  lines.push((/ウォッシャブル|洗える|自宅で.*洗/.test(name+' '+x.itemCaption)?'自宅でお手入れしやすい仕様なのも普段使いには嬉しいポイント。':'')+'デニムやワイドパンツに合わせてカジュアルに、スカートと合わせてやわらかい雰囲気にも使いやすそう。'+(pf.includes('スタンドネック')?'首元まで包みやすいスタンドネックも寒い季節に活躍しそうです。':''));
  lines.push('着丈・身幅・素材・裏地・洗濯表示を商品ページで確認してみてください♪');
  tags.push('#ボアアウター','#秋冬コーデ','#アウター');
 }else if(subtype==='cardigan'){
  lines.push('羽織りにもトップスにも使いやすそうなカーディガン🧶');
  lines.push((pf.includes('前後2WAY')?'前後2WAYなら、気分やコーデに合わせて表情を変えられるのが魅力。':'')+(pf.includes('クロップド丈')?'コンパクトなクロップド丈は、ハイウエストのボトムとも相性が良さそうです。':'')+'1枚で着るだけでなく、インナーを重ねて季節の変わり目にも着回しやすそう。');
  lines.push('カラー・サイズ・着丈・伸縮性・洗濯表示を商品ページで確認してみてください♪');
  tags.push('#カーディガン','#レイヤード','#着回し');
 }else if(subtype==='knit'){
  lines.push('秋冬コーデに取り入れやすそうなニットトップス🧶');
  lines.push('シルエットや首元のデザインで印象が変わるので、手持ちのパンツやスカートと合わせやすいか想像しながら選びたいところ。1枚でも重ね着でも使えるタイプなら、季節をまたいで活躍しそうです。');
  lines.push('サイズ感・着丈・素材・厚み・洗濯表示を商品ページで確認してみてください♪');
  tags.push('#ニット','#秋冬コーデ','#着回し');
 }else if(subtype==='lashSerum'){
  lines.push('毎日のまつげケアに取り入れたいプレミアムまつげ美容液✨');
  lines.push((pf.length?feature:'')+'マツエクやマスカラを使う人で、まつげのハリやコシを意識したい時にもチェックしたいアイテムです。レビューも参考にしながら、使い心地や続けやすさを見て選びたいですね。');
  lines.push('使用方法・使用頻度・成分・目元への使用上の注意を商品ページで確認してみてください♪');
  tags.push('#まつげ美容液','#まつげケア','#目元ケア');
 }else if(subtype==='hydroquinone'){
  lines.push('成分にこだわってスキンケアを選びたい人に気になる美容クリーム✨');
  lines.push(feature+'ハイドロキノン配合の商品なので、濃度だけでなく使い方や使用頻度をしっかり確認して取り入れたいところ。ほかの美容成分との組み合わせも商品選びの参考になりそうです。');
  lines.push('使用方法・使用頻度・保管方法・使用上の注意を商品ページで確認してみてください♪');
  tags.push('#ハイドロキノン','#美容クリーム','#スキンケア');
 }else if(subtype==='carStorage'){
  lines.push('車内のごちゃつきをまとめたい時に便利そうなシート収納ボックス🚗');
  lines.push(feature+'助手席まわりの小物や飲み物などをまとめやすく、旅行やドライブ、家族でのお出かけ時にも活躍しそう。使わない時の収納性や車への固定方法も見ておきたいですね。');
  lines.push('サイズ・容量・固定方法・保冷保温の仕様を商品ページで確認してみてください♪');
  tags.push('#車内収納','#カー用品','#ドライブグッズ');
 }else if(subtype==='roomwear'){
  lines.push('おうち時間をゆったり過ごしたい日に良さそうなルームウェア🛋️');
  lines.push(feature+'部屋着にもパジャマにも使いやすい上下セットなら、着替えをまとめやすいのも嬉しいポイント。冷えが気になる季節は腹巻付きかどうか、肌触りや生地の厚みも見ながら選びたいですね。');
  lines.push('カラー・サイズ・素材・洗濯方法を商品ページで確認してみてください♪');
  tags.push('#ルームウェア','#パジャマ','#おうち時間');
 }else if(subtype==='functionalTea'){
  lines.push('毎日の飲み物に取り入れやすそうな機能性グリーンティー🍵');
  lines.push('BMIや内臓脂肪、ウエストまわりが気になる人向けの表示がある商品なら、普段のお茶を選ぶ感覚で続けやすいのがポイント。食事や休憩時間、水分補給のタイミングにも取り入れやすそうです。');
  lines.push('機能性表示の内容・1日の摂取目安・原材料・飲み方を商品ページで確認してみてください♪');
  tags.push('#機能性表示食品','#緑茶','#健康習慣');
 }else if(subtype==='mango'){
  lines.push('おやつにもヨーグルトのトッピングにも使いやすそうなドライマンゴー🥭');
  lines.push(feature+'甘いものが欲しい時のストック用としても取り入れやすそう。セット商品なら1袋あたりの量や食べ切りやすさも見ながら選びたいですね。');
  lines.push('内容量・原材料・賞味期限・保存方法を商品ページで確認してみてください♪');
  tags.push('#ドライマンゴー','#ドライフルーツ','#おやつ');
 }else if(subtype==='tote'){
  lines.push('荷物が多い日に頼れそうな大容量トートバッグ👜');
  lines.push(feature+'通勤・通学・マザーズバッグ・旅行など、使う場面が広いのが魅力。荷物を分けやすい構造や肩掛けしやすさも、毎日使うバッグでは大事なポイントです。');
  lines.push('サイズ・重さ・収納数・素材・持ち手の長さを商品ページで確認してみてください♪');
  tags.push('#トートバッグ','#大容量バッグ','#通勤バッグ');
 }else if(subtype==='earphones'){
  lines.push('通勤・通学や普段使いにチェックしたいワイヤレスイヤホン🎧');
  lines.push(feature+'音楽や動画をよく見る人なら、接続方式だけでなく装着感や連続再生時間も気になるところ。持ち歩きやすさやケースの使いやすさまで見ながら選びたいですね。');
  lines.push('対応機種・連続再生時間・充電方式・付属品を商品ページで確認してみてください♪');
  tags.push('#ワイヤレスイヤホン','#Bluetooth','#ガジェット');
 }else if(subtype==='soyMeat'){
  lines.push('ひき肉代わりに使いやすい乾燥タイプの大豆ミート🌱');
  lines.push(feature+'そぼろ・麻婆豆腐・キーマカレー・ミートソースなど、普段の料理に取り入れやすいのが魅力。乾燥タイプなら常温でストックしやすく、備蓄用にもチェックしやすいですね。');
  lines.push('戻し方・原材料・内容量・保存方法を商品ページで確認してみてください♪');
  tags.push('#大豆ミート','#ソイミート','#備蓄');
 }else if(subtype==='rice'){
  lines.push('毎日のごはん用にストックしておきたいお米🍚');
  lines.push('10kgタイプなら、お弁当や作り置きでお米をよく使う家庭にも使いやすそう。重たいお米を自宅まで届けてもらえるのも通販ならではの助かるポイントです。');
  lines.push('産地・ブレンド内容・精米時期・保存方法を商品ページで確認してみてください♪');
  tags.push('#お米','#白米','#まとめ買い');
 }else if(subtype==='dryingMat'){
  lines.push('洗った食器をサッと置きたい時に便利な水切りマット✨');
  lines.push(feature+'水切りかごを常設したくないキッチンや、必要な時だけ広げて使いたい人にも相性が良さそう。使い終わった後の乾かしやすさや収納しやすさもチェックしたいところです。');
  lines.push('サイズ・素材・吸水性・お手入れ方法を商品ページで確認してみてください♪');
  tags.push('#水切りマット','#キッチングッズ','#省スペース');
 }else{
  const type=typeOf(x);
  if(type==='food'){
   lines.push('タイムセールでチェックしたい食品アイテム🍴');
   lines.push('内容量やセット数、食べる場面を想像しながら選びたい商品。普段用なのか、ストック用なのか、ギフト向けなのかでもチェックしたいポイントが変わります。');
   lines.push('原材料・内容量・賞味期限・保存方法を商品ページで確認してみてください♪');
   tags.push('#食品','#グルメ','#お取り寄せ');
  }else{
   lines.push('24時間タイムセールで見つけた注目アイテム✨');
   lines.push((feature?feature:'')+'価格だけでなく、使う場面や必要な機能まで見ながら自分に合うか確認したいですね。');
   lines.push('サイズ・仕様・セット内容・利用条件を商品ページで確認してみてください♪');
   tags.push('#お買い得','#セール情報');
  }
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
 if(w.__v63Installed)return;w.__v63Installed=true;
 const first=d.querySelector('section.panel');
 if(first&&!d.getElementById('v63box')){
  const box=d.createElement('div');box.id='v63box';box.className='warning';box.style.cssText='background:#fff1e6;border:2px solid #ff8a1f';
  const bm=bookmarklet().replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  box.innerHTML='<b style="font-size:16px">🔥 V63 タイムセール正式商品情報版</b><br>商品URLごとに楽天APIを複数パターンで照合し、さらにタイムセールページの価格を優先します。照合できない商品はROOM投稿文をそのまま使わず、商品名らしい部分だけを要約して表示します。<br><br><a class="btnlink" href="'+bm+'" style="background:#e86f00;color:#fff">🔥V63タイムセール取込</a>';
  first.parentNode.insertBefore(box,first);
 }
 if(!payload.length)return;
 const app=d.getElementById('appId')?.value.trim()||'',key=d.getElementById('accessKey')?.value.trim()||'',affiliate=d.getElementById('affiliateId')?.value.trim()||'';
 const panel=d.createElement('div');panel.className='warning';panel.style.cssText='background:#fffaf5;border-color:#ffb46b';
 panel.innerHTML='<b>🔥 タイムセール商品 '+payload.length+'件</b><div id="v63nav" style="display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap"><button id="v63prev">← 前の10件</button><b id="v63info"></b><button id="v63next">次の10件 →</button></div><div id="v63load" style="margin-top:8px"></div>';
 first.parentNode.insertBefore(panel,first);
 const results=d.getElementById('results');results.innerHTML='';
 const cache=new Map();let page=0,busy=false;
 async function loadPage(){
  if(busy)return;busy=true;
  const start=page*10,end=Math.min(start+10,payload.length),rows=[];
  panel.querySelector('#v63info').textContent=(start+1)+'〜'+end+'件目 / 全'+payload.length+'件';
  panel.querySelector('#v63prev').disabled=page===0;
  panel.querySelector('#v63next').disabled=end>=payload.length;
  results.innerHTML='<div class="empty">正式な商品情報を取得しています…</div>';
  for(let i=start;i<end;i++){
   panel.querySelector('#v63load').textContent='高精度照合中… '+(i-start+1)+' / '+(end-start)+'（1商品ずつ確認しています）';
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
    '<textarea id="v63copy-'+no+'" readonly>'+esc(copy)+'</textarea><div class="cardstatus">文字数：'+copy.length+' / 500</div>'+
    '<div class="actions"><button class="primary" id="v63prepare-'+no+'">この内容で投稿準備</button><button class="gray" id="v63copybtn-'+no+'">文章コピー</button></div><div class="cardstatus" id="v63status-'+no+'"></div>';
   results.appendChild(card);
   card.querySelector('#v63copybtn-'+no).addEventListener('click',async()=>{const ok=await copyText(copy);card.querySelector('#v63status-'+no).textContent=ok?'✅ コピーしました。':'コピーできませんでした。'});
   card.querySelector('#v63prepare-'+no).addEventListener('click',async()=>{await copyText(copy);window.open(x.itemUrl||x._sourceUrl||payload[start+j].u,'_blank');});
  });
  panel.querySelector('#v63load').textContent=xSummary(rows);
  let bottom=d.getElementById('v63bottom');
  if(!bottom){bottom=d.createElement('div');bottom.id='v63bottom';bottom.style.cssText='display:flex;gap:8px;justify-content:center;align-items:center;margin:20px 0 30px';results.after(bottom)}
  bottom.innerHTML='<button id="v63prevB">← 前の10件</button><b>'+(start+1)+'〜'+end+'件目 / 全'+payload.length+'件</b><button id="v63nextB">次の10件 →</button>';
  bottom.querySelector('#v63prevB').disabled=page===0;bottom.querySelector('#v63nextB').disabled=end>=payload.length;
  bottom.querySelector('#v63prevB').onclick=()=>{if(page>0){page--;loadPage();panel.scrollIntoView({behavior:'smooth'})}};
  bottom.querySelector('#v63nextB').onclick=()=>{if(end<payload.length){page++;loadPage();panel.scrollIntoView({behavior:'smooth'})}};
  busy=false;
 }
 function xSummary(rows){const n=rows.filter(x=>x._enriched).length;return '高精度照合：'+n+' / '+rows.length+'件を確定しました。'+(rows.length-n?' 未確定の商品は「要確認」と表示しています。':'')+(app&&key?'':' Application ID / Access Keyを入力すると補完できます。')}
 panel.querySelector('#v63prev').onclick=()=>{if(page>0){page--;loadPage()}};
 panel.querySelector('#v63next').onclick=()=>{if((page+1)*10<payload.length){page++;loadPage()}};
 loadPage();
 const h=d.querySelector('h1');if(h)h.textContent='楽天ROOM 自動リサーチ＋連続投稿 V63 軽量版';
}
const payload=getPayload();
function boot(){
 try{if(typeof window.callRakuten==='function'&&typeof window.itemArray==='function'){install(window,document,payload);return}}catch(e){console.error(e)}
 setTimeout(boot,150);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();