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
  completed_by: string
  completed_at?: string
  notes?: string
}

// Note: Training APIs would need to be created
// Keeping placeholder functions

export async function getTrainings(): Promise<TrainingRecord[]> {
  // TODO: Implement when needed
  return []
}

export async function createTraining(training: Omit<TrainingRecord, 'id' | 'created_at' | 'updated_at'>) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function deleteTraining(id: string) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function markTrainingComplete(trainingId: string, completedBy: string, notes?: string) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function getCompletedTrainings(): Promise<CompletedTrainingRecord[]> {
  // TODO: Implement when needed
  return []
}

export async function hasCompletedTraining(trainingId: string, userId: string): Promise<boolean> {
  // TODO: Implement when needed
  return false
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
  // TODO: Implement when needed
  return []
}

export async function createFormSubmission(submission: Omit<FormSubmissionRecord, 'id' | 'submitted_at' | 'created_at'>) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
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
  // TODO: Implement file upload to storage solution
  throw new Error('Not implemented')
}

export async function getProofs(): Promise<ExternalProofRecord[]> {
  // TODO: Implement when needed
  return []
}

export async function createProof(proof: Omit<ExternalProofRecord, 'id' | 'created_at'>) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function deleteProof(id: string) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function insertExternalProof(proof: Omit<ExternalProofRecord, 'id' | 'created_at'>) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
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

export async function upsertChatUser(userId: string, name: string) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function getChatUsers() {
  // TODO: Implement when needed
  return []
}

export async function getChatGroups() {
  // TODO: Implement when needed
  return []
}

export async function createChatGroup(name: string, description: string, createdBy: string) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function getDirectMessages(user1: string, user2: string) {
  // TODO: Implement when needed
  return []
}

export async function getGroupMessages(groupId: string) {
  // TODO: Implement when needed
  return []
}

export async function sendChatMessage(message: Omit<ChatMessageRecord, 'id' | 'created_at'>) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function updateChatMessageStatus(messageId: string, isRead: boolean) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

// =====================
// Trainings Additional
// =====================
export async function insertTraining(training: Omit<TrainingRecord, 'id' | 'created_at' | 'updated_at'>) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function deleteTrainingById(id: string) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function insertCompletedTraining(trainingId: string, completedBy: string, notes?: string) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function uploadTrainingFile(file: File): Promise<{ path: string; publicUrl: string }> {
  // TODO: Implement file upload
  throw new Error('Not implemented')
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
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function insertFormSubmission(submission: Omit<FormSubmissionRecord, 'id' | 'submitted_at' | 'created_at'>) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function deleteFormSubmissionById(id: string) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
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