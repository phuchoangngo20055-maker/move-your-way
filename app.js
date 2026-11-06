(() => {
 'use strict';
 const $ = s => document.querySelector(s);
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const movement = {
  yoga: {title:'Yoga & Pilates — thoải mái khi gập và duỗi',label:'Yoga & Pilates',url:'https://www.coolmate.me/collection/yoga-pilates',body:'Khi xem sản phẩm, chú ý mô tả chất liệu, độ co giãn và độ ôm. Khi thử, hãy ngồi, cúi hoặc duỗi người để cảm nhận cạp và đường may; kiểm tra độ che phủ dưới ánh sáng rõ khi vải giãn.'},
  run: {title:'Chạy bộ — kiểm tra trong chuyển động',label:'chạy bộ nữ',url:'https://www.coolmate.me/collection/quan-ao-chay-bo-nu',body:'Chú ý thông tin chất liệu, khả năng thoát ẩm được công bố và mức hỗ trợ của áo bra. Khi thử, bạn có thể đi nhanh hoặc chạy bước nhỏ để xem cạp có giữ vị trí và đường may có cọ xát không.'},
  gym: {title:'Tập gym — thử qua động tác quen thuộc',label:'tập gym nữ',url:'https://www.coolmate.me/collection/quan-ao-phu-kien-tap-gym-nu',body:'Đọc mô tả độ ôm và chất liệu của từng mẫu. Khi thử, kiểm tra qua squat nhẹ, bước chùng chân hoặc động tác tay qua đầu: trang phục có đủ linh hoạt, che phủ và giữ vị trí theo mong muốn không?'}
 };
 let selected = 'yoga';
 const priorities = {comfort:'Bạn ưu tiên thoải mái: chú ý vị trí bị siết, cấn hoặc cọ xát. Một bộ đồ dễ chịu khi đứng yên vẫn cần được kiểm tra qua chuyển động bạn định thực hiện.',support:'Bạn quan tâm bra: xem mức hỗ trợ được công bố trên từng mẫu và đối chiếu với hoạt động định tập. Chú ý cảm giác ở dây, chân ngực và độ ổn định khi thử.',style:'Bạn muốn dễ phối: bắt đầu từ màu và phom có thể kết hợp với tủ đồ hiện tại. Sau đó kiểm tra xem cách phối ấy có đáp ứng hoạt động và cảm giác mặc bạn cần không.'};
 function showResult(focus=false){
  const d=movement[selected],priority=$('input[name="priority"]:checked').value,root=$('#fit-result');
  root.querySelector('h3').textContent=d.title;$('#fit-advice').textContent=d.body;$('#fit-priority').textContent=priorities[priority];
  $('#fit-selection').textContent=$('[data-movement="'+selected+'"]>span').textContent+' · '+$('input[name="priority"]:checked').parentElement.textContent.trim();
  $('#shop-context').textContent='Bạn đang khám phá '+$('[data-movement="'+selected+'"]>.movement-label').textContent+'.';
  $('#shop-selected').href=d.url;$('#shop-selected').querySelector('.purchase-label').textContent='Xem danh mục '+({yoga:'Yoga & Pilates',run:'chạy bộ',gym:'tập gym'}[selected]);
  root.classList.remove('updated');void root.offsetWidth;root.classList.add('updated');if(focus){root.focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});}
 }
 document.querySelectorAll('[data-movement]').forEach(b=>b.addEventListener('click',()=>{
  selected=b.dataset.movement;document.querySelectorAll('[data-movement]').forEach(x=>{const on=x===b;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on));});
  const index=Object.keys(movement).indexOf(selected);$('#movement-position').textContent=b.querySelector('.movement-label').textContent+' · '+(index+1)+'/3';$('#movement-prev').disabled=index===0;$('#movement-next').disabled=index===2;showResult();
 }));
 document.querySelectorAll('input[name="priority"]').forEach(input=>input.addEventListener('change',()=>showResult()));
 showResult();
 $('#find-fit').addEventListener('click',()=>showResult(true));
 const moveButtons=[...document.querySelectorAll('[data-movement]')];
 function stepMovement(delta){const i=moveButtons.findIndex(b=>b.dataset.movement===selected),next=moveButtons[Math.max(0,Math.min(2,i+delta))];next.click();next.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduced.matches?'instant':'smooth'});}
 $('#movement-prev').addEventListener('click',()=>stepMovement(-1));$('#movement-next').addEventListener('click',()=>stepMovement(1));
 const row=$('.movement-row');row.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const a=[...row.querySelectorAll('button')];let i=a.indexOf(document.activeElement);i=e.key==='Home'?0:e.key==='End'?a.length-1:(i+(e.key==='ArrowRight'?1:-1)+a.length)%a.length;a[i].focus();a[i].click();a[i].scrollIntoView({block:'nearest',inline:'nearest',behavior:reduced.matches?'instant':'smooth'});});
 let startX=0,startScroll=0,dragging=false;row.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;startX=e.clientX;startScroll=row.scrollLeft;dragging=true;});window.addEventListener('pointerup',()=>dragging=false);row.addEventListener('pointermove',e=>{if(dragging)row.scrollLeft=startScroll-(e.clientX-startX);});
 const menu=$('#mobile-menu'),toggle=$('.menu-toggle');function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu';}
 toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Đóng':'Menu';});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus();}});matchMedia('(min-width:601px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
 const header=$('.site-header');
 let headerTick=false;function updateHeader(){header.classList.toggle('is-scrolled',scrollY>20);headerTick=false;}
 addEventListener('scroll',()=>{if(!headerTick){requestAnimationFrame(updateHeader);headerTick=true;}},{passive:true});updateHeader();
 const sectionLinks=[...document.querySelectorAll('.desktop-nav a,.mobile-menu a')];
 if('IntersectionObserver' in window){const navObserver=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;sectionLinks.forEach(a=>{if(a.hash==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-15% 0px -65% 0px'});['dau-trang','cach-cua-ban','nhin-gan','cam-nang','tiep-tuc'].forEach(id=>navObserver.observe(document.getElementById(id)));
 }
 const emailOK = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
 function error(input,output,message){input.setAttribute('aria-invalid',String(!!message));output.textContent=message;}
 $('#guide-form').addEventListener('submit',e=>{e.preventDefault();const field=$('#guide-email');const message=!field.value.trim()?'Nhập email mẫu để tiếp tục, ví dụ ban@vidu.com.':!emailOK(field.value)?'Kiểm tra lại email. Ví dụ đúng: ban@vidu.com.':'';error(field,$('#email-error'),message);if(message){field.focus();return;}$('#consent-summary').textContent=$('#guide-consent').checked?'Trong lần thử này, bạn đã chọn nhận thêm nội dung MOVE YOUR WAY. Lựa chọn không được lưu.':'Bạn chỉ chọn nhận cẩm nang, không chọn nhận thêm nội dung.';$('#guide-form').hidden=true;$('#guide-success').hidden=false;$('#guide-success').focus({preventScroll:true});field.value='';$('#guide-consent').checked=false;});
 $('#guide-email').addEventListener('input',()=>error($('#guide-email'),$('#email-error'),''));
 $('#guide-reset').addEventListener('click',()=>{$('#guide-success').hidden=true;$('#guide-form').hidden=false;$('#guide-form').reset();error($('#guide-email'),$('#email-error'),'');$('#guide-email').focus({preventScroll:true});});
 document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{const d=document.getElementById(b.dataset.open);d.showModal();d.scrollTop=0;d.querySelector('.dialog-close')?.focus({preventScroll:true});}));
 document.querySelectorAll('dialog').forEach(d=>{d.querySelectorAll('.dialog-close,.dialog-close-inline').forEach(b=>b.addEventListener('click',()=>{d.close();if(b.dataset.return){const target=document.getElementById(b.dataset.return);target.focus({preventScroll:true});target.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});}}));d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
 $('#fest-form').addEventListener('submit',e=>{e.preventDefault();let invalid=[];for(const [id,valid,msg] of [['fest-name',v=>v.trim().length>=2,'Nhập tên từ 2 ký tự để tiếp tục.'],['fest-email',emailOK,'Nhập email đúng định dạng, ví dụ ban@vidu.com.']]){const el=$('#'+id),m=valid(el.value)?'':msg;error(el,$('#'+id+'-error'),m);if(m)invalid.push(el);}if(invalid.length){invalid[0].focus();return;}$('#fest-form').hidden=true;$('#fest-success').hidden=false;$('#fest-success').focus();$('#fest-form').reset();});
 ['fest-name','fest-email'].forEach(id=>$('#'+id).addEventListener('input',()=>error($('#'+id),$('#'+id+'-error'),'')));
 $('#fest-dialog').addEventListener('close',()=>{$('#fest-form').hidden=false;$('#fest-success').hidden=true;$('#fest-form').reset();['fest-name','fest-email'].forEach(id=>error($('#'+id),$('#'+id+'-error'),''));});
 const activityNames={yoga:'Yoga & Pilates',run:'chạy bộ',gym:'tập gym',everyday:'một chút vận động mỗi ngày'};
 function caption(){const text=$('#caption-text').value.trim();$('#caption-output').textContent='Hôm nay, tôi chọn '+activityNames[$('#caption-activity').value]+'. '+(text?text+(/[.!?…]$/.test(text)?' ':'. '):'Tôi vận động theo nhịp của mình. ')+'#CoolmateMoveYourWay #CoolmateWomenActive';$('#copy-status').textContent='Bạn có thể dán và chỉnh lời chia sẻ cùng ảnh hoặc video của mình trên TikTok.';}
 caption();
 $('#caption-activity').addEventListener('change',caption);$('#caption-text').addEventListener('input',caption);$('#copy-caption').addEventListener('click',async()=>{const text=$('#caption-output').textContent;try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);else{const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.left='-9999px';document.body.append(t);t.select();if(!document.execCommand('copy'))throw Error('copy unavailable');t.remove();}$('#copy-status').textContent='Đã sao chép. Bạn có thể dán và chỉnh lại trên TikTok.';}catch{$('#copy-status').textContent='Chưa sao chép được. Hãy chọn phần lời chia sẻ và sao chép thủ công.';const r=document.createRange();r.selectNodeContents($('#caption-output'));getSelection().removeAllRanges();getSelection().addRange(r);}});
})();

