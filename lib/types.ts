export interface Profile {
  id: string
  name: string
  phone: string | null
  created_at: string
}

export type ProjectStatus = 'active' | 'archived'
export type Priority = 'urgent' | 'moderate' | 'low'
export type TaskStatus = 'not_done' | 'done' | 'rescheduled'

export const PROJECT_COLORS = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706',
  '#7c3aed', '#db2777', '#0891b2', '#65a30d',
]

export interface Project {
  id: string
  name: string
  address: string
  color: string
  status: ProjectStatus
  created_at: string
}

export interface Note {
  id: string
  project_id: string
  author_id: string | null
  content: string
  created_at: string
}

export interface Task {
  id: string
  project_id: string | null
  title: string
  assignee_id: string | null
  priority: Priority
  status: TaskStatus
  due_date: string | null
  notes: string | null
  created_at: string
}

export interface CalendarEvent {
  id: string
  project_id: string
  title: string
  event_date: string
  event_time: string | null
  contact_id: string | null
  created_at: string
}

export interface Folder {
  id: string
  project_id: string
  name: string
  created_at: string
}

export interface ProjectFile {
  id: string
  folder_id: string
  name: string
  url: string
  file_type: 'image' | 'document'
  created_at: string
}

export interface Contact {
  id: string
  name: string
  company: string | null
  trade: string
  phone: string
  notes: string | null
  created_at: string
}

export interface LookbookHome {
  id: string
  name: string
  address: string
  year: number | null
  hero_photo_url: string | null
  created_at: string
}

export interface LookbookRoom {
  id: string
  home_id: string
  room_type: string
  created_at: string
}

export interface LookbookPhoto {
  id: string
  room_id: string
  url: string
  created_at: string
}
