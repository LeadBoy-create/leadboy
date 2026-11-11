(function () {
  const DURATION = 3400;
  const BEATS = [
    { n: "01", title: "Un nouveau prospect" },
    { n: "02", title: "L'appel" },
    { n: "03", title: "Rendez-vous fixé" },
    { n: "04", title: "La présentation" },
    { n: "05", title: "Marché conclu" },
    { n: "06", title: "Ça grandit" },
  ];

  const stage = document.getElementById("stage");
  if (!stage) return;

  const groups = [...stage.querySelectorAll(".beat")];
  const tabs = [...stage.querySelectorAll('[role="tab"]')];
  const capIndex = document.getElementById("cap-index");
  const capTitle = document.getElementById("cap-title");
  const status = document.getElementById("cap-status");
  const playBtn = document.getElementById("play");
  const iconPause = playBtn.querySelector(".icon-pause");
  const iconPlay = playBtn.querySelector(".icon-play");
  const reduce = document.documentElement.classList.contains("reduce");

  let index = 0;
  let playing = !reduce;
  let onScreen = true;
  let timer = 0;
  let acc = 0;
  let locked = false;

  stage.style.setProperty("--beat", DURATION + "ms");

  function paint(user) {
    const beat = BEATS[index];
    capIndex.textContent = beat.n;
    capTitle.textContent = beat.title;
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    if (user && status) status.textContent = beat.n + " " + beat.title;
  }

  function restartBar() {
    const run = playing && onScreen && !document.hidden && !reduce;
    stage.classList.remove("is-playing");
    void stage.offsetWidth;
    stage.classList.toggle("is-playing", run);
  }

  function syncTimer() {
    window.clearTimeout(timer);
    const run = playing && onScreen && !document.hidden && !reduce;
    if (run) timer = window.setTimeout(() => show(index + 1, 1, false), DURATION);
    restartBar();
  }

  function show(next, dir, user) {
    const count = groups.length;
    const prev = index;
    index = ((next % count) + count) % count;
    const back = dir < 0;
    groups.forEach((group) => {
      group.classList.remove("is-on", "is-out", "is-out-right", "from-left", "prep");
    });
    if (prev !== index) {
      groups[prev].classList.add(back ? "is-out-right" : "is-out");
    }
    const enter = groups[index];
    enter.classList.add("prep");
    if (back) enter.classList.add("from-left");
    void enter.getBoundingClientRect();
    enter.classList.remove("prep", "from-left");
    enter.classList.add("is-on");
    paint(user);
    syncTimer();
  }

  function setPlaying(next) {
    playing = next && !reduce;
    playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    playBtn.setAttribute("aria-label", playing ? "Mettre le scénario en pause" : "Lire le scénario");
    iconPause.hidden = !playing;
    iconPlay.hidden = playing;
    syncTimer();
  }

  document.getElementById("next").addEventListener("click", () => show(index + 1, 1, true));
  document.getElementById("prev").addEventListener("click", () => show(index - 1, -1, true));
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => show(i, i >= index ? 1 : -1, true));
  });
  playBtn.addEventListener("click", () => setPlaying(!playing));

  stage.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key === "ArrowRight") {
      event.preventDefault();
      show(index + 1, 1, true);
    } else if (key === "ArrowLeft") {
      event.preventDefault();
      show(index - 1, -1, true);
    } else if (key === "Home") {
      event.preventDefault();
      show(0, -1, true);
    } else if (key === "End") {
      event.preventDefault();
      show(groups.length - 1, 1, true);
    } else if ((key === " " || key === "Spacebar") && event.target === stage) {
      event.preventDefault();
      setPlaying(!playing);
    }
  });

  stage.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    if (!event.target.closest(".film")) return;
    stage.focus({ preventScroll: true });
    show(index + 1, 1, true);
  });

  stage.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const down = event.deltaY > 0;
      const atEnd = (down && index === groups.length - 1) || (!down && index === 0);
      if (atEnd) return;
      event.preventDefault();
      acc += event.deltaY;
      if (locked || Math.abs(acc) < 70) return;
      const dir = acc > 0 ? 1 : -1;
      acc = 0;
      locked = true;
      show(index + dir, dir, true);
      window.setTimeout(() => {
        locked = false;
      }, 460);
    },
    { passive: false }
  );

  let pointer = null;
  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    pointer = { x: event.clientX, y: event.clientY };
  });
  stage.addEventListener("pointerup", (event) => {
    if (!pointer) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    const dir = dx < 0 ? 1 : -1;
    show(index + dir, dir, true);
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      syncTimer();
    },
    { threshold: 0.35 }
  );
  observer.observe(stage);

  document.addEventListener("visibilitychange", syncTimer);

  const params = new URLSearchParams(location.search);
  const rawBeat = params.get("beat");
  const initial = rawBeat === null ? Number.NaN : Number(rawBeat);
  if (Number.isInteger(initial) && initial >= 0 && initial < groups.length) {
    playing = false;
    show(initial, 1, false);
    setPlaying(false);
  } else {
    paint(false);
    setPlaying(playing);
  }
})();
