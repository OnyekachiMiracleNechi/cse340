const form = document.querySelector("#updateForm")
if (form) {
  form.addEventListener("change", function () {
    const updateBtn = document.querySelector("button[type='submit']")
    const hint = document.querySelector("#updateHint")
    if (updateBtn) updateBtn.removeAttribute("disabled")
    if (hint) hint.style.display = "none"
  })
}
