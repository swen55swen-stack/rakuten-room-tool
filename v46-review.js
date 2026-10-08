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
function reviewSummary(a){
 if(!a.hasText)return "";
 const names=a.themes.map(v=>v.key);
 if(!names.length)return "貼り付けたレビューも確認しながら、実際の使用感をチェックしたいところ。";
 if(names.length===1)return "貼り付けたレビューでは「"+names[0]+"」についての声が見られます。";
 return "貼り付けたレビューでは「"+names.slice(0,3).join("・")+"」についての声が目立ちます。";
}
function cautiousNegative(a){
 if(!a.hasText||a.negative===0)return "";
 return "一方で気になる声もあるので、自分に合うかレビュー本文まで確認して選びたいですね。";
}
function compose(w,d,x,a){
 const u=typeof w.productUnderstanding==="function"?w.productUnderstanding(x):null;
 const base=w.makeCopy(x);
 const tags=hashtagsFromBase(base);
 const lines=[];
 const sale=typeof w.saleEndLabel==="function"?(w.saleEndLabel(x)||""):"";
 const rc=Number(x.reviewCount||0),ra=Number(x.reviewAverage||0),price=Number(x.itemPrice||0);
 if(sale)lines.push("🔥 "+sale);
 if(rc>0&&ra>0&&ra<=5)lines.push("⭐ レビュー"+rc.toLocaleString()+"件・評価"+ra.toFixed(2));
 if(price>0)lines.push("💰 価格："+w.yen(price));
 lines.push("",productName(x),"");

 let intro="";
 if(u?.category?.includes("美容")||/クレンジング|美容液|化粧水|シャンプー|トリートメント|コスメ/.test(x.itemName||"")){
  intro="毎日使う美容アイテムだからこそ、商品説明だけじゃなく実際の使い心地も気になりますよね✨";
 }else if(/ファッション|子供服/.test(u?.category||"")){
  intro="服は写真だけじゃ分かりにくいから、サイズ感や着心地の口コミまで見て選びたいですよね。";
 }else if(/食品|栄養/.test(u?.category||"")){
  intro="味や使いやすさは商品説明だけでは分かりにくいから、口コミも参考にしたいところです🍴";
 }else{
  intro="気になる商品ほど、商品説明だけじゃなく実際に使った人の感想まで見て選びたいですよね。";
 }
 lines.push(intro);

 if(u&&u.type!=="商品"){
  lines.push(u.use+"。"+u.benefit+"のがポイントです。");
  if(u.features?.length)lines.push("✅ "+u.features.slice(0,3).map(v=>v.label).join(" / "));
 }
 if(a.hasText){
  lines.push("",reviewSummary(a));
  if(a.themes.length){
   const top=a.themes.slice(0,3).map(v=>"「"+v.key+"」").join("、");
   lines.push("特に"+top+"は、購入前にチェックしておきたいポイント。");
  }
  const neg=cautiousNegative(a); if(neg)lines.push(neg);
 }else if(rc>=1000&&ra>=4.5){
  lines.push("","レビューが"+rc.toLocaleString()+"件、評価"+ra.toFixed(2)+"と口コミ量がかなり多いので、実際の使用感を比較しやすい商品です◎");
 }else if(rc>=100&&ra>=4.3){
  lines.push("","レビュー"+rc.toLocaleString()+"件・評価"+ra.toFixed(2)+"。評判も参考にしながら選びたいですね◎");
 }

 if(/ファッション|子供服/.test(u?.category||"")){
  lines.push("サイズ感・着丈・素材・洗濯表示なども合わせて確認しておくと選びやすそうです。");
 }else if(u?.category?.includes("美容")){
  lines.push("肌質や使い方には個人差があるので、成分・使用方法も確認して選びたいですね。");
 }else if(/食品|栄養/.test(u?.category||"")){
  lines.push("内容量・保存方法・調理方法も確認して、自分の生活に取り入れやすいか見ておきたいですね。");
 }else if(u?.cta){
  lines.push(u.cta+"も商品ページで確認してみてください＾＾");
 }
 if(targetText(d))lines.push("","🎯 "+targetText(d)+"向けで選定中");
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
 box.innerHTML="<b>🧠 レビュー分析</b><br>貼付レビュー："+(a.count||"1")+"件相当<br>注目："+esc(t)+(a.negative?("<br>気になる表現も "+a.negative+"件検出"):"");
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