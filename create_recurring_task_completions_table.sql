-- =====================================================
-- CREATE RECURRING TASK COMPLETIONS TABLE
-- LA OLA Intranet - Track recurring task completions
-- =====================================================

-- Recurring Task Completions Table
CREATE TABLE IF NOT EXISTS recurring_task_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_task_id UUID REFERENCES recurring_tasks(id) ON DELETE CASCADE,
  completed_by VARCHAR(255) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  next_due_date VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_recurring_task_completions_task_id
  ON recurring_task_completions (recurring_task_id, completed_at);

CREATE INDEX IF NOT EXISTS idx_recurring_task_completions_completed_by
  ON recurring_task_completions (completed_by, completed_at);
