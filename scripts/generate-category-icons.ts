#!/usr/bin/env bun

import fs from 'fs/promises'
import path from 'path'

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY

if (!TOGETHER_API_KEY) {
  console.error('❌ TOGETHER_API_KEY environment variable is required')
  console.log('Get your API key from: https://api.together.xyz/')
  process.exit(1)
}

const categoryPrompts = {
  needles:
    'crossed tattoo machine needles, traditional tattoo flash art design, bold black ink illustration on white background, vintage tattoo flash sheet style, American traditional tattoo style, ornate decorative handles with engraved details, symmetrical composition, hand-drawn illustration, bold black outlines, high contrast black and white, no text or letters, centered composition, clean minimalist background, professional tattoo shop wall art, icon design',

  ink: 'vintage tattoo ink bottle with flowing drops, traditional tattoo flash art design, bold black ink illustration on white background, classic glass bottle with ornate label design, dripping ink creating decorative patterns, Chicano style fine line work, vintage tattoo flash sheet style, hand-drawn illustration, bold black outlines, high contrast black and white, no text or letters, centered composition, professional tattoo design, icon design',

  tubes_grips:
    'tattoo machine tubes and grips arrangement, traditional tattoo flash art design, bold black ink illustration on white background, steel tubes with textured grip patterns, decorative mandala-like arrangement, mechanical precision details, vintage tattoo flash sheet style, American traditional tattoo style, hand-drawn illustration, bold black outlines, high contrast black and white, no text or letters, centered composition, icon design',

  cartridges:
    'modern tattoo cartridge needles in fan display, traditional tattoo flash art design, bold black ink illustration on white background, precise geometric arrangement, technical illustration style, clean line work, vintage tattoo flash sheet style, minimalist traditional approach, hand-drawn illustration, bold black outlines, high contrast black and white, no text or letters, centered composition, icon design',

  machines:
    'classic coil tattoo machine, traditional tattoo flash art design, bold black ink illustration on white background, ornate decorative frame with scrollwork, vintage tattoo equipment, mechanical components visible, American traditional tattoo style, vintage tattoo flash sheet style, hand-drawn illustration, bold black outlines, high contrast black and white, no text or letters, centered composition, professional tattoo design, icon design',

  power_supplies:
    'powerful lightning bolt with electrical current, traditional tattoo flash art design, bold black ink illustration on white background, dynamic energy flow, vintage power dial elements, electric sparks, American traditional tattoo style, vintage tattoo flash sheet style, hand-drawn illustration, bold black outlines, high contrast black and white, no text or letters, centered composition, icon design',

  accessories:
    'tattoo tools in circular mandala pattern, traditional tattoo flash art design, bold black ink illustration on white background, various tattoo implements arranged symmetrically, Japanese-influenced geometric design, balanced composition, vintage tattoo flash sheet style, hand-drawn illustration, bold black outlines, high contrast black and white, no text or letters, centered composition, icon design',

  aftercare:
    'healing hands with botanical elements, traditional tattoo flash art design, bold black ink illustration on white background, caring hands surrounded by medicinal herbs, protective symbols, leaves and healing plants, Chicano fine line style, vintage tattoo flash sheet style, hand-drawn illustration, bold black outlines, high contrast black and white, no text or letters, centered composition, icon design',

  furniture:
    'classic vintage barber chair, traditional tattoo flash art design, bold black ink illustration on white background, ornamental metalwork details, decorative leather patterns, strong architectural foundation, American traditional tattoo style, vintage tattoo flash sheet style, hand-drawn illustration, bold black outlines, high contrast black and white, no text or letters, centered composition, icon design',

  hygiene:
    'medical cross with clean lines, traditional tattoo flash art design, bold black ink illustration on white background, geometric patterns, protective medical symbols, sanitary shield design, minimalist traditional style, vintage tattoo flash sheet style, hand-drawn illustration, bold black outlines, high contrast black and white, no text or letters, centered composition, icon design',

  stencil:
    'tattoo transfer paper with artistic flourishes, traditional tattoo flash art design, bold black ink illustration on white background, rolled paper with decorative patterns emerging, creative flow elements, technical meets artistic design, vintage tattoo flash sheet style, hand-drawn illustration, bold black outlines, high contrast black and white, no text or letters, centered composition, icon design',
}

const negativePrompt =
  'color, realistic photography, 3d render, blurry, text, letters, words, watermark, signature, photorealistic, complex background patterns, gradient fills, anime style, cartoon, low quality'

async function generateImage(category: string, prompt: string) {
  console.log(`🎨 Generating icon for: ${category}`)

  try {
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt: prompt,
        negative_prompt: negativePrompt,
        width: 1024,
        height: 1024,
        steps: 4,
        n: 1,
        seed: Math.floor(Math.random() * 1000000),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    if (data.data && data.data[0] && data.data[0].url) {
      const imageUrl = data.data[0].url

      // Download the image
      const imageResponse = await fetch(imageUrl)
      const arrayBuffer = await imageResponse.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Save to public/category-icons directory
      const outputDir = path.join(process.cwd(), 'public', 'category-icons')
      await fs.mkdir(outputDir, { recursive: true })

      const outputPath = path.join(outputDir, `${category}.png`)
      await fs.writeFile(outputPath, buffer)

      console.log(`✅ Saved ${category} icon to: ${outputPath}`)
      return outputPath
    } else {
      throw new Error('No image URL in response')
    }
  } catch (error) {
    console.error(`❌ Failed to generate ${category}:`, error)
    return null
  }
}

async function generateAllIcons() {
  console.log('🚀 Starting category icon generation...\n')
  console.log('📝 Style: Traditional tattoo flash art')
  console.log('🎨 Aesthetic: Black & white, bold lines, vintage flash sheet\n')

  const results: Record<string, string | null> = {}

  // Generate icons sequentially to avoid rate limits
  for (const [category, prompt] of Object.entries(categoryPrompts)) {
    results[category] = await generateImage(category, prompt)

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Save metadata
  const metadata = {
    generated: new Date().toISOString(),
    style: 'Traditional tattoo flash art',
    model: 'black-forest-labs/FLUX.1-schnell',
    icons: results,
  }

  await fs.writeFile(
    path.join(process.cwd(), 'public', 'category-icons', 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  )

  console.log('\n✨ Icon generation complete!')
  console.log(`📁 Icons saved to: public/category-icons/`)

  // Show summary
  const successful = Object.values(results).filter(r => r !== null).length
  console.log(
    `\n📊 Summary: ${successful}/${Object.keys(results).length} icons generated successfully`
  )
}

// Run the generation
generateAllIcons().catch(console.error)
