import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { LogEntry } from '../types';

interface LiveConsoleProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({ logs, onClearLogs }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTagColor = (tag: LogEntry['tag']) => {
    switch (tag) {
      case 'WEBHOOK':
        return 'text-indigo-400 bg-indigo-950/60 border-indigo-800';
      case 'S3_PRESIGN':
        return 'text-blue-400 bg-blue-950/60 border-blue-800';
      case 'PDF_WATERMARK':
        return 'text-purple-400 bg-purple-950/60 border-purple-800';
      case 'RECEIPT_PDF':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
      case 'EMAIL_SERVICE':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-emerald-300';
      case 'warn':
        return 'text-amber-300';
      case 'error':
        return 'text-rose-400 font-bold';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur border-t border-slate-800 shadow-2xl text-xs font-mono">
      {/* Console Bar Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold tracking-wider text-[11px] text-slate-300">
            SYSTEM EVENT STREAM
          </span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[10px]">
            {logs.length} events
          </span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <span className="text-[11px] text-slate-400 hidden sm:inline truncate max-w-md">
              Latest: {logs[logs.length - 1].message}
            </span>
          )}
          <button
            onClick={onClearLogs}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Log Output */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 max-h-56 overflow-y-auto space-y-1.5 border-t border-slate-900 scrollbar-thin">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-[11px] leading-tight">
              <span className="text-slate-500 shrink-0 select-none">
                [{log.timestamp}]
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getTagColor(log.tag)} shrink-0`}>
                {log.tag}
              </span>
              <span className={`break-all ${getLevelColor(log.level)}`}>
                {log.message}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-500 py-3 text-center">
              No logged events yet. Trigger checkout or webhook to stream execution logs.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
