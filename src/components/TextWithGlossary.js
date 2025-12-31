"use client";

import { useState, useMemo } from "react";
import GlossaryTooltip from "./GlossaryTooltip";
import { parseTextWithGlossary } from "@/lib/glossaryUtils";

export default function TextWithGlossary({
  text,
  glossaryTerms = [],
  onSaveWord,
  savedWords = new Set(),
  selectedLanguage = "pt",
  className = "",
}) {
  // Parse text into segments (text and glossary terms)
  const segments = useMemo(() => {
    return parseTextWithGlossary(text, glossaryTerms);
  }, [text, glossaryTerms]);

  const handleSave = async (term, translation) => {
    if (onSaveWord) {
      // Extract Portuguese translation if translation is an object
      const portugueseTranslation = typeof translation === 'object'
        ? translation.pt
        : translation;

      await onSaveWord({
        en: term,
        pt: portugueseTranslation,
      });
    }
  };

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'glossary') {
          const isSaved = savedWords.has(segment.term.toLowerCase());

          return (
            <GlossaryTooltip
              key={`glossary-${index}-${segment.term}`}
              term={segment.term}
              translation={{
                pt: segment.translation,
                es: segment.translation_es,
                fr: segment.translation_fr,
              }}
              notes={segment.notes}
              onSave={handleSave}
              isSaved={isSaved}
              selectedLanguage={selectedLanguage}
            >
              {segment.content}
            </GlossaryTooltip>
          );
        }

        return (
          <span key={`text-${index}`}>
            {segment.content}
          </span>
        );
      })}
    </span>
  );
}
