export class EdgeFlow {
  static highlight(ids, on) {
    ids.forEach((id) => {
      const e = document.getElementById(id);
      if (e) e.classList.toggle("flowing", !!on);
    });
  }
}
