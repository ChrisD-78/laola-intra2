'use client'

import { supabase } from './supabase'

// =====================
// Tasks
// =====================
export interface TaskRecord {
  id?: string
  title: string
  description: string
  priority: string
  status: string
  due_date: string
  assigned_to: string
  created_at?: string
}

export async function getTasks(): Promise<TaskRecord[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as TaskRecord[]
}

export async function createTask(task: Omit<TaskRecord, 'id' | 'created_at' | 'status'> & { status?: string }) {
  const { error } = await supabase.from('tasks').insert({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status ?? 'Offen',
    due_date: task.due_date,
    assigned_to: task.assigned_to
  })
  if (error) throw error
}

export async function updateTask(id: string, partial: Partial<TaskRecord>) {
  const { error } = await supabase
    .from('tasks')
    .update(partial)
    .eq('id', id)
  if (error) throw error
}

export async function deleteTaskById(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export interface AccidentRecord {
  id?: string
  unfalltyp: 'mitarbeiter' | 'gast'
  datum: string
  zeit: string
  verletzte_person: string
  unfallort: string
  unfallart: string
  verletzungsart: string
  schweregrad: string
  erste_hilfe: string
  arzt_kontakt: string
  zeugen: string | null
  beschreibung: string
  meldende_person: string
  unfallhergang?: string | null
  gast_alter?: string | null
  gast_kontakt?: string | null
  created_at?: string
}

export async function insertAccident(data: AccidentRecord) {
  const { error } = await supabase.from('accidents').insert({
    unfalltyp: data.unfalltyp,
    datum: data.datum,
    zeit: data.zeit,
    verletzte_person: data.verletzte_person,
    unfallort: data.unfallort,
    unfallart: data.unfallart,
    verletzungsart: data.verletzungsart,
    schweregrad: data.schweregrad,
    erste_hilfe: data.erste_hilfe,
    arzt_kontakt: data.arzt_kontakt,
    zeugen: data.zeugen ?? null,
    beschreibung: data.beschreibung,
    meldende_person: data.meldende_person,
    unfallhergang: data.unfallhergang ?? null,
    gast_alter: data.gast_alter ?? null,
    gast_kontakt: data.gast_kontakt ?? null
  })
  if (error) throw error
}

export interface ExternalProofRecord {
  id?: string
  bezeichnung: string
  vorname: string
  nachname: string
  datum: string
  pdf_name?: string | null
  pdf_url?: string | null
  created_at?: string
}

export async function uploadProofPdf(file: File): Promise<{ path: string; publicUrl: string }> {
  const filePath = `proofs/${Date.now()}_${file.name}`
  const { error: upErr } = await supabase.storage.from('proofs').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (upErr) throw upErr
  const { data } = supabase.storage.from('proofs').getPublicUrl(filePath)
  return { path: filePath, publicUrl: data.publicUrl }
}

export async function insertExternalProof(data: ExternalProofRecord) {
  const { error } = await supabase.from('external_proofs').insert({
    bezeichnung: data.bezeichnung,
    vorname: data.vorname,
    nachname: data.nachname,
    datum: data.datum,
    pdf_name: data.pdf_name ?? null,
    pdf_url: data.pdf_url ?? null,
  })
  if (error) throw error
}


