/**
 * Web app manifest: name, icons and colours used when the portal is installed on a phone ("Add to Home screen").
 */
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Uttarakhand Government Institute of Polytechnic, Tanakpur - Placement & Student Portal',
    short_name: 'UGIP Tanakpur',
    description:
      'Official Mobile App for Uttarakhand Government Institute of Polytechnic, Tanakpur (Code 090) - Placement, Student Dossier, UBTER Marks, AI Doubt Solver & Recruiters.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#08142c',
    theme_color: '#2a4f8a',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
