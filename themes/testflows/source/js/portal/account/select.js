/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Custom portal dropdown — native <select> popups are OS-drawn and unstyleable. */

/** @type {HTMLElement|null} */
let openMenu = null;

/**
 * @param {HTMLElement} menu
 */
function closeMenu(menu) {
  menu.classList.remove("is-open");
  const trigger = menu.querySelector(".portal-menu-trigger");
  const list = menu.querySelector(".portal-menu-list");
  if (trigger instanceof HTMLElement) {
    trigger.setAttribute("aria-expanded", "false");
  }
  if (list instanceof HTMLElement) {
    list.hidden = true;
  }
  if (openMenu === menu) {
    openMenu = null;
  }
}

function closeOpenMenu() {
  if (openMenu) {
    closeMenu(openMenu);
  }
}

/**
 * @param {HTMLSelectElement} select
 */
function selectedLabel(select) {
  const opt = select.selectedOptions[0];
  return opt ? opt.textContent || "" : "";
}

/**
 * @param {HTMLSelectElement} select
 * @param {HTMLElement} menu
 * @param {HTMLElement} valueEl
 * @param {HTMLElement} list
 */
function syncOptions(select, menu, valueEl, list) {
  list.replaceChildren();
  Array.from(select.options).forEach((opt, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "portal-menu-option";
    item.setAttribute("role", "option");
    item.dataset.value = opt.value;
    item.dataset.index = String(index);
    item.textContent = opt.textContent || "";
    const selected = opt.selected;
    item.setAttribute("aria-selected", selected ? "true" : "false");
    item.classList.toggle("is-selected", selected);
    item.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (select.value !== opt.value) {
        select.value = opt.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      valueEl.textContent = selectedLabel(select);
      syncOptions(select, menu, valueEl, list);
      closeMenu(menu);
      const trigger = menu.querySelector(".portal-menu-trigger");
      if (trigger instanceof HTMLElement) {
        trigger.focus();
      }
    });
    list.append(item);
  });
  valueEl.textContent = selectedLabel(select);
}

/**
 * Replace a native select's open menu with a styled listbox.
 * Keeps the <select> in the form for FormData / change events.
 * @param {HTMLSelectElement} select
 */
export function enhanceSelect(select) {
  if (select.dataset.portalMenu === "1") {
    return;
  }
  select.dataset.portalMenu = "1";

  const menu = document.createElement("div");
  menu.className = "portal-menu";
  if (select.classList.contains("form-control")) {
    menu.classList.add("portal-menu--control");
  }

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "portal-menu-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  const label = select.getAttribute("aria-label") || select.name || "Choose";
  trigger.setAttribute("aria-label", label);

  const valueEl = document.createElement("span");
  valueEl.className = "portal-menu-value";
  trigger.append(valueEl);

  const list = document.createElement("div");
  list.className = "portal-menu-list";
  list.setAttribute("role", "listbox");
  list.hidden = true;

  const parent = select.parentNode;
  if (!parent) {
    return;
  }
  parent.insertBefore(menu, select);
  menu.append(trigger, list, select);
  select.classList.add("portal-menu-native");
  select.tabIndex = -1;

  syncOptions(select, menu, valueEl, list);

  select.addEventListener("change", () => {
    syncOptions(select, menu, valueEl, list);
  });

  const open = () => {
    if (select.disabled) {
      return;
    }
    if (openMenu && openMenu !== menu) {
      closeMenu(openMenu);
    }
    syncOptions(select, menu, valueEl, list);
    menu.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    list.hidden = false;
    openMenu = menu;
    const selected = list.querySelector(".portal-menu-option.is-selected");
    if (selected instanceof HTMLElement) {
      selected.focus();
    }
  };

  trigger.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (menu.classList.contains("is-open")) {
      closeMenu(menu);
    } else {
      open();
    }
  });

  trigger.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowDown" || ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      open();
    }
  });

  list.addEventListener("keydown", (ev) => {
    const options = Array.from(
      list.querySelectorAll(".portal-menu-option")
    ).filter((el) => el instanceof HTMLElement);
    const current = document.activeElement;
    const idx = options.indexOf(/** @type {HTMLElement} */ (current));
    if (ev.key === "Escape") {
      ev.preventDefault();
      closeMenu(menu);
      trigger.focus();
      return;
    }
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      const next = options[Math.min(options.length - 1, Math.max(0, idx) + 1)];
      next?.focus();
      return;
    }
    if (ev.key === "ArrowUp") {
      ev.preventDefault();
      const prev = options[Math.max(0, idx - 1)];
      prev?.focus();
      return;
    }
    if (ev.key === "Home") {
      ev.preventDefault();
      options[0]?.focus();
      return;
    }
    if (ev.key === "End") {
      ev.preventDefault();
      options[options.length - 1]?.focus();
    }
  });
}

/**
 * @param {ParentNode} [root]
 */
export function enhanceSelects(root = document) {
  root.querySelectorAll("select.portal-select").forEach((el) => {
    if (el instanceof HTMLSelectElement) {
      enhanceSelect(el);
    }
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("click", (ev) => {
    if (!openMenu) {
      return;
    }
    const target = ev.target;
    if (target instanceof Node && openMenu.contains(target)) {
      return;
    }
    closeOpenMenu();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      closeOpenMenu();
    }
  });
}
