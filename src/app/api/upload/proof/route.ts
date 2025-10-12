import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`proofs/${file.name}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
    })

    return NextResponse.json({
      path: blob.pathname,
      publicUrl: blob.url,
      size: file.size,
      name: file.name
    })
  } catch (error) {
    console.error('Failed to upload proof:', error)
    return NextResponse.json(
      { error: 'Failed to upload proof', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
