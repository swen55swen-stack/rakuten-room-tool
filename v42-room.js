(()=>{
function onReady(fn){
  const frame=document.getElementById('appframe');
  if(!frame)return;
  frame.addEventListener('load',()=>setTimeout(()=>fn(frame.contentWindow,frame.contentDocument),300));
}
const TARGETS={
  none:{label:'指定なし',audience:'neutral',searches:[]},
  male_interior:{label:'一人暮らし男性インテリア',audience:'male',searches:[['一人暮らし インテリア','100804'],['モダン インテリア','100804']]},
  female_interior:{label:'一人暮らし女性インテリア',audience:'female',searches:[['一人暮らし インテリア','100804'],['北欧 インテリア','100804']]},
  easy_food:{label:'毎日の暮らしが楽な食品',audience:'neutral',searches:[['時短 食品','100227'],['レンジ 簡単','100227']]},
  kids:{label:'子供グッズ',audience:'neutral',searches:[['知育玩具','566382'],['キッズ 子供','100533']]},
  home_appliance:{label:'暮らし家電',audience:'neutral',searches:[['時短 家電','562637'],['一人暮らし 家電','562637']]},
  beauty:{label:'美容商品',audience:'female',searches:[['スキンケア','100939'],['ヘアケア','100939']]}
};
function seasonalCfg(){
  const m=new Date().getMonth()+1;
  if(m>=10||m<=2)return {label:'季節もの',audience:'neutral',searches:[['あったか 防寒','100804'],['暖房 加湿','562637']]};
  if(m>=3&&m<=5)return {label:'季節もの',audience:'neutral',searches:[['新生活 インテリア','100804'],['花粉 家電','562637']]};
  return {label:'季節もの',audience:'neutral',searches:[['冷感 夏','100804'],['扇風機 サーキュレーター','562637']]};
}
function getCfg(key){return key==='seasonal'?seasonalCfg():(TARGETS[key]||TARGETS.none)}
function relevance(x,target){
  const t=(String(x.itemName||'')+' '+String(x.catchcopy||'')+' '+String(x.itemCaption||'')).toLowerCase();
  let s=0;
  if(target==='none'){
    return 20;
  }
  if(target==='male_interior'||target==='female_interior'){
    if(/インテリア|収納|照明|ラグ|カーテン|テーブル|チェア|ソファ|ベッド|ラック|棚|デスク|クッション/.test(t))s+=45;
    if(/一人暮らし|ワンルーム|省スペース|コンパクト/.test(t))s+=18;
    if(target==='male_interior'&&/男性|メンズ|男前|モダン|シンプル|ブラック|ヴィンテージ/.test(t))s+=15;
    if(target==='female_interior'&&/女性|レディース|北欧|韓国|ナチュラル|ホワイト|かわいい|おしゃれ/.test(t))s+=15;
  }else if(target==='easy_food'){
    if(/レンジ|電子レンジ|湯煎|冷凍|レトルト|惣菜|スープ|カレー|丼|パスタ|麺|個包装|常温|時短|簡単|調理済み/.test(t))s+=55;
    if(/ごはん|米|肉|魚|パン|食品|グルメ/.test(t))s+=15;
  }else if(target==='kids'){
    if(/知育|おもちゃ|玩具|キッズ|子供|こども|ベビー|絵本|ブロック|ぬいぐるみ|パジャマ|子ども服|キッズ服/.test(t))s+=55;
    if(/誕生日|プレゼント|入園|通園|学習/.test(t))s+=12;
  }else if(target==='home_appliance'){
    if(/掃除機|クリーナ|加湿器|除湿機|空気清浄|ケトル|炊飯器|トースター|ドライヤ|サーキュレーター|ヒーター|扇風機|電気毛布|食洗|家電/.test(t))s+=55;
    if(/時短|自動|コードレス|コンパクト|一人暮らし|省スペース/.test(t))s+=15;
  }else if(target==='seasonal'){
    const m=new Date().getMonth()+1;
    if((m>=10||m<=2)&&/冬|秋冬|防寒|あったか|暖房|加湿|毛布|布団|ヒーター|こたつ|湯たんぽ|乾燥/.test(t))s+=60;
    else if((m>=3&&m<=5)&&/春|新生活|花粉|入学|入園|紫外線|uv|衣替え/.test(t))s+=60;
    else if(m>=6&&m<=9&&/夏|冷感|ひんやり|扇風機|サーキュレーター|日傘|uv|暑さ|保冷|冷却/.test(t))s+=60;
  }else if(target==='beauty'){
    if(/美容液|化粧水|乳液|クリーム|クレンジング|パック|シャンプ|トリートメント|ヘアオイル|美顔器|コスメ|ファンデ|リップ|日焼け止め|スキンケア|ヘアケア/.test(t))s+=60;
    if(/保湿|毛穴|乾燥|ツヤ|エイジング|敏感肌/.test(t))s+=12;
  }
  return s;
}
function roomScore(w,x,target){
  const p=Number(x.itemPrice||0),r=Number(x.reviewCount||0),a=Number(x.reviewAverage||0);
  let s=relevance(x,target);
  const sweet={
    male_interior:[1500,12000],female_interior:[1000,10000],easy_food:[800,5000],
    kids:[800,6000],home_appliance:[2000,15000],seasonal:[1000,10000],beauty:[1000,8000]
  }[target]||[1000,8000];
  if(p>=sweet[0]&&p<=sweet[1])s+=28; else if(p>0&&p<=20000)s+=10;
  if(r>=50&&r<=2000)s+=18; else if(r>2000&&r<=10000)s+=13; else if(r>=10)s+=8;
  if(a>=4.5)s+=16; else if(a>=4.3)s+=12; else if(a>=4.0)s+=6;
  if(w.isOnSale(x))s+=20;
  if(Number(x.pointRate||1)>=3)s+=6;
  if((x.mediumImageUrls||[]).length>=2)s+=5;
  if(w.hasConcreteProductInfo(x))s+=8; else s-=30;
  if(Number(x._realtimeRank||999)<=30)s+=18; else if(Number(x._realtimeRank||999)<=100)s+=9;
  if(Number(x._dailyRank||999)<=30)s+=12; else if(Number(x._dailyRank||999)<=100)s+=6;
  return Math.round(s);
}
function addChips(d,items,label){
  items.forEach((x,i)=>{
    const chips=d.querySelector('#card-'+(i+1)+' .chips');
    if(!chips)return;
    const a=d.createElement('span');a.className='chip';a.textContent='💗 ROOM売れそう '+x._room;
    a.style.cssText='background:#ffeaf5;color:#a11663;font-weight:900';
    const b=d.createElement('span');b.className='chip';b.textContent=label;
    b.style.cssText='background:#fff5fb;color:#8a2459';
    chips.prepend(b);chips.prepend(a);
  });
}
onReady((w,d)=>{
  const h1=d.querySelector('h1'); if(h1)h1.textContent='楽天ROOM 自動リサーチ＋連続投稿 V42';
  const sub=d.querySelector('header .sub'); if(sub)sub.textContent='ターゲットを絞って、ROOMで売れそうな商品も選定';
  const mode=d.getElementById('mode');
  if(mode&&!mode.querySelector('option[value="room"]'))mode.add(new Option('💗 ROOMで売れそう','room'));

  const sale=d.getElementById('saleOnly')?.closest('div');
  if(sale&&!d.getElementById('roomTarget')){
    const box=d.createElement('div');
    box.innerHTML='<label>ROOMターゲット</label><select id="roomTarget">'+
      '<option value="none">指定なし</option>'+
      '<option value="male_interior">一人暮らし男性インテリア</option>'+
      '<option value="female_interior">一人暮らし女性インテリア</option>'+
      '<option value="easy_food">毎日の暮らしが楽な食品</option>'+
      '<option value="kids">子供グッズ（おもちゃ・知育玩具・洋服など）</option>'+
      '<option value="home_appliance">暮らし家電</option>'+
      '<option value="seasonal">季節もの</option>'+
      '<option value="beauty">美容商品</option></select>';
    sale.parentNode.insertBefore(box,sale);
    const saved=localStorage.getItem('roomV42Target'); if(saved)d.getElementById('roomTarget').value=saved;
    d.getElementById('roomTarget').addEventListener('change',e=>localStorage.setItem('roomV42Target',e.target.value));
  }
  const actions=d.querySelector('.actions');
  if(actions&&!d.getElementById('roomSellBtn')){
    const btn=d.createElement('button');btn.id='roomSellBtn';btn.textContent='💗 ROOMで売れそう10件';
    btn.style.cssText='background:#d63384;color:#fff';
    const hot=[...actions.querySelectorAll('button')].find(b=>b.textContent.includes('今売れてる10件'));
    hot?hot.after(btn):actions.appendChild(btn);
    btn.addEventListener('click',()=>w.roomResearch());
  }
  const mainPanel=d.querySelector('section.panel');
  if(mainPanel){
    const note=d.createElement('div');note.className='warning';note.style.cssText='background:#fff0f7;border-color:#f2b9d7';
    note.innerHTML='<b>💗 ROOMで売れそう：</b>「指定なし」または7つのターゲットから選び、価格帯・レビュー・評価・セール・商品内容・楽天ランキングの勢いをまとめて点数化します。';
    mainPanel.parentNode.insertBefore(note,mainPanel);
  }

  w.roomResearch=async function(){
    const app=d.getElementById('appId').value.trim(),key=d.getElementById('accessKey').value.trim();
    if(!app||!key){w.status('Application IDとAccess Keyを入力してください。');return}
    const target=d.getElementById('roomTarget').value,c=getCfg(target);
    const pages=Math.min(Number(d.getElementById('pages').value||2),2);
    const affiliate=d.getElementById('affiliateId').value.trim();
    const min=Number(d.getElementById('minPrice').value||0),max=Number(d.getElementById('maxPrice').value||99999999);
    const saleOnly=d.getElementById('saleOnly').value==='1';
    localStorage.setItem('roomV42Target',target);
    w.status(target==='none'?'💗 ターゲットを絞らず、ROOMで売れそうな商品を広く探しています…':'💗 ROOMで売れそうな「'+c.label+'」を探しています…');
    d.getElementById('results').innerHTML='<div class="empty">ターゲット商品を取得中…</div>';
    try{
      let all=[];
      if(target==='none'){
        const rt=await w.rankingSearchPeriod(app,key,affiliate,pages,'','realtime','ROOM向けリアルタイム');
        rt.forEach((x,i)=>{x._realtimeRank=Number(x.rank||i+1);all.push(x)});
        const dy=await w.rankingSearchPeriod(app,key,affiliate,pages,'','','ROOM向けデイリー');
        dy.forEach((x,i)=>{x._dailyRank=Number(x.rank||i+1);all.push(x)});
      }else{
        for(const [q,g] of c.searches)all.push(...await w.themeSearch(app,key,affiliate,q,pages,min,max,g));
        for(const g of [...new Set(c.searches.map(v=>v[1]))]){
          try{
            const rt=await w.rankingSearchPeriod(app,key,affiliate,1,g,'realtime','ROOM向けリアルタイム');
            rt.forEach((x,i)=>{x._realtimeRank=Number(x.rank||i+1);all.push(x)});
            const dy=await w.rankingSearchPeriod(app,key,affiliate,1,g,'','ROOM向けデイリー');
            dy.forEach((x,i)=>{x._dailyRank=Number(x.rank||i+1);all.push(x)});
          }catch(e){}
        }
      }
      const map=new Map();
      all.forEach((x,i)=>{
        if(!x?.itemCode)return;
        const old=map.get(x.itemCode);
        if(old){if(x._realtimeRank)old._realtimeRank=x._realtimeRank;if(x._dailyRank)old._dailyRank=x._dailyRank}
        else{if(!x.rank)x.rank=i+1;map.set(x.itemCode,x)}
      });
      let arr=[...map.values()].filter(x=>{
        const p=Number(x.itemPrice||0);
        return p>=min&&p<=max&&w.directUrl(x)&&Number(x.availability??1)===1&&!w.isExcludedProduct(x)&&
          !w.targetMismatch(x,c.audience)&&relevance(x,target)>0&&(!saleOnly||w.isOnSale(x));
      });
      const hist=w.updateMonthlyHistory(arr);
      arr.forEach(x=>{
        w.finalScore(x,'mix',hist);
        x._room=roomScore(w,x,target);
        x._relevance=relevance(x,target);
        x._score=x._room;
      });
      arr.sort((a,b)=>b._room-a._room||b._relevance-a._relevance||Number(a.rank||999)-Number(b.rank||999));
      const top=arr.slice(0,10);
      if(!top.length)throw new Error('このターゲットで条件に合う商品が見つかりませんでした。価格条件やセール絞り込みを変えてください。');
      w.__roomCandidates=top;
      w.eval('candidates = window.__roomCandidates; render();');
      addChips(d,top,c.label);
      w.status(target==='none'?'完了：💗 ターゲット指定なしで、ROOMで売れそうな候補を10件作りました。\\n価格帯・レビュー・評価・セール・商品内容・楽天ランキングの勢いを加味しています。':'完了：💗 '+c.label+'に絞って、ROOMで売れそうな候補を10件作りました。\\n価格帯・レビュー・評価・セール・商品内容・楽天ランキングの勢いを加味しています。');
    }catch(e){
      console.error(e);
      w.status('取得できませんでした。\\n\\n'+(e.message||e));
      d.getElementById('results').innerHTML='<div class="empty">取得に失敗しました。</div>';
    }
  };

  const original=w.research;
  w.research=function(){
    if(d.getElementById('mode')?.value==='room')return w.roomResearch();
    return original();
  };
});
})();