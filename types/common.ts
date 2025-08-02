export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type NullableOptional<T> = T | null | undefined;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type NonNullable<T> = T extends null | undefined ? never : T;

export type DatabaseOperation = 'create' | 'read' | 'update' | 'delete';

// CRUD operation result
export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  affectedRows?: number;
}

// Generic ID type (UUID)
export type ID = string;

// Color types for boards and columns
export type HexColor = `#${string}`;

export interface ColorOption {
  name: string;
  value: HexColor;
  contrast: HexColor; // Text color for contrast
}

// Common color palette
export const COLOR_PALETTE: ColorOption[] = [
  { name: 'Blue', value: '#3B82F6', contrast: '#FFFFFF' },
  { name: 'Green', value: '#10B981', contrast: '#FFFFFF' },
  { name: 'Purple', value: '#8B5CF6', contrast: '#FFFFFF' },
  { name: 'Red', value: '#EF4444', contrast: '#FFFFFF' },
  { name: 'Orange', value: '#F59E0B', contrast: '#FFFFFF' },
  { name: 'Pink', value: '#EC4899', contrast: '#FFFFFF' },
  { name: 'Indigo', value: '#6366F1', contrast: '#FFFFFF' },
  { name: 'Gray', value: '#6B7280', contrast: '#FFFFFF' },
] as const;

// Priority levels
export enum Priority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
  CRITICAL = 4,
}

export interface PriorityOption {
  value: Priority;
  label: string;
  color: HexColor;
  icon?: string;
}

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: Priority.LOW, label: 'Low', color: '#6B7280' },
  { value: Priority.NORMAL, label: 'Normal', color: '#3B82F6' },
  { value: Priority.HIGH, label: 'High', color: '#F59E0B' },
  { value: Priority.URGENT, label: 'Urgent', color: '#EF4444' },
  { value: Priority.CRITICAL, label: 'Critical', color: '#DC2626' },
] as const;

// Position/ordering types
export interface PositionUpdate {
  id: ID;
  newPosition: number;
  oldPosition?: number;
}

export interface MoveOperation {
  itemId: ID;
  sourceContainerId: ID;
  targetContainerId: ID;
  newPosition: number;
}

// Drag and drop types
export interface DragItem {
  id: ID;
  type: 'task' | 'subtask' | 'column' | 'board';
  data: unknown;
}

export interface DropResult {
  dragItem: DragItem;
  sourceId: ID;
  targetId: ID;
  position: number;
}

// Date/time utility types
export type DateString = string; // ISO date string
export type TimeStamp = number; // Unix timestamp

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeRange {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// Search and filter types
export interface SearchOptions {
  query: string;
  fields?: string[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
}

export interface FilterOption<T = unknown> {
  label: string;
  value: T;
  count?: number;
  disabled?: boolean;
}

// Modal/dialog types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

// Form types
export interface FormField<T = unknown> {
  name: string;
  label: string;
  type: string;
  value: T;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Toast/notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: ID;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // ms
  persistent?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  primary: HexColor;
  secondary: HexColor;
  accent: HexColor;
  background: HexColor;
  surface: HexColor;
  text: HexColor;
}

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Application state types
export interface AppState {
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  theme: Theme;
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  modal: {
    isOpen: boolean;
    type: string | null;
    data: unknown;
  };
}

// Event types
export interface AppEvent<T = unknown> {
  type: string;
  payload?: T;
  timestamp: Date;
  source?: string;
}

// Generic component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = unknown> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
  lastUpdated?: Date;
}

// Keyboard shortcuts
export interface KeyboardShortcut {
  key: string;
  modifier?: 'ctrl' | 'alt' | 'shift' | 'meta';
  description: string;
  action: () => void;
}

// Feature flags
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
}
