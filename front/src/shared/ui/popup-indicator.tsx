"use client";

import { useCallback } from "react";

export function usePopupIndicator() {
  return useCallback((popup: HTMLDivElement | null) => {
    if (!popup) return;
    let disabledHover = false;
    const update = () => {
      if (disabledHover) {
        popup.removeAttribute("data-indicator-ready");
        return;
      }
      const active =
        popup.querySelector<HTMLElement>(
          ".ui-popup-item[data-highlighted]:not([data-disabled])",
        ) ??
        popup.querySelector<HTMLElement>(
          ".ui-popup-item[data-selected]:not([data-disabled])",
        );
      if (!popup.hasAttribute("data-open") || !active) {
        popup.removeAttribute("data-indicator-ready");
        return;
      }
      popup.style.setProperty("--popup-indicator-top", `${active.offsetTop}px`);
      popup.style.setProperty(
        "--popup-indicator-left",
        `${active.offsetLeft}px`,
      );
      popup.style.setProperty(
        "--popup-indicator-width",
        `${active.offsetWidth}px`,
      );
      popup.style.setProperty(
        "--popup-indicator-height",
        `${active.offsetHeight}px`,
      );
      popup.setAttribute("data-indicator-ready", "");
    };
    const onPointerOver = (event: PointerEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest(".ui-popup-item")
          : null;
      disabledHover = Boolean(target?.hasAttribute("data-disabled"));
      update();
    };
    const onPointerLeave = () => {
      disabledHover = false;
      update();
    };
    popup.setAttribute("data-indicator-managed", "");
    popup.addEventListener("pointerover", onPointerOver);
    popup.addEventListener("pointerleave", onPointerLeave);
    const observer = new MutationObserver(update);
    observer.observe(popup, {
      subtree: true,
      attributes: true,
      attributeFilter: [
        "data-open",
        "data-highlighted",
        "data-selected",
        "data-disabled",
      ],
    });
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    resizeObserver?.observe(popup);
    popup
      .querySelectorAll<HTMLElement>(".ui-popup-item")
      .forEach((item) => resizeObserver?.observe(item));
    update();
    return () => {
      popup.removeEventListener("pointerover", onPointerOver);
      popup.removeEventListener("pointerleave", onPointerLeave);
      popup.removeAttribute("data-indicator-managed");
      observer.disconnect();
      resizeObserver?.disconnect();
    };
  }, []);
}
