/* Helpers de DOM usados por toda a interface. */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});

  function $(id) {
    return document.getElementById(id);
  }
  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }
  function escape(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function icon(name, cls) {
    return EDM.Icons.svg(name, cls);
  }
  /* Todo elemento com data-icon ganha o SVG como primeiro filho (uma vez só). */
  function hydrateIcons(scope) {
    qsa("[data-icon]", scope).forEach(function (el) {
      if (el.dataset.iconDone === el.dataset.icon) return;
      var old = el.querySelector(":scope > .icon");
      if (old) old.remove();
      el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon));
      el.dataset.iconDone = el.dataset.icon;
    });
  }
  function setText(el, text) {
    if (el && el.textContent !== text) el.textContent = text;
  }
  /* Reinicia uma animação CSS de classe. */
  function pulse(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
  /* Re-renderiza uma lista sem perder o foco do teclado (pelo data-key). */
  function preserveFocus(container, render) {
    var active = document.activeElement;
    var key = active && container.contains(active) ? active.dataset.key : null;
    render();
    if (key) {
      var again = container.querySelector('[data-key="' + key + '"]');
      if (again) again.focus();
    }
  }

  EDM.Dom = { $: $, qsa: qsa, escape: escape, icon: icon, hydrateIcons: hydrateIcons, setText: setText, pulse: pulse, preserveFocus: preserveFocus };
})(window);
