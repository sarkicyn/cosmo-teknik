const mastersByService = {
  Ресницы: ["Анна", "Мария"],
  "Косметологический массаж": ["София", "Елена"],
  Парикмахер: ["Виктория", "Алина"],
  Маникюр: ["Карина", "Диана"],
};

const serviceCards = document.querySelectorAll(".service-card");
const serviceSelect = document.querySelector("#service");
const masterSelect = document.querySelector("#master");
const bookingForm = document.querySelector("#booking-form");
const formError = document.querySelector("#form-error");
const confirmation = document.querySelector("#confirmation");
const dateInput = document.querySelector("#date");
const siteHeader = document.querySelector(".site-header");
const heroMedia = document.querySelector(".hero__media");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const formatDate = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const setSelectedCard = (serviceName) => {
  serviceCards.forEach((card) => {
    const isSelected = card.dataset.service === serviceName;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });
};

const updateMasters = (serviceName) => {
  const masters = mastersByService[serviceName] || [];

  masterSelect.innerHTML = '<option value="">Выберите специалиста</option>';

  masters.forEach((master) => {
    const option = document.createElement("option");
    option.value = master;
    option.textContent = master;
    masterSelect.append(option);
  });
};

const selectService = (serviceName) => {
  serviceSelect.value = serviceName;
  setSelectedCard(serviceName);
  updateMasters(serviceName);
  formError.textContent = "";
};

const updateScrollEffects = () => {
  const scrollY = window.scrollY;

  siteHeader.classList.toggle("is-scrolled", scrollY > 24);

  if (!motionQuery.matches && heroMedia) {
    const shift = Math.min(scrollY * 0.08, 34);
    heroMedia.style.setProperty("--hero-shift", `${shift}px`);
  }
};

const resetCardMotion = (card) => {
  card.style.setProperty("--tilt-x", "0deg");
  card.style.setProperty("--tilt-y", "0deg");
  card.style.setProperty("--shine-x", "50%");
  card.style.setProperty("--shine-y", "0%");
};

const addTiltMotion = (card) => {
  card.addEventListener("pointermove", (event) => {
    if (motionQuery.matches || event.pointerType === "touch") {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const tiltX = (x - 0.5) * 6;
    const tiltY = (0.5 - y) * 6;

    card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    card.style.setProperty("--shine-x", `${(x * 100).toFixed(1)}%`);
    card.style.setProperty("--shine-y", `${(y * 100).toFixed(1)}%`);
  });

  card.addEventListener("pointerleave", () => resetCardMotion(card));
  card.addEventListener("blur", () => resetCardMotion(card));
};

// Не даем выбрать дату записи в прошлом.
const today = new Date();
const timezoneSafeToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];
dateInput.min = timezoneSafeToday;

serviceCards.forEach((card) => {
  const chooseCard = () => selectService(card.dataset.service);

  addTiltMotion(card);

  card.addEventListener("click", chooseCard);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseCard();
    }
  });
});

document.querySelectorAll(".review-card").forEach(addTiltMotion);

window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);
updateScrollEffects();

serviceSelect.addEventListener("change", (event) => {
  const serviceName = event.target.value;
  setSelectedCard(serviceName);
  updateMasters(serviceName);
  formError.textContent = "";
});

document.querySelectorAll("[data-scroll-to]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(`#${button.dataset.scrollTo}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(bookingForm);
  const service = formData.get("service");
  const date = formData.get("date");
  const time = formData.get("time");
  const master = formData.get("master");

  if (!service || !date || !time || !master) {
    formError.textContent = "Пожалуйста, заполните все поля перед подтверждением.";
    confirmation.classList.remove("is-complete");
    return;
  }

  formError.textContent = "";
  confirmation.classList.add("is-complete");
  confirmation.style.animation = "none";
  confirmation.offsetHeight;
  confirmation.style.animation = "";
  confirmation.replaceChildren();

  const label = document.createElement("span");
  const title = document.createElement("h3");
  const message = document.createElement("p");

  label.className = "confirmation__label";
  label.textContent = "Заявка отправлена";
  title.textContent = `${service} - ${master}`;
  message.textContent = `Запись запрошена на ${formatDate(date)} в ${time}. Мы скоро свяжемся с вами, чтобы подтвердить визит.`;

  confirmation.append(label, title, message);
});

// Мягко проявляем секции, когда они попадают в область просмотра.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".section-reveal").forEach((section) => {
  revealObserver.observe(section);
});

selectService("Ресницы");
