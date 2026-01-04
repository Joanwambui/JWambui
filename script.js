// =============================
// TAB + SCROLLSPY (SOLID VERSION)
// =============================

const tabs = Array.from(document.querySelectorAll(".tab"));
const sections = Array.from(document.querySelectorAll(".tab-content"));
const content = document.querySelector(".content");

// your scroll container
const tabsBar = document.querySelector(".tabs"); // sticky nav

if (!content || !tabsBar || tabs.length === 0 || sections.length === 0) {
  console.warn("Missing .content / .tabs / .tab / .tab-content in the DOM");
}

// ---------- helpers ----------
function isMobile() {
  return window.innerWidth <= 768;
}

function getScrollContainer() {
  return isMobile() ? window : content;
}

function getScrollTop() {
  return isMobile() ? window.scrollY : content.scrollTop;
}

function getTabsHeight() {
  // height of the sticky nav (accounts for padding/blur background)
  return tabsBar ? Math.ceil(tabsBar.getBoundingClientRect().height) : 0;
}

function activateTab(id) {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === id);
  });
}

function getSectionTop(sectionEl) {
  if (isMobile()) {
    return sectionEl.getBoundingClientRect().top + window.scrollY;
  }

  const contentRect = content.getBoundingClientRect();
  const sectionRect = sectionEl.getBoundingClientRect();
  return sectionRect.top - contentRect.top + content.scrollTop;
}

// ---------- click behavior ----------
let isProgrammaticScroll = false;
let scrollStopTimer = null;

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const id = tab.dataset.tab;
    const target = document.getElementById(id);
    if (!target) return;

    activateTab(id);

    const offset = getTabsHeight() + 16;
    const targetTop = getSectionTop(target) - offset;
    const scroller = getScrollContainer();

    isProgrammaticScroll = true;

    if (scroller === window) {
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    } else {
      scroller.scrollTo({ top: targetTop, behavior: "smooth" });
    }

    // release lock after scrolling settles
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(() => {
      isProgrammaticScroll = false;
    }, 600);
  });
});

// ---------- scrollspy ----------
let ticking = false;

function updateActiveTabOnScroll() {
  const offset = getTabsHeight() + 20;
  const scrollPos = getScrollTop() + offset;

  let current = sections[0]?.id;

  for (const section of sections) {
    const sectionTop = getSectionTop(section);
    if (sectionTop <= scrollPos) {
      current = section.id;
    } else {
      break;
    }
  }

  if (current) activateTab(current);
}

function onScroll() {
  if (isProgrammaticScroll) return;

  if (!ticking) {
    requestAnimationFrame(() => {
      updateActiveTabOnScroll();
      ticking = false;
    });
    ticking = true;
  }
}

function attachScrollListener() {
  const scroller = getScrollContainer();
  scroller.addEventListener("scroll", onScroll);
}

attachScrollListener();

// Run once on load
updateActiveTabOnScroll();

// If fonts/images shift layout after load, re-run
window.addEventListener("resize", () => {
  updateActiveTabOnScroll();
});
