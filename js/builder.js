// Завантаження HTML частин для header і footer
const loadHTML = (url, selector, callback) => {
  fetch(url)
    .then((response) => response.text())
    .then((html) => {
      document.querySelector(selector).innerHTML = html;
      if (callback) callback(); // Виклик ініціалізації після вставки HTML
    });
};

// Ініціалізація загальних елементів після завантаження хедера
const initializeHeader = () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuToggle.classList.toggle("active");
      const isExpanded = navLinks.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", isExpanded);
    });
  }

  // Активна навігація
  const currentPath = window.location.pathname.split("/").pop();
  const navItems = document.querySelectorAll(".nav-links a");
  navItems.forEach((link) => {
    if (
      link.getAttribute("href") === currentPath ||
      (currentPath === "" && link.getAttribute("href") === "home.html")
    ) {
      link.classList.add("active");
    }
  });
};

// Ініціалізація футера після завантаження футера
const initializeFooter = () => {
  const currentYearSpan = document.getElementById("current-year");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
};

// Викликаємо завантаження
loadHTML("header.html", ".header", initializeHeader);
loadHTML("footer.html", ".footer", initializeFooter);
