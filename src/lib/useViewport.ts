"use client";

import { useEffect, useState } from "react";

export function useViewport() {
  const [vp, setVp] = useState({ w: 1200, h: 800, ready: false });
  useEffect(() => {
    const on = () => setVp({ w: innerWidth, h: innerHeight, ready: true });
    on();
    addEventListener("resize", on);
    return () => removeEventListener("resize", on);
  }, []);
  return vp;
}
