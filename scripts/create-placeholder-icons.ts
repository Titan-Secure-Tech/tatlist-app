#!/usr/bin/env bun

import fs from 'fs/promises'
import path from 'path'

// SVG templates for each category in tattoo flash art style
const categoryIcons: Record<string, string> = {
  needles: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g stroke="black" stroke-width="3" fill="none">
      <line x1="40" y1="40" x2="160" y2="160" stroke-width="4"/>
      <line x1="160" y1="40" x2="40" y2="160" stroke-width="4"/>
      <circle cx="40" cy="40" r="8" fill="black"/>
      <circle cx="160" cy="40" r="8" fill="black"/>
      <circle cx="40" cy="160" r="8" fill="black"/>
      <circle cx="160" cy="160" r="8" fill="black"/>
      <path d="M90 100 L100 90 L110 100 L100 110 Z" fill="black"/>
    </g>
  </svg>`,

  ink: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g stroke="black" stroke-width="3" fill="none">
      <path d="M70 50 Q70 30 100 30 L100 30 Q130 30 130 50 L130 120 Q130 140 100 140 Q70 140 70 120 Z" fill="black"/>
      <rect x="65" y="45" width="70" height="20" fill="white"/>
      <text x="100" y="60" text-anchor="middle" font-family="serif" font-size="14" fill="black" font-weight="bold">INK</text>
      <path d="M100 140 Q95 155 100 170 Q105 155 100 140" fill="black"/>
      <circle cx="100" cy="175" r="5" fill="black"/>
    </g>
  </svg>`,

  tubes_grips: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g stroke="black" stroke-width="3" fill="black">
      <rect x="85" y="40" width="30" height="120" rx="5"/>
      <rect x="60" y="60" width="30" height="100" rx="5"/>
      <rect x="110" y="60" width="30" height="100" rx="5"/>
      <pattern id="grip" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <line x1="0" y1="5" x2="10" y2="5" stroke="white" stroke-width="1"/>
      </pattern>
      <rect x="85" y="80" width="30" height="40" fill="url(#grip)"/>
    </g>
  </svg>`,

  cartridges: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g stroke="black" stroke-width="3" fill="black">
      <path d="M100 50 L80 150 L90 150 L100 60 L110 150 L120 150 Z"/>
      <path d="M70 50 L50 150 L60 150 L75 60 L65 150 L75 150 Z"/>
      <path d="M130 50 L150 150 L140 150 L125 60 L135 150 L125 150 Z"/>
      <circle cx="100" cy="50" r="8"/>
      <circle cx="70" cy="50" r="8"/>
      <circle cx="130" cy="50" r="8"/>
    </g>
  </svg>`,

  machines: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g stroke="black" stroke-width="3" fill="black">
      <rect x="70" y="60" width="60" height="80" rx="5"/>
      <circle cx="90" cy="85" r="12" fill="white" stroke="black"/>
      <circle cx="110" cy="85" r="12" fill="white" stroke="black"/>
      <rect x="85" y="140" width="30" height="40"/>
      <line x1="100" y1="180" x2="100" y2="195" stroke-width="4"/>
      <circle cx="100" cy="195" r="3"/>
    </g>
  </svg>`,

  power_supplies: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g stroke="black" stroke-width="4" fill="black">
      <path d="M100 30 L70 90 L90 90 L80 130 L100 130 L90 170 L130 80 L110 80 L120 40 Z"/>
    </g>
  </svg>`,

  accessories: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g stroke="black" stroke-width="3" fill="none">
      <circle cx="100" cy="100" r="60" fill="black"/>
      <circle cx="100" cy="100" r="50" fill="white"/>
      <circle cx="100" cy="100" r="40" fill="black"/>
      <circle cx="100" cy="100" r="30" fill="white"/>
      <circle cx="100" cy="100" r="20" fill="black"/>
      <circle cx="100" cy="100" r="10" fill="white"/>
    </g>
  </svg>`,

  aftercare: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g stroke="black" stroke-width="3" fill="black">
      <path d="M100 140 Q60 100 60 80 Q60 60 80 60 Q90 60 100 70 Q110 60 120 60 Q140 60 140 80 Q140 100 100 140 Z"/>
      <path d="M50 120 Q30 110 30 100 Q30 90 40 90 L60 110" fill="none"/>
      <path d="M150 120 Q170 110 170 100 Q170 90 160 90 L140 110" fill="none"/>
    </g>
  </svg>`,

  furniture: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g stroke="black" stroke-width="3" fill="black">
      <rect x="60" y="40" width="80" height="100" rx="10"/>
      <rect x="70" y="50" width="60" height="80" fill="white"/>
      <rect x="50" y="140" width="100" height="20"/>
      <rect x="70" y="160" width="15" height="30"/>
      <rect x="115" y="160" width="15" height="30"/>
      <circle cx="100" cy="90" r="20" fill="black"/>
      <circle cx="100" cy="90" r="15" fill="white"/>
    </g>
  </svg>`,

  hygiene: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g stroke="black" stroke-width="3" fill="black">
      <rect x="85" y="50" width="30" height="100"/>
      <rect x="50" y="85" width="100" height="30"/>
      <rect x="75" y="40" width="50" height="50" fill="white"/>
      <rect x="75" y="110" width="50" height="50" fill="white"/>
      <rect x="40" y="75" width="50" height="50" fill="white"/>
      <rect x="110" y="75" width="50" height="50" fill="white"/>
    </g>
  </svg>`,

  stencil: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g stroke="black" stroke-width="3" fill="none">
      <rect x="50" y="40" width="100" height="120" fill="black"/>
      <rect x="60" y="50" width="80" height="100" fill="white"/>
      <path d="M70 70 Q100 80 130 70" stroke="black" stroke-width="2"/>
      <path d="M70 90 Q100 100 130 90" stroke="black" stroke-width="2"/>
      <path d="M70 110 Q100 120 130 110" stroke="black" stroke-width="2"/>
      <path d="M70 130 Q100 140 130 130" stroke="black" stroke-width="2"/>
    </g>
  </svg>`,
}

async function createPlaceholderIcons() {
  console.log('🎨 Creating placeholder tattoo-style icons...\n')

  const outputDir = path.join(process.cwd(), 'public', 'category-icons')
  await fs.mkdir(outputDir, { recursive: true })

  for (const [category, svg] of Object.entries(categoryIcons)) {
    const outputPath = path.join(outputDir, `${category}.svg`)
    await fs.writeFile(outputPath, svg)
    console.log(`✅ Created ${category}.svg`)
  }

  // Save metadata
  const metadata = {
    generated: new Date().toISOString(),
    type: 'placeholder',
    style: 'Traditional tattoo flash art (simplified SVG)',
    note: 'Replace these with AI-generated images using generate-category-icons.ts',
  }

  await fs.writeFile(path.join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2))

  console.log('\n✨ Placeholder icons created!')
  console.log(`📁 Icons saved to: public/category-icons/`)
  console.log('\n💡 To generate real AI images:')
  console.log('1. Get a Together API key from https://api.together.xyz/')
  console.log('2. Set TOGETHER_API_KEY in your .env.local')
  console.log('3. Run: bun run scripts/generate-category-icons.ts')
}

createPlaceholderIcons().catch(console.error)
