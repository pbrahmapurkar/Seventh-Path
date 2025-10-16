/**
 * Import Dialog Component
 * Handles CSV import with validation, merge/replace options, and detailed feedback
 */

import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2, Info, FileText, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import type { CSVImportResult } from '../../utils/csvExport';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (mode: 'merge' | 'replace') => Promise<CSVImportResult>;
  fileName?: string;
  habitCount?: number;
}

export function ImportDialog({
  open,
  onClose,
  onImport,
  fileName,
  habitCount
}: ImportDialogProps) {
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [step, setStep] = useState<'choose' | 'importing' | 'result'>('choose');

  const handleImport = async () => {
    setStep('importing');
    setIsImporting(true);
    
    try {
      const importResult = await onImport(mode);
      setResult(importResult);
      setStep('result');
    } catch (error) {
      setResult({
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error during import']
      });
      setStep('result');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setStep('choose');
    setResult(null);
    setMode('merge');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Import Habits
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Choose Mode */}
        {step === 'choose' && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{fileName || 'Unknown file'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {habitCount ? `${habitCount} habit${habitCount !== 1 ? 's' : ''} found` : 'Analyzing...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Import Mode Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">How should we import?</Label>
              
              <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'merge' | 'replace')}>
                <div className="space-y-3">
                  {/* Merge Option */}
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    mode === 'merge' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`} onClick={() => setMode('merge')}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="merge" id="merge" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="merge" className="text-base font-semibold cursor-pointer">
                          Merge (Recommended)
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Keep existing habits and add new ones. Update habits with matching IDs.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">Safe</Badge>
                          <Badge variant="outline" className="text-xs">No data loss</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Replace Option */}
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    mode === 'replace' 
                      ? 'border-destructive bg-destructive/5' 
                      : 'border-border hover:border-destructive/50'
                  }`} onClick={() => setMode('replace')}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="replace" id="replace" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="replace" className="text-base font-semibold cursor-pointer">
                          Replace All
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Delete all existing habits and replace with imported data.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Destructive
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Warning for Replace Mode */}
            {mode === 'replace' && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Warning</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This will permanently delete all your current habits and replace them with the imported data.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleImport} className="flex-1" disabled={isImporting}>
                Import {mode === 'merge' ? 'and Merge' : 'and Replace'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Importing */}
        {step === 'importing' && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Importing habits...</h3>
            <p className="text-sm text-muted-foreground">
              {mode === 'merge' ? 'Merging with existing data' : 'Replacing all habits'}
            </p>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && result && (
          <div className="space-y-6">
            {/* Success/Error Header */}
            <div className={`rounded-xl p-4 ${
              result.success 
                ? 'bg-success/10 border border-success/20' 
                : 'bg-destructive/10 border border-destructive/20'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    {result.success ? 'Import Successful!' : 'Import Failed'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.success 
                      ? 'Your habits have been imported and are now visible in the app.'
                      : 'There were errors importing your data. Please check the file and try again.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Import Statistics */}
            {result.success && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/30 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-success">{result.imported || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Imported</div>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{result.updated || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Updated</div>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{result.skipped || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Skipped</div>
                </div>
              </div>
            )}

            {/* Warnings */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-warning flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Warnings</p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      {result.warnings.map((warning, i) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors && result.errors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-destructive">Errors</p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <Button onClick={handleClose} className="w-full">
              {result.success ? 'Done' : 'Close'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
