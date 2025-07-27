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
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_boards_updated_at ON boards;
CREATE TRIGGER update_boards_updated_at
BEFORE UPDATE ON boards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_columns_updated_at ON columns;
CREATE TRIGGER update_columns_updated_at
BEFORE UPDATE ON columns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subtasks_updated_at ON subtasks;
CREATE TRIGGER update_subtasks_updated_at
BEFORE UPDATE ON subtasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to move a task to a different column (updated for boards)
CREATE OR REPLACE FUNCTION move_task_to_column(
  p_task_id UUID,
  p_new_column_id UUID,
  p_user_id UUID,
  p_new_position INTEGER DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_old_column_id UUID;
  v_old_position INTEGER;
  v_new_board_id UUID;
  v_old_board_id UUID;
  v_max_position INTEGER;
  v_task_board_id UUID;
  v_column_board_id UUID;
BEGIN
  -- Get task's current state
  SELECT board_id, column_id, position INTO v_task_board_id, v_old_column_id, v_old_position
  FROM tasks WHERE id = p_task_id;

  -- Verify task exists and belongs to user's board
  IF NOT EXISTS (
    SELECT 1 FROM boards WHERE id = v_task_board_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Task does not belong to user';
  END IF;

  -- Get the board ID for the new column and verify it belongs to user
  SELECT board_id INTO v_column_board_id
  FROM columns WHERE id = p_new_column_id;

  IF NOT EXISTS (
    SELECT 1 FROM boards WHERE id = v_column_board_id AND user_id = p_user_id
  ) THEN
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

  -- Move the task (update both column and board if moving between boards)
  UPDATE tasks
  SET 
    board_id = v_column_board_id,
    column_id = p_new_column_id, 
    position = p_new_position
  WHERE id = p_task_id;
END;
$$ LANGUAGE 'plpgsql';

-- Function to create a default board with columns for a new user
CREATE OR REPLACE FUNCTION create_default_board_for_user(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_board_id UUID;
BEGIN
  -- Create default board
  INSERT INTO boards (user_id, name, description, is_default, position)
  VALUES (p_user_id, 'My First Board', 'Default board created automatically', true, 1)
  RETURNING id INTO v_board_id;

  -- Create default columns for the board
  INSERT INTO columns (board_id, name, position, color) VALUES
    (v_board_id, 'Backlog', 1, '#6B7280'),
    (v_board_id, 'To Do', 2, '#3B82F6'),
    (v_board_id, 'In Progress', 3, '#F59E0B'),
    (v_board_id, 'Review', 4, '#8B5CF6'),
    (v_board_id, 'Done', 5, '#10B981');

  RETURN v_board_id;
END;
$$ LANGUAGE 'plpgsql';

-- Function to duplicate a board (useful for templates)
CREATE OR REPLACE FUNCTION duplicate_board(
  p_source_board_id UUID,
  p_user_id UUID,
  p_new_board_name VARCHAR(100) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_new_board_id UUID;
  v_max_position INTEGER;
  v_source_board_name VARCHAR(100);
  column_record RECORD;
BEGIN
  -- Verify source board belongs to user
  SELECT name INTO v_source_board_name
  FROM boards 
  WHERE id = p_source_board_id AND user_id = p_user_id;

  IF v_source_board_name IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Board does not belong to user';
  END IF;

  -- Get next position for new board
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_max_position
  FROM boards WHERE user_id = p_user_id;

  -- Create new board
  INSERT INTO boards (user_id, name, description, color, position)
  SELECT 
    p_user_id,
    COALESCE(p_new_board_name, v_source_board_name || ' (Copy)'),
    description,
    color,
    v_max_position
  FROM boards
  WHERE id = p_source_board_id
  RETURNING id INTO v_new_board_id;

  -- Duplicate columns
  FOR column_record IN 
    SELECT name, position, color
    FROM columns 
    WHERE board_id = p_source_board_id
    ORDER BY position
  LOOP
    INSERT INTO columns (board_id, name, position, color)
    VALUES (v_new_board_id, column_record.name, column_record.position, column_record.color);
  END LOOP;

  RETURN v_new_board_id;
END;
$$ LANGUAGE 'plpgsql';

-- Note: RLS policies commented out for development
-- Uncomment when implementing proper authentication context
/*
-- Enable RLS (Row-Level Security)
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own boards
CREATE POLICY boards_isolation ON boards
FOR ALL
USING (user_id = current_setting('app.current_user_id')::UUID);

-- Policy: users can only see columns from their boards
CREATE POLICY columns_isolation ON columns
FOR ALL
USING (board_id IN (
  SELECT id FROM boards WHERE user_id = current_setting('app.current_user_id')::UUID
));

-- Policy: users can only see tasks from their boards
CREATE POLICY tasks_isolation ON tasks
FOR ALL
USING (board_id IN (
  SELECT id FROM boards WHERE user_id = current_setting('app.current_user_id')::UUID
));
*/