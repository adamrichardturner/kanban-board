-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_columns_updated_at
BEFORE UPDATE ON columns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtasks_updated_at
BEFORE UPDATE ON subtasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to move a task to a different column with position adjustment
CREATE OR REPLACE FUNCTION move_task_to_column(
  p_task_id UUID,
  p_new_column_id UUID,
  p_user_id UUID,
  p_new_position INTEGER DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_old_column_id UUID;
  v_old_position INTEGER;
  v_max_position INTEGER;
  v_task_user_id UUID;
  v_column_user_id UUID;
BEGIN
  -- Verify task belongs to user
  SELECT user_id, column_id, position INTO v_task_user_id, v_old_column_id, v_old_position
  FROM tasks WHERE id = p_task_id;

  IF v_task_user_id != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Task does not belong to user';
  END IF;

  -- Verify new column belongs to user
  SELECT user_id INTO v_column_user_id
  FROM columns WHERE id = p_new_column_id;

  IF v_column_user_id != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Column does not belong to user';
  END IF;

  -- If no new position specified, append to end
  IF p_new_position IS NULL THEN
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_max_position
    FROM tasks WHERE column_id = p_new_column_id;
    p_new_position := v_max_position;
  END IF;

  -- Adjust positions in old column
  UPDATE tasks
  SET position = position - 1
  WHERE column_id = v_old_column_id AND position > v_old_position;

  -- Make room in new column
  UPDATE tasks
  SET position = position + 1
  WHERE column_id = p_new_column_id AND position >= p_new_position;

  -- Move the task
  UPDATE tasks
  SET column_id = p_new_column_id, position = p_new_position
  WHERE id = p_task_id;
END;
$$ LANGUAGE 'plpgsql';

-- Function to create default columns for a new user
CREATE OR REPLACE FUNCTION create_default_columns_for_user(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO columns (user_id, name, position, color) VALUES
    (p_user_id, 'Backlog', 1, '#6B7280'),
    (p_user_id, 'To Do', 2, '#3B82F6'),
    (p_user_id, 'In Progress', 3, '#F59E0B'),
    (p_user_id, 'Review', 4, '#8B5CF6'),
    (p_user_id, 'Done', 5, '#10B981');
END;
$$ LANGUAGE 'plpgsql';

-- Enable RLS (Row-Level Security)
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own columns
CREATE POLICY columns_isolation ON columns
FOR ALL
USING (user_id = current_setting('app.current_user_id')::UUID);

-- Policy: users can only see their own tasks
CREATE POLICY tasks_isolation ON tasks
FOR ALL
USING (user_id = current_setting('app.current_user_id')::UUID);
