(() => {
  'use strict';
  const dialog = document.querySelector('#share-dialog');
  if (!dialog) return;
  const title = dialog.querySelector('#share-title');
  const input = dialog.querySelector('#share-url');
  const copy = dialog.querySelector('.share-copy');
  const native = dialog.querySelector('.share-native');
  const status = dialog.querySelector('.share-status');
  const hint = '复制链接后可粘贴到微信或发送给客户';
  let payload, trigger, version = 0;

  function selection(button) {
    const id = button.hasAttribute('data-share-current-project')
      ? location.hash.replace(/^#project\//, '') : button.dataset.shareProject;
    if (id) {
      const project = window.PORTFOLIO?.projects.find(item => item.id === id);
      if (!project) return;
      // Use the case identity rather than the archive's current search or filters.
      const url = new URL('work.html', location.href);
      url.searchParams.set('type', project.media);
      url.hash = 'project/' + project.id;
      return {title: project.title + ' 有饭工作室', url: url.href};
    }
    const url = new URL(location.href);
    if (['#top', '#main', '#contact'].includes(url.hash)) url.hash = '';
    return {title: document.title, url: url.href};
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-share-page], [data-share-project], [data-share-current-project]');
    if (!button) return;
    const next = selection(button);
    if (!next) return;
    payload = next;
    trigger = button;
    version += 1;
    title.textContent = payload.title;
    input.value = payload.url;
    status.textContent = hint;
    copy.textContent = '复制链接';
    copy.disabled = false;
    native.hidden = typeof navigator.share !== 'function';
    native.disabled = false;
    dialog.showModal();
    document.body.classList.add('locked');
    copy.focus({preventScroll: true});
  });

  copy.addEventListener('click', async () => {
    const current = version, url = payload.url;
    let copied = false;
    copy.disabled = true;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        copied = true;
      }
    } catch { /* The selected field below also works when clipboard access is denied. */ }
    if (current !== version || !dialog.open) return;
    if (!copied) {
      input.focus({preventScroll: true});
      input.select();
      input.setSelectionRange(0, input.value.length);
      try { copied = document.execCommand('copy'); } catch { copied = false; }
    }
    copy.disabled = false;
    copy.textContent = copied ? '已复制' : '复制链接';
    status.textContent = copied ? '链接已复制 可粘贴到微信或发送给客户' : '请选择上方链接复制 手机可长按链接';
  });

  native.addEventListener('click', async () => {
    const current = version;
    native.disabled = true;
    try {
      await navigator.share(payload);
      if (current === version && dialog.open) status.textContent = '已完成系统分享';
    } catch (error) {
      if (current === version && dialog.open) {
        status.textContent = error.name === 'AbortError' ? hint : '暂时无法系统分享 可以复制链接';
      }
    } finally {
      if (current === version) native.disabled = false;
    }
  });

  dialog.querySelector('.share-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    version += 1;
    document.body.classList.toggle('locked', !!document.querySelector('dialog[open]'));
    trigger?.focus({preventScroll: true});
  });
})();
