// Site behaviors — vanilla JS, no jQuery. Loaded with `defer`.
(function () {
  'use strict';

  var COPY_ICON = '<i class="far fa-copy" aria-hidden="true"></i>';
  var DONE_ICON = '<i class="fas fa-check" aria-hidden="true"></i>';
  var ERROR_ICON = '<i class="fas fa-times" aria-hidden="true"></i>';
  // Buffer >= the .copy-btn opacity transition (.15s) in _code.scss.
  var FADE_MS = 250;

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    initBashPrompts();
    initThemeToggle();
    initCodeCopy();
    initLazyImages();
  });

  // Wrap each non-empty line of a bash block in <span class="bash"> so the CSS
  // `$ ` prompt renders per line. Built with DOM nodes (no innerHTML) to stay
  // safe against any special characters in the code.
  function initBashPrompts() {
    document.querySelectorAll('code.language-bash').forEach(function (block) {
      var lines = block.textContent.split('\n').filter(function (l) {
        return l.length > 0;
      });
      block.textContent = '';
      lines.forEach(function (line, i) {
        if (i > 0) block.appendChild(document.createTextNode('\n'));
        var span = document.createElement('span');
        span.className = 'bash';
        span.textContent = line;
        block.appendChild(span);
      });
    });
  }

  // Light/dark theme toggle. Persists the explicit choice in localStorage;
  // the pre-paint script in <head> applies it on the next load.
  function initThemeToggle() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var root = document.documentElement;
      var current = root.getAttribute('data-theme');
      if (!current) {
        current = window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark';
      }
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {}
    });
  }

  // Add a "Copy" button to each fenced code block.
  function initCodeCopy() {
    document.querySelectorAll('figure.highlight').forEach(function (fig) {
      if (!fig.querySelector('pre')) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.innerHTML = COPY_ICON;
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      fig.appendChild(btn);

      btn.addEventListener('click', function () {
        copyText(getCodeText(fig)).then(
          function () { flash(btn, DONE_ICON, 'copied'); },
          function () { flash(btn, ERROR_ICON, 'error'); }
        );
      });
    });
  }

  // Text of a code block, excluding any rendered line-number gutter.
  function getCodeText(fig) {
    var pre = fig.querySelector('pre');
    var clone = pre.cloneNode(true);
    clone.querySelectorAll('.lineno').forEach(function (el) {
      el.remove();
    });
    return clone.textContent.replace(/\n+$/, '');
  }

  function flash(btn, iconHtml, cls) {
    btn.innerHTML = iconHtml;
    btn.classList.add(cls);

    // Reset any pending timers so rapid re-clicks behave.
    clearTimeout(btn._fadeTimer);
    clearTimeout(btn._iconTimer);

    btn._fadeTimer = setTimeout(function () {
      // Start fading out, but keep the "done" icon during the fade.
      btn.classList.remove(cls);
      // Swap back to the copy icon only once it has faded out, so the
      // icon doesn't visibly flip from done -> copy while still on screen.
      btn._iconTimer = setTimeout(function () {
        btn.innerHTML = COPY_ICON;
      }, FADE_MS);
    }, 1000);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for older browsers / non-secure contexts.
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  // Lazy-load images inside post content, but keep the header image eager
  // since it is the largest-contentful-paint element.
  function initLazyImages() {
    document.querySelectorAll('.post img').forEach(function (img) {
      if (img.classList.contains('post-header-img')) return;
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });
  }
})();
