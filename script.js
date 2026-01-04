// =============================
// TAB + SCROLLSPY (SOLID VERSION)
// =============================

const tabs = Array.from(document.querySelectorAll(".tab"));
const sections = Array.from(document.querySelectorAll(".tab-content"));
const content = document.querySelector(".content");

function getScrollContainer() {
  return window.innerWidth <= 768 ? window : content;
}
// your scroll container
const tabsBar = document.querySelector(".tabs"); // sticky nav

if (!content || !tabsBar || tabs.length === 0 || sections.length === 0) {
  console.warn("Missing .content / .tabs / .tab / .tab-content in the DOM");
}

// ---------- helpers ----------
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
  if (window.innerWidth <= 768) {
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
    if (scroller === window) {
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    } else {
      scroller.scrollTo({ top: targetTop, behavior: "smooth" }); // 16px breathing room under sticky tabs
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
  const offset = getTabsHeight() + 20; // where "reading line" starts under sticky tabs
  const scrollPos = content.scrollTop + offset;

  // Find the last section whose top is above the reading line
  let current = sections[0]?.id;

  for (const section of sections) {
    const top = getSectionTopInContent(section);
    if (top <= scrollPos) current = section.id;
    else break; // sections are in order; stop early
  }

  if (current) activateTab(current);
}

getScrollContainer().addEventListener("scroll", () => {
  // even during smooth scroll, we still want it to update correctly,
  // but if you prefer, you can skip updates while programmatic scrolling:
  // if (isProgrammaticScroll) return;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateActiveTabOnScroll();
      ticking = false;
    });
    ticking = true;
  }
});

// Run once on load
updateActiveTabOnScroll();

// If fonts/images shift layout after load, re-run
window.addEventListener("resize", updateActiveTabOnScroll);
