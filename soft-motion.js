(() => {
  'use strict';
  document.documentElement.dataset.motion = 'full';
  let navigationFrame = 0;
  const running = new Set();

  function stopNavigation() {
    cancelAnimationFrame(navigationFrame);
    navigationFrame = 0;
  }
  function destination(target) {
    const header = document.querySelector('.site-header');
    const inset = (header?.getBoundingClientRect().height || 0) + 24;
    return Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight,
      scrollY + target.getBoundingClientRect().top - inset));
  }
  function finishNavigation(target, hash) {
    navigationFrame = 0;
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
        scrollTo({top:from + (to-from)*eased, behavior:'instant'});
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

  // Prepare only offscreen entrances. Never fade an already visible block backwards.
  const targets = document.querySelectorAll(
    '.section-heading,.finder-controls,.section-bridge,'+
    '.selection-photo,.selection-checks>div,.shop-inline,.guide-copy,.guide-form-wrap,'+
    '.continue-intro>h2,.continue-intro>.lead,.continue-links,.fest-visual,.fest-copy,'+
    '.community-heading,.community-art,.caption-maker,.faq-heading,.faq-copy,.footer-top,.footer-logo'
  );
  if ('IntersectionObserver' in window) {
    const prepared = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        const animation = prepared.get(el);
        prepared.delete(el);
        el.dataset.revealState = 'shown';
        animation?.play();
      });
    }, {threshold:0, rootMargin:'0px 0px 48px 0px'});
    // Read layout in one pass, before creating animation effects.
    const candidates = [...targets].map(el => ({el, top:el.getBoundingClientRect().top}));
    candidates.forEach(({el, top}) => {
      if (top < innerHeight || !el.animate) {
        el.dataset.revealState = 'shown';
        return;
      }
      try {
        const photo = el.matches('.selection-photo,.fest-visual');
        const animation = el.animate([
          {opacity:.4,transform:'translateY('+ (photo ? 16 : 22) +'px)'},
          {opacity:1,transform:'none'}
        ], {duration:photo?620:580,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'});
        animation.pause();
        animation.currentTime = 0;
        prepared.set(el, animation);
        running.add(animation);
        animation.finished.then(() => {
          running.delete(animation);
          animation.cancel(); // Release the compositing effect after arrival.
        }, () => running.delete(animation));
        el.dataset.revealState = 'ready';
        observer.observe(el);
      } catch {
        el.dataset.revealState = 'shown';
      }
    });
    // Keyboard focus must reveal its content immediately, even when navigation skips ahead.
    document.addEventListener('focusin', event => {
      for (const [el, animation] of prepared) {
        if (!el.contains(event.target)) continue;
        observer.unobserve(el);
        prepared.delete(el);
        el.dataset.revealState = 'shown';
        animation.finish();
      }
    });
  }
})();
