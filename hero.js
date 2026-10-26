(() => {
  const root = document.querySelector('[data-hero-mosaic]');
  if (!root) return;
  const scenes = [...root.querySelectorAll('.mosaic-scene')];
  const play = root.querySelector('[data-mosaic-play]');
  const count = root.querySelector('[data-mosaic-count]');
  const status = root.querySelector('[data-mosaic-status]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let userPaused = motion.matches;
  let inView = true;
  let busy = false;
  let timer;
  const pending = new WeakMap();

  function hydrate(scene) {
    if (pending.has(scene)) return pending.get(scene);
    const promise = Promise.all([...scene.querySelectorAll('img')].map(async image => {
      if (image.dataset.src) {
        image.srcset = image.dataset.srcset;
        image.src = image.dataset.src;
        delete image.dataset.src;
        delete image.dataset.srcset;
      }
      if (image.decode) await image.decode();
      else if (!image.complete) await new Promise((resolve, reject) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', reject, { once: true });
      });
      if (!image.naturalWidth) throw new Error('Image unavailable');
    })).catch(() => {
      pending.delete(scene);
      return false;
    });
    pending.set(scene, promise);
    return promise;
  }

  function schedule() {
    window.clearTimeout(timer);
    const focusHoldsPlayback = root.contains(document.activeElement) && document.activeElement !== play;
    if (userPaused || !inView || document.hidden || busy || focusHoldsPlayback) return;
    timer = window.setTimeout(async () => {
      await show(current + 1);
      schedule();
    }, Number(root.dataset.interval) || 7000);
  }

  function updatePlay() {
    play.textContent = userPaused ? '继续播放' : '暂停播放';
    play.setAttribute('aria-label', userPaused ? '继续自动播放拼图' : '暂停自动播放拼图');
    root.dataset.playing = String(!userPaused);
  }

  async function show(index, manual = false) {
    if (busy) return;
    const next = (index + scenes.length) % scenes.length;
    if (next === current) return;
    busy = true;
    window.clearTimeout(timer);
    const ready = await hydrate(scenes[next]);
    if (ready !== false) {
      scenes[current].classList.remove('is-active');
      scenes[current].setAttribute('aria-hidden', 'true');
      scenes[current].inert = true;
      scenes[next].classList.add('is-active');
      scenes[next].removeAttribute('aria-hidden');
      scenes[next].inert = false;
      current = next;
      root.dataset.current = String(current + 1);
      count.textContent = String(current + 1).padStart(2, '0');
      if (manual) status.textContent = `第 ${current + 1} 组 共 ${scenes.length} 组`;
      void hydrate(scenes[(current + 1) % scenes.length]);
    } else if (manual) status.textContent = '图片暂未加载 请稍后重试';
    busy = false;
  }

  for (const [selector, direction] of [['[data-mosaic-prev]', -1], ['[data-mosaic-next]', 1]]) {
    root.querySelector(selector).addEventListener('click', async () => {
      userPaused = true;
      updatePlay();
      await show(current + direction, true);
      schedule();
    });
  }
  play.addEventListener('click', () => {
    userPaused = !userPaused;
    updatePlay();
    schedule();
  });
  root.addEventListener('focusin', () => window.clearTimeout(timer));
  root.addEventListener('focusout', () => window.setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => {
    userPaused = motion.matches;
    updatePlay();
    schedule();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.1 }).observe(root);
  }
  updatePlay();
  void hydrate(scenes[0]).then(() => hydrate(scenes[1]));
  schedule();
})();
