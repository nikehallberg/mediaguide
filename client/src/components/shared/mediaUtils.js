import { useEffect } from "react";

// Inspects the data array and returns available search modes based on keys
export function getSearchModes(data) {
  if (!Array.isArray(data) || data.length === 0) return ["title"];
  const keys = Object.keys(data[0] || {});
  const modes = [];
  if (keys.includes("title")) modes.push("title");
  if (keys.includes("author")) modes.push("author");
  if (keys.includes("director")) modes.push("director");
  if (keys.includes("actor")) modes.push("actor");
  if (keys.includes("actors")) modes.push("actors");
  if (keys.includes("artist")) modes.push("artist");
  return modes.length ? modes : ["title"];
}

// Smooth scroll to a container by class name
export function scrollToContainer(className) {
  setTimeout(() => {
    const container = document.querySelector(`.${className}`);
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}

// Custom hook for endless/infinite scroll behavior
export function useEndlessScroll({ enabled, totalCount, perPage, setVisibleCount }) {
  useEffect(() => {
    if (!enabled) return;
    function handleScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setVisibleCount((prev) => {
          if (prev >= totalCount) return prev;
          return prev + perPage;
        });
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, totalCount, perPage, setVisibleCount]);
}
