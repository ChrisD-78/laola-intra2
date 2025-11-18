'use client'

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
  const response = await fetch('/api/tasks')
  if (!response.ok) throw new Error('Failed to fetch tasks')
  return response.json()
}

export async function createTask(task: Omit<TaskRecord, 'id' | 'created_at' | 'status'> & { status?: string }) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  })
  if (!response.ok) throw new Error('Failed to create task')
  return response.json()
}

export async function updateTask(id: string, partial: Partial<TaskRecord>) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial)
  })
  if (!response.ok) throw new Error('Failed to update task')
  return response.json()
}

export async function deleteTaskById(id: string) {
  const response = await fetch(`/api/tasks?id=${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete task')
  return response.json()
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

export interface RecurringTaskCompletionRecord {
  id?: string
  recurring_task_id: string
  completed_by: string
  completed_at?: string
  notes?: string
  next_due_date: string
  created_at?: string
}

export async function getRecurringTasks(): Promise<RecurringTaskRecord[]> {
  const response = await fetch('/api/recurring-tasks')
  if (!response.ok) throw new Error('Failed to fetch recurring tasks')
  return response.json()
}

export async function createRecurringTask(task: Omit<RecurringTaskRecord, 'id' | 'created_at'>) {
  const response = await fetch('/api/recurring-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  })
  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to create recurring task:', error)
    throw new Error('Failed to create recurring task')
  }
  return response.json()
}

export async function updateRecurringTask(id: string, partial: Partial<RecurringTaskRecord>) {
  const response = await fetch(`/api/recurring-tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial)
  })
  if (!response.ok) throw new Error('Failed to update recurring task')
  return response.json()
}

export async function deleteRecurringTask(id: string) {
  const response = await fetch(`/api/recurring-tasks?id=${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete recurring task')
  return response.json()
}

// =====================
// Recurring Task Completions
// =====================

export async function getRecurringTaskCompletions(taskId: string): Promise<RecurringTaskCompletionRecord[]> {
  const response = await fetch(`/api/recurring-tasks/${taskId}/completions`)
  if (!response.ok) throw new Error('Failed to fetch task completions')
  return response.json()
}

export async function markRecurringTaskCompleted(taskId: string, completedBy: string, notes?: string) {
  const response = await fetch(`/api/recurring-tasks/${taskId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completedBy, notes })
  })
  if (!response.ok) throw new Error('Failed to mark task as completed')
  return response.json()
}

// Convenience helper: returns the last completion (most recent) for a task
export async function getLastRecurringTaskCompletion(taskId: string): Promise<{
  completedAt: string
  completedBy: string
  notes?: string
  nextDueDate?: string
} | null> {
  const completions = await getRecurringTaskCompletions(taskId)
  if (!completions || completions.length === 0) return null
  // API already orders DESC by completed_at; fall back to local sort if missing
  const sorted = [...completions].sort((a, b) => {
    const aTime = a.completed_at ? new Date(a.completed_at).getTime() : 0
    const bTime = b.completed_at ? new Date(b.completed_at).getTime() : 0
    return bTime - aTime
  })
  const latest = sorted[0]
  return {
    completedAt: latest.completed_at || latest.created_at || new Date().toISOString(),
    completedBy: latest.completed_by,
    notes: latest.notes,
    nextDueDate: latest.next_due_date
  }
}

// =====================
// Documents
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
  uploaded_by: string
  file_url: string
  uploaded_at?: string
}

// Note: Document APIs would need to be created similar to tasks
// For now, keeping placeholder functions

export async function getDocuments(): Promise<DocumentRecord[]> {
  const response = await fetch('/api/documents')
  if (!response.ok) throw new Error('Failed to fetch documents')
  return response.json()
}

export async function createDocument(doc: Omit<DocumentRecord, 'id' | 'uploaded_at'>) {
  return insertDocument(doc)
}

export async function deleteDocument(id: string) {
  return deleteDocumentById(id)
}

// =====================
// Trainings
// =====================
export interface TrainingRecord {
  id?: string
  title: string
  description: string
  category: string
  duration?: string
  status?: string
  date?: string
  instructor?: string
  thumbnail?: string
  pdf_url?: string
  video_url?: string
  file_name?: string
  file_size_mb?: number
  file_type?: string
  file_url?: string
  created_at?: string
  updated_at?: string
}

export interface CompletedTrainingRecord {
  id?: string
  training_id: string
  training_title?: string
  participant_name?: string
  participant_surname?: string
  completed_date?: string
  score?: number
  category?: string
  instructor?: string
  duration?: string
  completed_by: string
  completed_at?: string
  notes?: string
}

// Note: Training APIs would need to be created
// Keeping placeholder functions

export async function getTrainings(): Promise<TrainingRecord[]> {
  const response = await fetch('/api/trainings')
  if (!response.ok) throw new Error('Failed to fetch trainings')
  return response.json()
}

export async function createTraining(training: Omit<TrainingRecord, 'id' | 'created_at' | 'updated_at'>) {
  return insertTraining(training)
}

export async function deleteTraining(id: string) {
  return deleteTrainingById(id)
}

export async function markTrainingComplete(data: Omit<CompletedTrainingRecord, 'id' | 'completed_at'>) {
  return insertCompletedTraining(data)
}

export async function getCompletedTrainings(): Promise<CompletedTrainingRecord[]> {
  const response = await fetch('/api/trainings/completed')
  if (!response.ok) throw new Error('Failed to fetch completed trainings')
  return response.json()
}

export async function hasCompletedTraining(trainingId: string, userId: string): Promise<boolean> {
  const completed = await getCompletedTrainings()
  return completed.some(c => c.training_id === trainingId && c.completed_by === userId)
}

// =====================
// Dashboard Infos
// =====================
export interface DashboardInfoRecord {
  id?: string
  title: string
  content: string
  timestamp: string
  pdf_name?: string
  pdf_url?: string
  is_popup?: boolean
  created_at?: string
}

export async function getDashboardInfos(): Promise<DashboardInfoRecord[]> {
  const response = await fetch('/api/dashboard-infos')
  if (!response.ok) throw new Error('Failed to fetch dashboard infos')
  return response.json()
}

export async function createDashboardInfo(info: Omit<DashboardInfoRecord, 'id' | 'created_at'>) {
  const response = await fetch('/api/dashboard-infos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(info)
  })
  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to create dashboard info:', error)
    throw new Error('Failed to create dashboard info')
  }
  return response.json()
}

export async function deleteDashboardInfo(id: string) {
  const response = await fetch(`/api/dashboard-infos?id=${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete dashboard info')
  return response.json()
}

export async function uploadInfoPdf(file: File): Promise<{ path: string; publicUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/pdf', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to upload PDF:', error)
    throw new Error('Failed to upload PDF')
  }

  const result = await response.json()
  return {
    path: result.path,
    publicUrl: result.publicUrl
  }
}

// =====================
// Form Submissions
// =====================
export interface FormSubmissionRecord {
  id?: string
  type: string
  title: string
  description?: string
  status: string
  submitted_at?: string
  form_data: Record<string, unknown>
  submitted_by: string
  created_at?: string
}

export async function getFormSubmissions(): Promise<FormSubmissionRecord[]> {
  const response = await fetch('/api/form-submissions')
  if (!response.ok) throw new Error('Failed to fetch form submissions')
  return response.json()
}

export async function createFormSubmission(submission: Omit<FormSubmissionRecord, 'id' | 'submitted_at' | 'created_at'>) {
  return insertFormSubmission(submission)
}

// =====================
// External Proofs
// =====================
export interface ExternalProofRecord {
  id?: string
  bezeichnung: string
  vorname: string
  nachname: string
  datum: string
  pdf_name?: string
  pdf_url?: string
  created_at?: string
}

export async function uploadProofPdf(file: File): Promise<{ path: string; publicUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/proof', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to upload proof PDF:', error)
    throw new Error('Failed to upload proof PDF')
  }

  const result = await response.json()
  return {
    path: result.path,
    publicUrl: result.publicUrl
  }
}

export async function getProofs(): Promise<ExternalProofRecord[]> {
  const response = await fetch('/api/proofs')
  if (!response.ok) throw new Error('Failed to fetch proofs')
  return response.json()
}

export async function createProof(proof: Omit<ExternalProofRecord, 'id' | 'created_at'>) {
  return insertExternalProof(proof)
}

export async function deleteProof(id: string) {
  const response = await fetch(`/api/proofs?id=${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete proof')
  return response.json()
}

export async function insertExternalProof(proof: Omit<ExternalProofRecord, 'id' | 'created_at'>) {
  const response = await fetch('/api/proofs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proof)
  })
  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to create proof:', error)
    throw new Error('Failed to create proof')
  }
  return response.json()
}

// =====================
// Chat Functions
// =====================
export interface ChatMessageRecord {
  id?: string
  sender_id: string
  recipient_id?: string
  group_id?: string
  content: string
  image_url?: string
  image_name?: string
  is_read: boolean
  created_at?: string
}

export async function upsertChatUser(userId: string, name: string, avatar?: string) {
  const response = await fetch('/api/chat/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, name, avatar })
  })
  if (!response.ok) throw new Error('Failed to upsert chat user')
  return response.json()
}

export async function getChatUsers() {
  const response = await fetch('/api/chat/users')
  if (!response.ok) throw new Error('Failed to fetch chat users')
  return response.json()
}

export async function getChatGroups() {
  const response = await fetch('/api/chat/groups')
  if (!response.ok) throw new Error('Failed to fetch chat groups')
  return response.json()
}

export async function createChatGroup(name: string, description: string, createdBy: string) {
  const response = await fetch('/api/chat/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, created_by: createdBy })
  })
  if (!response.ok) throw new Error('Failed to create chat group')
  return response.json()
}

export async function getDirectMessages(user1: string, user2: string) {
  const response = await fetch(`/api/chat/messages?user1=${user1}&user2=${user2}`)
  if (!response.ok) throw new Error('Failed to fetch direct messages')
  return response.json()
}

export async function getGroupMessages(groupId: string) {
  const response = await fetch(`/api/chat/messages?groupId=${groupId}`)
  if (!response.ok) throw new Error('Failed to fetch group messages')
  return response.json()
}

export async function sendChatMessage(message: Omit<ChatMessageRecord, 'id' | 'created_at'>) {
  const response = await fetch('/api/chat/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  })
  if (!response.ok) throw new Error('Failed to send message')
  return response.json()
}

export async function updateChatMessageStatus(messageId: string, isRead: boolean) {
  const response = await fetch('/api/chat/messages', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId, isRead })
  })
  if (!response.ok) throw new Error('Failed to update message status')
  return response.json()
}

// =====================
// Trainings Additional
// =====================
export async function insertTraining(training: Omit<TrainingRecord, 'id' | 'created_at' | 'updated_at'>) {
  const response = await fetch('/api/trainings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(training)
  })
  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to create training:', error)
    throw new Error('Failed to create training')
  }
  return response.json()
}

export async function deleteTrainingById(id: string) {
  const response = await fetch(`/api/trainings?id=${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete training')
  return response.json()
}

export async function insertCompletedTraining(data: Omit<CompletedTrainingRecord, 'id' | 'completed_at'>) {
  const response = await fetch('/api/trainings/completed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to mark training as completed')
  return response.json()
}

export async function deleteCompletedTraining(id: string) {
  const response = await fetch(`/api/trainings/completed?id=${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete completed training')
  return response.json()
}

export async function uploadTrainingFile(file: File, fileType?: string): Promise<{ path: string; publicUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  if (fileType) {
    formData.append('fileType', fileType)
  }

  const response = await fetch('/api/upload/training', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to upload training file:', error)
    throw new Error('Failed to upload training file')
  }

  const result = await response.json()
  return {
    path: result.path,
    publicUrl: result.publicUrl
  }
}

// =====================
// Form Submissions Additional
// =====================
export interface AccidentRecord {
  id?: string
  unfalltyp: string
  datum: string
  zeit: string
  verletzte_person: string
  unfallort: string
  unfallart: string
  verletzungsart: string
  schweregrad: string
  erste_hilfe: string
  arzt_kontakt: string
  zeugen?: string
  beschreibung: string
  meldende_person: string
  unfallhergang?: string
  gast_alter?: string
  gast_kontakt?: string
  created_at?: string
}

export async function insertAccident(accident: Omit<AccidentRecord, 'id' | 'created_at'>) {
  // Accidents can be stored as form submissions
  return insertFormSubmission({
    type: 'Unfall',
    title: `Unfall: ${accident.verletzte_person}`,
    description: accident.beschreibung,
    status: 'Eingegangen',
    form_data: accident as unknown as Record<string, unknown>,
    submitted_by: accident.meldende_person
  })
}

export async function insertFormSubmission(submission: Omit<FormSubmissionRecord, 'id' | 'submitted_at' | 'created_at'>) {
  const response = await fetch('/api/form-submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission)
  })
  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to create form submission:', error)
    throw new Error('Failed to create form submission')
  }
  return response.json()
}

export async function deleteFormSubmissionById(id: string) {
  const response = await fetch(`/api/form-submissions?id=${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete form submission')
  return response.json()
}

// =====================
// Documents Additional
// =====================
export async function getDocumentsFiltered(category?: string, tags?: string[]): Promise<DocumentRecord[]> {
  let url = '/api/documents'
  const params = new URLSearchParams()
  
  if (category) params.append('category', category)
  if (tags && tags.length > 0) params.append('tags', tags.join(','))
  
  if (params.toString()) url += `?${params.toString()}`
  
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch documents')
  return response.json()
}

export async function insertDocument(doc: Omit<DocumentRecord, 'id' | 'uploaded_at'>) {
  const response = await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc)
  })
  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to create document:', error)
    throw new Error('Failed to create document')
  }
  return response.json()
}

export async function uploadDocumentFile(file: File): Promise<{ path: string; publicUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/document', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to upload document:', error)
    throw new Error('Failed to upload document')
  }

  const result = await response.json()
  return {
    path: result.path,
    publicUrl: result.publicUrl
  }
}

export async function updateDocument(id: string, partial: Partial<DocumentRecord>) {
  const response = await fetch(`/api/documents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial)
  })
  if (!response.ok) throw new Error('Failed to update document')
  return response.json()
}

export async function deleteDocumentById(id: string) {
  const response = await fetch(`/api/documents?id=${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete document')
  return response.json()
}

// =====================
// Technik Inspections
// =====================
export interface TechnikInspectionRecord {
  id?: string
  rubrik: string
  id_nr: string
  name: string
  standort: string
  bild_url?: string
  bild_name?: string
  letzte_pruefung: string
  interval: string
  naechste_pruefung: string
  bericht_url?: string
  bericht_name?: string
  bemerkungen?: string
  in_betrieb: boolean
  kontaktdaten?: string
  status: string
  created_at?: string
  updated_at?: string
}

export async function getTechnikInspections(): Promise<TechnikInspectionRecord[]> {
  const response = await fetch('/api/technik')
  if (!response.ok) throw new Error('Failed to fetch technik inspections')
  return response.json()
}

export async function createTechnikInspection(inspection: Omit<TechnikInspectionRecord, 'id' | 'created_at' | 'updated_at'>) {
  const response = await fetch('/api/technik', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inspection)
  })
  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to create technik inspection:', error)
    throw new Error('Failed to create technik inspection')
  }
  return response.json()
}

export async function uploadTechnikPdf(file: File): Promise<{ path: string; publicUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/pdf', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to upload PDF:', error)
    throw new Error('Failed to upload PDF')
  }

  const result = await response.json()
  return {
    path: result.path,
    publicUrl: result.publicUrl
  }
}

export async function updateTechnikInspection(id: string, inspection: Partial<TechnikInspectionRecord>) {
  const response = await fetch('/api/technik', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...inspection })
  })
  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to update technik inspection:', error)
    throw new Error('Failed to update technik inspection')
  }
  return response.json()
}

export async function deleteTechnikInspection(id: string) {
  const response = await fetch(`/api/technik?id=${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to delete technik inspection:', error)
    throw new Error('Failed to delete technik inspection')
  }
  return response.json()
}
