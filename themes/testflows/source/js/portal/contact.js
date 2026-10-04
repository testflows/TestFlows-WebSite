/**
 * The contact form on /contact.html.
 *
 * Two steps: an email and a topic, then a company and a message. The message is
 * sent to the Machine API's /contact, which asks for the same proof-of-work as
 * sign-up; `contactSend` solves it. Nothing here is a secret, and nothing needs
 * to be: the work is what a request costs.
 */

import { contactSend } from "./api.js";

const MACHINE_TOPICS = ["Machine early access", "Machine product question"];

function markField(el, ok) {
  if (!el) return;
  el.classList.toggle("is-invalid", !ok);
  el.classList.toggle("is-valid", ok);
}

/** Step 1 → step 2: check the email and the topic, then show the rest. */
function continueForm(form) {
  const email = form.querySelector("#email");
  const subject = form.querySelector("#subject");
  const emailOk = Boolean(email && email.value.trim() && email.checkValidity());
  const subjectOk = Boolean(subject && subject.value);
  markField(email, emailOk);
  markField(subject, subjectOk);
  if (!emailOk || !subjectOk) {
    (emailOk ? subject : email).focus();
    return;
  }
  form.classList.add("is-expanded");
  const step2 = form.querySelector("#contact-step-2");
  step2.hidden = false;
  step2.style.display = "block";
  const company = form.querySelector("#company");
  const message = form.querySelector("#usecase");
  company.disabled = false;
  company.required = true;
  message.disabled = false;
  message.required = true;
  form.querySelector("#submit").disabled = false;
  form.querySelector("#contact-continue").classList.add("d-none");
  company.focus();
}

/** Machine enquiries are covered by the Machine privacy policy; everything else by the website's. */
function syncPrivacy(form) {
  const link = form.querySelector("#contact-privacy-link");
  const subject = form.querySelector("#subject");
  if (!link || !subject) return;
  link.setAttribute(
    "href",
    MACHINE_TOPICS.indexOf(subject.value) >= 0
      ? "/machine/legal/privacy-policy/"
      : "/legal/privacy-policy/"
  );
}

/** ?topic=machine (or an exact topic value) pre-selects the topic, e.g. from Machine CTAs. */
function prefillTopic(form) {
  const subject = form.querySelector("#subject");
  let wanted = new URLSearchParams(window.location.search).get("topic");
  if (!subject || !wanted) return;
  if (wanted === "machine") wanted = "Machine early access";
  const option = Array.prototype.find.call(subject.options, (o) => o.value === wanted);
  if (option) subject.value = option.value;
}

function setSending(form, sending) {
  form.querySelector("[role=submit]").classList.toggle("d-none", sending);
  form.querySelector("[role=processing]").classList.toggle("d-none", !sending);
  form.querySelector("#submit").disabled = sending;
}

async function submitForm(form) {
  if (!form.classList.contains("is-expanded")) {
    continueForm(form);
    return;
  }
  if (!form.checkValidity()) {
    const invalid = form.querySelector(":invalid");
    for (const id of ["#email", "#subject", "#company", "#usecase"]) {
      const el = form.querySelector(id);
      markField(el, el.checkValidity());
    }
    if (invalid) invalid.focus();
    return;
  }
  const email = form.querySelector("#email").value.trim();
  const failed = form.querySelector(".failed-submission");
  failed.classList.add("d-none");
  setSending(form, true);
  try {
    await contactSend({
      email,
      topic: form.querySelector("#subject").value,
      company: form.querySelector("#company").value.trim(),
      message: form.querySelector("#usecase").value.trim(),
      // Hidden from people; the API drops a message that has a value here.
      trap: form.querySelector("#contact-trap").value,
    });
  } catch (err) {
    failed.querySelector("span[role=error-message]").textContent =
      err && err.message ? err.message : "The message was not sent.";
    failed.classList.remove("d-none");
    setSending(form, false);
    return;
  }
  form.querySelector(".form-fields").classList.add("d-none");
  form.querySelector("span[role=contact-email]").textContent = email;
  form.querySelector(".successful-submission").classList.remove("d-none");
}

const form = document.querySelector("form.contact-us");
if (form) {
  prefillTopic(form);
  syncPrivacy(form);
  form.querySelector("#subject").addEventListener("change", () => syncPrivacy(form));
  form.querySelector("#contact-continue").addEventListener("click", (e) => {
    e.preventDefault();
    continueForm(form);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitForm(form);
  });
}
