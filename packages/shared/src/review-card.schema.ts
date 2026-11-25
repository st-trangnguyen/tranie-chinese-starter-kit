import { z } from 'zod';

// Skeleton RED (task 2.1): chưa có hành vi, GREEN (task 2.2) cài theo design D2.

export const CARD_FACETS = ['meaning', 'listening', 'writing'] as const;
export type CardFacet = (typeof CARD_FACETS)[number];
export const CARD_STATES = ['new', 'learning', 'review', 'relearning'] as const;
export type CardState = (typeof CARD_STATES)[number];

export const reviewCardSchema = z.object({}).passthrough();

export const reviewCardId: (wordId: string, facet: CardFacet) => string = () =>
  '';

export const writtenCharacterSchema = z.object({}).passthrough();
