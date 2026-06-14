import { NextResponse } from 'next/server';

export async function GET() {
  // Return a simple SVG icon
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
    <rect width="144" height="144" rx="32" fill="#6366f1"/>
    <text x="72" y="88" font-size="48" text-anchor="middle" fill="white" font-family="Arial">HB</text>
    <text x="72" y="110" font-size="14" text-anchor="middle" fill="#c7d2fe">Bank</text>
  </svg>`;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
