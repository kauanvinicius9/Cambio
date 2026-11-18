export function initThemeToggle(toggleButtonId: string): void {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "dark";

    root.setAttribute("data-theme", savedTheme);

    const button = document.getElementById(toggleButtonId);
    if (button) {
        button.addEventListener("click", () => {
            const currentTheme = root.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";

            root.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }
}