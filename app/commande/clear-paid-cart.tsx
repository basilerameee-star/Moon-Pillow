"use client";

import { useEffect } from "react";

export default function ClearPaidCart({ attemptId }: { attemptId: string | null }) {
  useEffect(() => {
    if (!attemptId) return;
    try {
      // A previous receipt must never erase a newer shopping session.
      if (sessionStorage.getItem("mp-checkout-attempt") !== attemptId) return;
      localStorage.removeItem("mp-cart-v1");
      sessionStorage.removeItem("mp-checkout-attempt");
    } catch { /* Storage may be unavailable in a privacy-restricted browser. */ }
  }, [attemptId]);
  return null;
}
