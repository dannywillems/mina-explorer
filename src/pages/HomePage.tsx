import type { ReactNode } from 'react';
import { SearchBar } from '@/components/common';
import { NetworkStats, RecentBlocks } from '@/components/dashboard';
import { useTheme } from '@/context/ThemeContext';

export function HomePage(): ReactNode {
  const { theme } = useTheme();

  // Use light logo on dark background, dark logo on light background
  const logoSrc =
    theme === 'dark'
      ? `${import.meta.env.BASE_URL}mina-logo-light.svg`
      : `${import.meta.env.BASE_URL}mina-logo-dark.svg`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-3 flex items-center justify-center gap-3 text-3xl font-bold">
          <img src={logoSrc} alt="Mina" className="h-10" />
          Explorer
        </h1>
        <p className="mb-6 text-muted-foreground">
          Explore blocks on the Mina Protocol network.
        </p>
        <div className="mx-auto max-w-xl">
          <SearchBar />
        </div>
      </div>

      <NetworkStats />

      <RecentBlocks />
    </div>
  );
}
