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
  // TODO: Implement when needed
  return []
}

export async function createDocument(doc: Omit<DocumentRecord, 'id' | 'uploaded_at'>) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function deleteDocument(id: string) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
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
  // TODO: Implement when needed
  return []
}

export async function createDashboardInfo(info: Omit<DashboardInfoRecord, 'id' | 'created_at'>) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function deleteDashboardInfo(id: string) {
  // TODO: Implement when needed
  throw new Error('Not implemented')
}

export async function uploadInfoPdf(file: File): Promise<{ path: string; publicUrl: string }> {
  // TODO: Implement file upload to storage solution
  throw new Error('Not implemented')
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
  form_data: any
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