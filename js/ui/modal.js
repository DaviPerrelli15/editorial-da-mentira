/* Diálogo acessível (foco preso, Esc), avisos rápidos e números flutuantes. */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;
  var current = null;

  function trapFocus(event) {
    if (!current) return;
    if (event.key === "Escape" && current.dismissable) {
      event.preventDefault();
      finish(-1);
      return;
    }
    if (event.key !== "Tab") return;
    var focusables = D.qsa("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])", D.$("modal"));
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function finish(index) {
    if (!current) return;
    var done = current;
    current = null;
    D.$("modal").hidden = true;
    document.removeEventListener("keydown", trapFocus);
    if (done.returnFocus && document.contains(done.returnFocus)) done.returnFocus.focus();
    done.resolve(index);
  }

  /* options: { icon, title, body (HTML), actions: [{ label, sub, kind }], dismissable } → Promise<índice> */
  function open(options) {
    if (current) finish(-1);
    return new Promise(function (resolve) {
      current = { resolve: resolve, dismissable: options.dismissable !== false, returnFocus: document.activeElement };
      D.$("modal-icon").innerHTML = options.icon ? D.icon(options.icon) : "";
      D.$("modal-title").textContent = options.title;
      D.$("modal-body").innerHTML = options.body || "";
      var actions = options.actions || [{ label: "Ok", kind: "primary" }];
      D.$("modal-actions").innerHTML = actions
        .map(function (a, i) {
          return (
            '<button type="button" class="btn btn--' + (a.kind || "secondary") + '" data-index="' + i + '">' +
            '<span>' + D.escape(a.label) + (a.sub ? '<br><span class="choice__fx">' + D.escape(a.sub) + "</span>" : "") + "</span></button>"
          );
        })
        .join("");
      D.$("modal").hidden = false;
      D.qsa("#modal-actions button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          EDM.Audio.play("click");
          finish(Number(btn.dataset.index));
        });
      });
      document.addEventListener("keydown", trapFocus);
      var first = D.$("modal-actions").querySelector("button");
      if (first) first.focus();
    });
  }

  function isOpen() {
    return !!current;
  }

  function toast(text, kind, iconName) {
    var box = D.$("toasts");
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " is-" + kind : "");
    el.innerHTML = (iconName ? D.icon(iconName) : "") + "<span>" + D.escape(text) + "</span>";
    box.appendChild(el);
    while (box.children.length > 4) box.firstChild.remove();
    setTimeout(function () {
      el.classList.add("is-leaving");
      setTimeout(function () {
        el.remove();
      }, 320);
    }, 2600);
  }

  function float(text, color, anchor) {
    var rect = (anchor || D.$("hud-money")).getBoundingClientRect();
    var el = document.createElement("div");
    el.className = "float";
    el.textContent = text;
    el.style.color = color || "var(--money)";
    el.style.left = Math.max(8, Math.min(window.innerWidth - 140, rect.left)) + "px";
    el.style.top = rect.bottom + 4 + "px";
    document.body.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 1400);
  }

  EDM.Modal = { open: open, close: function () { finish(-1); }, isOpen: isOpen, toast: toast, float: float };
})(window);
