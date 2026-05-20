import { API_BASE } from "../config.js";

export class ApiClient {
  constructor(base = API_BASE) {
    this.base = base;
  }

  async getJson(path) {
    const res = await fetch(this.base + path);
    return res.json();
  }

  async postJson(path, body) {
    const res = await fetch(this.base + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async postRaw(path, body) {
    const res = await fetch(this.base + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return { _raw: txt }; }
  }
}
