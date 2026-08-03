/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Shared portal modals — confirm, text prompt, and billing plan picker. */

/**
 * @typedef {{
 *   title: string,
 *   body: string,
 *   confirmLabel?: string,
 *   danger?: boolean,
 *   dismissOnly?: boolean,
 * }} ConfirmOptions
 */

/**
 * @typedef {{
 *   title: string,
 *   body: string,
 *   label: string,
 *   placeholder?: string,
 *   initial?: string,
 *   confirmLabel?: string,
 *   validate?: (value: string) => string|null,
 * }} PromptOptions
 */

/**
 * @typedef {{ value: string, label: string }} PlanOption
 */

/**
 * @typedef {{
 *   title: string,
 *   note?: string,
 *   options: PlanOption[],
 *   selected?: string,
 * }} PlanPickOptions
 */

/** True while a confirm or plan-pick dialog is open (blocks stacking). */
let modalOpen = false;

/** @returns {boolean} */
export function isModalOpen() {
  return modalOpen;
}

/**
 * Keep Tab focus inside an open modal — wrap at the ends so it can't escape to
 * the page behind. @param {HTMLElement} root @param {KeyboardEvent} ev
 */
function trapTab(root, ev) {
  const focusable = root.querySelectorAll(
    'button:not([disabled]):not([hidden]), input:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = /** @type {HTMLElement} */ (focusable[0]);
  const last = /** @type {HTMLElement} */ (focusable[focusable.length - 1]);
  if (ev.shiftKey && document.activeElement === first) {
    ev.preventDefault();
    last.focus();
  } else if (!ev.shiftKey && document.activeElement === last) {
    ev.preventDefault();
    first.focus();
  }
}

/**
 * Shared open/close wiring for the confirm modal shell.
 * @returns {{
 *   root: HTMLElement,
 *   title: HTMLElement,
 *   body: HTMLElement,
 *   field: HTMLElement,
 *   fieldLabel: HTMLElement,
 *   input: HTMLInputElement,
 *   error: HTMLElement,
 *   okBtn: HTMLButtonElement,
 *   cancelBtn: HTMLButtonElement,
 *   prevFocus: HTMLElement|null,
 * }|null}
 */
function confirmShell() {
  const root = document.getElementById("portal-confirm");
  const title = document.getElementById("portal-confirm-title");
  const body = document.getElementById("portal-confirm-body");
  const field = document.getElementById("portal-confirm-field");
  const fieldLabel = document.getElementById("portal-confirm-field-label");
  const input = /** @type {HTMLInputElement|null} */ (
    document.getElementById("portal-confirm-input")
  );
  const error = document.getElementById("portal-confirm-error");
  const okBtn = /** @type {HTMLButtonElement|null} */ (
    document.getElementById("portal-confirm-ok")
  );
  const cancelBtn = /** @type {HTMLButtonElement|null} */ (
    document.getElementById("portal-confirm-cancel")
  );
  if (
    !root ||
    !title ||
    !body ||
    !field ||
    !fieldLabel ||
    !input ||
    !error ||
    !okBtn ||
    !cancelBtn
  ) {
    return null;
  }
  const prevFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  return {
    root,
    title,
    body,
    field,
    fieldLabel,
    input,
    error,
    okBtn,
    cancelBtn,
    prevFocus,
  };
}

/**
 * @param {ReturnType<typeof confirmShell>} shell
 * @param {() => void} onCancel
 * @param {(ev: KeyboardEvent) => void} onKey
 */
function bindConfirmChrome(shell, onCancel, onKey) {
  if (!shell) return;
  shell.cancelBtn.addEventListener("click", onCancel);
  shell.root.querySelectorAll("[data-portal-confirm-dismiss]").forEach((el) => {
    el.addEventListener("click", onCancel);
  });
  shell.root.addEventListener("keydown", onKey);
}

/**
 * @param {ReturnType<typeof confirmShell>} shell
 * @param {() => void} onCancel
 * @param {(ev: KeyboardEvent) => void} onKey
 * @param {() => void} onOk
 */
function unbindConfirmChrome(shell, onCancel, onKey, onOk) {
  if (!shell) return;
  shell.okBtn.removeEventListener("click", onOk);
  shell.cancelBtn.removeEventListener("click", onCancel);
  shell.root.removeEventListener("keydown", onKey);
  shell.root.querySelectorAll("[data-portal-confirm-dismiss]").forEach((el) => {
    el.removeEventListener("click", onCancel);
  });
  shell.okBtn.className = "btn btn-primary";
  shell.cancelBtn.hidden = false;
  shell.field.hidden = true;
  shell.input.hidden = true;
  shell.error.hidden = true;
  shell.error.textContent = "";
  shell.input.value = "";
  shell.input.removeAttribute("aria-invalid");
}

/**
 * @param {ConfirmOptions} opts
 * @returns {Promise<boolean>}
 */
export function runConfirm(opts) {
  return new Promise((resolve) => {
    if (modalOpen) {
      resolve(false);
      return;
    }
    const shell = confirmShell();
    if (!shell) {
      resolve(false);
      return;
    }

    modalOpen = true;
    let settled = false;
    /** @param {boolean} ok */
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      modalOpen = false;
      shell.root.hidden = true;
      shell.root.setAttribute("aria-hidden", "true");
      unbindConfirmChrome(shell, onCancel, onKey, onOk);
      if (shell.prevFocus && document.contains(shell.prevFocus)) {
        shell.prevFocus.focus();
      }
      resolve(ok);
    };

    const onOk = () => finish(true);
    const onCancel = () => finish(false);
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        finish(false);
      } else if (ev.key === "Tab") {
        trapTab(shell.root, ev);
      }
    };

    shell.title.textContent = opts.title;
    shell.body.textContent = opts.body;
    shell.field.hidden = true;
    shell.input.hidden = true;
    shell.error.hidden = true;
    shell.error.textContent = "";
    shell.okBtn.textContent = opts.confirmLabel || "Confirm";
    shell.okBtn.className = opts.danger
      ? "btn btn-ghost portal-btn-danger"
      : "btn btn-primary";
    shell.cancelBtn.hidden = Boolean(opts.dismissOnly);

    shell.root.hidden = false;
    shell.root.setAttribute("aria-hidden", "false");
    shell.okBtn.addEventListener("click", onOk);
    bindConfirmChrome(shell, onCancel, onKey);
    // Danger: focus Cancel so Enter doesn't fire the destructive action.
    // dismissOnly / normal: focus OK.
    (opts.danger && !opts.dismissOnly ? shell.cancelBtn : shell.okBtn).focus();
  });
}

/**
 * Text prompt on the confirm modal shell. Returns trimmed value, or null if cancelled.
 * @param {PromptOptions} opts
 * @returns {Promise<string|null>}
 */
export function runPrompt(opts) {
  return new Promise((resolve) => {
    if (modalOpen) {
      resolve(null);
      return;
    }
    const shell = confirmShell();
    if (!shell) {
      resolve(null);
      return;
    }

    modalOpen = true;
    let settled = false;
    /** @param {string|null} value */
    const finish = (value) => {
      if (settled) return;
      settled = true;
      modalOpen = false;
      shell.root.hidden = true;
      shell.root.setAttribute("aria-hidden", "true");
      unbindConfirmChrome(shell, onCancel, onKey, onOk);
      shell.input.removeEventListener("keydown", onInputKey);
      if (shell.prevFocus && document.contains(shell.prevFocus)) {
        shell.prevFocus.focus();
      }
      resolve(value);
    };

    const showError = (msg) => {
      shell.error.hidden = !msg;
      shell.error.textContent = msg || "";
      shell.input.setAttribute("aria-invalid", msg ? "true" : "false");
    };

    const onOk = () => {
      const value = shell.input.value.trim();
      const err = opts.validate ? opts.validate(value) : null;
      if (err) {
        showError(err);
        shell.input.focus();
        return;
      }
      finish(value);
    };
    const onCancel = () => finish(null);
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        finish(null);
      } else if (ev.key === "Tab") {
        trapTab(shell.root, ev);
      }
    };
    const onInputKey = (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        onOk();
      }
    };

    shell.title.textContent = opts.title;
    shell.body.textContent = opts.body;
    shell.field.hidden = false;
    shell.input.hidden = false;
    shell.fieldLabel.textContent = opts.label;
    shell.input.value = opts.initial || "";
    shell.input.placeholder = opts.placeholder || "";
    showError("");
    shell.okBtn.textContent = opts.confirmLabel || "Continue";
    shell.okBtn.className = "btn btn-primary";
    shell.cancelBtn.hidden = false;

    shell.root.hidden = false;
    shell.root.setAttribute("aria-hidden", "false");
    shell.okBtn.addEventListener("click", onOk);
    shell.input.addEventListener("keydown", onInputKey);
    bindConfirmChrome(shell, onCancel, onKey);
    shell.input.focus();
    shell.input.select();
  });
}

/**
 * @param {PlanPickOptions} opts
 * @returns {Promise<string|null>} selected tier, or null if cancelled
 */
export function runPlanPick(opts) {
  return new Promise((resolve) => {
    if (modalOpen) {
      resolve(null);
      return;
    }
    const root = document.getElementById("portal-billing-plan");
    const title = document.getElementById("portal-billing-plan-title");
    const note = document.getElementById("portal-billing-plan-note");
    const fieldset = document.getElementById("portal-billing-plan-options");
    const okBtn = /** @type {HTMLButtonElement|null} */ (
      document.getElementById("portal-billing-plan-ok")
    );
    const cancelBtn = /** @type {HTMLButtonElement|null} */ (
      document.getElementById("portal-billing-plan-cancel")
    );
    if (!root || !title || !note || !fieldset || !okBtn || !cancelBtn) {
      resolve(null);
      return;
    }

    modalOpen = true;
    const prevFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    let settled = false;
    /** @param {string|null} value */
    const finish = (value) => {
      if (settled) return;
      settled = true;
      modalOpen = false;
      root.hidden = true;
      root.setAttribute("aria-hidden", "true");
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      root.removeEventListener("keydown", onKey);
      root.querySelectorAll("[data-portal-billing-plan-dismiss]").forEach((el) => {
        el.removeEventListener("click", onCancel);
      });
      fieldset.replaceChildren();
      if (prevFocus && document.contains(prevFocus)) {
        prevFocus.focus();
      }
      resolve(value);
    };

    const onOk = () => {
      const checked = /** @type {HTMLInputElement|null} */ (
        fieldset.querySelector('input[name="portal-billing-plan"]:checked')
      );
      if (!checked) return;
      finish(checked.value);
    };
    const onCancel = () => finish(null);
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        finish(null);
      } else if (ev.key === "Tab") {
        trapTab(root, ev);
      }
    };

    title.textContent = opts.title;
    if (opts.note) {
      note.hidden = false;
      note.textContent = opts.note;
    } else {
      note.hidden = true;
      note.textContent = "";
    }

    fieldset.replaceChildren();
    const selected =
      opts.selected && opts.options.some((o) => o.value === opts.selected)
        ? opts.selected
        : opts.options[0]?.value || "";
    /** @type {HTMLInputElement|null} */
    let selectedInput = null;
    for (const opt of opts.options) {
      const label = document.createElement("label");
      label.className = "portal-plan-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "portal-billing-plan";
      input.value = opt.value;
      input.checked = opt.value === selected;
      if (input.checked) selectedInput = input;
      const text = document.createElement("span");
      text.textContent = opt.label;
      label.append(input, text);
      fieldset.append(label);
    }

    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    root.querySelectorAll("[data-portal-billing-plan-dismiss]").forEach((el) => {
      el.addEventListener("click", onCancel);
    });
    root.addEventListener("keydown", onKey);
    (selectedInput || okBtn).focus();
  });
}
