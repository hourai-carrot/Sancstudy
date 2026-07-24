const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-nav");
const header = document.querySelector(".site-header");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const quotes = [
  "学ぶことは、未来の自分に贈るいちばん静かなプレゼント。",
  "小さな理解が、いつか大きな自信になる。",
  "昨日の自分より、ひとつ知っている今日へ。",
  "好奇心は、学びを始めるための最高の才能。",
  "できないは、まだできる途中ということ。",
  "一歩ずつ進む人だけが、見える景色がある。",
  "学びは答えを集めることではなく、問いを育てること。",
  "夢中になれる時間は、未来をつくる時間。",
  "知るたびに、世界は少しずつ広がっていく。",
  "今日の10分は、明日の自分を助けてくれる。",
  "続けることが、いちばんの近道になる。",
  "わからないは、伸びしろの合図。",
  "誰かと比べず、昨日の自分とだけ競おう。",
  "小さな達成感を、毎日積み重ねていこう。",
  "学びに、遅すぎるということはない。"
];

const closeMenu = () => {
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

menuButton.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
});

navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const dailyQuote = document.querySelector("#daily-quote");
if (dailyQuote) {
  dailyQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

// Split the hero headline into per-character spans for a staggered fade-in.
const splitTitle = document.querySelector(".split-title");
if (splitTitle && !reduceMotion.matches) {
  const walk = (node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        let delay = 0;
        [...child.textContent].forEach((ch) => {
          if (ch.trim() === "") {
            frag.appendChild(document.createTextNode(ch));
            return;
          }
          const span = document.createElement("span");
          span.className = "char";
          span.textContent = ch;
          span.style.animationDelay = `${delay}ms`;
          delay += 22;
          frag.appendChild(span);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(splitTitle);
}

const revealElements = document.querySelectorAll(".reveal");
if (reduceMotion.matches) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13 });
  revealElements.forEach((element) => revealObserver.observe(element));
}

if (!reduceMotion.matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `perspective(850px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg) translateY(-6px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
    card.addEventListener("pointerdown", () => card.classList.add("is-pressed"));
    card.addEventListener("pointerup", () => card.classList.remove("is-pressed"));
    card.addEventListener("pointercancel", () => card.classList.remove("is-pressed"));
  });
}

// Trust stats: count up once the strip scrolls into view.
const statNumbers = document.querySelectorAll(".stats-strip b[data-count]");
if (statNumbers.length) {
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion.matches || target === 0) {
      el.textContent = target.toLocaleString("ja-JP") + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("ja-JP") + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  statNumbers.forEach((el) => statsObserver.observe(el));
}

// Tag filtering: clicking a chip narrows the catalogue to matching cards.
const filterChips = document.querySelectorAll(".filter-chip");
const siteCards = document.querySelectorAll(".site-card[data-tags]");
const categoryBlocks = document.querySelectorAll(".category-block");
const filterEmpty = document.querySelector("#filter-empty");

const applyFilter = (tag) => {
  let visibleCount = 0;
  siteCards.forEach((card) => {
    const tags = card.dataset.tags || "";
    const matches = tag === "all" || tags.includes(tag);
    card.classList.toggle("is-filtered-out", !matches);
    if (matches) visibleCount += 1;
  });
  categoryBlocks.forEach((block) => {
    const anyVisible = [...block.querySelectorAll(".site-card")].some(
      (card) => !card.classList.contains("is-filtered-out")
    );
    block.hidden = !anyVisible;
  });
  if (filterEmpty) filterEmpty.hidden = visibleCount !== 0;
};

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    filterChips.forEach((other) => other.classList.remove("is-active"));
    chip.classList.add("is-active");
    applyFilter(chip.dataset.filter);
  });
});