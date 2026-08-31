import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* BALISES METADATA DE PARTAGE (OPEN GRAPH) */}
        <meta property="og:title" content="UNVEIL - Décryptage sémiotique" />
        <meta property="og:description" content="Réveille-toi et prête l'oreille ! Découvre le sens caché de tes chansons et poèmes." />
        <meta property="og:image" content="https://unveil-tau-eight.vercel.app/brain-logo.png" />
        <meta property="og:type" content="website" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}