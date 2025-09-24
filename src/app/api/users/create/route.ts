import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, metadata } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { role: role || 'user', ...(metadata || {}) },
      email_confirm: true
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ user: data.user }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 })
  }
}


