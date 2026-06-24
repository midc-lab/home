'use strict';

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------
  // 1. Dark Mode Toggle
  // -------------------------------------------------
  const themeSwitch = document.getElementById("theme-switch");
  const body = document.body;

  // Check user's previous theme preference
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme) {
    body.classList.add(currentTheme);
    if (themeSwitch) {
        themeSwitch.checked = currentTheme === "dark-mode";
    }
  }

  themeSwitch?.addEventListener("change", () => {
    if (themeSwitch.checked) {
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark-mode");
    } else {
      body.classList.remove("dark-mode");
      localStorage.removeItem("theme");
    }
  });

  // -------------------------------------------------
  // 2. Scroll Reveal Animations
  // -------------------------------------------------
  // Added '.publication-item' so your new manually added projects also animate in
  const revealElements = document.querySelectorAll(
    ".hero-section, .about-section, .project-highlights, .publication-item"
  );

  const revealOnScroll = () => {
    revealElements.forEach((element) => {
      const windowHeight = window.innerHeight;
      const revealTop = element.getBoundingClientRect().top;
      const revealPoint = 100; // Triggers slightly earlier for a smoother feel

      if (revealTop < windowHeight - revealPoint) {
        element.classList.add("active");
      } else {
        // Optional: Remove the else block if you only want them to animate in once
        element.classList.remove("active");
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // Initial check on page load
});