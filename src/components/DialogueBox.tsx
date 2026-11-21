import React from 'react';
import { FastForward } from 'lucide-react';
import { getSpriteBank } from '../game/sprites';
import { DialogueLine } from '../game/types';

interface DialogueBoxProps {
  lines: DialogueLine[];
  index: number;
  displayedChars: number;
  isCutscene?: boolean;
  onAdvance: () => void;
  onSelectChoice: (choiceId: string) => void;
  onSkip?: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  lines,
  index,
  displayedChars,
  isCutscene = false,
  onAdvance,
  onSelectChoice,
  onSkip,
}) => {
  const current = lines[index];
  if (!current) return null;

  const sprites = getSpriteBank();
  const portraitSrc = sprites.portraits[current.portrait] ?? sprites.portraits.pip;
  const cleanFullText = current.text.replace(/\*\*/g, '');
  const visibleText = cleanFullText.slice(0, displayedChars);
  const finishedTyping = displayedChars >= cleanFullText.length;
  const hasChoices = Boolean(current.choices && current.choices.length > 0);

  return (
    <div
      onClick={() => {
        if (!finishedTyping) {
          onAdvance();
        } else if (!hasChoices) {
          onAdvance();
        }
      }}
      className="absolute inset-x-0 bottom-2 z-30 mx-auto w-[94%] max-w-2xl cursor-pointer rounded-lg border-2 border-amber-400/85 bg-slate-950/95 px-3 py-2.5 sm:px-4 sm:py-3 shadow-2xl"
    >
      <div className="flex items-start gap-2.5 sm:gap-3.5">
        <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-900 p-1">
          <img
            src={portraitSrc}
            alt={current.speaker}
            className="pixelated-canvas h-full w-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-pixel text-xs sm:text-sm text-amber-300 truncate">
              {current.speaker}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono-tabular text-[11px] text-slate-400">
                {index + 1}/{lines.length}
              </span>
              {onSkip && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkip();
                  }}
                  className="inline-flex min-h-[24px] items-center gap-1 rounded border border-slate-600 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-200 cursor-pointer whitespace-nowrap"
                >
                  <FastForward className="w-3 h-3 text-amber-300" />
                  <span>{isCutscene ? 'SKIP CUTSCENE' : 'SKIP'}</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm leading-snug text-slate-100 min-h-[2.2rem] break-words">
            {visibleText}
          </p>

          {hasChoices && current.choices ? (
            <div className="mt-2 flex flex-col sm:flex-row gap-1.5">
              {current.choices.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectChoice(ch.id);
                  }}
                  className="flex min-h-[36px] flex-1 items-center justify-start gap-1.5 rounded-md border border-amber-400/80 bg-slate-900 hover:bg-amber-500/20 px-2.5 py-1.5 text-left text-xs font-medium text-amber-100 transition-colors cursor-pointer"
                >
                  <span className="font-mono-tabular text-amber-300 font-bold shrink-0">[{idx + 1}]</span>
                  <span className="leading-tight break-words">{ch.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-1 flex justify-end">
              <span className="text-[10px] font-medium text-amber-300/90">
                {finishedTyping ? 'Press [SPACE] or Click to continue ▶' : 'Click or [SPACE] to reveal all'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
