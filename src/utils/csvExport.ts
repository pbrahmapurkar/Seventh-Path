/**
 * CSV Export/Import utilities for Seventh Path
 * Handles exporting and importing habit data including completion history, timer sessions, and notes
 */

import type { HabitDef, DayEntry } from '../lib/habits/types';
import type { HabitStats } from '../store/HabitsStore';

export interface HabitExportData {
  // Habit metadata
  id: string;
  name: string;
  emoji: string;
  frequency: 'daily' | 'weekly';
  weeklyDays?: number[];
  reminderTimes: string[];
  createdAt: string;
  
  // Stats
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  totalCompletions: number;
  
  // Timer configuration
  timerEnabled?: boolean;
  timerMode?: string;
  timerDefaultDuration?: number;
  timerAutoComplete?: boolean;
  
  // Completion history (JSON string with ISO timestamps)
  completionHistory: string;
  
  // Timer sessions (JSON string)
  timerSessions?: string;
  
  // Notes (future feature, included for forward compatibility)
  notes?: string;
}

export interface CSVExportResult {
  success: boolean;
  csv?: string;
  filename?: string;
  habitCount?: number;
  error?: string;
}

export interface CSVImportResult {
  success: boolean;
  imported?: number;
  updated?: number;
  skipped?: number;
  errors?: string[];
  warnings?: string[];
}

export interface CSVImportOptions {
  mode: 'merge' | 'replace';
  validateOnly?: boolean;
}

/**
 * CSV Schema Version for compatibility checking
 */
const CSV_SCHEMA_VERSION = '1.0';

/**
 * Convert habit data to CSV format
 */
export function exportHabitsToCSV(
  habitsById: Record<string, HabitDef>,
  statsById: Record<string, HabitStats>,
  habitDaysByKey: Record<string, DayEntry>
): CSVExportResult {
  try {
    const habits = Object.values(habitsById);
    
    if (habits.length === 0) {
      return { success: false, error: 'No habits to export' };
    }

    // Build CSV header
    const headers = [
      'id',
      'name',
      'emoji',
      'frequency',
      'weeklyDays',
      'reminderTimes',
      'createdAt',
      'currentStreak',
      'bestStreak',
      'completionRate',
      'totalCompletions',
      'timerEnabled',
      'timerMode',
      'timerDefaultDuration',
      'timerAutoComplete',
      'completionHistory',
      'timerSessions'
    ];

    // Build CSV rows
    const rows: string[][] = [];
    
    for (const habit of habits) {
      const stats = statsById[habit.id] || {
        currentStreak: 0,
        bestStreak: 0,
        completionRate: 0,
        totalCompletions: 0
      };

      // Get completion history for this habit
      const completionHistory: Record<string, any> = {};
      const timerSessions: any[] = [];
      
      Object.entries(habitDaysByKey).forEach(([key, dayEntry]) => {
        if (key.startsWith(`habit:${habit.id}:day:`)) {
          const date = key.split(':day:')[1];
          completionHistory[date] = {
            reminders: dayEntry.reminders,
            updatedAt: dayEntry.updatedAt
          };
          // Collect timer sessions
          if (dayEntry.timerSessions && dayEntry.timerSessions.length > 0) {
            timerSessions.push(...dayEntry.timerSessions);
          }
        }
      });

      const row = [
        habit.id,
        habit.name,
        habit.emoji || '',
        habit.frequency || 'daily',
        JSON.stringify(habit.weeklyDays || []),
        JSON.stringify(habit.reminderTimes || []),
        habit.createdAt,
        stats.currentStreak?.toString() || '0',
        stats.bestStreak?.toString() || '0',
        stats.completionRate?.toString() || '0',
        stats.totalCompletions?.toString() || '0',
        habit.timerConfig?.enabled ? 'true' : 'false',
        habit.timerConfig?.mode || '',
        habit.timerConfig?.defaultDuration?.toString() || '',
        habit.timerConfig?.autoCompleteHabit ? 'true' : 'false',
        JSON.stringify(completionHistory),
        JSON.stringify(timerSessions)
      ];

      rows.push(row);
    }

    // Combine into CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => escapeCSVCell(cell)).join(','))
    ].join('\n');

    return { success: true, csv: csvContent };
  } catch (error) {
    console.error('CSV export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during export'
    };
  }
}

/**
 * Parse CSV content and extract habit data
 */
export function parseCSV(csvContent: string): HabitExportData[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const habits: HabitExportData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cells = parseCSVLine(line);
    if (cells.length !== headers.length) {
      console.warn(`Skipping malformed row ${i + 1}`);
      continue;
    }

    const habit: any = {};
    headers.forEach((header, index) => {
      const value = cells[index];
      
      // Parse JSON fields
      if (['weeklyDays', 'reminderTimes', 'completionHistory', 'timerSessions'].includes(header)) {
        try {
          habit[header] = JSON.parse(value || (header === 'completionHistory' ? '{}' : '[]'));
        } catch {
          habit[header] = ['completionHistory', 'timerSessions'].includes(header) ? {} : [];
        }
      } else if (['currentStreak', 'bestStreak', 'completionRate', 'totalCompletions', 'timerDefaultDuration'].includes(header)) {
        habit[header] = parseFloat(value) || 0;
      } else if (['timerEnabled', 'timerAutoComplete'].includes(header)) {
        habit[header] = value === 'true';
      } else {
        habit[header] = value;
      }
    });

    habits.push(habit as HabitExportData);
  }

  return habits;
}

/**
 * Validate imported habit data
 */
export function validateHabitData(habit: HabitExportData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!habit.id || typeof habit.id !== 'string') {
    errors.push('Invalid or missing habit ID');
  }

  if (!habit.name || typeof habit.name !== 'string') {
    errors.push('Invalid or missing habit name');
  }

  if (habit.frequency && !['daily', 'weekly'].includes(habit.frequency)) {
    errors.push('Invalid frequency (must be daily or weekly)');
  }

  if (habit.reminderTimes && !Array.isArray(habit.reminderTimes)) {
    errors.push('Invalid reminder times format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Escape CSV cell content
 */
function escapeCSVCell(cell: string): string {
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(currentCell.trim());
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  cells.push(currentCell.trim());
  return cells;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'seventh-path-habits.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Generate timestamp-based filename
 */
export function generateFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0].replace(/-/g, '');
  return `seventh-path-export-${timestamp}.csv`;
}
