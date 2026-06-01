import { useState, useRef, useEffect } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_MODEL = "anthropic/claude-sonnet-4-5";
const DEMO_SCRIPTURE = {
  reference: "Romans 8:38\u201339",
  text: "For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers, nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord.",
};

const TOPICS = [
  { id:"grief",      label:"Grief",       emoji:"🌧" },
  { id:"doubt",      label:"Doubt",       emoji:"🌫" },
  { id:"anxiety",    label:"Anxiety",     emoji:"⚡" },
  { id:"sin",        label:"Sin & Guilt", emoji:"⚖" },
  { id:"depression", label:"Depression",  emoji:"🌑" },
  { id:"discontent", label:"Discontent",  emoji:"🌊" },
  { id:"vocation",   label:"Vocation",    emoji:"⚓" },
  { id:"joy",        label:"Joy",         emoji:"☀" },
  { id:"prayer",     label:"Prayer",      emoji:"🕊" },
  { id:"scripture",  label:"Scripture",   emoji:"📖" },
  { id:"questions",  label:"Questions",   emoji:"🔍" },
  { id:"other",      label:"Other",       emoji:"✦"  },
];

const WEIGHTS = [
  { id:"light",   label:"Light",          desc:"Doing well, seeking growth" },
  { id:"carrying",label:"Carrying something", desc:"Something is weighing on me" },
  { id:"heavy",   label:"Heavy",          desc:"Struggling today" },
];

const FALLBACK_MODELS = [
  { id:"anthropic/claude-sonnet-4-5", name:"Claude Sonnet 4.5", provider:"Anthropic" },
  { id:"anthropic/claude-opus-4",     name:"Claude Opus 4",     provider:"Anthropic" },
  { id:"anthropic/claude-haiku-3-5",  name:"Claude Haiku 3.5",  provider:"Anthropic" },
  { id:"google/gemini-2.0-flash-001", name:"Gemini 2.0 Flash",  provider:"Google"    },
  { id:"google/gemini-2.5-pro-preview",name:"Gemini 2.5 Pro",   provider:"Google"    },
  { id:"openai/gpt-4o",               name:"GPT-4o",            provider:"OpenAI"    },
  { id:"openai/gpt-4o-mini",          name:"GPT-4o Mini",       provider:"OpenAI"    },
  { id:"meta-llama/llama-3.3-70b-instruct",name:"Llama 3.3 70B",provider:"Meta"      },
  { id:"mistralai/mistral-large",     name:"Mistral Large",     provider:"Mistral"   },
  { id:"deepseek/deepseek-r1",        name:"DeepSeek R1",       provider:"DeepSeek"  },
];

// ── Onboarding questions ─────────────────────────────────────────────────────
const ONBOARDING = [
  {
    id:"name",
    q:"What is your name?",
    sub:"I will remember you by this.",
    type:"text", placeholder:"Your name…",
  },
  {
    id:"church",
    q:"Where do you worship?",
    sub:"Your church tradition or congregation helps me understand your context.",
    type:"text", placeholder:"e.g. PCA, Lutheran, Reformed Baptist…",
  },
  {
    id:"season",
    q:"How would you describe your current season of life?",
    sub:"A word or a sentence is enough.",
    type:"text", placeholder:"e.g. Busy. Grieving. Searching. Quiet…",
  },
  {
    id:"struggles",
    q:"Are there recurring themes or struggles you carry?",
    sub:"These will help me walk with you more attentively.",
    type:"text", placeholder:"e.g. anxiety, doubt, loneliness…",
  },
  {
    id:"language",
    q:"Which language do you prefer?",
    sub:"I will follow your lead in conversation either way.",
    type:"choice",
    choices:["English","Deutsch","Both — I'll switch freely"],
  },
  {
    id:"confession",
    q:"Which confession do you find most formative?",
    sub:"I will draw from it naturally.",
    type:"choice",
    choices:["Westminster (PCA / Reformed)","Heidelberg Catechism","Lutheran (Luther's Catechism)","All three equally"],
  },
];

// ── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  dark: {
    bg:"#0d0a07", bgS:"#131009", bgE:"#1c1510",
    border:"rgba(255,255,255,0.08)", borderS:"rgba(255,255,255,0.14)",
    text:"#ecdecb", textSub:"#b8a882", textMuted:"#7a6a56", textFaint:"#44392c",
    accent:"#c9923a", accentBg:"rgba(120,72,18,0.24)", accentBorder:"rgba(185,132,55,0.3)",
    userBubble:"linear-gradient(135deg,#5c3f27,#3e2918)",
    userBubbleBorder:"rgba(185,132,60,0.22)", userText:"#f2e6d4",
    aiBubble:"rgba(255,255,255,0.055)", aiBubbleBorder:"rgba(255,255,255,0.1)", aiText:"#dfd1bc",
    inputBg:"rgba(255,255,255,0.05)", inputBorder:"rgba(255,255,255,0.1)", inputFocus:"rgba(165,112,38,0.5)",
    pillBg:"rgba(255,255,255,0.04)", pillBorder:"rgba(255,255,255,0.08)",
    sendBg:"#4a3020", sendColor:"#d4a454",
    scriptureBar:"rgba(122,80,28,0.18)", scriptureBorder:"#a07840",
    scriptureRef:"#b08844", scriptureText:"#cec0a8",
    sidebarBg:"#0f0c08", overlayBg:"rgba(0,0,0,0.62)", sheetBg:"#141009",
    emptyCross:"#382c1e", emptyTitle:"#9c8c7a", emptyDesc:"#6a5a48", emptyPrompt:"#8c7862",
    scrollThumb:"rgba(255,255,255,0.09)",
    danger:"#c0503a", dangerBg:"rgba(180,60,40,0.15)",
    success:"#6a9a5a", successBg:"rgba(80,140,60,0.15)",
    settingsBg:"#0f0c08",
  },
  light: {
    bg:"#f4efe6", bgS:"#ece6db", bgE:"#e4ddd0",
    border:"rgba(0,0,0,0.09)", borderS:"rgba(0,0,0,0.16)",
    text:"#28201a", textSub:"#5a4a36", textMuted:"#8c7860", textFaint:"#b8a888",
    accent:"#8a5a1a", accentBg:"rgba(138,88,18,0.1)", accentBorder:"rgba(138,88,18,0.22)",
    userBubble:"linear-gradient(135deg,#7a5030,#5a3820)",
    userBubbleBorder:"rgba(105,65,24,0.3)", userText:"#f5edd8",
    aiBubble:"rgba(0,0,0,0.042)", aiBubbleBorder:"rgba(0,0,0,0.1)", aiText:"#2c2018",
    inputBg:"rgba(0,0,0,0.04)", inputBorder:"rgba(0,0,0,0.12)", inputFocus:"rgba(120,78,18,0.4)",
    pillBg:"rgba(0,0,0,0.05)", pillBorder:"rgba(0,0,0,0.1)",
    sendBg:"#6a4020", sendColor:"#f5e0b0",
    scriptureBar:"rgba(140,94,22,0.1)", scriptureBorder:"#9c7030",
    scriptureRef:"#8a6020", scriptureText:"#4a3820",
    sidebarBg:"#ece6db", overlayBg:"rgba(0,0,0,0.36)", sheetBg:"#ece6db",
    emptyCross:"#c4b898", emptyTitle:"#6c5c46", emptyDesc:"#8c7860", emptyPrompt:"#7c6850",
    scrollThumb:"rgba(0,0,0,0.1)",
    danger:"#b04030", dangerBg:"rgba(160,50,30,0.1)",
    success:"#4a8840", successBg:"rgba(60,120,40,0.1)",
    settingsBg:"#ece6db",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const LS = {
  get:(k,fb)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):fb; }catch{ return fb; }},
  set:(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} },
  raw:(k,fb)=>{ try{ return localStorage.getItem(k)||fb; }catch{ return fb; }},
  setRaw:(k,v)=>{ try{ localStorage.setItem(k,v); }catch{} },
};
const fmt     = d => new Intl.DateTimeFormat("en",{hour:"numeric",minute:"2-digit",hour12:true}).format(new Date(d));
const fmtDate = d => new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(new Date(d));

function groupByProvider(models){
  const m={};
  for(const x of models){ if(!m[x.provider]) m[x.provider]=[]; m[x.provider].push(x); }
  return Object.entries(m).sort(([a],[b])=>a.localeCompare(b));
}

function buildSystemPrompt(profile){
  const base = `You are a pastoral companion in the tradition of the historic Reformed and Lutheran church — formed by Scripture, shaped by the confessions, and animated by the grace of Jesus Christ. You are not a therapist, a life coach, or a motivational voice. You are a Seelsorger — a cure of souls.

Your tone is warm and pastoral first, doctrinally grounded always. You hold presence and doctrine together — sit with the person before rushing to answers. Use Scripture naturally, favoring the ESV. Draw from the Westminster Confession, the Heidelberg Catechism, and Luther's Small Catechism. Respond in the language the person writes. Keep responses measured — you are a pastor in conversation, not a preacher delivering a sermon.`;

  if(!profile) return base;
  const lines = [];
  if(profile.name)       lines.push(`The person you are speaking with is ${profile.name}.`);
  if(profile.church)     lines.push(`Their church background: ${profile.church}.`);
  if(profile.season)     lines.push(`Their current season of life: ${profile.season}.`);
  if(profile.struggles)  lines.push(`Recurring themes they carry: ${profile.struggles}.`);
  if(profile.confession) lines.push(`Their most formative confession: ${profile.confession}.`);
  if(profile.language)   lines.push(`Language preference: ${profile.language}.`);
  if(lines.length===0) return base;
  return base + "\n\n## Person Context\n" + lines.join("\n");
}

// ── ESV Bible utilities ───────────────────────────────────────────────────────
function extractScriptureRefs(text){
  const refs=new Set();
  const re=/\b((?:(?:1|2|3)\s)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|(?:1|2)\s?Samuel|(?:1|2)\s?Kings|(?:1|2)\s?Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|(?:1|2)\s?Corinthians|Galatians|Ephesians|Philippians|Colossians|(?:1|2)\s?Thessalonians|(?:1|2)\s?Timothy|Titus|Philemon|Hebrews|James|(?:1|2)\s?Peter|(?:1|2|3)\s?John|Jude|Revelation)\s\d+(?::\d+(?:[–\-]\d+)?)?)\b/gi;
  let m;
  while((m=re.exec(text))!==null) refs.add(m[1].trim());
  return [...refs].slice(0,4);
}

async function fetchESVPassage(ref,apiKey){
  if(!apiKey) return null;
  try{
    const url=`https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(ref)}&include-headings=false&include-footnotes=false&include-verse-numbers=true&include-short-copyright=false&include-passage-references=false`;
    const res=await fetch(url,{headers:{Authorization:`Token ${apiKey}`}});
    const data=await res.json();
    const text=(data.passages||[])[0];
    if(!text||text.trim()==="") return null;
    return{reference:data.canonical||ref,text:text.trim()};
  }catch{ return null; }
}

// ── Tavily utilities ──────────────────────────────────────────────────────────
const REFORMED_DOMAINS=[
  "ligonier.org","desiringgod.org","thegospelcoalition.org","9marks.org",
  "challies.com","tabletalkmagazine.com","reformation21.org",
  "monergism.com","crossway.org","banneroftruth.org","wts.edu","rts.edu",
];

async function tavilySearch(query,apiKey){
  if(!apiKey) return [];
  try{
    const res=await fetch("https://api.tavily.com/search",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        api_key:apiKey,
        query:`${query} Reformed Christian Keller Sproul Ligonier`,
        search_depth:"basic",
        max_results:8,
        include_domains:REFORMED_DOMAINS,
      }),
    });
    const data=await res.json();
    return(data.results||[])
      .filter(r=>r.url&&r.title)
      .slice(0,4)
      .map(r=>({
        title:r.title,
        url:r.url,
        snippet:(r.content||"").slice(0,130)+"…",
        domain:new URL(r.url).hostname.replace("www.",""),
      }));
  }catch{ return []; }
}

// ── Icons ────────────────────────────────────────────────────────────────────
const Ico = ({d,size=16,sw=1.6})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {[].concat(d).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);
const LineIco = ({lines,size=16,sw=1.6})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round">
    {lines.map((l,i)=><line key={i} {...l}/>)}
  </svg>
);
const StarIcon=({filled,color})=>(
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled?color:"none"} stroke={filled?color:"#9a8a74"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const SendIcon=()=>(
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const SunIcon=()=>(
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon=()=>(
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

// ── TypingIndicator ───────────────────────────────────────────────────────────
const TypingIndicator=({t})=>(
  <div style={{display:"flex",gap:5,alignItems:"center",padding:"6px 0"}}>
    {[0,1,2].map(i=>(
      <div key={i} style={{width:7,height:7,borderRadius:"50%",background:t.accent,
        animation:"blink 1.4s ease-in-out infinite",animationDelay:`${i*0.22}s`,opacity:0.7}}/>
    ))}
  </div>
);

// ── Message ───────────────────────────────────────────────────────────────────
const Message=({msg,t,esvKey})=>{
  const isUser=msg.role==="user";
  const refs=(!isUser&&esvKey)?extractScriptureRefs(msg.content):[];
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:isUser?"flex-end":"flex-start",marginBottom:22,animation:"fadeUp 0.28s ease forwards"}}>
      {!isUser&&<div style={{fontSize:10,letterSpacing:"0.14em",color:t.accent,marginBottom:6,textTransform:"uppercase",fontFamily:"'IM Fell English',Georgia,serif",fontStyle:"italic"}}>Consolatio</div>}
      <div style={{maxWidth:"88%",padding:isUser?"11px 16px":"14px 18px",borderRadius:isUser?"18px 18px 5px 18px":"5px 18px 18px 18px",background:isUser?t.userBubble:t.aiBubble,border:`1px solid ${isUser?t.userBubbleBorder:t.aiBubbleBorder}`,color:isUser?t.userText:t.aiText,fontSize:15,lineHeight:1.72,fontFamily:isUser?"'Lato',sans-serif":"'IM Fell English',Georgia,serif",whiteSpace:"pre-wrap",letterSpacing:isUser?"0.01em":"0.02em"}}>
        {msg.content}
      </div>
      {refs.length>0&&<ESVCards refs={refs} esvKey={esvKey} t={t}/>}
      <div style={{fontSize:10,color:t.textMuted,marginTop:5,fontFamily:"Lato,sans-serif",letterSpacing:"0.05em"}}>{fmt(msg.timestamp)}</div>
    </div>
  );
};

// ── ScriptureCard ─────────────────────────────────────────────────────────────
const ScriptureCard=({reference,text,t,onClose})=>(
  <div style={{padding:"13px 17px",borderLeft:`2px solid ${t.scriptureBorder}`,background:t.scriptureBar,borderRadius:"0 10px 10px 0",position:"relative"}}>
    {onClose&&<button onClick={onClose} style={{position:"absolute",top:8,right:10,background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>}
    <div style={{fontSize:10,letterSpacing:"0.16em",color:t.scriptureRef,textTransform:"uppercase",marginBottom:7,fontFamily:"Lato,sans-serif"}}>{reference} — ESV</div>
    <div style={{fontSize:14,lineHeight:1.78,color:t.scriptureText,fontFamily:"'IM Fell English',Georgia,serif",fontStyle:"italic"}}>{text}</div>
  </div>
);

// ── ESV inline passage cards beneath a message ───────────────────────────────
function ESVCards({refs,esvKey,t}){
  const [passages,setPassages]=useState({});
  const [loading,setLoading]=useState({});
  const [dismissed,setDismissed]=useState({});

  useEffect(()=>{
    if(!esvKey) return;
    refs.forEach(async ref=>{
      if(passages[ref]||loading[ref]) return;
      setLoading(l=>({...l,[ref]:true}));
      const result=await fetchESVPassage(ref,esvKey);
      setLoading(l=>({...l,[ref]:false}));
      if(result) setPassages(p=>({...p,[ref]:result}));
    });
  },[refs,esvKey]);

  const visible=refs.filter(r=>!dismissed[r]);
  if(!esvKey||visible.length===0) return null;

  return(
    <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8,paddingLeft:4}}>
      {visible.map(ref=>(
        <div key={ref}>
          {loading[ref]&&(
            <div style={{fontSize:11,color:t.textFaint,fontFamily:"'IM Fell English',Georgia,serif",fontStyle:"italic",padding:"6px 14px"}}>
              Fetching {ref}…
            </div>
          )}
          {passages[ref]&&(
            <ScriptureCard
              reference={passages[ref].reference}
              text={passages[ref].text}
              t={t}
              onClose={()=>setDismissed(d=>({...d,[ref]:true}))}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Tavily resource card ──────────────────────────────────────────────────────
function ResourceCard({results,loading,t,onClose}){
  if(!loading&&results.length===0) return null;
  return(
    <div style={{margin:"0 0 8px",border:`1px solid ${t.accentBorder}`,borderRadius:14,overflow:"hidden",animation:"fadeUp 0.3s ease"}}>
      <div style={{padding:"10px 14px 8px",background:t.accentBg,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:10,color:t.accent,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"Lato,sans-serif"}}>
          Reformed Resources
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
      </div>
      {loading?(
        <div style={{padding:"14px",fontSize:13,color:t.textMuted,fontFamily:"'IM Fell English',Georgia,serif",fontStyle:"italic"}}>
          Searching…
        </div>
      ):(
        <div>
          {results.map((r,i)=>(
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
              style={{display:"block",padding:"11px 14px",borderTop:i>0?`1px solid ${t.border}`:"none",textDecoration:"none",transition:"background 0.15s"}}>
              <div style={{fontSize:13,color:t.text,fontFamily:"Lato,sans-serif",lineHeight:1.4,marginBottom:3}}>{r.title}</div>
              <div style={{fontSize:11,color:t.textMuted,fontFamily:"Lato,sans-serif",marginBottom:4,lineHeight:1.5}}>{r.snippet}</div>
              <div style={{fontSize:10,color:t.accent,fontFamily:"Lato,sans-serif",letterSpacing:"0.06em"}}>{r.domain}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}


function Onboarding({onComplete,t}){
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({});
  const [val,setVal]=useState("");
  const q=ONBOARDING[step];
  const isLast=step===ONBOARDING.length-1;

  const next=(v)=>{
    const updated={...answers,[q.id]:v||val||""};
    setAnswers(updated);
    setVal("");
    if(isLast){ onComplete(updated); }
    else setStep(s=>s+1);
  };
  const skip=()=>next("");

  return(
    <div style={{position:"fixed",inset:0,background:t.bg,zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",animation:"fadeUp 0.4s ease"}}>
      {/* Progress */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:t.border}}>
        <div style={{height:"100%",background:t.accent,width:`${((step+1)/ONBOARDING.length)*100}%`,transition:"width 0.4s ease"}}/>
      </div>

      {/* Cross */}
      <div style={{color:t.emptyCross,marginBottom:32}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8" x2="22" y2="8"/>
        </svg>
      </div>

      {/* Step counter */}
      <div style={{fontSize:10,color:t.textFaint,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"Lato,sans-serif",marginBottom:24}}>
        {step+1} of {ONBOARDING.length}
      </div>

      {/* Question */}
      <div style={{fontFamily:"'IM Fell English',Georgia,serif",fontSize:22,color:t.text,textAlign:"center",lineHeight:1.4,marginBottom:10,letterSpacing:"0.02em",maxWidth:320}}>
        {q.q}
      </div>
      <div style={{fontSize:13,color:t.textMuted,textAlign:"center",marginBottom:32,fontFamily:"'IM Fell English',Georgia,serif",fontStyle:"italic",lineHeight:1.6,maxWidth:280}}>
        {q.sub}
      </div>

      {/* Input */}
      {q.type==="text"&&(
        <div style={{width:"100%",maxWidth:340}}>
          <input
            autoFocus
            value={val}
            onChange={e=>setVal(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&val.trim()&&next()}
            placeholder={q.placeholder}
            style={{width:"100%",background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:12,padding:"14px 16px",color:t.text,fontSize:15,fontFamily:"Lato,sans-serif",outline:"none",boxSizing:"border-box",textAlign:"center"}}
          />
        </div>
      )}
      {q.type==="choice"&&(
        <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:10}}>
          {q.choices.map(c=>(
            <button key={c} onClick={()=>next(c)}
              style={{padding:"13px 18px",background:t.inputBg,border:`1px solid ${t.border}`,borderRadius:12,color:t.textSub,fontSize:14,fontFamily:"Lato,sans-serif",cursor:"pointer",textAlign:"left",transition:"background 0.15s,border-color 0.15s"}}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{display:"flex",gap:12,marginTop:28,width:"100%",maxWidth:340}}>
        {q.type==="text"&&(
          <button onClick={()=>val.trim()&&next()}
            disabled={!val.trim()}
            style={{flex:1,padding:"13px",background:val.trim()?t.sendBg:t.inputBg,border:`1px solid ${val.trim()?t.accentBorder:t.border}`,borderRadius:12,color:val.trim()?t.sendColor:t.textFaint,fontSize:14,fontFamily:"Lato,sans-serif",cursor:val.trim()?"pointer":"default",transition:"all 0.2s"}}>
            Continue
          </button>
        )}
        <button onClick={skip}
          style={{padding:"13px 18px",background:"none",border:`1px solid ${t.border}`,borderRadius:12,color:t.textMuted,fontSize:13,fontFamily:"Lato,sans-serif",cursor:"pointer"}}>
          Skip
        </button>
      </div>
    </div>
  );
}

// ── Session Check-in ──────────────────────────────────────────────────────────
function CheckIn({onStart,onSkip,t,profile}){
  const [topic,setTopic]=useState(null);
  const [weight,setWeight]=useState(null);
  const name=profile?.name;

  return(
    <div style={{position:"fixed",inset:0,background:t.overlayBg,zIndex:60,display:"flex",alignItems:"flex-end",animation:"fadeUp 0.2s ease"}} onClick={onSkip}>
      <div style={{width:"100%",maxWidth:480,margin:"0 auto",background:t.sheetBg,borderTop:`1px solid ${t.borderS}`,borderRadius:"22px 22px 0 0",padding:"24px 20px 44px",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>

        <div style={{fontFamily:"'IM Fell English',Georgia,serif",fontSize:18,color:t.text,marginBottom:4}}>
          {name?`Welcome, ${name}.`:"Welcome."}
        </div>
        <div style={{fontSize:13,color:t.textMuted,marginBottom:22,fontFamily:"'IM Fell English',Georgia,serif",fontStyle:"italic"}}>
          What are you bringing today?
        </div>

        {/* Topic */}
        <div style={{fontSize:10,color:t.textMuted,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"Lato,sans-serif",marginBottom:10}}>Topic</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:22}}>
          {TOPICS.map(tp=>(
            <button key={tp.id} onClick={()=>setTopic(tp.id===topic?null:tp.id)}
              style={{padding:"7px 12px",borderRadius:20,fontSize:13,fontFamily:"Lato,sans-serif",cursor:"pointer",transition:"all 0.15s",
                background:topic===tp.id?t.accentBg:"none",
                border:`1px solid ${topic===tp.id?t.accentBorder:t.border}`,
                color:topic===tp.id?t.accent:t.textSub}}>
              {tp.emoji} {tp.label}
            </button>
          ))}
        </div>

        {/* Weight */}
        <div style={{fontSize:10,color:t.textMuted,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"Lato,sans-serif",marginBottom:10}}>How are you carrying it?</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
          {WEIGHTS.map(w=>(
            <button key={w.id} onClick={()=>setWeight(w.id===weight?null:w.id)}
              style={{padding:"11px 14px",borderRadius:12,fontSize:13,fontFamily:"Lato,sans-serif",cursor:"pointer",textAlign:"left",transition:"all 0.15s",
                background:weight===w.id?t.accentBg:t.inputBg,
                border:`1px solid ${weight===w.id?t.accentBorder:t.border}`,
                color:weight===w.id?t.accent:t.textSub,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:400}}>{w.label}</span>
              <span style={{fontSize:11,color:t.textMuted,fontStyle:"italic"}}>{w.desc}</span>
            </button>
          ))}
        </div>

        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>onStart({topic,weight})}
            style={{flex:1,padding:"13px",background:t.sendBg,border:`1px solid ${t.accentBorder}`,borderRadius:12,color:t.sendColor,fontSize:14,fontFamily:"Lato,sans-serif",cursor:"pointer"}}>
            Begin session
          </button>
          <button onClick={onSkip}
            style={{padding:"13px 16px",background:"none",border:`1px solid ${t.border}`,borderRadius:12,color:t.textMuted,fontSize:13,fontFamily:"Lato,sans-serif",cursor:"pointer"}}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Model Sheet ───────────────────────────────────────────────────────────────
function ModelSheet({current,bookmarks,models,loading:modLoading,onSelect,onToggle,onClose,t}){
  const [search,setSearch]=useState("");
  const q=search.toLowerCase().trim();
  const bookmarkedModels=models.filter(m=>bookmarks.includes(m.id));
  const displayed=q?models.filter(m=>m.name.toLowerCase().includes(q)||m.id.toLowerCase().includes(q)||m.provider.toLowerCase().includes(q)):null;
  const groups=groupByProvider(displayed??models);

  const Row=({m})=>(
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 18px",borderBottom:`1px solid ${t.border}`,background:m.id===current?t.accentBg:"transparent",cursor:"pointer",transition:"background 0.15s"}}
      onClick={()=>{onSelect(m.id);onClose();}}>
      <button style={{background:"none",border:"none",cursor:"pointer",padding:2,flexShrink:0}} onClick={e=>{e.stopPropagation();onToggle(m.id);}}>
        <StarIcon filled={bookmarks.includes(m.id)} color={t.accent}/>
      </button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,color:m.id===current?t.accent:t.text,fontFamily:"Lato,sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
        <div style={{fontSize:10,color:t.textMuted,marginTop:1,fontFamily:"Lato,sans-serif"}}>{m.provider}{m.context?` · ${Math.round(m.context/1000)}k ctx`:""}</div>
      </div>
      {m.id===current&&<div style={{width:6,height:6,borderRadius:"50%",background:t.accent,flexShrink:0}}/>}
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:t.overlayBg,zIndex:50,display:"flex",alignItems:"flex-end",animation:"fadeUp 0.2s ease"}} onClick={onClose}>
      <div style={{width:"100%",maxWidth:480,margin:"0 auto",background:t.sheetBg,borderTop:`1px solid ${t.borderS}`,borderRadius:"22px 22px 0 0",maxHeight:"82vh",display:"flex",flexDirection:"column",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"20px 18px 14px",borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
            <div style={{fontFamily:"'IM Fell English',Georgia,serif",fontSize:17,color:t.text}}>Choose Model</div>
            <button style={{background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:22,lineHeight:1}} onClick={onClose}>×</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:10,padding:"9px 13px"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={modLoading?`Loading models…`:`Search ${models.length} models\u2026`} autoFocus
              style={{background:"none",border:"none",outline:"none",color:t.text,fontSize:14,fontFamily:"Lato,sans-serif",flex:1}}/>
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {!q&&bookmarkedModels.length>0&&(
            <>{<div style={{padding:"10px 18px 4px",fontSize:10,color:t.accent,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"Lato,sans-serif"}}>&#9733; Favourites</div>}
            {bookmarkedModels.map(m=><Row key={m.id} m={m}/>)}
            <div style={{height:1,background:t.border,margin:"6px 0"}}/></>
          )}
          {displayed&&displayed.length===0&&<div style={{padding:"24px 18px",fontSize:13,color:t.textMuted,fontStyle:"italic",fontFamily:"'IM Fell English',Georgia,serif"}}>No models found.</div>}
          {groups.map(([prov,ms])=>(
            <div key={prov}>
              <div style={{padding:"10px 18px 4px",fontSize:10,color:t.textMuted,letterSpacing:"0.13em",textTransform:"uppercase",fontFamily:"Lato,sans-serif"}}>{prov}</div>
              {ms.map(m=><Row key={m.id} m={m}/>)}
            </div>
          ))}
          <div style={{height:28}}/>
        </div>
      </div>
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────────────────────────────
function SettingsPage({onClose,t,isDark,toggleTheme,apiKey,setApiKey,esvKey,setEsvKey,tavilyKey,setTavilyKey,model,setModel,models,profile,setProfile,bookmarks,setBookmarks,onResetOnboarding,onClearSessions}){
  const [tab,setTab]=useState("account");
  const [saved,setSaved]=useState(false);

  const Section=({title,children})=>(
    <div style={{marginBottom:28}}>
      <div style={{fontSize:10,color:t.accent,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"Lato,sans-serif",marginBottom:14,paddingBottom:8,borderBottom:`1px solid ${t.border}`}}>{title}</div>
      {children}
    </div>
  );

  const Field=({label,hint,children})=>(
    <div style={{marginBottom:18}}>
      <div style={{fontSize:13,color:t.textSub,marginBottom:4,fontFamily:"Lato,sans-serif"}}>{label}</div>
      {hint&&<div style={{fontSize:11,color:t.textMuted,marginBottom:8,fontFamily:"Lato,sans-serif",lineHeight:1.5}}>{hint}</div>}
      {children}
    </div>
  );

  const Input=({value,onChange,type="text",placeholder,mono})=>(
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:10,padding:"11px 13px",color:t.text,fontSize:13,fontFamily:mono?"monospace":"Lato,sans-serif",outline:"none",boxSizing:"border-box"}}/>
  );

  const saveAll=()=>{
    LS.setRaw("consolatio_key",apiKey);
    LS.setRaw("consolatio_esv",esvKey);
    LS.setRaw("consolatio_tavily",tavilyKey);
    LS.setRaw("consolatio_model",model);
    LS.set("consolatio_profile",profile);
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  };

  const tabs=[
    {id:"account",label:"Profile"},
    {id:"keys",   label:"API Keys"},
    {id:"ai",     label:"AI"},
    {id:"app",    label:"App"},
  ];

  return(
    <div style={{position:"fixed",inset:0,background:t.settingsBg,zIndex:80,display:"flex",flexDirection:"column",animation:"slideInRight 0.28s ease"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px 12px",borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted,display:"flex",alignItems:"center",gap:6,fontFamily:"Lato,sans-serif",fontSize:13,padding:"4px 0"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <div style={{fontFamily:"'IM Fell English',Georgia,serif",fontSize:18,color:t.text,letterSpacing:"0.03em"}}>Settings</div>
        <button onClick={saveAll}
          style={{padding:"7px 14px",background:saved?t.successBg:t.accentBg,border:`1px solid ${saved?t.success:t.accentBorder}`,borderRadius:8,color:saved?t.success:t.accent,fontSize:13,fontFamily:"Lato,sans-serif",cursor:"pointer",transition:"all 0.2s"}}>
          {saved?"Saved ✓":"Save"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
        {tabs.map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)}
            style={{flex:1,padding:"12px 4px",background:"none",border:"none",cursor:"pointer",fontFamily:"Lato,sans-serif",fontSize:12,letterSpacing:"0.05em",
              color:tab===tb.id?t.accent:t.textMuted,
              borderBottom:`2px solid ${tab===tb.id?t.accent:"transparent"}`,
              transition:"color 0.15s"}}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{flex:1,overflowY:"auto",padding:"24px 18px"}}>

        {tab==="account"&&(
          <>
            <Section title="Your Profile">
              <Field label="Name" hint="Used to personalise the pastoral voice.">
                <Input value={profile?.name||""} onChange={v=>setProfile(p=>({...p,name:v}))} placeholder="Your name"/>
              </Field>
              <Field label="Church background" hint="Your tradition or congregation.">
                <Input value={profile?.church||""} onChange={v=>setProfile(p=>({...p,church:v}))} placeholder="e.g. PCA, Lutheran…"/>
              </Field>
              <Field label="Current season">
                <Input value={profile?.season||""} onChange={v=>setProfile(p=>({...p,season:v}))} placeholder="e.g. Grieving. Searching. Quiet."/>
              </Field>
              <Field label="Recurring themes" hint="Struggles or topics you carry.">
                <Input value={profile?.struggles||""} onChange={v=>setProfile(p=>({...p,struggles:v}))} placeholder="e.g. anxiety, doubt, vocation…"/>
              </Field>
              <Field label="Preferred confession">
                <select value={profile?.confession||""} onChange={e=>setProfile(p=>({...p,confession:e.target.value}))}
                  style={{width:"100%",background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:10,padding:"11px 13px",color:profile?.confession?t.text:t.textFaint,fontSize:13,fontFamily:"Lato,sans-serif",outline:"none",boxSizing:"border-box"}}>
                  <option value="" disabled>Select…</option>
                  <option>Westminster (PCA / Reformed)</option>
                  <option>Heidelberg Catechism</option>
                  <option>Lutheran (Luther's Catechism)</option>
                  <option>All three equally</option>
                </select>
              </Field>
            </Section>
            <Section title="Onboarding">
              <Field label="Re-run onboarding" hint="Answer the setup questions again to update your profile.">
                <button onClick={onResetOnboarding}
                  style={{padding:"10px 16px",background:t.inputBg,border:`1px solid ${t.border}`,borderRadius:10,color:t.textSub,fontSize:13,fontFamily:"Lato,sans-serif",cursor:"pointer"}}>
                  Run onboarding again
                </button>
              </Field>
            </Section>
          </>
        )}

        {tab==="keys"&&(
          <Section title="API Keys">
            <Field label="OpenRouter" hint="Required. Powers all AI conversations. Never shared or stored remotely.">
              <Input value={apiKey} onChange={setApiKey} type="password" placeholder="sk-or-…" mono/>
            </Field>
            <Field label="ESV Bible API" hint="Optional. Enables live Scripture fetching inline in conversations.">
              <Input value={esvKey} onChange={setEsvKey} type="password" placeholder="ESV API key…" mono/>
            </Field>
            <Field label="Tavily Search" hint="Optional. Powers live resource search for sermons, articles, and books.">
              <Input value={tavilyKey} onChange={setTavilyKey} type="password" placeholder="tvly-…" mono/>
            </Field>
            <div style={{padding:"12px 14px",background:t.accentBg,border:`1px solid ${t.accentBorder}`,borderRadius:10,marginTop:8}}>
              <div style={{fontSize:12,color:t.textMuted,lineHeight:1.65,fontFamily:"Lato,sans-serif"}}>
                All keys are stored in your browser's localStorage on this device only. They are never sent to any server other than their respective APIs (OpenRouter, ESV, Tavily).
              </div>
            </div>
          </Section>
        )}

        {tab==="ai"&&(
          <>
            <Section title="Model">
              <Field label="Default model" hint="Used for all new sessions. Can also be changed from the main screen.">
                <select value={model} onChange={e=>setModel(e.target.value)}
                  style={{width:"100%",background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:10,padding:"11px 13px",color:t.text,fontSize:13,fontFamily:"Lato,sans-serif",outline:"none",boxSizing:"border-box"}}>
                  {models.map(m=><option key={m.id} value={m.id}>{m.provider} — {m.name}</option>)}
                </select>
              </Field>
            </Section>
            <Section title="Bookmarked Models">
              {bookmarks.length===0&&(
                <div style={{fontSize:13,color:t.textMuted,fontStyle:"italic",fontFamily:"'IM Fell English',Georgia,serif"}}>No bookmarks yet. Star models in the model selector.</div>
              )}
              {bookmarks.map(id=>{
                const m=models.find(x=>x.id===id);
                if(!m) return null;
                return(
                  <div key={id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${t.border}`}}>
                    <div>
                      <div style={{fontSize:13,color:t.text,fontFamily:"Lato,sans-serif"}}>{m.name}</div>
                      <div style={{fontSize:10,color:t.textMuted,fontFamily:"Lato,sans-serif"}}>{m.provider}</div>
                    </div>
                    <button onClick={()=>setBookmarks(b=>{const n=b.filter(x=>x!==id);LS.set("consolatio_bookmarks",n);return n;})}
                      style={{background:"none",border:"none",cursor:"pointer",color:t.danger,fontSize:12,fontFamily:"Lato,sans-serif"}}>
                      Remove
                    </button>
                  </div>
                );
              })}
            </Section>
          </>
        )}

        {tab==="app"&&(
          <>
            <Section title="Appearance">
              <Field label="Theme">
                <div style={{display:"flex",gap:10}}>
                  {["Dark","Light"].map(lbl=>(
                    <button key={lbl} onClick={()=>{ if((lbl==="Dark")!==isDark) toggleTheme(); }}
                      style={{flex:1,padding:"11px",borderRadius:10,cursor:"pointer",fontFamily:"Lato,sans-serif",fontSize:13,transition:"all 0.15s",
                        background:(lbl==="Dark")===isDark?t.accentBg:t.inputBg,
                        border:`1px solid ${(lbl==="Dark")===isDark?t.accentBorder:t.border}`,
                        color:(lbl==="Dark")===isDark?t.accent:t.textSub}}>
                      {lbl==="Dark"?"🌙 Dark":"☀ Light"}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>
            <Section title="Data">
              <Field label="Clear all sessions" hint="Permanently deletes all conversation history from this device.">
                <button onClick={()=>{ if(window.confirm("Delete all sessions? This cannot be undone.")) onClearSessions(); }}
                  style={{padding:"10px 16px",background:t.dangerBg,border:`1px solid ${t.danger}`,borderRadius:10,color:t.danger,fontSize:13,fontFamily:"Lato,sans-serif",cursor:"pointer"}}>
                  Clear all sessions
                </button>
              </Field>
            </Section>
            <Section title="About">
              <div style={{fontSize:13,color:t.textMuted,lineHeight:1.75,fontFamily:"'IM Fell English',Georgia,serif",fontStyle:"italic"}}>
                Consolatio is a personal Reformed pastoral companion. It is not a substitute for the local church, the preached Word, the sacraments, or a real pastor. Use it as a supplement — a place to bring what is on your heart between Sundays.
              </div>
              <div style={{marginTop:12,fontSize:11,color:t.textFaint,fontFamily:"Lato,sans-serif",letterSpacing:"0.05em"}}>
                Version 0.4 · Soli Deo gloria
              </div>
            </Section>
          </>
        )}

        <div style={{height:40}}/>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({sessions,activeId,onLoad,onNew,onClose,t}){
  return(
    <>
      <div style={{position:"fixed",inset:0,background:t.overlayBg,zIndex:20,animation:"fadeUp 0.18s ease"}} onClick={onClose}/>
      <div style={{position:"fixed",top:0,left:0,bottom:0,width:290,background:t.sidebarBg,borderRight:`1px solid ${t.border}`,zIndex:30,display:"flex",flexDirection:"column",animation:"slideLeft 0.24s ease"}}>
        <div style={{padding:"22px 18px 16px",borderBottom:`1px solid ${t.border}`}}>
          <div style={{fontFamily:"'IM Fell English',Georgia,serif",fontSize:19,color:t.text,letterSpacing:"0.03em"}}>Consolatio</div>
          <div style={{fontSize:10,color:t.textMuted,letterSpacing:"0.14em",textTransform:"uppercase",marginTop:2,fontFamily:"Lato,sans-serif"}}>Sessions</div>
        </div>
        <button onClick={onNew} style={{margin:"12px 16px",padding:"10px 14px",background:t.accentBg,border:`1px solid ${t.accentBorder}`,borderRadius:10,color:t.textSub,fontSize:13,fontFamily:"Lato,sans-serif",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New session
        </button>
        <div style={{flex:1,overflowY:"auto"}}>
          {sessions.length===0&&<div style={{padding:"18px",fontSize:13,color:t.textFaint,fontStyle:"italic",fontFamily:"'IM Fell English',Georgia,serif",lineHeight:1.65}}>No sessions yet. Begin when you are ready.</div>}
          {sessions.map(s=>(
            <div key={s.id} onClick={()=>{onLoad(s.id);onClose();}}
              style={{padding:"13px 18px",cursor:"pointer",borderBottom:`1px solid ${t.border}`,background:s.id===activeId?t.accentBg:"transparent",transition:"background 0.15s"}}>
              <div style={{fontSize:13,color:s.id===activeId?t.accent:t.textSub,lineHeight:1.45,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{s.title}</div>
              <div style={{fontSize:10,color:t.textFaint,marginTop:4,fontFamily:"Lato,sans-serif"}}>{fmtDate(s.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function Consolatio(){
  const [isDark,setIsDark]         = useState(()=>LS.get("consolatio_dark",true));
  const [onboarded,setOnboarded]   = useState(()=>LS.get("consolatio_onboarded",false));
  const [profile,setProfile]       = useState(()=>LS.get("consolatio_profile",null));
  const [sessions,setSessions]     = useState(()=>LS.get("consolatio_sessions",[]));
  const [activeId,setActiveId]     = useState(null);
  const [messages,setMessages]     = useState([]);
  const [input,setInput]           = useState("");
  const [loading,setLoading]       = useState(false);
  const [summarizing,setSummarizing] = useState(false);
  const [model,setModel]           = useState(()=>LS.raw("consolatio_model",DEFAULT_MODEL));
  const [bookmarks,setBookmarks]   = useState(()=>LS.get("consolatio_bookmarks",[]));
  const [apiKey,setApiKey]         = useState(()=>LS.raw("consolatio_key",""));
  const [esvKey,setEsvKey]         = useState(()=>LS.raw("consolatio_esv",""));
  const [tavilyKey,setTavilyKey]   = useState(()=>LS.raw("consolatio_tavily",""));
  const [models,setModels]         = useState(FALLBACK_MODELS);
  const [modelsLoading,setModelsLoading] = useState(false);

  const [showSidebar,setShowSidebar]   = useState(false);
  const [showScripture,setShowScripture] = useState(false);
  const [showModels,setShowModels]     = useState(false);
  const [showSettings,setShowSettings] = useState(false);
  const [showCheckin,setShowCheckin]   = useState(false);
  const [checkinData,setCheckinData]   = useState(null);
  const [resources,setResources]       = useState([]);
  const [resourcesLoading,setResourcesLoading] = useState(false);
  const [showResources,setShowResources] = useState(false);

  const endRef = useRef(null);
  const taRef  = useRef(null);
  const t = T[isDark?"dark":"light"];

  // Fetch live OpenRouter models
  useEffect(()=>{
    setModelsLoading(true);
    fetch("https://openrouter.ai/api/v1/models")
      .then(r=>r.json())
      .then(data=>{
        if(!data.data) return;
        const parsed=data.data
          .filter(m=>m.id&&m.name)
          .map(m=>({id:m.id,name:m.name,provider:m.id.split("/")[0].replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase()),context:m.context_length??null}))
          .sort((a,b)=>a.provider.localeCompare(b.provider)||a.name.localeCompare(b.name));
        if(parsed.length>0) setModels(parsed);
      })
      .catch(()=>{})
      .finally(()=>setModelsLoading(false));
  },[]);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);
  useEffect(()=>{ if(sessions.length) LS.set("consolatio_sessions",sessions); },[sessions]);

  const toggleTheme=()=>setIsDark(d=>{ LS.set("consolatio_dark",!d); return !d; });

  const saveModel=m=>{ setModel(m); LS.setRaw("consolatio_model",m); };
  const toggleBookmark=id=>{
    setBookmarks(prev=>{ const n=prev.includes(id)?prev.filter(b=>b!==id):[...prev,id]; LS.set("consolatio_bookmarks",n); return n; });
  };

  const completeOnboarding=answers=>{
    setProfile(answers);
    LS.set("consolatio_profile",answers);
    LS.set("consolatio_onboarded",true);
    setOnboarded(true);
  };

  const resetOnboarding=()=>{ LS.set("consolatio_onboarded",false); setOnboarded(false); setShowSettings(false); };
  const clearSessions=()=>{ setSessions([]); setMessages([]); setActiveId(null); LS.set("consolatio_sessions",[]); };

  const startNew=()=>{
    setShowSidebar(false);
    setShowCheckin(true);
  };

  const beginSession=(checkin)=>{
    setCheckinData(checkin);
    setShowCheckin(false);
    const s={ id:Date.now().toString(), createdAt:new Date().toISOString(), title:"New session", messages:[], checkin };
    setSessions(p=>[s,...p]);
    setActiveId(s.id);
    setMessages([]);
    setShowScripture(false);
  };

  const loadSession=id=>{
    const s=sessions.find(x=>x.id===id);
    if(s){ setActiveId(id); setMessages(s.messages); setCheckinData(s.checkin||null); }
  };

  const updateSession=(id,msgs)=>{
    setSessions(prev=>prev.map(s=>{
      if(s.id!==id) return s;
      const first=msgs.find(m=>m.role==="user");
      const title=first?first.content.slice(0,46)+(first.content.length>46?"\u2026":""):"Session";
      return{...s,messages:msgs,title};
    }));
  };

  // Build contextual system prompt with check-in data
  const buildPrompt=()=>{
    let base=buildSystemPrompt(profile);
    if(checkinData?.topic){
      const topicLabel=TOPICS.find(tp=>tp.id===checkinData.topic)?.label||checkinData.topic;
      base+=`\n\nThis session's topic: ${topicLabel}.`;
    }
    if(checkinData?.weight){
      const w=WEIGHTS.find(x=>x.id===checkinData.weight);
      if(w) base+=` The person is carrying it as: "${w.label}" — ${w.desc}.`;
    }
    return base;
  };

  const fetchResources=async(topic)=>{
    if(!tavilyKey) return;
    setResourcesLoading(true);
    setShowResources(true);
    const topicLabel=TOPICS.find(tp=>tp.id===topic)?.label||topic||"Reformed Christian life";
    const results=await tavilySearch(topicLabel,tavilyKey);
    setResources(results);
    setResourcesLoading(false);
  };

  const summarizeSession=async()=>{
    if(messages.length<4||!apiKey) return;
    setSummarizing(true);
    try{
      const res=await fetch("https://openrouter.ai/api/v1/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`,"HTTP-Referer":window.location.href,"X-Title":"Consolatio"},
        body:JSON.stringify({
          model,
          messages:[
            {role:"system",content:"You are a pastoral assistant. Summarize the following conversation into a concise pastoral session summary with these sections: **Themes** (2-3 bullet points), **Scripture surfaced** (any references mentioned), **Key insights** (what emerged), **Open threads** (what remains unresolved). Be brief, warm, and precise. Use plain text, not markdown headers."},
            {role:"user",content:`Please summarize this pastoral conversation:\n\n${messages.map(m=>`${m.role==="user"?"Person":"Consolatio"}: ${m.content}`).join("\n\n")}`},
          ],
          max_tokens:600,temperature:0.4,
        }),
      });
      const data=await res.json();
      const summary=data.choices?.[0]?.message?.content||"Could not generate summary.";
      const summaryMsg={role:"assistant",content:`\u2014 Session Summary \u2014\n\n${summary}`,timestamp:new Date().toISOString(),isSummary:true};
      // Replace full history with a condensed version
      const condensed=[
        {role:"assistant",content:`[Session compressed. Original: ${messages.length} messages.]\n\n${summary}`,timestamp:new Date().toISOString(),isSummary:true},
      ];
      setMessages(condensed);
      updateSession(activeId,condensed);
    }catch(e){
      console.error(e);
    }finally{
      setSummarizing(false);
    }
  };

  const send=async()=>{
    if(!input.trim()||loading) return;
    let sid=activeId;
    if(!sid){
      setShowCheckin(true);
      return;
    }
    const userMsg={role:"user",content:input.trim(),timestamp:new Date().toISOString()};
    const next=[...messages,userMsg];
    setMessages(next); setInput(""); setLoading(true);
    if(taRef.current) taRef.current.style.height="auto";

    if(!apiKey){
      setTimeout(()=>{
        const dm={role:"assistant",content:"This is a preview of Consolatio. Add your OpenRouter API key in Settings to begin.\n\n\"What is your only comfort in life and in death? That I am not my own, but belong \u2014 body and soul, in life and in death \u2014 to my faithful Savior, Jesus Christ.\"\n\u2014 Heidelberg Catechism, Q&A 1",timestamp:new Date().toISOString()};
        const fin=[...next,dm];
        setMessages(fin); updateSession(sid,fin); setLoading(false);
      },900);
      return;
    }

    try{
      const res=await fetch("https://openrouter.ai/api/v1/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`,"HTTP-Referer":window.location.href,"X-Title":"Consolatio"},
        body:JSON.stringify({
          model,
          messages:[
            {role:"system",content:buildPrompt()},
            ...next.map(m=>({role:m.role,content:m.content})),
          ],
          max_tokens:1024,temperature:0.72,
        }),
      });
      const data=await res.json();
      const text=data.choices?.[0]?.message?.content||"I am here. Please try again.";
      const am={role:"assistant",content:text,timestamp:new Date().toISOString()};
      const fin=[...next,am];
      setMessages(fin); updateSession(sid,fin);
      // Fetch resources after second exchange (first real response)
      if(fin.filter(m=>m.role==="assistant").length===1&&tavilyKey&&checkinData?.topic){
        fetchResources(checkinData.topic);
      }
    }catch{
      const em={role:"assistant",content:"Something went quiet. Please check your connection and try again.",timestamp:new Date().toISOString()};
      const fin=[...next,em];
      setMessages(fin); updateSession(sid,fin);
    }finally{
      setLoading(false);
    }
  };

  const onKey=e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); }};
  const onInput=e=>{
    setInput(e.target.value);
    e.target.style.height="auto";
    e.target.style.height=Math.min(e.target.scrollHeight,140)+"px";
  };

  const currentLabel=models.find(m=>m.id===model)?.name??model.split("/")[1]??model;
  const tokenEstimate=messages.reduce((a,m)=>a+Math.ceil(m.content.length/4),0);
  const tokenWarning=tokenEstimate>6000;

  // ── Render ──
  if(!onboarded) return <Onboarding onComplete={completeOnboarding} t={t}/>;

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Lato:wght@300;400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:${t.bg};overflow:hidden;transition:background 0.3s;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:4px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideLeft{from{transform:translateX(-100%);}to{transform:translateX(0);}}
        @keyframes slideInRight{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}
        @keyframes blink{0%,80%,100%{opacity:0.2;transform:scale(0.72);}40%{opacity:1;transform:scale(1);}}
        .app{display:flex;flex-direction:column;height:100vh;max-width:480px;margin:0 auto;background:${t.bg};position:relative;transition:background 0.3s;}
        .topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 12px;border-bottom:1px solid ${t.border};flex-shrink:0;background:${t.bg};transition:background 0.3s;}
        .topbar-name{font-family:'IM Fell English',Georgia,serif;font-size:18px;color:${t.text};letter-spacing:0.04em;}
        .topbar-sub{font-size:10px;color:${t.textMuted};letter-spacing:0.15em;text-transform:uppercase;margin-top:1px;font-family:Lato,sans-serif;}
        .ibtn{background:none;border:none;cursor:pointer;color:${t.textMuted};padding:7px;border-radius:9px;display:flex;align-items:center;justify-content:center;transition:color 0.18s,background 0.18s;}
        .ibtn:hover{color:${t.text};background:${t.inputBg};}
        .theme-toggle{display:flex;align-items:center;justify-content:center;width:34px;height:20px;background:${isDark?"rgba(180,130,60,0.25)":"rgba(0,0,0,0.1)"};border:1px solid ${t.accentBorder};border-radius:10px;cursor:pointer;position:relative;transition:background 0.25s;flex-shrink:0;}
        .theme-toggle-knob{position:absolute;left:${isDark?"16px":"3px"};width:14px;height:14px;border-radius:50%;background:${isDark?t.accent:"#8a7058"};transition:left 0.22s,background 0.22s;display:flex;align-items:center;justify-content:center;color:${isDark?"#fff":"#f5ede0"};}
        .model-pill{display:flex;align-items:center;gap:5px;padding:5px 11px;background:${t.pillBg};border:1px solid ${t.pillBorder};border-radius:20px;cursor:pointer;transition:background 0.18s,border-color 0.18s;max-width:220px;overflow:hidden;}
        .model-pill:hover{background:${t.inputBg};border-color:${t.accentBorder};}
        .model-pill-label{font-size:11px;color:${t.textSub};font-family:Lato,sans-serif;letter-spacing:0.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .messages{flex:1;overflow-y:auto;padding:24px 18px 8px;scroll-behavior:smooth;}
        .empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:0 36px;animation:fadeUp 0.5s ease;}
        .empty-cross{color:${t.emptyCross};margin-bottom:26px;}
        .empty-title{font-family:'IM Fell English',Georgia,serif;font-size:24px;color:${t.emptyTitle};margin-bottom:10px;letter-spacing:0.04em;}
        .empty-desc{font-size:14px;color:${t.emptyDesc};line-height:1.72;max-width:270px;font-style:italic;font-family:'IM Fell English',Georgia,serif;}
        .empty-prompt{margin-top:28px;font-size:15px;color:${t.emptyPrompt};font-family:'IM Fell English',Georgia,serif;font-style:italic;}
        .input-area{padding:10px 14px 28px;border-top:1px solid ${t.border};flex-shrink:0;background:${t.bg};transition:background 0.3s;}
        .input-row{display:flex;align-items:flex-end;gap:10px;background:${t.inputBg};border:1px solid ${t.inputBorder};border-radius:22px;padding:10px 14px;transition:border-color 0.2s;}
        .input-row:focus-within{border-color:${t.inputFocus};}
        textarea{flex:1;background:none;border:none;outline:none;color:${t.text};font-size:15px;font-family:Lato,sans-serif;font-weight:300;resize:none;line-height:1.55;max-height:140px;overflow-y:auto;padding:2px 0;}
        textarea::placeholder{color:${t.textFaint};}
        .send-btn{background:${t.sendBg};border:1px solid ${t.accentBorder};border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${t.sendColor};flex-shrink:0;transition:opacity 0.18s,transform 0.1s;}
        .send-btn:hover{opacity:0.85;}
        .send-btn:active{transform:scale(0.92);}
        .send-btn:disabled{opacity:0.25;cursor:default;}
        select option{background:${t.bgS};color:${t.text};}
      `}</style>

      <div className="app">
        {/* Topbar */}
        <div className="topbar">
          <button className="ibtn" onClick={()=>setShowSidebar(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div style={{textAlign:"center"}}>
            <div className="topbar-name">Consolatio</div>
            <div className="topbar-sub">Reformed Pastoral Companion</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <button className="theme-toggle" onClick={toggleTheme}>
              <div className="theme-toggle-knob">{isDark?<MoonIcon/>:<SunIcon/>}</div>
            </button>
            <button className="ibtn" onClick={()=>setShowScripture(v=>!v)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </button>
            <button className="ibtn" onClick={()=>setShowSettings(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Model pill + token warning */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 16px 2px"}}>
          <button className="model-pill" onClick={()=>setShowModels(true)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
            <span className="model-pill-label">{currentLabel}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {messages.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {tokenWarning&&(
                <button onClick={summarizeSession} disabled={summarizing||!apiKey}
                  style={{fontSize:10,color:t.accent,background:t.accentBg,border:`1px solid ${t.accentBorder}`,borderRadius:8,padding:"4px 9px",cursor:"pointer",fontFamily:"Lato,sans-serif",letterSpacing:"0.04em",opacity:summarizing?0.5:1}}>
                  {summarizing?"Compressing…":"⚡ Compress"}
                </button>
              )}
              {tavilyKey&&messages.length>0&&(
                <button onClick={()=>fetchResources(checkinData?.topic||"Reformed Christian life")} disabled={resourcesLoading}
                  style={{fontSize:10,color:t.textMuted,background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"4px 9px",cursor:"pointer",fontFamily:"Lato,sans-serif",letterSpacing:"0.04em",opacity:resourcesLoading?0.5:1}}>
                  {resourcesLoading?"…":"📚 Resources"}
                </button>
              )}
              <div style={{fontSize:10,color:tokenWarning?t.accent:t.textFaint,fontFamily:"Lato,sans-serif",letterSpacing:"0.04em"}}>
                ~{tokenEstimate.toLocaleString()} tokens
              </div>
            </div>
          )}
        </div>

        {/* Check-in badge */}
        {checkinData&&(checkinData.topic||checkinData.weight)&&messages.length>0&&(
          <div style={{margin:"6px 16px 0",display:"flex",gap:6,flexWrap:"wrap"}}>
            {checkinData.topic&&(
              <div style={{fontSize:10,color:t.accent,background:t.accentBg,border:`1px solid ${t.accentBorder}`,borderRadius:6,padding:"3px 8px",fontFamily:"Lato,sans-serif",letterSpacing:"0.06em"}}>
                {TOPICS.find(tp=>tp.id===checkinData.topic)?.emoji} {TOPICS.find(tp=>tp.id===checkinData.topic)?.label}
              </div>
            )}
            {checkinData.weight&&(
              <div style={{fontSize:10,color:t.textMuted,background:t.inputBg,border:`1px solid ${t.border}`,borderRadius:6,padding:"3px 8px",fontFamily:"Lato,sans-serif",letterSpacing:"0.06em"}}>
                {WEIGHTS.find(w=>w.id===checkinData.weight)?.label}
              </div>
            )}
          </div>
        )}

        {/* Resource card */}
        {showResources&&(
          <div style={{margin:"8px 18px 0"}}>
            <ResourceCard results={resources} loading={resourcesLoading} t={t} onClose={()=>setShowResources(false)}/>
          </div>
        )}

        {/* Scripture banner */}
        {showScripture&&(
          <div style={{margin:"8px 18px 0",animation:"fadeUp 0.3s ease"}}>
            <ScriptureCard {...DEMO_SCRIPTURE} t={t}/>
          </div>
        )}

        {/* Messages */}
        <div className="messages">
          {messages.length===0?(
            <div className="empty">
              <div className="empty-cross">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                  <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8" x2="22" y2="8"/>
                </svg>
              </div>
              <div className="empty-title">Consolatio</div>
              <div className="empty-desc">
                {profile?.name?`Welcome, ${profile.name}.`:"A companion in the Reformed and Lutheran tradition."}<br/>
                For the care of souls.
              </div>
              <div className="empty-prompt">What is on your heart today?</div>
              <button onClick={()=>setShowCheckin(true)}
                style={{marginTop:24,padding:"11px 24px",background:t.accentBg,border:`1px solid ${t.accentBorder}`,borderRadius:12,color:t.accent,fontSize:13,fontFamily:"Lato,sans-serif",cursor:"pointer",letterSpacing:"0.04em"}}>
                Begin a session
              </button>
            </div>
          ):(
            <>
              {messages.map((m,i)=><Message key={i} msg={m} t={t} esvKey={esvKey}/>)}
              {loading&&(
                <div style={{paddingLeft:4,marginBottom:16,animation:"fadeUp 0.25s ease"}}>
                  <div style={{fontSize:10,letterSpacing:"0.14em",color:t.accent,marginBottom:7,textTransform:"uppercase",fontFamily:"'IM Fell English',Georgia,serif",fontStyle:"italic"}}>Consolatio</div>
                  <TypingIndicator t={t}/>
                </div>
              )}
              <div ref={endRef}/>
            </>
          )}
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-row">
            <textarea ref={taRef} rows={1} placeholder="What is on your heart\u2026" value={input} onChange={onInput} onKeyDown={onKey}/>
            <button className="send-btn" onClick={send} disabled={!input.trim()||loading}><SendIcon/></button>
          </div>
        </div>
      </div>

      {showSidebar&&<Sidebar sessions={sessions} activeId={activeId} onLoad={loadSession} onNew={startNew} onClose={()=>setShowSidebar(false)} t={t}/>}
      {showModels&&<ModelSheet current={model} bookmarks={bookmarks} models={models} loading={modelsLoading} onSelect={saveModel} onToggle={toggleBookmark} onClose={()=>setShowModels(false)} t={t}/>}
      {showCheckin&&<CheckIn onStart={beginSession} onSkip={()=>{setShowCheckin(false);const s={id:Date.now().toString(),createdAt:new Date().toISOString(),title:"New session",messages:[],checkin:null};setSessions(p=>[s,...p]);setActiveId(s.id);setMessages([]);}} t={t} profile={profile}/>}
      {showSettings&&(
        <SettingsPage
          onClose={()=>setShowSettings(false)} t={t}
          isDark={isDark} toggleTheme={toggleTheme}
          apiKey={apiKey} setApiKey={setApiKey}
          esvKey={esvKey} setEsvKey={setEsvKey}
          tavilyKey={tavilyKey} setTavilyKey={setTavilyKey}
          model={model} setModel={saveModel}
          models={models} profile={profile} setProfile={setProfile}
          bookmarks={bookmarks} setBookmarks={setBookmarks}
          onResetOnboarding={resetOnboarding}
          onClearSessions={clearSessions}
        />
      )}
    </>
  );
}
