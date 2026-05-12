'use client';

import { useState, useEffect } from 'react';

/**
 * useMounted - Returns true only after the component has mounted on the client.
 * Use this to prevent hydration mismatches when rendering theme-dependent or
 * browser-only content.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
