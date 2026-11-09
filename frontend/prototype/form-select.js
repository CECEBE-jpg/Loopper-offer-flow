/* Form dropdowns in the same style as the phone country code list
   (form-phone-search.js, form-phone.css). Add data-fsel to a <select>.
   - the <select> stays in the page: it holds the value, the required check,
     the label and the field's look; only its native list is replaced
   - a transparent button over the field opens the list; a search box and
     scrollbar appear only when the options don't fit in one view
   - on phones the list opens as a full-screen sheet
   - flags: add data-flag="gb" to an <option>
   - keyboard: the search box is a combobox; arrows move, Enter chooses, Esc
     closes; screen readers hear how many results there are */
(function () {
  "use strict";

  var FLAGS = "https://www.loopper.co.uk/storage/flags/";
  var PHONE = matchMedia("(width < 768px)");
  var uid = 0;

  function plain(text) {
    return text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  }

  document.querySelectorAll("select[data-fsel]").forEach(function (select) {
    var field = select.parentElement;
    var labelEl = document.querySelector('label[for="' + select.id + '"]');
    var title = labelEl ? labelEl.textContent.replace("*", "").trim() : "Choose";
    var id = "fsel-" + ++uid;
    var isSheet = false;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "fsel-btn";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", id + "-panel");
    select.insertAdjacentElement("afterend", button);
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    var panel = document.createElement("div");
    panel.className = "fcc-panel fsel-panel";
    panel.id = id + "-panel";
    panel.hidden = true;
    panel.tabIndex = -1;
    panel.innerHTML =
      '<div class="fcc-sheet-head"><h2 class="fcc-sheet-title" id="' + id + '-title"></h2>' +
      '<button class="fcc-sheet-x" type="button" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>' +
      '<div class="fcc-search-wrap"><input class="fcc-search" type="text" role="combobox" ' +
      'aria-expanded="true" aria-autocomplete="list" autocomplete="off" spellcheck="false" ' +
      'aria-controls="' + id + '-list" /></div>' +
      '<div class="fcc-list" id="' + id + '-list" role="listbox"></div>' +
      '<p class="fcc-status vh" aria-live="polite"></p>';
    field.appendChild(panel);

    panel.querySelector(".fcc-sheet-title").textContent = title;
    var search = panel.querySelector(".fcc-search");
    var list = panel.querySelector(".fcc-list");
    list.tabIndex = -1;
    var status = panel.querySelector(".fcc-status");
    var searchText = "Search " + title.toLowerCase();
    search.placeholder = searchText;
    search.setAttribute("aria-label", searchText);
    list.setAttribute("aria-label", title);
    var items = [];
    var active = -1;

    var options = Array.prototype.filter.call(select.options, function (o) {
      return !o.disabled;
    });

    function syncButton() {
      var chosen = select.selectedOptions[0];
      var value = chosen && !chosen.disabled ? chosen.textContent : "not chosen";
      button.setAttribute("aria-label", title + ": " + value + ". Change");
    }
    function mirror(name) {
      if (select.hasAttribute(name)) button.setAttribute(name, select.getAttribute(name));
      else button.removeAttribute(name);
    }
    new MutationObserver(function () {
      mirror("aria-invalid");
      mirror("aria-describedby");
    }).observe(select, { attributes: true, attributeFilter: ["aria-invalid", "aria-describedby"] });

    function setActive(index, scroll) {
      if (items[active]) items[active].el.classList.remove("is-active");
      active = index;
      if (items[active]) {
        items[active].el.classList.add("is-active");
        search.setAttribute("aria-activedescendant", items[active].el.id);
        if (scroll) items[active].el.scrollIntoView({ block: "nearest" });
      } else {
        search.removeAttribute("aria-activedescendant");
      }
    }

    function row(opt) {
      var el = document.createElement("div");
      var index = items.length;
      el.id = id + "-opt-" + index;
      el.className = "fcc-opt";
      el.setAttribute("role", "option");
      el.setAttribute("aria-selected", String(opt.selected));
      if (opt.selected) el.classList.add("is-selected");
      if (opt.dataset.flag) {
        var flag = document.createElement("img");
        flag.className = "fcc-flag";
        flag.width = flag.height = 18;
        flag.alt = "";
        flag.src = FLAGS + opt.dataset.flag + ".svg";
        el.appendChild(flag);
      }
      var name = document.createElement("span");
      name.className = "fcc-name";
      name.textContent = opt.textContent;
      el.appendChild(name);
      el.addEventListener("mousedown", function (e) {
        e.preventDefault(); // keeps focus in the search box until chosen
      });
      el.addEventListener("click", function () {
        choose(opt);
      });
      el.addEventListener("mousemove", function () {
        setActive(index, false);
      });
      items.push({ el: el, opt: opt });
      return el;
    }

    function render() {
      var q = plain(search.value.trim());
      list.textContent = "";
      items = [];
      active = -1;
      options
        .filter(function (o) {
          return !q || plain(o.textContent).indexOf(q) >= 0;
        })
        .forEach(function (o) {
          list.appendChild(row(o));
        });
      if (!items.length) {
        var none = document.createElement("p");
        none.className = "fcc-none";
        none.textContent = "Nothing found. Check the spelling or contact us.";
        list.appendChild(none);
      }
      var chosen = -1;
      items.forEach(function (it, i) {
        if (chosen < 0 && it.opt.selected) chosen = i;
      });
      setActive(q ? (items.length ? 0 : -1) : Math.max(chosen, 0), true);
      status.textContent = q ? items.length + (items.length === 1 ? " result" : " results") : "";
    }

    function fit() {
      panel.classList.remove("is-long");
      var long = isSheet
        ? list.scrollHeight > list.clientHeight + 1
        : panel.getBoundingClientRect().height > window.innerHeight - 24;
      panel.classList.toggle("is-long", long);
      return long;
    }

    function open() {
      isSheet = PHONE.matches;
      panel.classList.toggle("is-sheet", isSheet);
      (isSheet ? document.body : field).appendChild(panel);
      // the screen width, also when the page itself runs wider than the phone
      panel.style.right = isSheet ? "auto" : "";
      panel.style.width = isSheet ? document.documentElement.clientWidth + "px" : "";
      if (isSheet) {
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "true");
        panel.setAttribute("aria-labelledby", id + "-title");
      } else {
        panel.removeAttribute("role");
        panel.removeAttribute("aria-modal");
        panel.removeAttribute("aria-labelledby");
      }
      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
      field.classList.add("fsel-open");
      search.value = "";
      render();
      var long = fit();
      if (isSheet) {
        // no keyboard until the search box is tapped: the list stays in view
        document.body.classList.add("fcc-lock");
        panel.focus({ preventScroll: true });
        return;
      }
      (long ? search : list).focus({ preventScroll: true });
      panel.scrollIntoView({ block: "nearest" });
    }
    function close(focusTo) {
      if (panel.hidden) return;
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
      field.classList.remove("fsel-open");
      document.body.classList.remove("fcc-lock");
      if (focusTo) focusTo.focus();
    }
    function choose(opt) {
      select.value = opt.value;
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      close(button);
    }

    button.addEventListener("click", function () {
      if (panel.hidden) open();
      else close(button);
    });
    button.addEventListener("keydown", function (e) {
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && panel.hidden) {
        e.preventDefault();
        open();
      }
    });
    // validation focuses the select: hand that on to the button
    select.addEventListener("focus", function () {
      button.focus();
    });
    select.addEventListener("change", syncButton);
    search.addEventListener("input", render);
    panel.addEventListener("keydown", function (e) {
      if (e.target.closest(".fcc-sheet-x")) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!items.length) return;
        var step = e.key === "ArrowDown" ? 1 : -1;
        setActive((active + step + items.length) % items.length, true);
      } else if (e.key === "Enter") {
        e.preventDefault(); // never sends the form from here
        if (items[active]) choose(items[active].opt);
      } else if (e.key === "Tab") {
        close();
      }
    });
    panel.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close(button);
      }
    });
    panel.querySelector(".fcc-sheet-x").addEventListener("click", function () {
      close(button);
    });
    document.addEventListener("mousedown", function (e) {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== button) close();
    });

    syncButton();
  });
})();
