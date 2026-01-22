import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const MAX_FILE_SIZE_MB = 50
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large', details: `Max ${MAX_FILE_SIZE_MB}MB` },
        { status: 413 }
      )
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `${timestamp}-${safeName}`

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (token) {
      try {
        const blob = await put(`documents/${fileName}`, file, {
          access: 'public',
          token,
          addRandomSuffix: false
        })

        return NextResponse.json({
          path: blob.pathname,
          publicUrl: blob.url,
          size: file.size,
          name: file.name
        })
      } catch (error) {
        console.error('Blob upload failed:', error)
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: 'Failed to upload document', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          )
        }
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Blob token missing', details: 'BLOB_READ_WRITE_TOKEN is not set' },
        { status: 500 }
      )
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents')
    await mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, fileName), buffer)

    return NextResponse.json({
      path: `/uploads/documents/${fileName}`,
      publicUrl: `/uploads/documents/${fileName}`,
      size: file.size,
      name: file.name
    })
  } catch (error) {
    console.error('Failed to upload document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
