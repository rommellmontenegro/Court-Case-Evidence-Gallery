(() => {
  const DATA = window.GALLERY_DATA;
  if (!DATA) return;
  const categoryLabels = {insomnia:'Insomnia', typePain:'Type of Pain', injuryDiscovery:'Electrical Injury Discovery', upperBody:'Upper Body Pain', lowerBody:'Lower Body Pain', thorax:'Thorax Pain'};
  const dateToUtc = (s) => { const [y,m,d]=s.split('-').map(Number); return Date.UTC(y,m-1,d); };
  const addDays = (s,n) => { const t=new Date(dateToUtc(s)+n*86400000); return `${t.getUTCFullYear()}-${String(t.getUTCMonth()+1).padStart(2,'0')}-${String(t.getUTCDate()).padStart(2,'0')}`; };
  const monthName = (s) => new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(dateToUtc(s+'-01')));
  const displayDate = (s) => new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(dateToUtc(s)));
  const dateTimeLabel = (m) => `${displayDate(m.date)} · ${m.time.slice(0,5)}`;
  const cleanValues = (s) => s.split(',').map(x=>x.trim()).filter(Boolean);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mediaKind = m => (m.mimeType||'').startsWith('video/') ? 'Video' : 'Photo';
  const duration = (seconds) => { const n=Number(seconds); if(!Number.isFinite(n)||n<=0)return ''; const tenths=Math.round(n*10), total=Math.floor(tenths/10), h=Math.floor(total/3600),min=Math.floor((total%3600)/60),sec=total%60, rest=tenths%10, secText=`${String(sec).padStart(2,'0')}.${rest}`; return h?`${h}:${String(min).padStart(2,'0')}:${secText}`:`${min}:${secText}`; };
  const driveId = m => m.id || (m.url.match(/\/d\/([^/?]+)/)||[])[1] || '';
  const linkFor = m => m.url || `https://drive.google.com/file/d/${encodeURIComponent(driveId(m))}`;
  const galleryStart = (m) => { const elapsed=Math.floor((dateToUtc(m.date)-dateToUtc(DATA.firstDate))/86400000); return addDays(DATA.firstDate,Math.floor(elapsed/2)*2); };

  // INDEX VIEW
  if (document.getElementById('media-rows')) {
    const rows=document.getElementById('media-rows'), count=document.getElementById('result-count'), empty=document.getElementById('empty-state');
    const categoryFilters=['insomnia','typePain','injuryDiscovery','upperBody','lowerBody','thorax'];
    const selected={}; let sortKey='timestamp', sortDir=1;
    const filterBox=document.getElementById('descriptor-filters');
    for (const key of categoryFilters) {
      const group=document.createElement('details'); group.className='descriptor-group';
      const summary=document.createElement('summary'); summary.innerHTML=`<span>${categoryLabels[key]}</span><span>${DATA.options[key].length}</span>`; group.append(summary);
      const search=document.createElement('input'); search.className='choice-search'; search.type='search'; search.placeholder=`Find ${categoryLabels[key].toLowerCase()} descriptors`; search.setAttribute('aria-label',search.placeholder); group.append(search);
      const list=document.createElement('div'); list.className='choice-list';
      for (const option of DATA.options[key]) {
        const label=document.createElement('label'); label.dataset.value=option.toLowerCase();
        const box=document.createElement('input'); box.type='checkbox'; box.value=option; box.addEventListener('change',()=>render());
        label.append(box,document.createTextNode(option)); list.append(label);
      }
      search.addEventListener('input',()=>{for(const label of list.children)label.hidden=!label.textContent.toLowerCase().includes(search.value.toLowerCase());});
      group.append(list); filterBox.append(group); selected[key]=()=>[...list.querySelectorAll('input:checked')].map(x=>x.value);
    }
    const searchable=m=>[m.name,m.date,m.time,mediaKind(m),...Object.values(m.categories).flat()].join(' ').toLowerCase();
    function render(){
      const q=document.getElementById('search').value.trim().toLowerCase();
      const dates=cleanValues(document.getElementById('dates').value);
      const months=cleanValues(document.getElementById('months').value);
      const hours=cleanValues(document.getElementById('hours').value).map(x=>x.padStart(2,'0').slice(0,2));
      const choices=Object.fromEntries(categoryFilters.map(k=>[k,selected[k]() ]));
      const filtered=DATA.media.filter(m=>{
        if(q&&!searchable(m).includes(q))return false;
        if(dates.length&&!dates.includes(m.date))return false;
        if(months.length&&!months.includes(m.date.slice(0,7)))return false;
        if(hours.length&&!hours.includes(m.time.slice(0,2)))return false;
        for(const k of categoryFilters){if(choices[k].length&&!choices[k].some(v=>(m.categories[k]||[]).includes(v)))return false;}
        return true;
      }).sort((a,b)=>{
        const av=sortKey==='timestamp'?a.timestamp:sortKey==='name'?a.name.toLowerCase():sortKey==='date'?a.date:sortKey==='time'?a.time:sortKey==='type'?mediaKind(a):(a.categories[sortKey]||[]).join(' · ').toLowerCase();
        const bv=sortKey==='timestamp'?b.timestamp:sortKey==='name'?b.name.toLowerCase():sortKey==='date'?b.date:sortKey==='time'?b.time:sortKey==='type'?mediaKind(b):(b.categories[sortKey]||[]).join(' · ').toLowerCase();
        return (av<bv?-1:av>bv?1:0)*sortDir;
      });
      rows.innerHTML=filtered.map(m=>{
        const summary=k=>(m.categories[k]||[]).join('; ')||'—';
        const url=linkFor(m), wstart=galleryStart(m), dur=mediaKind(m)==='Video'?duration(m.durationSeconds):'';
        const thumb=`https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId(m))}&sz=w500`;
        return `<tr><td><a class="thumb-link" href="${esc(url)}" target="_blank" rel="noopener"><img class="index-thumb" src="${thumb}" alt="Preview of ${esc(m.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="thumb-fallback" hidden>Preview unavailable</span></a></td><td>${esc(m.date)}</td><td>${esc(m.time)}</td><td><a class="file-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(m.name)}</a>${dur?` <span class="duration-inline">${dur}</span>`:''}</td><td><span class="type-pill">${mediaKind(m)}</span></td><td class="descriptor-cell">${esc(summary('insomnia'))}</td><td class="descriptor-cell">${esc(summary('typePain'))}</td><td class="descriptor-cell">${esc(summary('injuryDiscovery'))}</td><td class="descriptor-cell">${esc(summary('upperBody'))}</td><td class="descriptor-cell">${esc(summary('lowerBody'))}</td><td class="descriptor-cell">${esc(summary('thorax'))}</td><td><a class="text-link" href="gallery.html?start=${encodeURIComponent(wstart)}">${esc(displayDate(wstart))}</a></td></tr>`;
      }).join('');
      count.textContent=`${filtered.length.toLocaleString()} of ${DATA.media.length.toLocaleString()} media files`;
      empty.hidden=filtered.length!==0;
      document.getElementById('archive-summary').textContent=`${DATA.media.length.toLocaleString()} unique files · ${displayDate(DATA.firstDate)} to ${displayDate(DATA.lastDate)}`;
      document.querySelectorAll('[data-sort]').forEach(btn=>{const key=btn.dataset.sort;btn.querySelector('span').textContent=key===sortKey?(sortDir===1?'↑':'↓'):'';});
    }
    document.querySelectorAll('[data-sort]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.sort;if(key===sortKey)sortDir*=-1;else{sortKey=key;sortDir=1;}render();}));
    ['search','dates','months','hours'].forEach(id=>document.getElementById(id).addEventListener('input',render));
    document.getElementById('clear-filters').addEventListener('click',()=>{for(const id of ['search','dates','months','hours'])document.getElementById(id).value='';filterBox.querySelectorAll('input[type=checkbox]').forEach(x=>x.checked=false);render();});
    render();
  }

  // GALLERY VIEW: selectable windows are limited to date spans with media.
  if (document.getElementById('gallery-grid')) {
    const query=new URLSearchParams(location.search), select=document.getElementById('window-choice');
    const windows=DATA.windows||[];
    if (!windows.length) return;
    let start=query.get('start')||windows[0];
    if(!windows.includes(start)) start=windows[0];
    const counts={};
    for(const m of DATA.media){const w=galleryStart(m);counts[w]=(counts[w]||0)+1;}
    select.innerHTML=windows.map(w=>`<option value="${w}">${esc(displayDate(w))} – ${esc(displayDate(addDays(w,2)))} · ${counts[w]} files</option>`).join('');
    select.value=start;
    const end=addDays(start,2), grid=document.getElementById('gallery-grid');
    document.getElementById('window-label').textContent=`${displayDate(start)} at 12:00 AM through ${displayDate(end)} at 12:00 AM (end time not included)`;
    const files=DATA.media.filter(m=>m.timestamp>=`${start}T00:00:00`&&m.timestamp<`${end}T00:00:00`);
    document.getElementById('gallery-count').textContent=`${files.length} unique ${files.length===1?'file':'files'} in this 48-hour window`;
    const descriptorRows=[['Insomnia','insomnia',false],['Type of Pain','typePain',true],['Electrical Injury Discovery','injuryDiscovery',false],['Lower Body','lowerBody',false],['Thorax','thorax',false],['Upper Body','upperBody',false]];
    grid.innerHTML=files.map(m=>{
      const id=driveId(m), video=mediaKind(m)==='Video', url=linkFor(m), thumb=`https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200`;
      const frame=`<img class="media-thumb" src="${thumb}" alt="Thumbnail of ${esc(m.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="thumb-fallback">Thumbnail unavailable. Use the linked file name to open the Google Drive file.</div>${video?`<button class="play-overlay" type="button" data-drive-id="${esc(id)}" data-video-title="${esc(m.name)}" aria-label="Play ${esc(m.name)}">▶</button>`:''}`;
      const dur=video&&duration(m.durationSeconds)?` · ${duration(m.durationSeconds)}`:'';
      const trs=descriptorRows.map(([label,key,always])=>{const vals=m.categories[key]||[];if(!always&&!vals.length)return '';return `<tr><th scope="row">${label}</th><td>${vals.length?vals.map(esc).join('; '):'—'}</td></tr>`;}).join('');
      return `<article class="media-card"><div class="media-frame">${frame}</div><div class="media-card-content"><div class="media-title-row"><h2><a href="${esc(url)}" target="_blank" rel="noopener">${esc(m.name)}</a>${dur?` <span class="duration-inline">${esc(dur)}</span>`:''}</h2><span class="type-pill">${video?'Video':'Photo'}</span></div><p class="media-meta">${esc(dateTimeLabel(m))}</p><table class="album-table"><tbody>${trs}</tbody></table></div></article>`;
    }).join('');
    for(const button of grid.querySelectorAll('.play-overlay')) button.addEventListener('click',()=>{
      const frame=button.parentElement, id=button.dataset.driveId, title=button.dataset.videoTitle;
      const iframe=document.createElement('iframe'); iframe.src=`https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`; iframe.title=`Video player for ${title}`; iframe.allow='autoplay; fullscreen; picture-in-picture'; iframe.allowFullscreen=true; iframe.loading='lazy';
      frame.replaceChildren(iframe);
    });
    const prev=document.getElementById('previous-window'), next=document.getElementById('next-window'), ix=windows.indexOf(start);
    prev.disabled=ix===0; next.disabled=ix===windows.length-1;
    prev.addEventListener('click',()=>{location.href=`gallery.html?start=${encodeURIComponent(windows[ix-1])}`;});
    next.addEventListener('click',()=>{location.href=`gallery.html?start=${encodeURIComponent(windows[ix+1])}`;});
    select.addEventListener('change',()=>{location.href=`gallery.html?start=${encodeURIComponent(select.value)}`;});
  }
})();
