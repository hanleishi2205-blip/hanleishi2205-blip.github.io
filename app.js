(() => {
 'use strict';
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const data=window.PORTFOLIO;
 const menu=$('.menu-toggle'), navigation=$('#nav-links');
 const setMenu=open=>{if(!menu||!navigation)return;menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'收起导航':'导航';navigation.classList.toggle('open',open);};
 menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
 $$('#nav-links a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){setMenu(false);menu.focus();}});
 document.addEventListener('click',e=>{if(menu?.getAttribute('aria-expanded')==='true'&&!e.target.closest('.site-header'))setMenu(false);});
 matchMedia('(min-width:768px)').addEventListener('change',e=>{if(e.matches)setMenu(false);});
 let timer;const toast=text=>{const t=$('.toast');t.textContent=text;t.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>t.classList.remove('show'),2600);};
 $$('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);toast('联系电话已复制');}catch{toast('联系电话 '+b.dataset.copy);}}));
 $('#print-resume')?.addEventListener('click',()=>window.print());
 function studio(id,hash=true){if(!$('#panel-'+id))return;$$('[data-studio]').forEach(b=>{const selected=b.dataset.studio===id;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});$$('.studio-panel').forEach(p=>p.hidden=p.id!=='panel-'+id);if(hash)history.replaceState(null,'',id==='dream'?'#ai-studio':'#youfan');}
 $$('[data-studio]').forEach(b=>{b.addEventListener('click',()=>studio(b.dataset.studio));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=$$('[data-studio]');const t=e.key==='Home'?tabs[0]:e.key==='End'?tabs.at(-1):tabs[(tabs.indexOf(b)+1)%tabs.length];studio(t.dataset.studio);t.focus();}});});
 if(location.hash==='#ai-studio')studio('dream',false);
 $('[data-ai-link]')?.setAttribute('href','work.html?type=video&category=ai');
 let media='video';
 function applyFilter(panel){const filter=$('[data-case-filter][aria-pressed="true"]',panel)?.dataset.caseFilter||'all';const q=$('input[type="search"]',panel)?.value.trim().toLowerCase()||'';const cards=$$('.project',panel);cards.forEach(c=>c.hidden=!(filter==='all'||c.dataset.category===filter)||!c.dataset.title.toLowerCase().includes(q));const count=cards.filter(c=>!c.hidden).length;$('.archive-status',panel).textContent=`显示 ${count} 组 共 ${cards.length} 组`;$('.archive-empty',panel).hidden=count>0;}
 function selectMedia(type,update=true){if(!['video','stills'].includes(type)||!$('#case-'+type))return;media=type;$$('[data-media-tab]').forEach(b=>{const selected=b.dataset.mediaTab===type;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});$$('.case-panel').forEach(p=>p.hidden=p.id!=='case-'+type);if(update){const url=new URL(location.href);url.searchParams.set('type',type);url.searchParams.delete('category');history.replaceState(null,'',url.pathname+url.search+url.hash);}}
 $$('[data-media-tab]').forEach(b=>{b.addEventListener('click',()=>selectMedia(b.dataset.mediaTab));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();selectMedia(b.dataset.mediaTab==='video'?'stills':'video');$('[data-media-tab="'+media+'"]').focus();}});});
 $$('.case-panel').forEach(panel=>{$$('[data-case-filter]',panel).forEach(b=>b.addEventListener('click',()=>{$$('[data-case-filter]',panel).forEach(t=>t.setAttribute('aria-pressed',String(t===b)));applyFilter(panel);}));$('input[type="search"]',panel)?.addEventListener('input',()=>applyFilter(panel));});
 const params=new URLSearchParams(location.search);if(params.get('type'))selectMedia(params.get('type'),false);
 if(params.get('category')&&$('#case-'+media)){const panel=$('#case-'+media),b=$$('[data-case-filter]',panel).find(item=>item.dataset.caseFilter===params.get('category'));if(b){$$('[data-case-filter]',panel).forEach(t=>t.setAttribute('aria-pressed',String(t===b)));applyFilter(panel);}}
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const dialog=$('#project-dialog'),imageDialog=$('#image-dialog');let activeProject,lastTrigger,imageFiles=[],imageIndex=0,imageTitle='';
 const syncLock=()=>document.body.classList.toggle('locked',!!dialog?.open||!!imageDialog?.open);
 function showImage(index){imageIndex=(index+imageFiles.length)%imageFiles.length;const image=$('#large-image');image.src=imageFiles[imageIndex];image.alt=imageTitle+' '+(imageIndex+1);$('#image-count').textContent='第 '+(imageIndex+1)+' 幅 共 '+imageFiles.length+' 幅';$('#image-standalone').href=imageFiles[imageIndex];$('.image-prev').hidden=imageFiles.length<2;$('.image-next').hidden=imageFiles.length<2;}
 function openImage(files,index,title){if(!imageDialog)return;imageFiles=files;imageTitle=title;showImage(index);if(!imageDialog.open)imageDialog.showModal();syncLock();}
 function openProject(id,hash=true){const p=data.projects.find(x=>x.id===id);if(!p||!dialog)return;activeProject=p;selectMedia(p.media,true);const peers=data.projects.filter(x=>x.media===p.media);const next=peers[(peers.indexOf(p)+1)%peers.length];$('.modal-content',dialog).innerHTML=`<span class="mono accent">${esc(p.client)}</span>${p.relationship?`<span class="partner-label modal-partner">${esc(p.relationship)}</span>`:''}<h2 id="project-title">${esc(p.title)}</h2><div class="modal-info"><p>${esc(p.description)}</p><dl>${p.credits?p.credits.map(c=>`<dt>${esc(c.role)}</dt><dd>${esc(c.name)}</dd>`).join(''):`<dt>项目职责</dt><dd>${esc(p.creator?p.creator+' ':'')}${esc(p.role)}</dd>`}<dt>作品类型</dt><dd>${esc(p.label)}</dd><dt>图集</dt><dd>${p.images.length} 幅</dd></dl></div><div class="modal-gallery">${p.images.map((file,i)=>`<button class="gallery-shot" data-image-index="${i}" aria-label="放大${esc(p.title)}第 ${i+1} 幅"><img src="assets/${esc(file)}" alt="${esc(p.title)} ${i+1}" ${i?'loading="lazy"':''}><span aria-hidden="true">查看大图</span></button>`).join('')}</div><div class="modal-bottom">${p.creatorPage?`<a href="${p.creatorPage}">查看创作者资料</a>`:p.media==='video'?`<a href="${data.filmProfile}" target="_blank" rel="noopener noreferrer">前往新片场作品主页</a>`:'<span class="mono muted">点击图像查看完整画幅</span>'}<button class="next-project" data-next="${next.id}">下一个项目</button></div>`;if(!dialog.open){lastTrigger=document.activeElement;dialog.showModal();}dialog.scrollTop=0;$('.modal-close').focus();syncLock();if(hash)history.replaceState(null,'','#project/'+id);}
 $$('[data-project]').forEach(b=>b.addEventListener('click',()=>openProject(b.dataset.project)));
 dialog?.addEventListener('click',e=>{const next=e.target.closest('[data-next]');if(next)openProject(next.dataset.next);const shot=e.target.closest('[data-image-index]');if(shot)openImage(activeProject.images.map(p=>'assets/'+p),Number(shot.dataset.imageIndex),activeProject.title);});
 $('.modal-close')?.addEventListener('click',()=>dialog.close());
 dialog?.addEventListener('close',()=>{syncLock();if(location.hash.startsWith('#project/'))history.replaceState(null,'',location.pathname+location.search);lastTrigger?.focus({preventScroll:true});});
 const profileShots=$$('[data-profile-image]');profileShots.forEach((b,i)=>b.addEventListener('click',()=>openImage(profileShots.map(x=>x.dataset.profileImage),i,document.title)));
 let swipeStart;
 const imageStage=$('.image-stage');
 imageStage?.addEventListener('touchstart',e=>{swipeStart=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
 imageStage?.addEventListener('touchcancel',()=>{swipeStart=null;},{passive:true});
 imageStage?.addEventListener('touchend',e=>{if(!swipeStart||e.touches.length||!imageDialog?.open||imageFiles.length<2)return;const t=e.changedTouches[0],dx=t.clientX-swipeStart.x,dy=t.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.4)showImage(imageIndex+(dx<0?1:-1));},{passive:true});
 $('.image-close')?.addEventListener('click',()=>imageDialog.close());$('.image-prev')?.addEventListener('click',()=>showImage(imageIndex-1));$('.image-next')?.addEventListener('click',()=>showImage(imageIndex+1));imageDialog?.addEventListener('close',syncLock);
 imageDialog?.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showImage(imageIndex+1);}if(e.key==='ArrowLeft'){e.preventDefault();showImage(imageIndex-1);}});
 for(const d of [dialog,imageDialog])d?.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
 if(location.hash.startsWith('#project/'))openProject(location.hash.split('/')[1],false);
 addEventListener('hashchange',()=>{if(location.hash.startsWith('#project/'))openProject(location.hash.split('/')[1],false);else if(dialog?.open)dialog.close();});
})();
