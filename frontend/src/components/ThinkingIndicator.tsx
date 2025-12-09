import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, Search, Calculator, FileText, Sparkles } from 'lucide-react';

interface ThinkingStep {
  tool_name?: string;
  status?: string;
  query?: string;
  timestamp: number;
}

interface ThinkingIndicatorProps {
  steps: ThinkingStep[];
  isThinking: boolean;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ steps, isThinking }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isThinking && steps.length === 0) {
    return null;
  }

  const getToolIcon = (toolName?: string) => {
    if (!toolName) return <Sparkles className="w-4 h-4" />;
    
    const name = toolName.toLowerCase();
    if (name.includes('search')) return <Search className="w-4 h-4" />;
    if (name.includes('calculator')) return <Calculator className="w-4 h-4" />;
    if (name.includes('file')) return <FileText className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  return (
    <div className="mb-3 mx-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700/50 rounded-lg overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-100/50 dark:hover:bg-purple-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className={`w-5 h-5 text-purple-600 dark:text-purple-400 ${isThinking ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-semibold text-purple-900 dark:text-purple-200">
            {isThinking ? 'Thinking...' : 'Thought Process'}
          </span>
          {steps.length > 0 && (
            <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full">
              {steps.length} step{steps.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-purple-200 dark:border-purple-700/50 px-4 py-3 space-y-2">
          {steps.length === 0 && isThinking && (
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Analyzing your request...</span>
            </div>
          )}

          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              <div className="flex-shrink-0 mt-0.5 text-purple-600 dark:text-purple-400">
                {getToolIcon(step.tool_name)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-purple-900 dark:text-purple-200">
                  {step.tool_name || 'Processing'}
                </div>
                {step.status && (
                  <div className="text-xs text-purple-700 dark:text-purple-300 capitalize">
                    {step.status}
                    {step.query && `: "${step.query}"`}
                  </div>
                )}
              </div>
              {step.status === 'complete' && (
                <div className="flex-shrink-0 text-green-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
