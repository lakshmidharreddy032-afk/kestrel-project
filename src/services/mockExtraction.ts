import type { ExtractedFigure } from '../domain/types';
import extractionsData from '../data/extractions.json';

/**
 * Service returning pre-written mock extracted figures with source bounding boxes.
 * Clearly labeled: "Mock extraction, no model call."
 */
export function getMockExtractions(applicationId: string): ExtractedFigure[] {
  const data = (extractionsData as unknown as Record<string, ExtractedFigure[]>)[applicationId];
  if (!data) return [];
  return JSON.parse(JSON.stringify(data));
}

export const EXTRACTION_DISCLAIMER = "Mock extraction. Not a live model. No external AI APIs called. All figures require human analyst verification.";
