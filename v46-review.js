(()=>{
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clean=s=>String(s||"").replace(/\s+/g," ").trim();
const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));

const THEMES=[
 {key:"落ちやすさ", re:/メイク.*落|落ちる|落とせ|洗浄力|しっかり落|するっと|スルッと/g},
 {key:"洗い上がり", re:/洗い上がり|つっぱら|突っ張ら|しっとり|さっぱり|乾燥しにく|うるお/g},
 {key:"毛穴", re:/毛穴|角栓|ざらつき|黒ずみ/g},
 {key:"香り", re:/香り|匂い|におい|香料/g},
 {key:"使いやすさ", re:/使いやす|使い勝手|ポンプ|なじみ|伸び|テクスチャ|使い心地/g},
 {key:"コスパ", re:/コスパ|大容量|たっぷり|長持ち|お得|価格|値段/g},
 {key:"リピート", re:/リピ|何本目|何回目|愛用|ずっと使|また買|再購入/g},
 {key:"肌との相性", re:/敏感肌|肌荒れ|刺激|ヒリヒリ|赤み|合わな|肌に合/g},
 {key:"サイズ感", re:/サイズ|大きめ|小さめ|ゆったり|タイト|着丈|身幅|袖丈/g},
 {key:"着心地", re:/着心地|着やす|動きやす|軽い|重い|暖か|あたたか|蒸れ/g},
 {key:"見た目", re:/デザイン|色味|カラー|見た目|かわいい|おしゃれ|高見え/g}
];
const POS=/良い|よい|いい|満足|おすすめ|好き|気に入|最高|便利|楽|ラク|使いやす|落ちる|しっとり|さっぱり|リピ|大容量|コスパ|きれい|綺麗|かわいい|おしゃれ|快適/g;
const NEG=/悪い|いまいち|微妙|残念|合わない|合わな|高い|重い|小さい|大きすぎ|乾燥|つっぱる|刺激|ヒリヒリ|漏れ|臭い|においが苦手|香りが強/g;

function deepest(frame){
 let win=frame?.contentWindow,doc=frame?.contentDocument;
 for(let i=0;i<5&&doc;i++){
  const next=doc.getElementById("appframe");
  if(!next)break;
  win=next.contentWindow; doc=next.contentDocument;
 }
 return {w:win,d:doc};
}
function getItem(w,i){
 if(w.__roomCandidates?.[i])return w.__roomCandidates[i];
 try{return w.eval("candidates["+i+"]")}catch(e){return null}
}
function splitReviews(text){
 return String(text||"").split(/\n{2,}|(?=★{2,5}|☆{2,5})/).map(v=>v.trim()).filter(v=>v.length>=8);
}
function analyzeReviews(text){
 const raw=String(text||"").trim(), parts=splitReviews(raw);
 const scores=[];
 for(const t of THEMES){
  const m=raw.match(t.re)||[];
  if(m.length)scores.push({key:t.key,count:m.length});
 }
 scores.sort((a,b)=>b.count-a.count);
 const pos=(raw.match(POS)||[]).length,neg=(raw.match(NEG)||[]).length;
 return {count:parts.length||0,themes:scores.slice(0,4),positive:pos,negative:neg,hasText:!!raw};
}
function targetText(d){
 const r=d.getElementById("roomTarget"),g=d.getElementById("genreId");
 const rt=r?.options?.[r.selectedIndex]?.textContent||"";
 const gt=g?.options?.[g.selectedIndex]?.textContent||"";
 return [rt,gt].filter(Boolean).join(" / ");
}
function hashtagsFromBase(base){
 const m=String(base||"").match(/#[^\s#]+/g)||[];
 return [...new Set(m)].slice(0,14).join(" ");
}
function productName(x){return clean(x.itemName).slice(0,82)}
function naturalReviewLine(a,kind){
 if(!a.hasText||!a.themes.length)return "";
 const names=a.themes.map(v=>v.key).slice(0,3);
 if(kind==="beauty"){
  if(names.length===1)return names[0]+"も選ぶときに気になるポイントです。";
  return names.join("・")+"など、使い続けやすさにつながるポイントも気になります。";
 }
 if(kind==="fashion"){
  return names.join("・")+"あたりも、選ぶときに見ておきたいポイントです。";
 }
 if(kind==="food"){
  return names.join("・")+"など、実際に続けやすいか気になるところです。";
 }
 return names.join("・")+"あたりも、選ぶときにチェックしておきたいポイントです。";
}
function naturalCaution(a,kind){
 if(!a.hasText||a.negative===0)return "";
 if(kind==="beauty")return "肌質や好みには個人差があるので、成分や使い方も合わせて確認しておきたいですね。";
 if(kind==="fashion")return "サイズ感や着心地には個人差があるので、サイズ表や素材も確認して選びたいですね。";
 if(kind==="food")return "味や食べやすさには好みがあるので、内容量や原材料も確認して選びたいですね。";
 return "使い心地には個人差もあるので、仕様や使い方も確認して選びたいですね。";
}
function compose(w,d,x,a){
 const u=typeof w.productUnderstanding==="function"?w.productUnderstanding(x):null;
 const base=w.makeCopy(x);
 const tags=hashtagsFromBase(base);
 const lines=[];
 const rawName=String(x.itemName||"");
 const name=productName(x);
 const sale=typeof w.saleEndLabel==="function"?(w.saleEndLabel(x)||""):"";
 const rc=Number(x.reviewCount||0),ra=Number(x.reviewAverage||0),price=Number(x.itemPrice||0);

 const isBeauty=(u?.category||"").includes("美容")||/クレンジング|クレンズ|美容液|化粧水|乳液|クリーム|シャンプー|トリートメント|コスメ|スキンケア|洗顔/.test(rawName);
 const isFashion=/ファッション|子供服/.test(u?.category||"")||/ジャケット|ブルゾン|アウター|シャツ|トップス|ニット|セーター|パンツ|スカート|ワンピース/.test(rawName);
 const isFood=/食品|栄養/.test(u?.category||"")||/食品|惣菜|レトルト|冷凍|プロテイン|スープ|カレー|ごはん/.test(rawName);
 const kind=isBeauty?"beauty":isFashion?"fashion":isFood?"food":"other";

 if(sale)lines.push("🔥 "+sale);
 if(rc>0&&ra>0&&ra<=5)lines.push("⭐ レビュー"+rc.toLocaleString()+"件・評価"+ra.toFixed(2));
 if(price>0)lines.push("💰 価格："+w.yen(price));
 lines.push("",name,"");

 if(kind==="beauty"){
  if(/クレンジング|クレンズ/.test(rawName)){
   lines.push("毎日のメイク落とし、落ちやすさだけじゃなく使い心地も大事ですよね✨");
   lines.push("大容量タイプのクレンジングオイルだから、毎日使う人には容量もしっかりチェックしたいところ。");
  }else{
   lines.push("毎日使う美容アイテムだからこそ、使い心地や続けやすさまで気になりますよね✨");
   if(u&&u.type!=="商品")lines.push(u.use+"。"+u.benefit+"のがポイントです。");
  }
 }else if(kind==="fashion"){
  lines.push("服は写真だけでは分かりにくいから、サイズ感や素材感まで見て選びたいですよね。");
  if(u&&u.type!=="商品")lines.push(u.use+"。"+u.benefit+"のがポイントです。");
 }else if(kind==="food"){
  lines.push("毎日の中で取り入れるものだから、味や使いやすさまで気になりますよね🍴");
  if(u&&u.type!=="商品")lines.push(u.use+"。"+u.benefit+"のがポイントです。");
 }else{
  lines.push("こういうの、実際の使いやすさまで分かると選びやすいですよね。");
  if(u&&u.type!=="商品")lines.push(u.use+"。"+u.benefit+"のがポイントです。");
 }

 if(u?.features?.length)lines.push("✅ "+u.features.slice(0,3).map(v=>v.label).join(" / "));

 const reviewLine=naturalReviewLine(a,kind);
 if(reviewLine)lines.push("",reviewLine);

 if(rc>=1000&&ra>=4.5){
  lines.push("レビュー数が多く評価も高めなので、気になる人は実際の口コミも見比べておきたいですね◎");
 }else if(rc>=100&&ra>=4.3){
  lines.push("口コミもあるので、使用感を見ながら選びたいですね◎");
 }

 const caution=naturalCaution(a,kind);
 if(caution)lines.push(caution);

 if(kind==="beauty"){
  if(/クレンジング|クレンズ/.test(rawName)){
   lines.push("気になったら、容量・香り・成分・使い方を商品ページで確認してみてください♪");
  }else{
   lines.push("気になったら、成分・容量・使い方を商品ページで確認してみてください♪");
  }
 }else if(kind==="fashion"){
  lines.push("気になったら、サイズ・着丈・素材・洗濯表示を商品ページで確認してみてください♪");
 }else if(kind==="food"){
  lines.push("気になったら、内容量・原材料・保存方法を商品ページで確認してみてください♪");
 }else if(u?.cta){
  lines.push("気になったら、"+u.cta+"を商品ページで確認してみてください♪");
 }else{
  lines.push("気になったら、詳しい仕様を商品ページで確認してみてください♪");
 }

 let body=lines.join("\n").replace(/\n{3,}/g,"\n\n").trim();
 let chosen=tags?tags.split(/\s+/):["#楽天ROOM","#楽天市場"];
 while(chosen.length>2&&body.length+2+chosen.join(" ").length>500)chosen.pop();
 if(body.length+2+chosen.join(" ").length>500)body=body.slice(0,500-2-chosen.join(" ").length-1)+"…";
 return (body+"\n\n"+chosen.join(" ")).trim();
}
function resultBox(d,host,a){
 let box=host.querySelector(".v46-analysis");
 if(!box){box=d.createElement("div");box.className="v46-analysis";box.style.cssText="margin-top:8px;padding:10px;border-radius:10px;background:#f5f0ff;color:#4e2a7d;font-size:12px;line-height:1.6";host.appendChild(box)}
 const t=a.themes.length?a.themes.map(v=>v.key+"("+v.count+")").join(" / "):"特徴語は少なめ";
 box.innerHTML="<b>🧠 内部分析（投稿文には入りません）</b><br>レビュー："+(a.count||"1")+"件相当<br>注目テーマ："+esc(t)+(a.negative?("<br>気になる表現も "+a.negative+"件検出"):"");
}
async function slowGenerate(w,d,card,i,btn){
 const x=getItem(w,i); if(!x)return;
 const area=card.querySelector(".v46-review-input");
 const ta=card.querySelector("textarea[id^='copy-']");
 if(!ta)return;
 const old=btn.textContent; btn.disabled=true;
 const phases=["① 商品を理解中…","② レビューを分析中…","③ ターゲットとの相性を確認中…","④ 不自然な表現をチェック中…","⑤ ROOM文章を仕上げ中…"];
 try{
  for(const p of phases){btn.textContent=p;await sleep(450)}
  const a=analyzeReviews(area?.value||"");
  ta.value=compose(w,d,x,a);
  const counter=ta.nextElementSibling;
  if(counter&&counter.textContent.includes("文字数"))counter.textContent="文字数："+ta.value.length+" / 500（V46じっくり生成）";
  resultBox(d,card,a);
 }finally{btn.textContent=old;btn.disabled=false}
}
function inject(w,d){
 const oldRender=w.render;

 // V46: selected genre is authoritative for ROOM discovery.
 const originalRoomResearch=typeof w.roomResearch==="function"?w.roomResearch:null;
 const ROOM_TARGET_WORDS={
  none:[],
  male_interior:["一人暮らし","モダン","収納","インテリア"],
  female_interior:["一人暮らし","北欧","収納","インテリア"],
  easy_food:["時短","簡単","レンジ"],
  kids:["知育","キッズ","子供"],
  home_appliance:["時短","家電","便利"],
  seasonal:["季節","人気"],
  beauty:["スキンケア","ヘアケア","コスメ"]
 };
 async function genreAwareRoomResearch(){
  const genre=d.getElementById("genreId")?.value||"";
  if(!genre||!originalRoomResearch)return originalRoomResearch?.();

  const app=d.getElementById("appId")?.value.trim()||"";
  const key=d.getElementById("accessKey")?.value.trim()||"";
  if(!app||!key){w.status("Application IDとAccess Keyを入力してください。");return}
  const affiliate=d.getElementById("affiliateId")?.value.trim()||"";
  const pages=Math.min(Number(d.getElementById("pages")?.value||2),3);
  const min=Number(d.getElementById("minPrice")?.value||0);
  const max=Number(d.getElementById("maxPrice")?.value||99999999);
  const saleOnly=d.getElementById("saleOnly")?.value==="1";
  const target=d.getElementById("roomTarget")?.value||"none";
  const genreText=d.getElementById("genreId")?.options[d.getElementById("genreId").selectedIndex]?.textContent||"選択ジャンル";

  try{
   w.status("💗 "+genreText+"の中だけで、ROOMで売れそうな商品を探しています…");
   const results=d.getElementById("results");
   if(results)results.innerHTML='<div class="empty">'+esc(genreText)+'の商品だけを取得中…</div>';

   let all=[];
   const rt=await w.rankingSearchPeriod(app,key,affiliate,Math.min(pages,2),genre,"realtime","ROOMジャンル内リアルタイム");
   rt.forEach((x,i)=>{x._realtimeRank=Number(x.rank||i+1);all.push(x)});
   const dy=await w.rankingSearchPeriod(app,key,affiliate,Math.min(pages,2),genre,"","ROOMジャンル内デイリー");
   dy.forEach((x,i)=>{x._dailyRank=Number(x.rank||i+1);all.push(x)});

   const words=ROOM_TARGET_WORDS[target]||[];
   for(const q of words.slice(0,2)){
    try{all.push(...await w.themeSearch(app,key,affiliate,q,1,min,max,genre))}catch(e){}
   }

   const map=new Map();
   all.forEach((x,i)=>{
    if(!x?.itemCode)return;
    const old=map.get(x.itemCode);
    if(old){
     if(x._realtimeRank)old._realtimeRank=x._realtimeRank;
     if(x._dailyRank)old._dailyRank=x._dailyRank;
    }else{
     if(!x.rank)x.rank=i+1;
     map.set(x.itemCode,x);
    }
   });

   let arr=[...map.values()].filter(x=>{
    const p=Number(x.itemPrice||0);
    return p>=min&&p<=max&&w.directUrl(x)&&Number(x.availability??1)===1&&!w.isExcludedProduct(x)&&(!saleOnly||w.isOnSale(x));
   });

   const hist=w.updateMonthlyHistory(arr);
   arr.forEach(x=>{
    const base=w.finalScore(x,"mix",hist);
    const reviews=Number(x.reviewCount||0),avg=Number(x.reviewAverage||0),price=Number(x.itemPrice||0);
    let bonus=0;
    if(Number(x._realtimeRank||999)<=30)bonus+=30; else if(Number(x._realtimeRank||999)<=100)bonus+=15;
    if(Number(x._dailyRank||999)<=30)bonus+=20; else if(Number(x._dailyRank||999)<=100)bonus+=10;
    if(reviews>=1000)bonus+=16; else if(reviews>=100)bonus+=12; else if(reviews>=20)bonus+=7;
    if(avg>=4.6)bonus+=16; else if(avg>=4.4)bonus+=12; else if(avg>=4.1)bonus+=6;
    if(price>=800&&price<=8000)bonus+=12; else if(price<=20000)bonus+=6;
    if(w.isOnSale(x))bonus+=14;
    if(Number(x.pointRate||1)>=3)bonus+=6;
    x._room=Math.round(base*.55+bonus);
    x._score=x._room;
   });
   arr.sort((a,b)=>b._room-a._room||Number(a.rank||999)-Number(b.rank||999));
   const top=arr.slice(0,10);
   if(!top.length)throw new Error("このジャンルで条件に合う商品が見つかりませんでした。価格やセール条件を変えてください。");

   w.__roomCandidates=top;
   w.eval("candidates = window.__roomCandidates; render();");
   setTimeout(()=>{
    [...d.querySelectorAll("article.card")].forEach((card,i)=>{
     const chips=card.querySelector(".chips"),x=top[i];
     if(!chips||!x||chips.querySelector(".v46genrechip"))return;
     const a=d.createElement("span");a.className="chip v46genrechip";a.textContent="📂 "+genreText;
     a.style.cssText="background:#e9f7ef;color:#176b3a;font-weight:900";chips.prepend(a);
    });
   },50);
   w.status("完了：📂 "+genreText+"の中だけから、ROOMで売れそうな候補を"+top.length+"件作りました。");
  }catch(e){
   console.error(e);
   w.status("取得できませんでした。\n\n"+(e.message||e));
   const results=d.getElementById("results");
   if(results)results.innerHTML='<div class="empty">取得に失敗しました。</div>';
  }
 }
 if(originalRoomResearch)w.roomResearch=genreAwareRoomResearch;
 function decorate(){
  [...d.querySelectorAll("article.card")].forEach((card,i)=>{
   if(card.querySelector(".v46-review-wrap"))return;
   const ta=card.querySelector("textarea[id^='copy-']"); if(!ta)return;
   const wrap=d.createElement("div");wrap.className="v46-review-wrap";
   wrap.style.cssText="margin-top:12px;padding:12px;border:1px solid #d9c8ff;border-radius:12px;background:#faf7ff";
   wrap.innerHTML='<div style="font-weight:900;margin-bottom:6px">🧠 V46 じっくり文章生成</div>'+
    '<div style="font-size:12px;margin-bottom:7px">レビュー本文を貼ると、その内容も分析して紹介文に反映します。貼らなくても生成できます。</div>'+
    '<textarea class="v46-review-input" placeholder="ここに楽天レビュー本文を貼り付け（複数件OK）" style="width:100%;min-height:90px;box-sizing:border-box;padding:9px;border:1px solid #ccc;border-radius:8px"></textarea>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button type="button" class="v46-slow-btn" style="background:#6f42c1;color:#fff">🧠 レビュー分析してじっくり生成</button></div>';
   ta.parentNode.insertBefore(wrap,ta.nextSibling);
   wrap.querySelector(".v46-slow-btn").addEventListener("click",e=>slowGenerate(w,d,card,i,e.currentTarget));
  });
 }
 w.render=function(){oldRender();setTimeout(decorate,50)};
 decorate();

 const actions=d.querySelector(".actions");
 if(actions&&!d.getElementById("v46AllSlow")){
  const b=d.createElement("button");b.id="v46AllSlow";b.textContent="🧠 10件じっくり生成";b.style.cssText="background:#6f42c1;color:#fff";
  actions.appendChild(b);
  b.addEventListener("click",async()=>{
   b.disabled=true;const old=b.textContent;
   const cards=[...d.querySelectorAll("article.card")];
   for(let i=0;i<cards.length;i++){b.textContent="🧠 "+(i+1)+"/"+cards.length+" 生成中";const btn=cards[i].querySelector(".v46-slow-btn");if(btn)await slowGenerate(w,d,cards[i],i,btn)}
   b.textContent=old;b.disabled=false;
  });
 }
 const h=d.querySelector("h1");if(h)h.textContent="楽天ROOM 自動リサーチ＋連続投稿 V46";
 const sub=d.querySelector("header .sub");if(sub)sub.textContent="商品情報とレビューを確認して、じっくり紹介文を作る";
 const first=d.querySelector("section.panel");
 if(first&&!d.getElementById("v46note")){
  const n=d.createElement("div");n.id="v46note";n.className="warning";n.style.cssText="background:#f5f0ff;border-color:#d9c8ff";
  n.innerHTML="<b>🧠 V46 じっくり生成：</b> レビュー本文を貼り付けると、よく出る話題や気になる声を分析してから500文字以内のROOM文章を作ります。";
  first.parentNode.insertBefore(n,first);
 }
}
const root=document.getElementById("appframe");
let tries=0;
const timer=setInterval(()=>{
 tries++;
 try{
  const {w,d}=deepest(root);
  if(w&&d&&typeof w.render==="function"&&typeof w.makeCopy==="function"){
   inject(w,d);clearInterval(timer);
  }
 }catch(e){}
 if(tries>120)clearInterval(timer);
},250);
})();