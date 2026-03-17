"use client";
import { useEffect, useState } from "react";

/**
 * Renderiza `children` apenas no cliente, após a hidratação.
 * Elimina hydration mismatch em qualquer bloco que dependa de
 * new Date(), fuso horário ou estado só disponível no browser.
 * `fallback` é renderizado no lugar durante o SSR.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}
