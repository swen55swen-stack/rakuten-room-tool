(()=>{
const RULES=[
["メンズワイシャツ",/ワイシャツ|カッターシャツ|yシャツ|ｙシャツ|ビジネスシャツ|ドレスシャツ/,"メンズファッション","仕事や通勤で着るメンズ向けワイシャツ","通勤・仕事・ビジネスシーン","アイロンの手間や、仕事着の着回しやすさが気になる","仕事用のシャツを探している男性","ノーアイロン仕様やサイズ感を比べながら、毎日の仕事着として選びやすい",["#ワイシャツ","#ビジネスシャツ","#ノーアイロン","#メンズファッション","#通勤コーデ","#仕事着"],["ニット","セーター","レディース","寝具","収納"],"サイズ・首回り・袖丈・素材・洗濯表示"],
["掛け布団カバー",/掛け布団カバー|掛布団カバー|羽毛布団カバー|ふとんカバー|布団カバー/,"寝具カバー","掛け布団にかぶせて使う寝具カバー","寝室","布団カバーの肌ざわりや洗いやすさが気になる","寝具の雰囲気や使い心地を整えたい人","布団の肌ざわりやお手入れを考えて選べる",["#掛け布団カバー","#布団カバー","#寝具カバー","#寝室","#冬支度","#あったか寝具"],["掛け布団本体","掃除機"],"対応サイズ・素材・留め具・洗濯方法"],
["ニット・セーター",/ニット|セーター|カシミヤタッチ|プルオーバー/,"レディースファッション","普段のコーディネートに取り入れるニット・セーター","通勤・お出かけ・普段着","肌ざわりや着回しやすさが気になる","季節のコーデを楽しみたい人","デザインや素材感を比べながら選べる",["#ニット","#セーター","#秋冬コーデ","#レディースファッション","#着回し","#大人カジュアル"],["掛け布団","寝具","掃除機"],"サイズ・素材・厚み・洗濯表示"],
["サラダチキンメーカー",/サラダチキンメーカー|サラダチキン.*(?:調理器|メーカー)/,"キッチン家電","サラダチキンなどの調理に使うキッチン家電","キッチン・食卓","自宅で手軽にサラダチキンを作りたい","食事づくりを工夫したい人","調理の手間や使いやすさを考えながら選べる",["#サラダチキンメーカー","#キッチン家電","#自炊","#サラダチキン","#料理グッズ","#時短調理"],["掃除機","寝具"],"容量・調理モード・加熱時間・お手入れ方法"],
["ミキサー・ブレンダー",/ブレンダー|ミキサー|スムージーメーカー|ジューサー/,"キッチン家電","食材や飲み物を混ぜるための調理家電","キッチン","飲み物や料理の下ごしらえを手軽にしたい","スムージーや自炊を楽しみたい人","食材の混ぜ方や使いやすさを選べる",["#ミキサー","#ブレンダー","#キッチン家電","#スムージー","#調理家電"],["掃除機","寝具"],"容量・刃の仕様・洗いやすさ・対応食材"],
["布団乾燥機",/布団乾燥機|ふとん乾燥機|ふとん乾燥器|布団乾燥器/,"寝具家電","布団に温風を送り乾燥やあたために使う家電","寝室・布団・靴（対応機種のみ）","布団の湿気や寝る前の冷たさが気になる","布団の乾燥やあたためを手軽にしたい人","布団の乾燥やあたために使える",["#布団乾燥機","#ふとん乾燥機","#布団乾燥","#寝具家電","#湿気対策","#梅雨対策","#冬支度","#布団あたため"],["掃除機","コードレス掃除機","吸引力","ゴミ捨て"],"対応する布団サイズ・ノズル数・運転モード・消費電力"],
["排気口カバー",/排気口(?:カバー|ガード)|グリルガード|コンロ(?:カバー|ガード)/,"キッチン用品","コンロの排気口周りを汚れから守るキッチン用品","キッチン・コンロ周り","調理中の油はねや汚れが気になる","コンロ周りを清潔に保ちたい人","油はねなどの汚れ対策に役立つ",["#排気口カバー","#コンロカバー","#キッチングッズ","#油はねガード","#汚れ防止","#コンロ掃除","#キッチン掃除","#家事ラク","#お手入れ簡単"],["収納ラック","整理収納","部屋づくり","寝具"],"対応コンロ・幅・奥行き・耐熱温度・お手入れ方法"],
["枕",/枕|まくら|ピロー/,"寝具","頭と首を支えて眠るための寝具","寝室","今の枕がしっくりこない・寝心地を見直したい","睡眠環境を見直したい人","毎晩使う寝具だから、高さや硬さを自分に合わせて選びたい",["#枕","#まくら","#快眠","#睡眠環境","#枕選び"],["収納","掛け布団","冬支度"],"高さ・硬さ・素材・サイズ・お手入れ方法"],
["掛け布団",/掛け布団|掛布団/,"寝具","体に掛けて眠るための寝具","寝室","寝る時の寒さや布団の重さが気になる","あたたかく眠れる寝具を探している人","季節に合う掛け布団を選んで寝床を整えやすい",["#掛け布団","#寝具","#快眠","#寝室"],["収納グッズ"],"サイズ・重さ・素材・洗濯方法"],
["毛布",/毛布|ブランケット/,"寝具","体を包んで暖かさを補う寝具","寝室・リビング","寒い時期の冷えが気になる","手軽に暖かさを足したい人","寝る時やくつろぎ時間の冷え対策に使いやすい",["#毛布","#ブランケット","#あったか寝具","#冷え対策"],["収納グッズ"],"サイズ・重さ・肌ざわり・洗濯方法"],
["マットレス",/マットレス|敷きマット/,"寝具","体を支えて眠るための寝具","寝室","寝心地や体の沈み込みが気になる","睡眠環境を見直したい人","厚みや硬さを比べながら寝心地を選びやすい",["#マットレス","#寝具","#快眠","#睡眠環境"],["収納グッズ"],"厚み・硬さ・サイズ・素材"],
["珪藻土コースター",/珪藻土.*コースター|コースター.*珪藻土/,"テーブル雑貨","グラスやカップの下に敷くコースター","食卓・デスク","冷たい飲み物の結露でテーブルが濡れる","グラスまわりの水滴が気になる人","グラスの下に敷いて水滴を受けやすくできる",["#珪藻土コースター","#コースター","#水滴対策","#結露対策"],["収納","掃除用品"],"サイズ・吸水性・デザイン・お手入れ方法"],
["タンブラー",/タンブラー/,"ドリンク用品","飲み物を入れて飲むための容器","食卓・デスク・外出先","飲み物をゆっくり楽しみたい","マイカップをよく使う人","普段の飲み物時間に取り入れやすい",["#タンブラー","#ドリンクグッズ","#おうち時間"],["調理器具"],"容量・保温保冷・フタ・お手入れ方法"],
["水筒・マグボトル",/水筒|マグボトル/,"ドリンク用品","飲み物を持ち歩くためのボトル","通勤・通学・外出先","外出先でも飲み物を持ち歩きたい","通勤通学やお出かけが多い人","外出時の水分補給に使いやすい",["#水筒","#マグボトル","#水分補給","#お出かけ"],["インテリア"],"容量・重さ・保温保冷・洗いやすさ"],
["収納ラック",/収納ラック|シェルフ|収納棚|カラーボックス|ラック/,"収納","物を置いたり分けたりして収納する家具","部屋・キッチン・洗面所など","物の置き場所を作って部屋を整えたい","収納を増やしたい人","散らかりやすい物の定位置を作りやすい",["#収納","#収納ラック","#整理収納","#部屋づくり"],["寝具"],"サイズ・耐荷重・設置場所・組み立て方法"],
["ハンガー",/ハンガー/,"収納","衣類を掛けて保管するための道具","クローゼット・洗濯スペース","服をすっきり掛けて整理したい","クローゼットを整えたい人","衣類の定位置を作りやすい",["#ハンガー","#衣類収納","#クローゼット収納","#整理収納"],["キッチン"],"本数・サイズ・滑りにくさ・対応衣類"],
["掃除機",/ロボット掃除機|掃除機|スティッククリーナー|ハンディクリーナー/,"暮らし家電","床や家具まわりのゴミを吸い取る掃除家電","家の中","日々の掃除の手間を減らしたい","掃除を少しラクにしたい人","床やすき間の掃除を効率よく進めやすい",["#掃除機","#掃除グッズ","#家事ラク","#暮らし家電"],["美容"],"吸引力・重さ・稼働時間・ゴミ捨て方法"],
["フライパン",/フライパン/,"キッチン","焼く・炒める料理に使う調理器具","キッチン","毎日の調理を使いやすい道具で進めたい","自炊や料理をする人","普段の焼き物や炒め物で出番が多い",["#フライパン","#キッチングッズ","#自炊","#料理"],["美容"],"サイズ・重さ・コーティング・IH対応"],
["包丁",/包丁/,"キッチン","食材を切るための調理道具","キッチン","下ごしらえをスムーズにしたい","料理をする人","毎日の食材カットに使う基本の道具",["#包丁","#キッチングッズ","#料理道具","#自炊"],["美容"],"刃渡り・重さ・素材・お手入れ方法"],
["まな板",/まな板|カッティングボード/,"キッチン","食材を切る時に下に敷く調理道具","キッチン","下ごしらえをしやすくしたい","料理をする人","食材を切る作業スペースを作りやすい",["#まな板","#キッチングッズ","#自炊","#料理"],["インテリア家具"],"サイズ・素材・滑りにくさ・洗いやすさ"],
["電気ケトル",/電気ケトル|ケトル/,"暮らし家電","お湯を沸かすための家電","キッチン・ダイニング","必要な分のお湯を手早く用意したい","コーヒーやお茶をよく飲む人","飲み物や簡単な食事用のお湯を用意しやすい",["#電気ケトル","#キッチン家電","#暮らし家電","#一人暮らし"],["美容"],"容量・沸騰時間・安全機能・お手入れ方法"],
["炊飯器",/炊飯器|炊飯ジャー/,"暮らし家電","ご飯を炊くための家電","キッチン","日々のご飯を手軽に炊きたい","自炊をする人","毎日の主食づくりを任せやすい",["#炊飯器","#キッチン家電","#自炊","#暮らし家電"],["美容"],"炊飯容量・炊飯メニュー・お手入れ方法"],
["加湿器",/加湿器/,"暮らし家電","部屋の空気を加湿する家電","リビング・寝室","乾燥する季節の部屋の湿度が気になる","室内の乾燥対策をしたい人","乾燥しやすい時期の室内環境を整えやすい",["#加湿器","#乾燥対策","#暮らし家電","#冬支度"],["美容液"],"適用畳数・加湿量・給水方法・お手入れ方法"],
["除湿機",/除湿機|衣類乾燥除湿/,"暮らし家電","部屋の湿気を減らす家電","部屋・洗濯スペース","湿気や部屋干しの乾きにくさが気になる","梅雨や部屋干し対策をしたい人","室内の湿気対策や衣類乾燥に使いやすい",["#除湿機","#部屋干し","#湿気対策","#暮らし家電"],["美容"],"適用畳数・除湿能力・タンク容量・運転音"],
["ドライヤー",/ドライヤー/,"美容家電","髪を乾かすための家電","洗面所・脱衣所","毎日のドライ時間や髪の扱いやすさが気になる","ヘアケアを見直したい人","毎日の髪を乾かす時間に使う美容家電",["#ドライヤー","#美容家電","#ヘアケア"],["掃除家電"],"風量・重さ・温度設定・サイズ"],
["シャンプー",/シャンプー/,"美容","髪と頭皮を洗うためのヘアケア商品","浴室","毎日のヘアケアを見直したい","シャンプー選びにこだわりたい人","毎日の洗髪に取り入れるヘアケア商品",["#シャンプー","#ヘアケア","#おうち美容"],["掃除用品"],"容量・香り・髪質との相性・使用方法"],
["トリートメント",/トリートメント|ヘアマスク/,"美容","髪を整えるためのヘアケア商品","浴室","髪のまとまりや手触りが気になる","ヘアケアを見直したい人","普段のシャンプー後のケアに足しやすい",["#トリートメント","#ヘアケア","#おうち美容"],["掃除用品"],"容量・香り・髪質との相性・使用方法"],
["美容液",/美容液|セラム/,"美容","スキンケアで使う美容商品","洗面所・ドレッサー","普段のスキンケアを見直したい","美容ケアに関心がある人","いつものスキンケアに取り入れやすい",["#美容液","#スキンケア","#美容","#おうち美容"],["家電"],"容量・成分・肌質との相性・使用方法"],
["化粧水",/化粧水|ローション/,"美容","洗顔後などに使うスキンケア商品","洗面所・ドレッサー","毎日のスキンケアを整えたい","基礎化粧品を見直したい人","日々のスキンケアに取り入れやすい",["#化粧水","#スキンケア","#美容","#おうち美容"],["掃除用品"],"容量・成分・肌質との相性・使用方法"],
["美顔器",/美顔器/,"美容家電","自宅で美容ケアに使う機器","洗面所・ドレッサー","おうち美容を充実させたい","美容家電が気になる人","自宅での美容時間に取り入れやすい",["#美顔器","#美容家電","#おうち美容","#美容"],["掃除家電"],"機能・使用頻度・充電方法・お手入れ方法"],
["ホエイプロテイン",/wpc|wpi|ホエイ.*プロテイン|プロテイン.*ホエイ/,"食品・栄養","たんぱく質補給に使うホエイ系プロテイン","自宅・ジム","毎日のたんぱく質補給を続けたい","筋トレや運動をしている人","運動後や食事で不足しがちなたんぱく質補給に取り入れやすい",["#ホエイプロテイン","#プロテイン","#筋トレ","#たんぱく質"],["収納"],"味・容量・栄養成分・1回量"],
["ソイプロテイン",/ソイ.*プロテイン|プロテイン.*ソイ/,"食品・栄養","たんぱく質補給に使う大豆系プロテイン","自宅・ジム","毎日のたんぱく質補給を続けたい","植物性プロテインを選びたい人","日々のたんぱく質補給に取り入れやすい",["#ソイプロテイン","#プロテイン","#たんぱく質","#健康習慣"],["収納"],"味・容量・栄養成分・1回量"],
["プロテイン",/プロテイン/,"食品・栄養","たんぱく質補給に使う食品","自宅・ジム","毎日のたんぱく質補給を続けたい","プロテインを取り入れたい人","日々のたんぱく質補給に取り入れやすい",["#プロテイン","#たんぱく質","#筋トレ"],["収納"],"味・容量・栄養成分・1回量"],
["レトルト食品",/レトルト|レンジで.*(?:完成|簡単)|電子レンジ.*(?:食品|ごはん|惣菜)/,"時短食品","温めるなど簡単な準備で食べられる食品","キッチン・食卓","忙しい日に食事準備をラクにしたい","自炊の負担を減らしたい人","時間がない日の食事候補として使いやすい",["#時短ごはん","#簡単ごはん","#レトルト","#忙しい日のごはん"],["インテリア"],"内容量・調理方法・保存方法・賞味期限"],
["冷凍食品",/冷凍.*(?:食品|惣菜|おかず|餃子|ハンバーグ|ピザ|麺|ごはん)/,"時短食品","冷凍保存して必要な時に調理する食品","冷凍庫・キッチン","忙しい日に食事準備をラクにしたい","ストック食品を活用したい人","食べたい時に使えるストックとして便利",["#冷凍食品","#時短ごはん","#ストック食品","#簡単ごはん"],["インテリア"],"内容量・調理方法・保存方法・賞味期限"],
["知育玩具",/知育玩具|知育おもちゃ|モンテッソーリ/,"子供グッズ","遊びながら考えたり手を動かしたりする子供向け玩具","家・子供部屋","年齢に合った遊び道具を選びたい","子供の遊び時間を充実させたい家庭","遊びながら楽しめるおもちゃとして選びやすい",["#知育玩具","#知育おもちゃ","#子供グッズ","#おもちゃ"],["大人向け"],"対象年齢・サイズ・遊び方・安全上の注意"],
["おもちゃ",/おもちゃ|玩具|ブロック|ぬいぐるみ/,"子供グッズ","子供が遊ぶためのアイテム","家・子供部屋","子供が楽しめる遊び道具を探したい","子供向け商品を探している家庭","誕生日や普段の遊び用に選びやすい",["#おもちゃ","#子供グッズ","#キッズ","#プレゼント"],["大人向け"],"対象年齢・サイズ・遊び方・安全上の注意"],
["モバイルバッテリー",/モバイルバッテリー/,"ガジェット","外出先などでスマホ等を充電する機器","外出先・旅行・デスク","外出先の充電切れが不安","スマホをよく使う人","コンセントがない場所でも充電しやすい",["#モバイルバッテリー","#スマホ充電","#ガジェット","#旅行グッズ"],["美容"],"容量・重さ・対応端子・充電速度"],
["充電器",/急速充電器|usb充電器|充電アダプタ|充電器/,"ガジェット","スマホなどの機器を充電するための機器","家・デスク・外出先","充電環境を整えたい","スマホやガジェットをよく使う人","毎日の充電をしやすく整えられる",["#充電器","#急速充電","#スマホグッズ","#ガジェット"],["美容"],"出力・ポート数・対応規格・サイズ"]
];
const F=[
[/ノーアイロン|ノンアイロン|形態安定|形状記憶/,"ノーアイロン","アイロンがけの手間を減らしやすい"],
[/長袖/,"長袖","通勤や仕事着として使いやすい定番仕様"],
[/半袖/,"半袖","暑い時期の仕事着として使いやすい"],
[/ストレッチ/,"ストレッチ","動きやすさを意識した仕様"],
[/吸汗速乾|吸水速乾/,"吸汗速乾","汗や乾きやすさを意識した仕様"],
[/洗える|丸洗い|洗濯可能/,"洗える","お手入れしやすい"],
[/通気性|通気/,"通気性","ムレが気になる時に確認したい"],
[/軽量|軽い/,"軽量","持ち運びや扱いやすさが気になる"],
[/コンパクト|省スペース/,"コンパクト","置き場所を取りにくい"],
[/折りたたみ/,"折りたたみ","使わない時にまとめやすい"],
[/コードレス/,"コードレス","コンセント位置を気にせず使いやすい"],
[/静音/,"静音","運転音が気になる場面で確認したい"],
[/大容量/,"大容量","まとめて使いたい時に便利"],
[/抗菌/,"抗菌","清潔さを意識した仕様"],
[/防臭/,"防臭","ニオイ対策を意識した仕様"],
[/速乾/,"速乾","乾きやすさを意識した仕様"],
[/保温/,"保温","温度を保ちやすい仕様"],
[/保冷/,"保冷","冷たさを保ちやすい仕様"],
[/珪藻土/,"珪藻土","水分を吸いやすい素材"],
[/シンサレート/,"シンサレート","軽さと暖かさを意識した素材"],
[/フランネル/,"フランネル","あたたかみのある肌ざわり"],
[/ゲル|ジェル/,"ゲル素材","やわらかさやフィット感が気になる素材"],
[/無添加/,"無添加","成分を気にする人が確認したいポイント"],
[/国産|日本製/,"日本製・国産","産地を重視する人が確認したいポイント"]
];
const low=s=>String(s||"").toLowerCase();
const clean=s=>String(s||"").replace(/【[^】]*】/g," ").replace(/[＼／]/g," ").replace(/\s+/g," ").trim();
function choose(x,a){const k=String(x.itemCode||x.itemName||"");const n=[...k].reduce((p,c)=>p+c.charCodeAt(0),0);return a[Math.abs(n)%a.length]}
function understand(x){
 const n=low(x.itemName),c=low(x.catchcopy),d=low(x.itemCaption);
 // Title is authoritative. Generic accessory terms must not override a specific product.
 const priorities={"メンズワイシャツ":190,"掛け布団カバー":155,"ニット・セーター":140,"サラダチキンメーカー":145,"ミキサー・ブレンダー":125,"布団乾燥機":130,"排気口カバー":120,"珪藻土コースター":110,"モバイルバッテリー":108,"ホエイプロテイン":106,"ソイプロテイン":106,"知育玩具":104,"ハンガー":50,"収納ラック":35,"充電器":35,"おもちゃ":30};
 const generic=new Set(["収納ラック","充電器","おもちゃ"]);
 function rank(text,source){
  const matches=[];
  RULES.forEach((rule,index)=>{
   const m=rule[1].exec(text);
   if(!m)return;
   const specificity=(priorities[rule[0]]||60);
   // Prefer explicit product phrases and early occurrences in the title.
   const score=specificity+Math.min(m[0].length,15)*2-Math.min(m.index,120)*0.3;
   matches.push({rule,index,score,source});
  });
  matches.sort((a,b)=>b.score-a.score||a.index-b.index);
  return matches[0]||null;
 }
 const title=rank(n,"商品名");
 // A vague title should never be classified from unrelated cross-sell copy.
 const selected=title&&!generic.has(title.rule[0])?title:
   title?title:null;
 let h=selected?.rule||null,src=selected?.source||"判定できず",conf=selected?Math.min(96,Math.round(75+(selected.score-55)/4)):25;
 if(!h){
  // Caption/catchcopy alone cannot reliably identify a product.
  h=["商品",/./,"商品","商品ページで用途を確認したいアイテム","商品ページ","用途がタイトルだけでは分かりにくい","詳細を見てから選びたい人","用途や仕様を確認してから判断したい",[],[],"用途・サイズ・仕様"];
 }
 // Features need direct title evidence; descriptions often contain unrelated recommendations.
 const features=[];
 F.forEach(v=>{if(v[0].test(n)&&!features.some(z=>z.label===v[1])&&!(v[1]==="折りたたみ"&&!/折りたたみ(?:式|可能)?|折畳|折り畳み/.test(n)))features.push({label:v[1],desc:v[2]})});
 if(h[0]==="商品")conf=25;
 if(generic.has(h[0])&&n.length>70)conf=Math.min(conf,70);
 return {type:h[0],category:h[2],use:h[3],place:h[4],pain:h[5],audience:h[6],benefit:h[7],tags:h[8],ng:h[9],cta:h[10],features:features.slice(0,4),confidence:conf,source:src};
}
function hook(x,u){
 const M={
  "メンズワイシャツ":["毎日の仕事着、できればアイロンの手間は減らしたいですよね👔","通勤用のワイシャツって、着やすさとお手入れのラクさが大事ですよね。","仕事でよく着るシャツだから、サイズ感と扱いやすさはしっかり見ておきたいところ。"],
  "掛け布団カバー":["布団カバーを変えるだけでも、寝室の雰囲気って変わりますよね🛏️","毎日触れる布団カバーだから、肌ざわりやお手入れのしやすさも大切ですね。"],
  "ニット・セーター":["季節の変わり目、着回しやすいニットが気になりますよね🧶","一枚で着ても重ね着しても楽しめるニット、ついチェックしたくなりますね。"],
  "枕":["毎晩使う枕、ちゃんと自分に合ってるか気になりません？😴","朝起きた時、枕そろそろ見直そうかなって思うことありません？","枕って毎日使うからこそ、高さや寝心地って大事ですよね。"],
  "珪藻土コースター":["冷たい飲み物の水滴で、テーブルがびちゃっとなるの気になりません？🥤","コップを持ち上げたら水の輪っか…って地味に気になりますよね。","デスクで冷たい飲み物を飲む人、コースターの水滴問題ありません？"],
  "布団乾燥機":["布団の湿気や寝る前の冷たさ、気になりませんか？🛏️","梅雨の湿気や冬の冷たい布団、手軽にケアできたらうれしいですよね。"],
  "排気口カバー":["コンロの排気口まわり、油はねや汚れが気になりませんか？🍳","キッチンの掃除、少しでもラクにできたらうれしいですよね。"],
  "収納ラック":["ここにもう少し収納があれば…って場所ありません？","物の定位置が決まるだけで、部屋ってかなり片付けやすくなりますよね。","気づくと物が増えて置き場所に困る人、これちょっと気になるかも。"],
  "掃除機":["掃除って、少しでも手間が減るとかなり助かりますよね。","毎日の床掃除、もっとサッと終わらせたいと思いません？"],
  "フライパン":["毎日使うフライパン、使いやすさで料理の気分まで変わりません？","焼く・炒めるで出番が多いから、フライパンは使いやすいものがいいですよね。"],
  "美容液":["いつものスキンケア、何かひとつ足したくなる時ありません？✨","美容液って種類が多いから、成分や使い方を見比べたくなりますよね。"],
  "ホエイプロテイン":["プロテインって、結局続けやすさが大事ですよね。","トレーニング後の一杯、味も成分も自分に合うものを選びたいですよね。"],
  "プロテイン":["毎日飲むなら、無理なく続けられるプロテインがいいですよね。","プロテイン選び、味・成分・価格のバランスで迷いません？"],
  "知育玩具":["遊びながら楽しめるおもちゃ、つい探したくなりません？🧸","子どもが夢中になれる遊び道具、見つかるとうれしいですよね。"],
  "レトルト食品":["今日はもうご飯作りたくない…って日、ありますよね🍚","忙しい日にサッと食べられるもの、ストックしてあると助かりますよね。"]
 };
 return choose(x,M[u.type]||["これ、使う場面がイメージできるとちょっと気になりません？👀","こういうの、必要な人にはかなり刺さりそうです。","毎日の中で使うものって、ちょっとした使いやすさが大事ですよね。"]);
}
function review(x){const n=Number(x.reviewCount||0),a=Number(x.reviewAverage||0);if(n>=1000)return "口コミが"+n.toLocaleString()+"件あるので、実際に使った人の感想もかなり見られそう◎";if(n>=100&&a>=4.4)return "レビュー"+n.toLocaleString()+"件・評価"+a.toFixed(2)+"。口コミも一緒に見ておきたいです◎";return ""}
function makeTags(w,x,u){
 const a=["#楽天ROOM","#楽天市場",...u.tags];
 u.features.forEach(f=>a.push("#"+f.label.replace(/\s+/g,"")));
 const full=low(x.itemName)+" "+low(x.catchcopy);
 if(/shark|シャーク/.test(full))a.push("#Shark","#シャーク");
 if(/evopower|エヴォパワー/.test(full))a.push("#EVOPOWER");
 if(/ハンディクリーナー/.test(full))a.push("#ハンディクリーナー","#コードレス掃除機","#車内掃除","#時短家事");
 if(w.isOnSale(x)&&/sale|セール|%\s*off|％\s*off|割引/i.test(String(x.itemName||"")+" "+String(x.catchcopy||"")))a.push("#セール","#お買い得");
 if(/ポイント\s*([2-9]|[1-9][0-9])\s*倍/.test(full))a.push("#ポイントアップ");
 if(/女性用|女性向け|レディース/.test(full))a.push("#女性向け");
 if(/メンズ|男性用|男性向け/.test(full))a.push("#男性向け");
 return [...new Set(a)].filter(t=>!u.ng.some(ng=>low(t).includes(low(ng)))).slice(0,25).join(" ");
}
function makeBody(w,x,u){
 const raw=String(x.itemName||""),name=clean(raw).slice(0,65);
 const price=Number(x.itemPrice||0),count=Number(x.reviewCount||0),avg=Number(x.reviewAverage||0);
 const sale=w.saleEndLabel(x)||"",lines=[];
 if(sale&&/sale|セール|割引|off/i.test(sale)&&!(/[２2３3４4５5]点目|まとめ買い|対象商品|クーポン利用/.test(raw)&&/off|割引/i.test(sale)))lines.push("🔥 "+sale);
 if(count>0&&avg>0&&avg<=5)lines.push("⭐ レビュー"+count.toLocaleString()+"件・評価"+avg.toFixed(2));
 if(price>0)lines.push("💰 価格："+w.yen(price));
 const discount=raw.match(/(\d{1,2})\s*[%％]\s*OFF/i),points=raw.match(/ポイント\s*(\d+)\s*倍/);
 const conditional=/[２2３3４4５5]点目|まとめ買い|対象商品|クーポン利用|クーポンで/i.test(raw);
 const deals=[discount?(conditional?"条件付き割引あり（詳細要確認）":discount[1]+"％OFF"):null,points?"ポイント"+points[1]+"倍":null].filter(Boolean);
 if(deals.length)lines.push("✨ "+deals.join("＆")+"！");
 lines.push("",name,"",hook(x,u),"");
 if(u.confidence>=65){
  lines.push(u.use+"。"+u.benefit+"のが魅力です。");
  u.features.slice(0,3).forEach(f=>lines.push("✅ "+f.label+"： "+f.desc));
  lines.push("","「"+u.pain+"」という人にも、チェックしてほしいアイテム😊");
  if(/ファッション|子供服/.test(u.category)){
   lines.push(u.place+"で着る場面を想像しながら、サイズ感・素材・お手入れのしやすさを見て選びたいですね。");
  }else if(/食品|栄養/.test(u.category)){
   lines.push("食べる場面やストック方法を想像しながら、内容量・調理方法・保存方法を確認して選びたいですね。");
  }else if(/美容/.test(u.category)){
   lines.push("毎日のケアで使う場面を想像しながら、成分・使用方法・自分との相性を確認して選びたいですね。");
  }else{
   lines.push(u.place+"で使う場面を想像しながら、サイズや使いやすさを考えて選びたいですね。");
  }
 }else{
  lines.push("気になる商品を見つけたら、まずは自分の暮らしでどんなふうに使えるか考えてみたいですね😊");
  lines.push("商品名だけでは詳しい機能まで判断できないので、購入前に仕様や使い方を確認しておくと選びやすそうです。");
  lines.push("毎日使うものなら、お手入れのしやすさや収納場所も気になるポイント。使う頻度や置き場所もイメージしておきたいところです。");
  lines.push("レビューがある場合は、実際に購入した人の感想も参考にしながら比較してみるのがおすすめ◎");
 }
 lines.push("","気になったら、"+u.cta+"を商品ページで確認してみてください♪");
 return lines.join("\n");
}
function install(w,d){
 if(w.__v44Installed)return;
 w.__v44Installed=true;
 const oldRender=w.render;

 // V44 hotfix: ROOMターゲットに「指定なし」を必ず追加
 const roomTarget=d.getElementById("roomTarget");
 if(roomTarget&&!roomTarget.querySelector('option[value="none"]')){
  const opt=d.createElement("option");
  opt.value="none";
  opt.textContent="指定なし";
  roomTarget.insertBefore(opt,roomTarget.firstChild);
 }

 // 古いV42がキャッシュされていても「指定なし」はV44側で動かす
 const originalRoomResearch=typeof w.roomResearch==="function"?w.roomResearch:null;
 async function v44NoneRoomResearch(){
  const app=d.getElementById("appId")?.value.trim()||"";
  const key=d.getElementById("accessKey")?.value.trim()||"";
  if(!app||!key){w.status("Application IDとAccess Keyを入力してください。");return}
  const pages=Math.min(Number(d.getElementById("pages")?.value||2),3);
  const affiliate=d.getElementById("affiliateId")?.value.trim()||"";
  const min=Number(d.getElementById("minPrice")?.value||0);
  const max=Number(d.getElementById("maxPrice")?.value||99999999);
  const saleOnly=d.getElementById("saleOnly")?.value==="1";
  try{
   localStorage.setItem("roomV42Target","none");
   w.status("💗 ターゲットを絞らず、ROOMで売れそうな商品を広く探しています…");
   const results=d.getElementById("results");
   if(results)results.innerHTML='<div class="empty">指定なしで候補を取得中…</div>';

   let all=[];
   const rt=await w.rankingSearchPeriod(app,key,affiliate,pages,"","realtime","ROOM向けリアルタイム");
   rt.forEach((x,i)=>{x._realtimeRank=Number(x.rank||i+1);all.push(x)});
   const dy=await w.rankingSearchPeriod(app,key,affiliate,pages,"","","ROOM向けデイリー");
   dy.forEach((x,i)=>{x._dailyRank=Number(x.rank||i+1);all.push(x)});

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
    if(Number(x._realtimeRank||999)<=30)bonus+=28;
    else if(Number(x._realtimeRank||999)<=100)bonus+=14;
    if(Number(x._dailyRank||999)<=30)bonus+=18;
    else if(Number(x._dailyRank||999)<=100)bonus+=9;
    if(reviews>=50&&reviews<=3000)bonus+=12;
    if(avg>=4.5)bonus+=12; else if(avg>=4.3)bonus+=8;
    if(price>=1000&&price<=8000)bonus+=14; else if(price>8000&&price<=15000)bonus+=7;
    if(w.isOnSale(x))bonus+=15;
    x._room=Math.round(base*.55+bonus);
    x._score=x._room;
   });
   arr.sort((a,b)=>b._room-a._room||Number(a.rank||999)-Number(b.rank||999));
   const top=arr.slice(0,10);
   if(!top.length)throw new Error("条件に合う商品が見つかりませんでした。価格条件やセール絞り込みを変えてください。");

   w.__roomCandidates=top;
   w.eval("candidates = window.__roomCandidates; render();");

   setTimeout(()=>{
    [...d.querySelectorAll("article.card")].forEach((card,i)=>{
     const x=top[i],chips=card.querySelector(".chips");
     if(!x||!chips||chips.querySelector(".v44roomnone"))return;
     const a=d.createElement("span");
     a.className="chip v44roomnone";
     a.textContent="💗 ROOM売れそう "+x._room;
     a.style.cssText="background:#ffeaf5;color:#a11663;font-weight:900";
     const b=d.createElement("span");
     b.className="chip v44roomnone";
     b.textContent="指定なし";
     b.style.cssText="background:#fff5fb;color:#8a2459";
     chips.prepend(b);chips.prepend(a);
    });
   },0);

   w.status("完了：💗 ターゲット指定なしで、ROOMで売れそうな候補を10件作りました。\nリアルタイム順位・デイリー順位・レビュー・評価・価格・セールを加味しています。");
  }catch(e){
   console.error(e);
   w.status("取得できませんでした。\n\n"+(e.message||e));
   const results=d.getElementById("results");
   if(results)results.innerHTML='<div class="empty">取得に失敗しました。</div>';
  }
 }

 if(originalRoomResearch){
  w.roomResearch=function(){
   const target=d.getElementById("roomTarget")?.value;
   if(target==="none")return v44NoneRoomResearch();
   return originalRoomResearch();
  };
 }
 w.productUnderstanding=understand;
 w.itemProfile=x=>{const u=understand(x);return {cat:u.type,pain:u.pain,benefit:u.benefit,tags:u.tags.join(" "),thumbs:[u.type+"をチェック",u.features[0]?.label||u.category,u.audience].filter(Boolean).slice(0,3)}};
 w.makeCopy=x=>{
  const u=understand(x),tags=makeTags(w,x,u).split(/\s+/).filter(Boolean);
  const body=makeBody(w,x,u);
  // Build a complete post, including hashtags, aiming for 400-490 characters.
  const chosen=tags.slice(0,Math.min(12,tags.length));
  const tagLength=()=>chosen.join(" ").length;
  const limit=500-2-tagLength();
  const extras=u.confidence>=65?[
   "選ぶときは、実際に使う場所や使う頻度も考えておくと、自分に合うか判断しやすいですね。",
   "写真だけでは分かりにくい部分もあるので、サイズ感やお手入れの方法までチェックしておきたいところ。",
   "購入前にレビューを見て、良かった点だけでなく気になる点も比較しておくと安心です◎",
   /ファッション|子供服/.test(u.category)?"毎日着るものなら、サイズ感だけでなく洗濯後のお手入れや着回しやすさも見ておきたいですね。":"毎日の暮らしに取り入れるなら、使い勝手やお手入れのしやすさも大事なポイントですね。"
  ]:[
   "商品名だけでは分からないこともあるので、使い方やサイズなどの詳しい仕様は商品ページで確認したいですね。",
   "置く場所や使う頻度を想像してみると、自分の暮らしに合うかどうか判断しやすそうです。",
   "気になるところはレビューもチェック。良い評価だけでなく、購入前に知っておきたい注意点も見ておきたいです◎",
   "ほかの商品と比較するときは、価格だけでなく付属品やお手入れのしやすさも確認したいところ。"
  ];
  let paragraphs=body.split("\n");
  // Place extra context before the closing call to action, not after the hashtags.
  const closing=paragraphs.pop();
  while(paragraphs.length&&paragraphs[paragraphs.length-1]==="")paragraphs.pop();
  let text=paragraphs.join("\n").trim();
  const target=Math.min(limit,Math.max(360,limit-25));
  for(const extra of extras){
   const candidate=text+"\n\n"+extra+"\n\n"+closing;
   if(candidate.length<=limit && (text+"\n\n"+closing).length<target)text+="\n\n"+extra;
  }
  let result=text+"\n\n"+closing;
  if(result.length>limit){
   // Drop optional middle paragraphs before dropping product facts or closing line.
   let parts=result.split("\n\n");
   while(parts.join("\n\n").length>limit&&parts.length>3)parts.splice(parts.length-2,1);
   result=parts.join("\n\n");
  }
  if(result.length>limit){
   // Prefer fewer tags over shortening the product description.
   while(chosen.length>2&&result.length+2+tagLength()>500)chosen.pop();
  }
  if(result.length+2+tagLength()>500){
   const sentences=result.split(/(?<=[。！？♪◎])|\n/).map(v=>v.trim()).filter(Boolean);
   result="";
   const max=500-2-tagLength();
   for(const sentence of sentences){
    const next=result?result+"\n"+sentence:sentence;
    if(next.length>max)break;
    result=next;
   }
  }
  // Fill spare space with relevant tags without exceeding the ROOM limit.
  for(const t of tags.slice(chosen.length)){
   if(result.length+2+tagLength()+1+t.length<=500)chosen.push(t);
  }
  return (result+"\n\n"+chosen.join(" ")).trim();
 };
 w.thumbnailIdeas=x=>{const u=understand(x);return [u.type+"をチェック",u.features[0]?.label||u.category,u.audience].filter(Boolean).slice(0,3)};
 w.recommendText=x=>{const u=understand(x);const fs=u.features.map(v=>v.label).join(" / ")||"特徴は商品ページで確認";return "🧠 商品判定："+u.type+"｜理解度 "+u.confidence+"%（"+u.source+"）\n🎯 用途："+u.use+"\n📍 使う場所："+u.place+"\n💡 特徴："+fs+"\n👤 向いていそう："+u.audience+"\n🚫 混ぜない文脈："+u.ng.join(" / ")};
 w.render=function(){
  oldRender();
  const items=w.__roomCandidates||[];
  [...d.querySelectorAll("article.card")].forEach((card,i)=>{
   let x=items[i];
   if(!x){try{x=w.eval("candidates["+i+"]")}catch(e){}}
   if(!x)return;
   const u=understand(x),chips=card.querySelector(".chips");
   if(chips&&!chips.querySelector(".v44understand")){
    const a=d.createElement("span");a.className="chip v44understand";
    a.textContent="🧠 "+u.type+" "+u.confidence+"%";
    a.style.cssText="background:#eaf2ff;color:#174ea6;font-weight:900";chips.prepend(a);
   }
   const ta=card.querySelector("textarea[id^='copy-']");
   if(ta){
    const copy=w.makeCopy(x);
    ta.value=copy;
    const counter=ta.nextElementSibling;
    if(counter&&counter.textContent.includes("文字数"))counter.textContent="文字数："+copy.length+" / 500（V44改良版）";
   }
  });
 };
 const h=d.querySelector("h1");if(h)h.textContent="楽天ROOM 自動リサーチ＋連続投稿 V44";
 const sub=d.querySelector("header .sub");if(sub)sub.textContent="商品を理解してから、その商品に合う紹介文を作る";
 const first=d.querySelector("section.panel");
 if(first&&!d.getElementById("v44note")){const n=d.createElement("div");n.id="v44note";n.className="warning";n.style.cssText="background:#eef5ff;border-color:#b9d2ff";n.innerHTML="<b>🧠 V44 商品理解エンジン：</b> 商品名を最優先に、キャッチコピー→商品説明の順で判定。商品種類・用途・使う場所・特徴・ターゲットを整理してから紹介文を作ります。";first.parentNode.insertBefore(n,first)}
}
// Wait for both nested frames and the V41 functions; do not depend on load event timing.
const frame=document.getElementById("appframe");
let attempts=0;
const waitForApp=setInterval(()=>{
 attempts++;
 try{
  const nested=frame?.contentDocument?.getElementById("appframe");
  const w=nested?.contentWindow,d=nested?.contentDocument;
  if(w&&d&&typeof w.makeCopy==="function"&&typeof w.render==="function"){
   install(w,d);
   clearInterval(waitForApp);
  }
 }catch(e){console.warn("V44 waiting for application",e)}
 if(attempts>=100)clearInterval(waitForApp);
},250);
})();