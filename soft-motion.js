(() => {
  'use strict';
  document.documentElement.dataset.motion = 'full';
  let navigationFrame = 0;
  let navigationTarget = null;
  const running = new Set();

  function stopNavigation() {
    cancelAnimationFrame(navigationFrame);
    navigationFrame = 0;
    navigationTarget = null;
  }
  function destination(target) {
    const header = document.querySelector('.site-header');
    const inset = (header?.getBoundingClientRect().height || 0) + 24;
    return Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight,
      scrollY + target.getBoundingClientRect().top - inset));
  }
  function finishNavigation(target, hash) {
    navigationFrame = 0;
    navigationTarget = null;
    if (location.hash !== hash) history.pushState(null, '', hash);
    const hadTabindex = target.hasAttribute('tabindex');
    if (!hadTabindex) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
    if (!hadTabindex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once:true});
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const hash = link.hash;
      let target;
      try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return; }
      if (!target) return;
      event.preventDefault();
      stopNavigation();
      navigationTarget = target;
      const from = scrollY;
      const to = destination(target);
      if (Math.abs(to - from) < 2) {
        scrollTo({top:to, behavior:'instant'});
        finishNavigation(target, hash);
        return;
      }
      const duration = Math.min(1350, 650 + Math.sqrt(Math.abs(to - from)) * 9);
      const started = performance.now();
      function frame(now) {
        const t = Math.min(1, (now - started) / duration);
        const eased = t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
        scrollTo({top:from + (destination(target)-from)*eased, behavior:'instant'});
        if (t < 1) navigationFrame = requestAnimationFrame(frame);
        else finishNavigation(target, hash);
      }
      navigationFrame = requestAnimationFrame(frame);
    });
  });
  addEventListener('wheel', stopNavigation, {passive:true});
  addEventListener('touchstart', stopNavigation, {passive:true});
  addEventListener('pointerdown', stopNavigation, {passive:true});
  addEventListener('keydown', event => {
    if (['Escape','ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) stopNavigation();
  });

  // Content stays visible if scripts fail; entry animations run only once, on arrival.
  const targets = document.querySelectorAll(
    '.section-heading,.movement-row,.finder-controls,.section-bridge,'+
    '.selection-photo,.selection-checks>div,.shop-inline,.guide-copy,.guide-form-wrap,'+
    '.continue-intro>h2,.continue-intro>.lead,.continue-links,.fest-visual,.fest-copy,'+
    '.community-heading,.community-art,.caption-maker,.faq-heading,.faq-copy,.footer-top,.footer-logo'
  );
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        el.dataset.revealState = 'shown';
        if (!el.animate) return;
        const photo = el.matches('.selection-photo,.fest-visual');
        const frames = photo
          ? [{opacity:.3,transform:'translateY(18px) scale(.985)'},{opacity:1,transform:'none'}]
          : [{opacity:.15,transform:'translateY(22px)'},{opacity:1,transform:'none'}];
        const animation = el.animate(frames, {duration:photo?760:640, easing:'cubic-bezier(.16,1,.3,1)'});
        running.add(animation);
        animation.finished.then(()=>running.delete(animation),()=>running.delete(animation));
      });
    }, {threshold:0, rootMargin:'0px 0px -45px 0px'});
    targets.forEach(el => {el.dataset.revealState = 'ready';observer.observe(el);});
  }
})();
