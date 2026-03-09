const toggleButton = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");

if (toggleButton && nav) {
  toggleButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  });
}
