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
 * Convert habit data to CSV format with complete fidelity
 */
export function exportHabitsToCSV(
  habitsById: Record<string, HabitDef>,
  statsById: Record<string, HabitStats>,
  habitDaysByKey: Record<string, DayEntry>
): CSVExportResult {
  try {
    const habits = Object.values(habitsById);
    
    if (habits.length === 0) {
      return { 
        success: false, 
        error: 'No habits to export. Create some habits first!' 
      };
    }

    // Build CSV header with schema version
    const headers = [
      'schemaVersion',
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
      'timerSessions',
      'notes',
      'exportedAt' // ISO timestamp of export
    ];

    // Build CSV rows
    const rows: string[][] = [];
    const exportedAt = new Date().toISOString();
    
    for (const habit of habits) {
      const stats = statsById[habit.id] || {
        currentStreak: 0,
        bestStreak: 0,
        completionRate: 0,
        totalCompletions: 0
      };

      // Get completion history for this habit with full timestamps
      const completionHistory: Record<string, any> = {};
      Object.entries(habitDaysByKey).forEach(([key, dayEntry]) => {
        if (key.startsWith(`habit:${habit.id}:day:`)) {
          const date = key.split(':day:')[1];
          completionHistory[date] = {
            reminders: dayEntry.reminders,
            updatedAt: dayEntry.updatedAt || new Date().toISOString(),
            timerSessions: dayEntry.timerSessions || []
          };
        }
      });

      // Collect timer sessions
      const timerSessions: any[] = [];
      Object.values(completionHistory).forEach((day: any) => {
        if (day.timerSessions && day.timerSessions.length > 0) {
          timerSessions.push(...day.timerSessions);
        }
      });

      const row = [
        CSV_SCHEMA_VERSION,
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
        JSON.stringify(timerSessions),
        '', // notes placeholder for future
        exportedAt
      ];

      rows.push(row);
    }

    // Combine into CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => escapeCSVCell(cell)).join(','))
    ].join('\n');

    const filename = generateFilename();

    return { 
      success: true, 
      csv: csvContent,
      filename,
      habitCount: habits.length
    };
  } catch (error) {
    console.error('CSV export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during export'
    };
  }
}

/**
 * Parse CSV content and extract habit data with validation
 */
export function parseCSV(csvContent: string): { habits: HabitExportData[]; schemaVersion: string } {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const habits: HabitExportData[] = [];
  let schemaVersion = '1.0';

  // Check if schemaVersion is in headers
  const hasSchemaVersion = headers.includes('schemaVersion');

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cells = parseCSVLine(line);
    if (cells.length !== headers.length) {
      console.warn(`Skipping malformed row ${i + 1}: expected ${headers.length} columns, got ${cells.length}`);
      continue;
    }

    const habit: any = {};
    headers.forEach((header, index) => {
      const value = cells[index];
      
      if (header === 'schemaVersion' && i === 1) {
        schemaVersion = value || '1.0';
      }
      
      // Parse JSON fields
      if (['weeklyDays', 'reminderTimes', 'completionHistory', 'timerSessions'].includes(header)) {
        try {
          habit[header] = JSON.parse(value || (header === 'completionHistory' ? '{}' : '[]'));
        } catch (e) {
          console.warn(`Failed to parse ${header} for row ${i + 1}:`, e);
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

    // Validate required fields
    if (!habit.id || !habit.name) {
      console.warn(`Skipping row ${i + 1}: missing required fields (id or name)`);
      continue;
    }

    habits.push(habit as HabitExportData);
  }

  return { habits, schemaVersion };
}

/**
 * Validate imported habit data with detailed error reporting
 */
export function validateHabitData(habit: HabitExportData): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!habit.id || typeof habit.id !== 'string') {
    errors.push('Invalid or missing habit ID');
  }

  if (!habit.name || typeof habit.name !== 'string') {
    errors.push('Invalid or missing habit name');
  }

  // Frequency validation
  if (habit.frequency && !['daily', 'weekly'].includes(habit.frequency)) {
    errors.push('Invalid frequency (must be daily or weekly)');
  }

  // Reminder times validation
  if (habit.reminderTimes && !Array.isArray(habit.reminderTimes)) {
    errors.push('Invalid reminder times format');
  }

  // Timer validation
  if (habit.timerEnabled) {
    if (habit.timerMode && !['countdown', 'stopwatch'].includes(habit.timerMode)) {
      warnings.push('Invalid timer mode, will default to countdown');
    }
    if (habit.timerDefaultDuration && (habit.timerDefaultDuration < 0 || habit.timerDefaultDuration > 86400)) {
      warnings.push('Timer duration out of range (0-24 hours)');
    }
  }

  // Date validation
  if (habit.createdAt) {
    const date = new Date(habit.createdAt);
    if (isNaN(date.getTime())) {
      warnings.push('Invalid createdAt timestamp, will use current time');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Escape CSV cell content properly
 */
function escapeCSVCell(cell: string): string {
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

/**
 * Parse a single CSV line handling quoted values and edge cases
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
 * Download CSV file with proper naming
 */
export function downloadCSV(csvContent: string, filename: string): void {
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
