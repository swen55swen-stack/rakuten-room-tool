(()=>{
"use strict";
const CONFIG_KEY="roomV66WorkerUrl";
const STYLE_ID="v66aiStyles";
let busyAll=false;
let cancelBatch=false;
const results=document.getElementById("results");
const first=document.querySelector("section.panel");
if(!results||!first)return;
const el=(tag,cls,text)=>{
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(text)n.textContent=text;
 return n;
};
const style=document.createElement("style");
style.id=STYLE_ID;
style.textContent=".v66-ai-panel{background:#f1f8ff;border:2px solid #367de7;border-radius:14px;padding:15px;margin:14px 0;color:#183457}.v66-ai-panel label{display:block;font-weight:700;font-size:13px;margin:8px 0 4px}.v66-ai-panel input{max-width:100%;box-sizing:border-box;width:100%;padding:9px;border:1px solid #abc5ea;border-radius:8px;background:#fff;color:#222}.v66-ai-panel .v66-ai-row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.v66-ai-panel button,.v66-ai-action{padding:9px 13px;border-radius:8px;border:0;background:#2563eb;color:#fff;font-weight:700;cursor:pointer}.v66-ai-panel button:disabled,.v66-ai-action:disabled{opacity:.55;cursor:wait}.v66-ai-note{font-size:12px;color:#34516f;line-height:1.6}.v66-ai-status{font-size:13px;margin-top:7px;white-space:pre-wrap;line-height:1.5}.v66-ai-preview{font-size:12px;margin:9px 0;padding:8px;border-left:3px solid #4d91db;background:#f2f7ff;color:#264361}.v66-ai-pending{font-size:12px;color:#8a5707;font-weight:700;margin:8px 0}.v66-ai-done{color:#166534;background:#effbf2;padding:7px 9px;border-radius:6px}.v66-ai-panel a{color:#205eb8}";
document.head.appendChild(style);
const panel=el("section","v66-ai-panel");
panel.innerHTML='<b style="font-size:17px">✨ AI商品別紹介文（2段階チェック）</b>'+
 '<div class="v66-ai-note">①商品名と説明から「何の商品か・確認できる特徴」をAIが整理 → ②商品ごとに500文字以内のROOM文を生成。URL取込・タイムセール・ふるさと納税に対応。<br>※ 未照合商品は誤紹介を防ぐためAI生成を停止します。設定方法は <a href="./ai-setup.html" target="_blank" rel="noopener">こちら</a>。</div>'+
 '<label for="v66WorkerUrl">自分のCloudflare Worker URL（秘密鍵そのものではありません）</label>'+
 '<input id="v66WorkerUrl" placeholder="https://xxxx.your-name.workers.dev" autocomplete="url" inputmode="url">'+
 '<label for="v66WorkerToken">Worker専用パスコード（このタブだけで保持・保存しません）</label>'+
 '<input id="v66WorkerToken" type="password" placeholder="Cloudflareで登録したROOM_ACCESS_TOKEN" autocomplete="off">'+
 '<label style="font-size:13px;font-weight:500"><input id="v66AutoNormal" type="checkbox" checked style="width:auto;margin-right:5px">通常商品URLを読み込んだらAI文まで自動生成する</label>'+
 '<div class="v66-ai-row"><button id="v66Health" type="button">接続確認</button><button id="v66Batch" type="button">表示中の商品を順番にAI生成</button><button id="v66Cancel" type="button" disabled style="background:#64748b">次の商品から中止</button></div>'+
 '<div id="v66PanelStatus" class="v66-ai-status" aria-live="polite">接続先を設定するとAI機能を利用できます。APIキーは入力しないでください。</div>';
first.parentElement.insertBefore(panel,first);
const workerInput=panel.querySelector("#v66WorkerUrl");
const tokenInput=panel.querySelector("#v66WorkerToken");
const panelStatus=panel.querySelector("#v66PanelStatus");
workerInput.value=localStorage.getItem(CONFIG_KEY)||"";
const health=panel.querySelector("#v66Health");
const batch=panel.querySelector("#v66Batch");
const cancel=panel.querySelector("#v66Cancel");
function endpoint(){
 const raw=workerInput.value.trim();
 let u;
 try{u=new URL(raw)}catch(e){throw Error("Worker URLが正しくありません")}
 if(u.protocol!=="https:"||!u.hostname.endsWith(".workers.dev"))throw Error("HTTPSのCloudflare workers.dev URLを指定してください");
 u.pathname="/";u.search="";u.hash="";
 localStorage.setItem(CONFIG_KEY,u.origin);
 return u.origin;
}
function credentials(){
 const url=endpoint();
 const token=tokenInput.value;
 if(!token)throw Error("Worker専用パスコードを入力してください（OpenAI APIキーではありません）");
 return {url,token};
}
function payloadFrom(item){
 return {
  itemName:String(item.itemName||"").slice(0,240),
  itemUrl:String(item.itemUrl||item._sourceUrl||"").slice(0,600),
  itemPrice:Number(item.itemPrice||0),
  reviewCount:Number(item.reviewCount||0),
  reviewAverage:Number(item.reviewAverage||0),
  catchcopy:String(item.catchcopy||"").slice(0,700),
  itemCaption:String(item.itemCaption||"").slice(0,3500)
 };
}
function modeFrom(item){
 return item._furusato?"furusato":item._normalUrl?"normal":"timesale";
}
async function aiOne(card,{quiet=false}={}){
 const textarea=card.querySelector("textarea");
 if(!textarea)return false;
 const item=window.__roomV66ProductsById?.[textarea.id];
 const status=card.querySelector(".v66-ai-status");
 const button=card.querySelector(".v66-ai-action");
 if(!item){
  if(status)status.textContent="商品情報の受け渡しを確認できませんでした。";
  return false;
 }
 if(!item._enriched){
  if(status)status.textContent="⚠️ 楽天APIで商品を照合できていません。誤った商品でのAI生成を防ぐため停止しました。";
  return false;
 }
 let conn;
 try{conn=credentials()}catch(e){if(status)status.textContent=e.message;return false}
 if(button)button.disabled=true;
 if(status)status.textContent="🔎 AIが商品を分類・事実確認 → 商品専用の文章を生成しています…";
 try{
  const ctrl=new AbortController();
  const timeout=setTimeout(()=>ctrl.abort(),100000);
  let res;
  try{
   res=await fetch(conn.url+"/generate",{
    method:"POST",
    headers:{"Content-Type":"application/json","X-Room-Token":conn.token},
    body:JSON.stringify({product:payloadFrom(item),mode:modeFrom(item)}),
    signal:ctrl.signal
   });
  }finally{clearTimeout(timeout)}
  const data=await res.json().catch(()=>({error:"サーバー応答を解釈できませんでした"}));
  if(!res.ok||!data.ok)throw Error(data.error||"AI生成に失敗しました（"+res.status+"）");
  if(!data.post||data.post.length>500)throw Error("生成文章が500文字以内になりませんでした");
  textarea.value=data.post;
  // コピー/投稿ボタンも textarea の現在値を使うようにコア側を修正済み。
  const counter=[...card.querySelectorAll(".cardstatus")].find(x=>/^文字数[:：]/.test(x.textContent.trim()));
  if(counter)counter.textContent="文字数："+data.post.length+" / 500（AI生成）";
  card.querySelector(".v66-ai-pending")?.remove();
  let preview=card.querySelector(".v66-ai-preview");
  if(!preview){preview=el("div","v66-ai-preview");textarea.before(preview)}
  preview.textContent="AIの商品判定："+String(data.product_type||"")+
    (data.verified_facts?.length?" ／ 確認できた特徴："+data.verified_facts.slice(0,4).join("・"):"")+
    (data.cautions?.length?" ／ 要注意："+data.cautions.slice(0,2).join("・"):"");
  if(status){status.classList.add("v66-ai-done");status.textContent="✅ 商品ごとの文章を生成しました。コピーや投稿準備に反映済み。"}
  if(button)button.textContent="✨ AIで再生成";
  if(!quiet)panelStatus.textContent="生成完了："+String(item.itemName||"").slice(0,80);
  return true;
 }catch(e){
  if(status)status.textContent="❌ "+(e.name==="AbortError"?"処理がタイムアウトしました":e.message);
  return false;
 }finally{if(button)button.disabled=false}
}
function decorate(){
 [...results.querySelectorAll("article.card")].forEach(card=>{
  if(card.querySelector(".v66-ai-action"))return;
  const ta=card.querySelector("textarea");
  if(!ta)return;
  const actions=card.querySelector(".actions");
  if(!actions)return;
  const btn=el("button","v66-ai-action","✨ AIで商品専用の文章を生成");
  btn.type="button";
  actions.appendChild(btn);
  btn.addEventListener("click",()=>{aiOne(card)});
  const note=el("div","v66-ai-pending","⚠️ 現在の本文は従来のテンプレート仮文です。AI生成後に内容を確認して投稿してください。");
  ta.before(note);
  const status=el("div","v66-ai-status");
  actions.after(status);
  if(ta.id==="v66normalCopy"&&panel.querySelector("#v66AutoNormal").checked&&workerInput.value&&tokenInput.value){
   btn.click();
  }
 });
}
health.addEventListener("click",async()=>{
 let url;
 try{url=endpoint()}catch(e){panelStatus.textContent=e.message;return}
 health.disabled=true;panelStatus.textContent="接続を確認しています…";
 try{
  const r=await fetch(url+"/health");
  const j=await r.json();
  if(!r.ok)throw Error(j.error||"接続できませんでした");
  panelStatus.textContent=j.configured?"✅ Worker接続OK。秘密鍵の登録を確認しました。商品側のAIボタンを押してください。":"⚠️ Workerは開けましたが、Secretsが未設定です。";
 }catch(e){panelStatus.textContent="❌ 接続に失敗："+e.message}
 finally{health.disabled=false}
});
batch.addEventListener("click",async()=>{
 if(busyAll)return;
 try{credentials()}catch(e){panelStatus.textContent=e.message;return}
 busyAll=true;cancelBatch=false;batch.disabled=true;cancel.disabled=false;
 const cards=[...results.querySelectorAll("article.card")];
 let ok=0;
 for(let i=0;i<cards.length;i++){
  if(cancelBatch)break;
  panelStatus.textContent="AI生成中："+(i+1)+" / "+cards.length+"件";
  if(await aiOne(cards[i],{quiet:true}))ok++;
 }
 panelStatus.textContent="AI生成："+ok+" / "+cards.length+"件完了"+(cancelBatch?"（途中中止）":"")+"。未照合やAPI制限で失敗した商品は各カードを確認してください。";
 busyAll=false;batch.disabled=false;cancel.disabled=true;
});
cancel.addEventListener("click",()=>{cancelBatch=true;panelStatus.textContent="次の商品から停止します…"});
const observer=new MutationObserver(()=>decorate());
observer.observe(results,{childList:true,subtree:false});
decorate();
})();
