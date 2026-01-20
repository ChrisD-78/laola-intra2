import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const lowerName = file.name.toLowerCase()
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf')
    const isJpg = file.type === 'image/jpeg' || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')
    const isPng = file.type === 'image/png' || lowerName.endsWith('.png')
    if (!isPdf && !isJpg && !isPng) {
      return NextResponse.json(
        { error: 'Only PDF or JPG/PNG images are allowed' },
        { status: 400 }
      )
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Blob token missing', details: 'BLOB_READ_WRITE_TOKEN is not set' },
        { status: 500 }
      )
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    // Upload to Vercel Blob
    const blob = await put(`pdfs/${timestamp}-${safeName}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false, // We already include a timestamp
    })

    return NextResponse.json({
      path: blob.pathname,
      publicUrl: blob.url,
      size: file.size,
      name: file.name
    })
  } catch (error) {
    console.error('Failed to upload file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
