(function () {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");

  function setNav(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Fermer" : "Menu";
    document.body.classList.toggle("nav-open", open);
    if (open) {
      const first = nav.querySelector("a");
      if (first) first.focus();
    }
  }

  toggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNav(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setNav(false);
      toggle.focus();
    }
  });

  const links = [...nav.querySelectorAll('a[href^="#"]')].filter((link) => !link.classList.contains("nav-mobile-cta"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  ["clarte", "contact"].forEach((id) => {
    const section = document.getElementById(id);
    if (section) sections.push(section);
  });

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        links.forEach((link) => {
          const on = link.getAttribute("href") === "#" + visible.target.id;
          if (on) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0.1, 0.25, 0.5] }
    );
    sections.forEach((section) => spy.observe(section));
  }

  const steps = [...document.querySelectorAll(".step")];
  const poses = [...document.querySelectorAll(".pose")];
  const miniTitle = document.getElementById("mini-title");
  const miniText = document.getElementById("mini-text");
  const poseCopy = {
    appel: ["On discute", "L'appel qui cadre l'offre, le client idéal, l'objectif."],
    setup: ["On met en place", "Campagnes, pages et qualification, branchées avant le premier prospect."],
    lead: ["Les prospects arrivent", "Un flux régulier. Tu contactes, tu vends, tu sers."],
    grow: ["On optimise", "Chaque mois, le coût par prospect et la qualité."],
  };

  function activateStep(step) {
    const pose = step.dataset.pose;
    steps.forEach((item) => item.classList.toggle("is-active", item === step));
    poses.forEach((item) => item.classList.toggle("is-on", item.dataset.pose === pose));
    const copy = poseCopy[pose];
    if (copy && miniTitle && miniText) {
      miniTitle.textContent = copy[0];
      miniText.textContent = copy[1];
    }
  }

  if (steps.length && "IntersectionObserver" in window) {
    const stepObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) activateStep(visible.target);
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: [0.25, 0.5, 0.7] }
    );
    steps.forEach((step) => stepObserver.observe(step));
  }

  const form = document.getElementById("demande");
  const thanks = document.getElementById("thanks");
  const count = document.getElementById("form-count");
  const KEY = "leadboy.demandes";
  if (!form) return;

  const fields = [...form.querySelectorAll("input, textarea")];

  function updateCount() {
    const done = fields.filter((field) => field.value.trim()).length;
    count.textContent = done + " / " + fields.length;
  }

  function messageFor(field) {
    const value = field.value.trim();
    if (!value) {
      const prompts = {
        nom: "Écris ton nom.",
        entreprise: "Écris le nom de ton entreprise.",
        service: "Dis-nous le service que tu vends.",
        client: "Décris ton client idéal, même en une phrase.",
        objectif: "Dis-nous l'objectif que tu vises.",
        courriel: "Entre un courriel valide.",
        telephone: "Entre un numéro où on peut te joindre.",
      };
      return prompts[field.name] || "Ce champ est requis.";
    }
    if (field.name === "courriel" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Ce courriel ne semble pas valide.";
    }
    if (field.name === "telephone" && value.replace(/\D/g, "").length < 10) {
      return "Entre un numéro complet, avec l'indicatif régional.";
    }
    return "";
  }

  function showError(field, text) {
    const slot = field.parentElement.querySelector(".err");
    if (text) {
      field.setAttribute("aria-invalid", "true");
      if (slot) slot.textContent = text;
    } else {
      field.removeAttribute("aria-invalid");
      if (slot) slot.textContent = "";
    }
  }

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      updateCount();
      if (field.getAttribute("aria-invalid") === "true") showError(field, messageFor(field));
    });
  });
  updateCount();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let first = null;
    fields.forEach((field) => {
      const problem = messageFor(field);
      showError(field, problem);
      if (problem && !first) first = field;
    });
    if (first) {
      first.focus();
      return;
    }

    const entry = { id: crypto.randomUUID(), at: new Date().toISOString() };
    fields.forEach((field) => {
      entry[field.name] = field.value.trim();
    });

    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      saved.push(entry);
      localStorage.setItem(KEY, JSON.stringify(saved));
    } catch (error) {
      const slot = form.querySelector(".fine");
      if (slot) slot.textContent = "Impossible d'enregistrer dans ce navigateur. Garde tes réponses sous la main.";
      return;
    }

    const labels = {
      nom: "Nom",
      entreprise: "Entreprise",
      service: "Service",
      client: "Client idéal",
      objectif: "Objectif",
      courriel: "Courriel",
      telephone: "Téléphone",
    };
    const recap = document.getElementById("thanks-recap");
    recap.replaceChildren();
    Object.keys(labels).forEach((key) => {
      const dt = document.createElement("dt");
      dt.textContent = labels[key];
      const dd = document.createElement("dd");
      dd.textContent = entry[key];
      recap.append(dt, dd);
    });
    document.getElementById("thanks-name").textContent = entry.nom.split(" ")[0];
    form.hidden = true;
    thanks.hidden = false;
    thanks.querySelector("h3").focus();
  });

  document.getElementById("thanks-reset").addEventListener("click", () => {
    thanks.hidden = true;
    form.hidden = false;
    fields[0].focus();
  });
})();
