import { useState } from 'react';
import { AlertCircle, CheckCircle2, Info, FileText, XCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
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

  // Determine Modal Props based on step
  const getModalProps = () => {
    if (step === 'choose') {
      return {
        title: 'Import Habits',
        type: mode === 'replace' ? 'destructive' as const : 'confirm' as const,
        primaryAction: {
          label: mode === 'merge' ? 'Import and Merge' : 'Import and Replace',
          onClick: handleImport,
          isLoading: isImporting
        },
        secondaryAction: {
          label: 'Cancel',
          onClick: handleClose
        }
      };
    }

    if (step === 'importing') {
      return {
        title: 'Importing...',
        type: 'info' as const,
        // No actions during import
      };
    }

    // Result step
    return {
      title: result?.success ? 'Import Successful' : 'Import Failed',
      type: result?.success ? 'info' as const : 'destructive' as const,
      primaryAction: {
        label: result?.success ? 'Done' : 'Close',
        onClick: handleClose
      }
    };
  };

  const modalProps = getModalProps();

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      {...modalProps}
    >
      {/* Step 1: Choose Mode */}
      {step === 'choose' && (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{fileName || 'Unknown file'}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {habitCount ? `${habitCount} habit${habitCount !== 1 ? 's' : ''} found` : 'Analyzing...'}
                </p>
              </div>
            </div>
          </div>

          {/* Import Mode Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-white">How should we import?</Label>

            <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'merge' | 'replace')}>
              <div className="space-y-3">
                {/* Merge Option */}
                <div
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${mode === 'merge'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/10 hover:border-emerald-500/50 hover:bg-white/5'
                    }`}
                  onClick={() => setMode('merge')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="merge" id="merge" className="mt-1 border-slate-500 text-emerald-500" />
                    <div className="flex-1">
                      <Label htmlFor="merge" className="text-base font-semibold text-white cursor-pointer">
                        Merge (Recommended)
                      </Label>
                      <p className="text-sm text-slate-400 mt-1">
                        Keep existing habits and add new ones. Update habits with matching IDs.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">Safe</Badge>
                        <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">No data loss</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Replace Option */}
                <div
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${mode === 'replace'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-white/10 hover:border-red-500/50 hover:bg-white/5'
                    }`}
                  onClick={() => setMode('replace')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="replace" id="replace" className="mt-1 border-slate-500 text-red-500" />
                    <div className="flex-1">
                      <Label htmlFor="replace" className="text-base font-semibold text-white cursor-pointer">
                        Replace All
                      </Label>
                      <p className="text-sm text-slate-400 mt-1">
                        Delete all existing habits and replace with imported data.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="destructive" className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0">
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
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-500">Warning</p>
                  <p className="text-sm text-red-400/80 mt-1">
                    This will permanently delete all your current habits and replace them with the imported data.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Importing */}
      {step === 'importing' && (
        <div className="py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400">
            {mode === 'merge' ? 'Merging with existing data...' : 'Replacing all habits...'}
          </p>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 'result' && result && (
        <div className="space-y-6">
          {/* Success/Error Header */}
          <div className={`rounded-xl p-4 ${result.success
            ? 'bg-emerald-500/10 border border-emerald-500/20'
            : 'bg-red-500/10 border border-red-500/20'
            }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              )}
              <div>
                <h3 className={`font-semibold text-lg ${result.success ? 'text-emerald-500' : 'text-red-500'}`}>
                  {result.success ? 'Import Successful!' : 'Import Failed'}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
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
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                <div className="text-2xl font-bold text-emerald-500">{result.imported || 0}</div>
                <div className="text-xs text-slate-400 mt-1">Imported</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                <div className="text-2xl font-bold text-blue-500">{result.updated || 0}</div>
                <div className="text-xs text-slate-400 mt-1">Updated</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                <div className="text-2xl font-bold text-slate-500">{result.skipped || 0}</div>
                <div className="text-xs text-slate-400 mt-1">Skipped</div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-500">Warnings</p>
                  <ul className="text-sm text-amber-400/80 mt-2 space-y-1">
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
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-500">Errors</p>
                  <ul className="text-sm text-red-400/80 mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {result.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
