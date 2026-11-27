/**
 * A plain-text code block that holds a terminal session shows its prompts and check marks in the accent, so the
 * commands are found at a glance. A block is a session when one of its lines starts with "$ "; any other
 * plain-text block is left as it is. Hexo has already escaped the text, so a line's content is HTML-safe here.
 * A session's figure also gets the class "session", which content.css gives a shorter height: a command's output
 * is read at a glance and scrolled for the rest.
 */

"use strict";

const BLOCK = /<figure class="highlight plaintext">[\s\S]*?<\/figure>/g;
const LINE = /<span class="line">([\s\S]*?)<\/span>(?=<br>|<\/pre>)/g;
const PROMPT = "$ ";
const OK = "✔";

function sessionLine(text) {
  if (text.startsWith(PROMPT)) {
    return `<span class="term-mark">$</span> ${text.slice(PROMPT.length)}`;
  }
  if (text.startsWith(OK)) {
    return `<span class="term-mark">${OK}</span>${text.slice(OK.length)}`;
  }
  return text;
}

function terminalBlock(block) {
  const code = block.indexOf('<td class="code">');
  if (code < 0 || !/<span class="line">\$ /.test(block.slice(code))) {
    return block;
  }
  const marked = block.slice(code).replace(LINE, (_, text) => `<span class="line">${sessionLine(text)}</span>`);
  const head = block.slice(0, code).replace('<figure class="highlight plaintext">', '<figure class="highlight plaintext session">');
  return head + marked;
}

hexo.extend.filter.register("after_post_render", function (data) {
  data.content = data.content.replace(BLOCK, terminalBlock);
  return data;
});
