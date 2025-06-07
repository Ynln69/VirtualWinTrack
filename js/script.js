document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname.split("/").pop();

  // Page specific logic
  if (currentPath === "index.html" || currentPath === "") {
    loadHomePageContent();
    loadHotelCardsHome();
  } else if (currentPath === "hotel-details.html") {
    loadHotelDetailsPage();
    setupModal();
  } else if (currentPath === "ideas.html") {
    loadPromotionsIdeasPage();
  }
});

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

function displayErrorMessage(containerElementOrSelector, message) {
  let container;
  if (typeof containerElementOrSelector === "string") {
    container = document.querySelector(containerElementOrSelector);
  } else {
    container = containerElementOrSelector;
  }

  if (container) {
    container.innerHTML = `<p class="error-message">${message}</p>`;
  } else {
    console.error(
      "Error message container not found:",
      containerElementOrSelector
    );
  }
}

// Home Page: Load dynamic sections (About, Why Us, FAQ)
async function loadHomePageContent() {
  const content = await fetchData("data/homePageContent.json");
  if (!content) {
    displayErrorMessage("#about-us-section", "Could not load page content.");
    displayErrorMessage("#why-choose-us-section", "");
    displayErrorMessage("#faq-section", "");
    return;
  }

  // Render About Us
  const aboutSection = document.getElementById("about-us-section");
  if (aboutSection && content.aboutUs) {
    const paragraphsHtml = content.aboutUs.paragraphs
      .map((p) => `<p>${p}</p>`)
      .join("");
    aboutSection.innerHTML = `
      <h2>${content.aboutUs.title}</h2>
      <div class="about-us-content">${paragraphsHtml}</div>
    `;
  }

  // Render Why Choose Us
  const whyChooseSection = document.getElementById("why-choose-us-section");
  if (whyChooseSection && content.whyChooseUs) {
    const itemsHtml = content.whyChooseUs.items
      .map(
        (item) => `
      <div class="why-choose-item">
        <img src="${item.icon}" alt="${item.title}" class="why-choose-icon">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `
      )
      .join("");
    whyChooseSection.innerHTML = `
      <h2>${content.whyChooseUs.title}</h2>
      <div class="why-choose-grid">${itemsHtml}</div>
    `;
  }

  // Render FAQ
  const faqSection = document.getElementById("faq-section");
  if (faqSection && content.faq) {
    const itemsHtml = content.faq.items
      .map(
        (item) => `
      <details class="faq-item">
        <summary class="faq-question">${item.question}</summary>
        <div class="faq-answer">
          <p>${item.answer}</p>
        </div>
      </details>
    `
      )
      .join("");
    faqSection.innerHTML = `
      <h2>${content.faq.title}</h2>
      <div class="faq-list">${itemsHtml}</div>
    `;
  }
}

// Home Page: Load Hotel Cards
async function loadHotelCardsHome() {
  const container = document.getElementById("hotel-cards-container");
  if (!container) return;

  const hotels = await fetchData("data/hotelsData.json");
  if (hotels && hotels.length > 0) {
    container.innerHTML = ""; 
    hotels.forEach((hotel) => {
      const card = document.createElement("div");
      card.className = "hotel-card-home";
      card.innerHTML = `
          <img src="${
            hotel.photo || "/placeholder.svg?width=400&height=300"
          }" alt="${hotel.name}">
          <div class="hotel-card-content-home">
              <h3>${hotel.name}</h3>
              <p>${hotel.description.substring(0, 100)}...</p>
              <a href="hotel-details.html?hotelId=${hotel.id}">View Details</a>
          </div>
      `;
      container.appendChild(card);
    });
  } else {
    displayErrorMessage(
      container,
      "Could not load hotels. Please try again later."
    );
  }
}

// Hotel Details Page: Load Hotel Details and Events
async function loadHotelDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const hotelId = params.get("hotelId");

  const showcaseContainer = document.getElementById("hotel-showcase-container");
  const galleryAside = document.getElementById("hotel-gallery-aside");
  const descriptionMain = document.getElementById("hotel-description-main");
  const eventsListContainer = document.getElementById("events-list-container");

  if (!hotelId) {
    displayErrorMessage(showcaseContainer, "Hotel ID not found.");
    if (galleryAside) galleryAside.innerHTML = "";
    if (descriptionMain) descriptionMain.innerHTML = "";
    if (eventsListContainer) eventsListContainer.innerHTML = "";
    return;
  }

  // Load Hotel Info
  const hotelsData = await fetchData("data/hotelsData.json");
  if (!hotelsData) {
    displayErrorMessage(showcaseContainer, "Could not load hotel data.");
    return;
  }
  const hotel = hotelsData.find((h) => h.id.toString() === hotelId);

  if (hotel) {
    showcaseContainer.innerHTML = `
      <h1>${hotel.name}</h1>
      <img src="${
        hotel.photo || "/placeholder.svg?width=1200&height=500"
      }" alt="${hotel.name}" class="hotel-main-image-details">
    `;
    descriptionMain.innerHTML = `<h2>About ${hotel.name}</h2><p>${
      hotel.fullDescription || hotel.description
    }</p>`;

    if (hotel.gallery && hotel.gallery.length > 0) {
      galleryAside.innerHTML = `<h3>Photo Gallery</h3><div class="gallery-thumbnails">
        ${hotel.gallery
          .map(
            (imgUrl) =>
              `<img src="${imgUrl}" alt="Gallery image for ${hotel.name}" onclick="updateMainImage('${imgUrl}', '${hotel.name}')">`
          )
          .join("")}
      </div>`;
    } else {
      galleryAside.innerHTML =
        "<h3>Photo Gallery</h3><p>No additional photos available.</p>";
    }
  } else {
    displayErrorMessage(showcaseContainer, "Hotel details not found.");
    if (galleryAside) galleryAside.innerHTML = "";
    if (descriptionMain) descriptionMain.innerHTML = "";
  }

  // Load Events
  const allEventsData = await fetchData("data/eventsData.json");
  if (!allEventsData) {
    displayErrorMessage(eventsListContainer, "Could not load events data.");
    return;
  }

  const hotelEvents = allEventsData[hotelId];
  if (hotelEvents && hotelEvents.length > 0) {
    eventsListContainer.innerHTML = ""; 
    hotelEvents.forEach((event) => {
      const eventItem = document.createElement("div");
      eventItem.className = "event-item-details";
      eventItem.setAttribute("data-event-id", event.id);
      eventItem.innerHTML = `
          <h4>${event.name}</h4>
          <p class="event-date-details">Date: ${new Date(
            event.date
          ).toLocaleDateString()}</p>
          <p>${event.description}</p>
      `;
      eventItem.addEventListener("click", () => openEventModal(event));
      eventsListContainer.appendChild(eventItem);
    });
  } else {
    eventsListContainer.innerHTML =
      "<p>No events scheduled for this hotel at the moment.</p>";
  }
}

// Function to update main image on hotel details page when a thumbnail is clicked
function updateMainImage(newImageUrl, hotelName) {
  const mainImage = document.querySelector(".hotel-main-image-details");
  if (mainImage) {
    mainImage.src = newImageUrl;
    mainImage.alt = `Displaying ${hotelName} gallery image`;
  }
}

// Modal Logic (consistent)
let modal, closeButton;
function setupModal() {
  modal = document.getElementById("event-modal");
  closeButton = document.querySelector(".modal .close-button");
  if (closeButton) {
    closeButton.onclick = () => (modal.style.display = "none");
  }
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
}
function openEventModal(event) {
  const modalBody = document.getElementById("modal-body");
  if (modal && modalBody) {
    modalBody.innerHTML = `
        <h3>${event.name}</h3>
        <p><strong>Date:</strong> ${new Date(
          event.date
        ).toLocaleDateString()}</p>
        <p>${event.fullDescription || event.description}</p>
    `;
    modal.style.display = "block";
  }
}

// Ideas Page: Load Promotions
async function loadPromotionsIdeasPage() {
  const container = document.getElementById("promotions-container");
  if (!container) return;

  const promotions = await fetchData("data/promotionsData.json");
  if (promotions && promotions.length > 0) {
    container.innerHTML = ""; 
    promotions.forEach((promo) => {
      const promoCard = document.createElement("article"); 
      promoCard.className = "idea-card"; 
      promoCard.innerHTML = `
          <div class="idea-card-image-wrapper">
              <img src="${
                promo.image || "/placeholder.svg?width=600&height=400"
              }" alt="${promo.title || "Promotion"}" class="idea-card-image">
          </div>
          <div class="idea-card-content">
              <h3>${promo.title || "Special Offer"}</h3>
              <p>${promo.description}</p>
              <div class="idea-card-footer">
                  ${
                    promo.hotelLogo
                      ? `<img src="${
                          promo.hotelLogo ||
                          "/placeholder.svg?width=100&height=50"
                        }" alt="Hotel Logo" class="idea-card-logo">`
                      : "<div></div>"
                  }
                  ${
                    promo.link
                      ? `<a href="${promo.link}" target="_blank" rel="noopener noreferrer" class="idea-card-link">Learn More</a>`
                      : ""
                  }
              </div>
          </div>
      `;
      container.appendChild(promoCard);
    });
  } else {
    displayErrorMessage(
      container,
      "Could not load holiday ideas. Please try again later."
    );
  }
}
