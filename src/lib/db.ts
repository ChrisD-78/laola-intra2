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

// =====================
// Recurring Tasks
// =====================
export interface RecurringTaskRecord {
  id?: string
  title: string
  description: string
  frequency: string
  priority: string
  start_time: string
  assigned_to: string
  is_active: boolean
  next_due: string
  created_at?: string
}

export async function getRecurringTasks(): Promise<RecurringTaskRecord[]> {
  const { data, error } = await supabase
    .from('recurring_tasks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as RecurringTaskRecord[]
}

export async function createRecurringTask(task: Omit<RecurringTaskRecord, 'id' | 'created_at'>) {
  const { error } = await supabase.from('recurring_tasks').insert({
    title: task.title,
    description: task.description,
    frequency: task.frequency,
    priority: task.priority,
    start_time: task.start_time,
    assigned_to: task.assigned_to,
    is_active: task.is_active,
    next_due: task.next_due,
  })
  if (error) throw error
}

export async function updateRecurringTask(id: string, partial: Partial<RecurringTaskRecord>) {
  const { error } = await supabase
    .from('recurring_tasks')
    .update(partial)
    .eq('id', id)
  if (error) throw error
}

export async function deleteRecurringTask(id: string) {
  const { error } = await supabase
    .from('recurring_tasks')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// =====================
// Chat
// =====================
export interface ChatUserRecord {
  id: string
  name: string
  is_online: boolean
  avatar?: string | null
}

export interface ChatGroupRecord {
  id?: string
  name: string
  description?: string | null
  created_by: string
  created_at?: string
}

export interface ChatMessageRecord {
  id?: string
  sender: string
  recipient?: string | null
  group_id?: string | null
  content?: string | null
  timestamp?: string
  is_read: boolean
  image_url?: string | null
  image_name?: string | null
}

export async function upsertChatUser(user: ChatUserRecord) {
  const { error } = await supabase.from('chat_users').upsert({
    id: user.id,
    name: user.name,
    is_online: user.is_online,
    avatar: user.avatar ?? null,
  })
  if (error) throw error
}

export async function getChatUsers(): Promise<ChatUserRecord[]> {
  const { data, error } = await supabase.from('chat_users').select('*')
  if (error) throw error
  return data as ChatUserRecord[]
}

export async function getChatGroups(): Promise<ChatGroupRecord[]> {
  const { data, error } = await supabase
    .from('chat_groups')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as ChatGroupRecord[]
}

export async function createChatGroup(group: Omit<ChatGroupRecord, 'id' | 'created_at'>, memberIds: string[]) {
  const { data, error } = await supabase
    .from('chat_groups')
    .insert({ name: group.name, description: group.description ?? null, created_by: group.created_by })
    .select('id')
    .single()
  if (error) throw error
  const groupId = data.id as string
  if (memberIds.length > 0) {
    const rows = memberIds.map(user_id => ({ group_id: groupId, user_id }))
    const { error: mErr } = await supabase.from('chat_group_members').insert(rows)
    if (mErr) throw mErr
  }
  return groupId
}

export async function getDirectMessages(currentUserId: string, otherUserId: string): Promise<ChatMessageRecord[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .or(`and(sender.eq.${currentUserId},recipient.eq.${otherUserId}),and(sender.eq.${otherUserId},recipient.eq.${currentUserId})`)
    .order('timestamp', { ascending: true })
  if (error) throw error
  return data as ChatMessageRecord[]
}

export async function getGroupMessages(groupId: string): Promise<ChatMessageRecord[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('group_id', groupId)
    .order('timestamp', { ascending: true })
  if (error) throw error
  return data as ChatMessageRecord[]
}

export async function sendChatMessage(msg: Omit<ChatMessageRecord, 'id' | 'timestamp' | 'is_read'> & { is_read?: boolean }) {
  const { error } = await supabase.from('chat_messages').insert({
    sender: msg.sender,
    recipient: msg.recipient ?? null,
    group_id: msg.group_id ?? null,
    content: msg.content ?? null,
    is_read: msg.is_read ?? false,
    image_url: msg.image_url ?? null,
    image_name: msg.image_name ?? null,
  })
  if (error) throw error
}

// =====================
// Dashboard Infos
// =====================
export interface DashboardInfoRecord {
  id?: string
  title: string
  content: string
  timestamp: string
  pdf_name?: string | null
  pdf_url?: string | null
  created_at?: string
}

export async function getDashboardInfos(): Promise<DashboardInfoRecord[]> {
  const { data, error } = await supabase
    .from('dashboard_infos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as DashboardInfoRecord[]
}

export async function createDashboardInfo(info: Omit<DashboardInfoRecord, 'id' | 'created_at'>) {
  const { error } = await supabase.from('dashboard_infos').insert({
    title: info.title,
    content: info.content,
    timestamp: info.timestamp,
    pdf_name: info.pdf_name ?? null,
    pdf_url: info.pdf_url ?? null,
  })
  if (error) throw error
}

export async function deleteDashboardInfo(id: string) {
  const { error } = await supabase
    .from('dashboard_infos')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function uploadInfoPdf(file: File): Promise<{ path: string; publicUrl: string }> {
  const filePath = `infos/${Date.now()}_${file.name}`
  const { error: upErr } = await supabase.storage.from('proofs').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (upErr) throw upErr
  const { data } = supabase.storage.from('proofs').getPublicUrl(filePath)
  return { path: filePath, publicUrl: data.publicUrl }
}

// =====================
// Documents (Dokumente)
// =====================
export interface DocumentRecord {
  id?: string
  title: string
  description: string
  category: string
  file_name: string
  file_size_mb: number
  file_type: string
  tags: string[]
  uploaded_at: string
  uploaded_by: string
  file_url: string
  created_at?: string
}

export async function getDocuments(): Promise<DocumentRecord[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as DocumentRecord[]
}

export async function getDocumentsFiltered(params: { category?: string; search?: string }): Promise<DocumentRecord[]> {
  let query = supabase.from('documents').select('*')
  if (params.category && params.category !== 'Alle Kategorien') {
    query = query.eq('category', params.category)
  }
  if (params.search && params.search.trim()) {
    const term = `%${params.search.trim()}%`
    query = query.or(
      `title.ilike.${term},description.ilike.${term},tags.cs.{${params.search.trim()}}`
    )
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data as DocumentRecord[]
}

export async function uploadDocumentFile(file: File): Promise<{ path: string; publicUrl: string }> {
  const filePath = `documents/${Date.now()}_${file.name}`
  const { error: upErr } = await supabase.storage.from('documents').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (upErr) throw upErr
  const { data } = supabase.storage.from('documents').getPublicUrl(filePath)
  return { path: filePath, publicUrl: data.publicUrl }
}

export async function insertDocument(doc: Omit<DocumentRecord, 'id' | 'created_at'>) {
  const { error } = await supabase.from('documents').insert({
    title: doc.title,
    description: doc.description,
    category: doc.category,
    file_name: doc.file_name,
    file_size_mb: doc.file_size_mb,
    file_type: doc.file_type,
    tags: doc.tags,
    uploaded_at: doc.uploaded_at,
    uploaded_by: doc.uploaded_by,
    file_url: doc.file_url,
  })
  if (error) throw error
}

export async function updateDocument(id: string, partial: Partial<DocumentRecord>) {
  const { error } = await supabase
    .from('documents')
    .update(partial)
    .eq('id', id)
  if (error) throw error
}

export async function deleteDocumentById(id: string) {
  const { error } = await supabase
    .from('documents')
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

export async function getProofs(): Promise<ExternalProofRecord[]> {
  const { data, error } = await supabase
    .from('external_proofs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
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

// Form Submissions
export interface FormSubmissionRecord {
  id: string
  type: string
  title: string
  description: string
  status: string
  submitted_at: string
  form_data: any
  submitted_by: string
}

export async function getFormSubmissions(filters?: {
  type?: string
  status?: string
  submittedBy?: string
}): Promise<FormSubmissionRecord[]> {
  let query = supabase
    .from('form_submissions')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.submittedBy) {
    query = query.eq('submitted_by', filters.submittedBy)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function insertFormSubmission(submission: Omit<FormSubmissionRecord, 'id' | 'submitted_at'>): Promise<FormSubmissionRecord> {
  const { data, error } = await supabase
    .from('form_submissions')
    .insert([submission])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateFormSubmission(id: string, updates: Partial<FormSubmissionRecord>): Promise<FormSubmissionRecord> {
  const { data, error } = await supabase
    .from('form_submissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteFormSubmissionById(id: string): Promise<void> {
  const { error } = await supabase
    .from('form_submissions')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Training Records
export interface TrainingRecord {
  id: string
  title: string
  description: string
  category: string
  duration: string
  status: string
  date: string
  instructor: string
  pdf_url?: string
  video_url?: string
  thumbnail?: string
  created_at: string
}

export async function getTrainings(filters?: {
  category?: string
  status?: string
  instructor?: string
}): Promise<TrainingRecord[]> {
  let query = supabase
    .from('trainings')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.instructor) {
    query = query.ilike('instructor', `%${filters.instructor}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function insertTraining(training: Omit<TrainingRecord, 'id' | 'created_at'>): Promise<TrainingRecord> {
  const { data, error } = await supabase
    .from('trainings')
    .insert([training])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTraining(id: string, updates: Partial<TrainingRecord>): Promise<TrainingRecord> {
  const { data, error } = await supabase
    .from('trainings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTrainingById(id: string): Promise<void> {
  const { error } = await supabase
    .from('trainings')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function uploadTrainingFile(file: File, type: 'pdf' | 'video'): Promise<{ publicUrl: string }> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `trainings/${type}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('proofs')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('proofs')
    .getPublicUrl(filePath)

  return { publicUrl: data.publicUrl }
}

// Completed Trainings
export interface CompletedTrainingRecord {
  id: string
  training_id: string
  training_title: string
  participant_name: string
  participant_surname: string
  completed_date: string
  score?: number
  category: string
  instructor: string
  duration: string
  created_at: string
}

export async function getCompletedTrainings(filters?: {
  category?: string
  participant?: string
  instructor?: string
  dateFrom?: string
  dateTo?: string
}): Promise<CompletedTrainingRecord[]> {
  let query = supabase
    .from('completed_trainings')
    .select('*')
    .order('completed_date', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.participant) {
    query = query.or(`participant_name.ilike.%${filters.participant}%,participant_surname.ilike.%${filters.participant}%`)
  }

  if (filters?.instructor) {
    query = query.ilike('instructor', `%${filters.instructor}%`)
  }

  if (filters?.dateFrom) {
    query = query.gte('completed_date', filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte('completed_date', filters.dateTo)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function insertCompletedTraining(training: Omit<CompletedTrainingRecord, 'id' | 'created_at'>): Promise<CompletedTrainingRecord> {
  const { data, error } = await supabase
    .from('completed_trainings')
    .insert([training])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Chat Messages
export async function getDirectMessages(userId1: string, userId2: string): Promise<ChatMessageRecord[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getGroupMessages(groupId: string): Promise<ChatMessageRecord[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}


