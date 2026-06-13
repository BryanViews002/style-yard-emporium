import { useEffect, useRef } from "react";

/**
 * Custom luxury cursor: dot + ring, expands on hoverable elements.
 */
export const CustomCursor = () => {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = mx + "px";
        dotRef.current.style.top  = my + "px";
      }
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      rx = lerp(rx, mx, 0.12);
      ry = lerp(ry, my, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = rx + "px";
        ringRef.current.style.top  = ry + "px";
      }
      raf = requestAnimationFrame(animate);
    };

    const onEnter = () => ringRef.current?.classList.add("cursor-hover");
    const onLeave = () => ringRef.current?.classList.remove("cursor-hover");

    window.addEventListener("mousemove", onMove);
    document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};
