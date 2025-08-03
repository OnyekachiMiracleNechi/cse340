const form = document.querySelector("#editInventoryForm")
if (form) {
  form.addEventListener("change", function () {
    const updateBtn = document.querySelector("button[type='submit']")
    const hint = document.querySelector("#updateHint")
    if (updateBtn) updateBtn.removeAttribute("disabled")
    if (hint) hint.style.display = "none"
  })
}


// ✅ For Update Account form
const updateForm = document.querySelector("#updateAccountForm")
if (updateForm) {
  updateForm.addEventListener("change", function () {
    const updateBtn = updateForm.querySelector("button[type='submit']")
    const hint = document.querySelector("#updateHint")
    if (updateBtn) updateBtn.removeAttribute("disabled")
    if (hint) hint.style.display = "none"
  })
}