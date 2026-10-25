// Copy-email button
document.getElementById("copy").addEventListener("click", (e) => {
  const btn = e.currentTarget;
  const email = document.getElementById("email");
  const done = () => { btn.textContent = "Copied"; setTimeout(() => (btn.textContent = "Copy email"), 1600); };
  const select = () => {
    const range = document.createRange();
    range.selectNodeContents(email);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    btn.textContent = "Press Ctrl+C";
  };
  try { navigator.clipboard.writeText(email.textContent).then(done, select); } catch { select(); }
});

// If a demo video file hasn't been added yet, show which file name to drop in.
document.querySelectorAll(".video video").forEach((video) => {
  const showMissing = () => {
    const thumb = video.parentElement;
    if (thumb.classList.contains("missing")) return;
    thumb.classList.add("missing");
    const note = document.createElement("p");
    note.className = "missing-note";
    note.innerHTML = `Video coming soon<code>${video.getAttribute("src")}</code>`;
    thumb.appendChild(note);
  };
  video.addEventListener("error", showMissing);
  if (video.error) showMissing();
});
