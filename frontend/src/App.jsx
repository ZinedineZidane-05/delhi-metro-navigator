import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getStations, getMapEdges, getShortestDistance, getShortestTime,
  getShortestPathByDistance, getShortestPathByTime,
  getAlternatePathByDistance, getAlternatePathByTime,
} from './api';

const LC = { B:'#3b82f6', Y:'#eab308', O:'#f97316', P:'#d946ef', R:'#ef4444' };
const LN = { B:'Blue', Y:'Yellow', O:'Orange', P:'Pink', R:'Red' };
const glc = (s) => { if(!s) return '#6b7280'; const i=s.indexOf('~'); const c=i!==-1?s.substring(i+1):s; for(const ch of c){if(LC[ch])return LC[ch];} return '#6b7280'; };
const gsn = (f) => { if(!f) return ''; const i=f.indexOf('~'); return i===-1?f:f.substring(0,i); };
const gll = (f) => { if(!f) return []; const i=f.indexOf('~'); if(i===-1) return []; return [...f.substring(i+1)].filter(c=>LN[c]).map(c=>LN[c]); };

const Header = () => (
  <header className="header">
    <div className="header-inner">
      <div className="logo-ring"><div className="logo-circle"><span className="logo-letter">M</span></div></div>
      <div className="header-text">
        <h1 className="header-title">Delhi Metro Navigator</h1>
        <p className="header-subtitle">Routes, distances, fares & travel times across the Delhi Metro network</p>
      </div>
    </div>
    <div className="header-stats">
      <div className="stat"><span className="stat-num">20</span><span className="stat-label">Stations</span></div>
      <div className="stat-divider" />
      <div className="stat"><span className="stat-num">19</span><span className="stat-label">Connections</span></div>
      <div className="stat-divider" />
      <div className="stat"><span className="stat-num">5</span><span className="stat-label">Lines</span></div>
    </div>
  </header>
);

const NavTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [{id:'finder',label:'Route Finder',icon:'\uD83D\uDD0D'},{id:'map',label:'Metro Map',icon:'\uD83D\uDDFA\uFE0F'},{id:'stations',label:'All Stations',icon:'\uD83D\uDE89'}];
  return (
    <nav className="nav-tabs">
      {tabs.map(t=>(<button key={t.id} className={`nav-tab ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}><span className="tab-icon">{t.icon}</span><span className="tab-label">{t.label}</span></button>))}
    </nav>
  );
};

const StationSelector = ({ stations, source, destination, setSource, setDestination }) => (
  <div className="glass-card selector-card">
    <h2 className="section-title"><span className="title-icon">{'\uD83D\uDCCD'}</span> Select Your Route</h2>
    <div className="selector-row">
      <div className="selector-group">
        <label className="select-label"><span className="dot green-dot" /> Source Station</label>
        <select className="station-select" value={source} onChange={e=>setSource(e.target.value)}>
          <option value="">— Choose departure —</option>
          {stations.map(s=><option key={s.fullName} value={s.fullName}>{s.name} ({s.lines.join(' / ')})</option>)}
        </select>
      </div>
      <button className="swap-btn" onClick={()=>{const t=source;setSource(destination);setDestination(t);}} title="Swap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
      </button>
      <div className="selector-group">
        <label className="select-label"><span className="dot red-dot" /> Destination Station</label>
        <select className="station-select" value={destination} onChange={e=>setDestination(e.target.value)}>
          <option value="">— Choose arrival —</option>
          {stations.map(s=><option key={s.fullName} value={s.fullName}>{s.name} ({s.lines.join(' / ')})</option>)}
        </select>
      </div>
    </div>
  </div>
);

const ActionButtons = ({ onAction, loading, source, destination }) => {
  const actions = [
    {id:'distance',icon:'\uD83D\uDCCF',title:'Shortest Distance',desc:'Minimum KM + fare',cls:'btn-purple'},
    {id:'time',icon:'\u23F1\uFE0F',title:'Shortest Time',desc:'Fastest travel + fare',cls:'btn-amber'},
    {id:'pathDistance',icon:'\uD83D\uDEE4\uFE0F',title:'Route by Distance',desc:'Full path + fare',cls:'btn-teal'},
    {id:'pathTime',icon:'\uD83D\uDE87',title:'Route by Time',desc:'Fastest route + fare',cls:'btn-rose'},
  ];
  const off = loading || !source || !destination;
  return (
    <div className="glass-card">
      <h2 className="section-title"><span className="title-icon">{'\u26A1'}</span> Choose Action</h2>
      <div className="action-grid">
        {actions.map(a=>(<button key={a.id} className={`action-btn ${a.cls}`} onClick={()=>onAction(a.id)} disabled={off}>
          <span className="action-icon">{a.icon}</span><span className="action-title">{a.title}</span><span className="action-desc">{a.desc}</span>
        </button>))}
      </div>
      {(!source||!destination)&&<p className="hint-text">{'\uD83D\uDCA1'} Select both stations above to enable actions</p>}
    </div>
  );
};

const BlockedStationsSelector = ({ stations, blockedStations, setBlockedStations, source, destination, onAction, loading }) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = (fn) => { if(blockedStations.includes(fn)) setBlockedStations(blockedStations.filter(s=>s!==fn)); else setBlockedStations([...blockedStations,fn]); };
  const available = stations.filter(s=>s.fullName!==source&&s.fullName!==destination);
  const off = loading||!source||!destination||blockedStations.length===0;
  return (
    <div className="glass-card blocked-card">
      <button className="blocked-header" onClick={()=>setExpanded(!expanded)}>
        <h2 className="section-title" style={{marginBottom:0}}><span className="title-icon">{'\uD83D\uDEA7'}</span> Block Stations (Route Disruption)</h2>
        <span className={`chevron ${expanded?'chevron-up':''}`}>{'\u25BC'}</span>
      </button>
      {expanded && (
        <div className="blocked-body slide-up">
          {blockedStations.length>0&&(
            <div className="blocked-active">
              <div className="blocked-chips">
                {blockedStations.map(bs=>(<span key={bs} className="blocked-chip">{'\uD83D\uDEAB'} {gsn(bs)}<button className="chip-x" onClick={()=>toggle(bs)}>×</button></span>))}
              </div>
              <button className="clear-blocked" onClick={()=>setBlockedStations([])}>Clear All</button>
            </div>
          )}
          <p className="blocked-hint">Select stations to mark as blocked/closed:</p>
          <div className="blocked-grid">
            {available.map(s=>{const isB=blockedStations.includes(s.fullName);return(
              <button key={s.fullName} className={`blocked-item ${isB?'blocked-active-item':''}`} onClick={()=>toggle(s.fullName)} style={{borderLeftColor:isB?'#ef4444':glc(s.fullName)}}>
                <span className="bi-check">{isB?'\uD83D\uDEAB':''}</span><span className="bi-name">{s.name}</span>
              </button>);})}
          </div>
          {blockedStations.length>0&&(
            <div className="alt-actions">
              <p className="alt-warning">{'\u26A0\uFE0F'} {blockedStations.length} station{blockedStations.length>1?'s':''} blocked — find alternate route:</p>
              <div className="alt-btn-row">
                <button className="alt-btn alt-btn-dist" onClick={()=>onAction('altDistance')} disabled={off}>{'\uD83D\uDEE4\uFE0F'} Alternate Route (Distance)</button>
                <button className="alt-btn alt-btn-time" onClick={()=>onAction('altTime')} disabled={off}>{'\u23F1\uFE0F'} Alternate Route (Time)</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ResultDisplay = ({ result, loading, onAnimate }) => {
  if(loading) return (<div className="glass-card result-card"><div className="loader-box"><div className="spinner"/><p className="loader-text">Calculating optimal route...</p></div></div>);
  if(!result) return null;
  if(result.error) return (<div className="glass-card result-card error-result"><div className="error-icon">{'\u26A0\uFE0F'}</div><h3 className="error-title">Something went wrong</h3><p className="error-msg">{result.error}</p></div>);
  return (
    <div className="glass-card result-card slide-up">
      {result.alternateRoute&&(<div className="alt-banner"><span>{'\uD83D\uDEA7'} Alternate Route</span><p>This route avoids blocked station{result.blockedStations?.length>1?'s':''}: {result.blockedStations?.map(s=>gsn(s)).join(', ')}</p></div>)}
      <div className="result-header">
        <h2 className="section-title"><span className="title-icon">{'\uD83C\uDFAF'}</span> Route Result</h2>
        <div className="route-badges">
          <span className="badge badge-green">{gsn(result.source)}</span>
          <span className="badge-arrow"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-7-7l7 7-7 7"/></svg></span>
          <span className="badge badge-red">{gsn(result.destination)}</span>
        </div>
      </div>
      <div className="metrics-row">
        {result.distance>0&&(<div className="metric-card"><div className="metric-icon-bg purple-bg">{'\uD83D\uDCCF'}</div><div className="metric-val">{result.distance}</div><div className="metric-unit">KM</div></div>)}
        {result.time>0&&(<div className="metric-card"><div className="metric-icon-bg amber-bg">{'\u23F1\uFE0F'}</div><div className="metric-val">{result.time}</div><div className="metric-unit">Minutes</div></div>)}
        {result.fare>0&&(<div className="metric-card fare-metric"><div className="metric-icon-bg green-bg">{'\uD83D\uDCB0'}</div><div className="metric-val fare-val">{'\u20B9'}{result.fare}</div><div className="metric-unit">Fare</div></div>)}
        {result.path&&result.interchanges!==undefined&&(<div className="metric-card"><div className="metric-icon-bg rose-bg">{'\uD83D\uDD04'}</div><div className="metric-val">{result.interchanges}</div><div className="metric-unit">Interchange{result.interchanges!==1?'s':''}</div></div>)}
        {result.totalStops>0&&(<div className="metric-card"><div className="metric-icon-bg teal-bg">{'\uD83D\uDE89'}</div><div className="metric-val">{result.totalStops}</div><div className="metric-unit">Stops</div></div>)}
      </div>
      {result.fareBreakdown&&<p className="fare-breakdown">{result.fareBreakdown}</p>}
      {result.path&&result.path.length>0&&(<button className="animate-btn" onClick={onAnimate}>{'\u25B6\uFE0F'} Animate Route on Map</button>)}
      {result.path&&result.path.length>0&&(
        <div className="path-section"><h3 className="path-heading">{'\uD83D\uDDFA\uFE0F'} Detailed Route</h3>
          <div className="timeline">
            {result.path.map((step,idx)=>{
              const isFirst=idx===0,isLast=idx===result.path.length-1,isIC=step.includes('==>');
              const main=step.split(' ==> ')[0]; const color=glc(main);
              return (
                <div key={idx} className={`tl-step ${isIC?'tl-interchange':''} ${isFirst?'tl-first':''} ${isLast?'tl-last':''}`}>
                  {!isLast&&<div className="tl-line" style={{backgroundColor:color}}/>}
                  <div className={`tl-dot ${isFirst||isLast?'tl-dot-terminal':''}`} style={{borderColor:color,backgroundColor:isFirst||isLast?color:'#1a1a2e'}}/>
                  <div className="tl-content">
                    {isIC?(<div className="interchange-card"><span className="ic-icon">{'\uD83D\uDD04'}</span><div className="ic-details"><span className="ic-label">Line Change</span><span className="ic-stations">{gsn(step.split(' ==> ')[0])}<span className="ic-arrow"> → </span>{gsn(step.split(' ==> ')[1])}</span></div></div>):(
                      <><span className="tl-name">{isFirst&&<span className="tl-tag start-tag">START</span>}{isLast&&<span className="tl-tag end-tag">END</span>}{gsn(step)}</span><span className="tl-line-label" style={{color}}>{gll(step).join(' / ')} Line</span></>
                    )}
                  </div>
                </div>);
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const MetroMapView = ({ stations, edges, animatingPath, animationStep, blockedStations, onResetAnim }) => {
  const pos = {
    'Noida Sector 62~B':{x:850,y:300},'Botanical Garden~B':{x:740,y:300},
    'Yamuna Bank~B':{x:610,y:300},'Vaishali~B':{x:610,y:190},
    'Rajiv Chowk~BY':{x:460,y:300},'Moti Nagar~B':{x:310,y:300},
    'Rajouri Garden~BP':{x:230,y:370},'Janak Puri West~BO':{x:190,y:300},
    'Dwarka Sector 21~B':{x:70,y:300},'AIIMS~Y':{x:460,y:400},
    'Saket~Y':{x:460,y:490},'Huda City Center~Y':{x:460,y:580},
    'New Delhi~YO':{x:530,y:220},'Chandni Chowk~Y':{x:610,y:140},
    'Vishwavidyalaya~Y':{x:700,y:70},'Shivaji Stadium~O':{x:620,y:420},
    'DDS Campus~O':{x:710,y:490},'IGI Airport~O':{x:800,y:560},
    'Punjabi Bagh West~P':{x:230,y:460},'Netaji Subhash Place~PR':{x:230,y:550},
  };
  const animS=new Set(),animE=new Set();
  if(animatingPath.length>0){
    for(let i=0;i<Math.min(animationStep,animatingPath.length);i++){
      const step=animatingPath[i];
      if(step.includes('==>')){step.split(' ==> ').forEach(s=>animS.add(s.trim()));}else{animS.add(step.trim());}
    }
    const ord=[];
    animatingPath.forEach(s=>{if(s.includes('==>')){s.split(' ==> ').forEach(x=>ord.push(x.trim()));}else{ord.push(s.trim());}});
    for(let i=0;i<ord.length-1;i++){if(animS.has(ord[i])&&animS.has(ord[i+1])){animE.add([ord[i],ord[i+1]].sort().join('|'));}}
  }
  const isAnim=animatingPath.length>0; const blSet=new Set(blockedStations||[]);
  const legend=[{color:'#3b82f6',name:'Blue'},{color:'#eab308',name:'Yellow'},{color:'#f97316',name:'Orange'},{color:'#d946ef',name:'Pink'},{color:'#ef4444',name:'Red'}];
  return (
    <div className="glass-card map-card">
      <h2 className="section-title"><span className="title-icon">{'\uD83D\uDDFA\uFE0F'}</span> Delhi Metro Network Map</h2>
      {isAnim&&(<div className="anim-controls"><span className="anim-status">{'\uD83D\uDE82'} Animating... ({Math.min(animationStep,animatingPath.length)}/{animatingPath.length})</span><button className="anim-reset-btn" onClick={onResetAnim}>{'\u23F9\uFE0F'} Reset</button></div>)}
      <div className="legend-row">{legend.map(l=><div key={l.name} className="legend-item"><span className="legend-dot" style={{background:l.color}}/><span className="legend-label">{l.name}</span></div>)}
        {blSet.size>0&&<div className="legend-item"><span className="legend-dot" style={{background:'#ef4444',border:'2px solid #fff'}}/><span className="legend-label">Blocked</span></div>}
      </div>
      <div className="map-scroll">
        <svg viewBox="0 0 940 640" className="map-svg">
          <defs><filter id="glow"><feGaussianBlur stdDeviation="3.5" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glowS"><feGaussianBlur stdDeviation="6" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          {edges.map((e,i)=>{const f=pos[e.from],t=pos[e.to];if(!f||!t)return null;const ek=[e.from,e.to].sort().join('|');const hl=animE.has(ek);const bl=blSet.has(e.from)||blSet.has(e.to);const c=glc(e.from);const op=isAnim?(hl?1:0.15):(bl?0.2:0.7);const sw=hl?7:4.5;
            return(<g key={`e-${i}`}><line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={c} strokeWidth={sw} strokeLinecap="round" opacity={op} filter={hl?"url(#glowS)":"none"} style={{transition:'all 0.5s ease'}}/><text x={(f.x+t.x)/2} y={(f.y+t.y)/2-8} fill="#94a3b8" fontSize="9" textAnchor="middle" opacity={isAnim&&!hl?0.2:0.8}>{e.weight} km</text></g>);})}
          {stations.map(st=>{const p=pos[st.fullName];if(!p)return null;const c=glc(st.fullName);const isA=animS.has(st.fullName);const isB=blSet.has(st.fullName);const op=isAnim?(isA?1:0.2):(isB?0.3:1);const r=isA?13:10;
            return(<g key={st.fullName} style={{transition:'all 0.5s ease',opacity:op}}>
              {isB&&!isAnim&&(<><line x1={p.x-8} y1={p.y-8} x2={p.x+8} y2={p.y+8} stroke="#ef4444" strokeWidth="3"/><line x1={p.x+8} y1={p.y-8} x2={p.x-8} y2={p.y+8} stroke="#ef4444" strokeWidth="3"/></>)}
              <circle cx={p.x} cy={p.y} r={r} fill="#0f0f23" stroke={isB?'#ef4444':c} strokeWidth={isA?4:3} filter={isA?"url(#glowS)":"url(#glow)"}/>
              {isA&&<circle cx={p.x} cy={p.y} r={r+4} fill="none" stroke={c} strokeWidth="2" opacity="0.5" className="pulse-ring"/>}
              <circle cx={p.x} cy={p.y} r={isA?5:4} fill={isB?'#ef4444':c}/>
              <text x={p.x} y={p.y-18} fill={isB?'#ef4444':'#e2e8f0'} fontSize="10" fontWeight="600" textAnchor="middle" style={{textShadow:'0 1px 6px #000',textDecoration:isB?'line-through':'none'}}>{st.name}</text>
            </g>);})}
        </svg>
      </div>
    </div>
  );
};

const StationListView = ({ stations }) => (
  <div className="glass-card"><h2 className="section-title"><span className="title-icon">{'\uD83D\uDE89'}</span> All Stations ({stations.length})</h2>
    <div className="station-grid">{stations.map((s,i)=>(<div key={s.fullName} className="station-card" style={{borderLeftColor:glc(s.fullName)}}>
      <div className="sc-num" style={{background:glc(s.fullName)+'22',color:glc(s.fullName)}}>{i+1}</div>
      <div className="sc-info"><span className="sc-name">{s.name}</span><div className="sc-lines">{s.lines.map(l=><span key={l} className="sc-line-tag" style={{background:glc(l[0])+'22',color:glc(l[0])}}>{l}</span>)}</div></div>
    </div>))}</div>
  </div>
);

const Footer = () => (<footer className="footer"><p className="footer-main">Delhi Metro Navigator &bull; React &amp; Spring Boot</p><p className="footer-sub">Powered by Dijkstra's Algorithm &amp; Graph Theory</p></footer>);

export default function App() {
  const [stations, setStations] = useState([]);
  const [edges, setEdges] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('finder');
  const [initError, setInitError] = useState('');
  const [blockedStations, setBlockedStations] = useState([]);
  const [animatingPath, setAnimatingPath] = useState([]);
  const [animationStep, setAnimationStep] = useState(0);
  const animRef = useRef(null);

  useEffect(() => { (async () => { try { const [sd,ed] = await Promise.all([getStations(),getMapEdges()]); setStations(sd); setEdges(ed); } catch { setInitError('Unable to connect. Ensure backend is running on port 8080.'); } })(); }, []);

  useEffect(() => {
    if(animatingPath.length>0 && animationStep<animatingPath.length) { animRef.current = setTimeout(()=>setAnimationStep(s=>s+1), 600); }
    return () => { if(animRef.current) clearTimeout(animRef.current); };
  }, [animatingPath, animationStep]);

  const resetAnim = () => { if(animRef.current) clearTimeout(animRef.current); setAnimatingPath([]); setAnimationStep(0); };
  const startAnim = () => { if(result&&result.path&&result.path.length>0) { resetAnim(); setActiveTab('map'); setTimeout(()=>{setAnimatingPath(result.path);setAnimationStep(0);},100); } };

  const handleAction = useCallback(async (type) => {
    if(!source||!destination){setResult({error:'Please select both stations.'});return;}
    if(source===destination){setResult({error:'Source and destination cannot be the same.'});return;}
    setLoading(true); setResult(null); resetAnim();
    try {
      let data;
      switch(type) {
        case 'distance': data=await getShortestDistance(source,destination); break;
        case 'time': data=await getShortestTime(source,destination); break;
        case 'pathDistance': data=await getShortestPathByDistance(source,destination); break;
        case 'pathTime': data=await getShortestPathByTime(source,destination); break;
        case 'altDistance': data=await getAlternatePathByDistance(source,destination,blockedStations); break;
        case 'altTime': data=await getAlternatePathByTime(source,destination,blockedStations); break;
        default: break;
      }
      setResult(data);
    } catch { setResult({error:'Failed to retrieve results.'}); }
    finally { setLoading(false); }
  }, [source, destination, blockedStations]);

  return (
    <div className="app">
      <div className="bg-glow bg-glow-1"/><div className="bg-glow bg-glow-2"/><div className="bg-glow bg-glow-3"/>
      <div className="container">
        <Header />
        <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {initError&&<div className="glass-card error-result" style={{textAlign:'center',padding:'30px'}}><div className="error-icon">{'\uD83D\uDD0C'}</div><p className="error-msg">{initError}</p></div>}
        <main className="main">
          {activeTab==='finder'&&(<div className="fade-in">
            <StationSelector stations={stations} source={source} destination={destination} setSource={setSource} setDestination={setDestination}/>
            <ActionButtons onAction={handleAction} loading={loading} source={source} destination={destination}/>
            <BlockedStationsSelector stations={stations} blockedStations={blockedStations} setBlockedStations={setBlockedStations} source={source} destination={destination} onAction={handleAction} loading={loading}/>
            <ResultDisplay result={result} loading={loading} onAnimate={startAnim}/>
          </div>)}
          {activeTab==='map'&&(<div className="fade-in"><MetroMapView stations={stations} edges={edges} animatingPath={animatingPath} animationStep={animationStep} blockedStations={blockedStations} onResetAnim={resetAnim}/></div>)}
          {activeTab==='stations'&&<div className="fade-in"><StationListView stations={stations}/></div>}
        </main>
        <Footer />
      </div>
    </div>
  );
}
