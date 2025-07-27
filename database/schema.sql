-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for status
CREATE TYPE task_status AS ENUM ('todo', 'doing', 'done');
CREATE TYPE subtask_status AS ENUM ('todo', 'doing', 'done');

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table for JWT refresh token storage
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Columns table (now user-specific)
CREATE TABLE columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, position),
    UNIQUE(user_id, name)
);

-- Tasks table (now user-specific)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    column_id UUID NOT NULL,
    position INTEGER NOT NULL,
    due_date DATE,
    priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE,
    UNIQUE(column_id, position)
);

-- Subtasks table
CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    status subtask_status NOT NULL DEFAULT 'todo',
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(task_id, position)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_columns_user_id ON columns(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_column_id ON tasks(column_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX idx_subtasks_status ON subtasks(status);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_columns_updated_at BEFORE UPDATE ON columns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON subtasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to move a task to a different column (with user validation)
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
    
    -- If no new position specified, add to end
    IF p_new_position IS NULL THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_max_position
        FROM tasks WHERE column_id = p_new_column_id;
        p_new_position := v_max_position;
    END IF;
    
    -- Update positions in old column
    UPDATE tasks 
    SET position = position - 1 
    WHERE column_id = v_old_column_id AND position > v_old_position;
    
    -- Make space in new column
    UPDATE tasks 
    SET position = position + 1 
    WHERE column_id = p_new_column_id AND position >= p_new_position;
    
    -- Move the task
    UPDATE tasks 
    SET column_id = p_new_column_id, position = p_new_position 
    WHERE id = p_task_id;
END;
$$ LANGUAGE plpgsql;

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
$$ LANGUAGE plpgsql;

-- Row Level Security Policies (optional but recommended)
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy for columns: users can only see their own columns
CREATE POLICY columns_isolation ON columns
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Policy for tasks: users can only see their own tasks
CREATE POLICY tasks_isolation ON tasks
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Grant necessary permissions to your app user
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_app_user;