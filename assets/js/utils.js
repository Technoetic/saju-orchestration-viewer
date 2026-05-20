export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function escapeHtml(s) {
  return (s ?? "").toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escSvg(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function wrapSvgText(text, maxChars, x, startY, lineH, fontSize, fill) {
  if (!text) return "";
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const tryStr = cur ? cur + " " + w : w;
    if (tryStr.length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = tryStr;
    }
  }
  if (cur) lines.push(cur);
  return lines.map((line, i) =>
    `<text x="${x}" y="${startY + i * lineH}" font-size="${fontSize}" fill="${fill}">${escSvg(line)}</text>`
  ).join("");
}
