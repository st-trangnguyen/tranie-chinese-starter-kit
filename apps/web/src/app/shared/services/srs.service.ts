import { createEmptyCard, State } from 'ts-fsrs';

import {
  hanCharacterSchema,
  reviewCardId,
  type CardFacet,
  type CardState,
  type Exercise,
  type Lesson,
  type ReviewCard,
  type Word,
} from '@csk/shared';

import {
  contentSource,
  type ContentSource,
} from '@core/services/content-source.service';
import {
  progressStore,
  type ProgressStore,
} from '@core/services/progress-store.service';
import type { LessonSession } from '@shared/models/lesson-session.model';
import type {
  CharacterWriting,
  LessonCardPlanInput,
  WritingCardPlanInput,
} from '@shared/models/review-card.model';
import { summarizeSession } from '@shared/utils/lesson-session.utils';

/** Trạng thái số của `ts-fsrs` → chuỗi lưu trong `ReviewCard`. */
const CARD_STATE_BY_FSRS_STATE: Record<State, CardState> = {
  [State.New]: 'new',
  [State.Learning]: 'learning',
  [State.Review]: 'review',
  [State.Relearning]: 'relearning',
};

/** Lỗi của use case tạo thẻ khi xong bài (đọc hoặc ghi thất bại). */
const CREATE_CARDS_FAILED_MESSAGE = 'Không tạo được thẻ ôn tập.';

/** Lỗi của use case ghi nhận chữ đã viết khi ghi chữ thất bại (lần viết không được tính). */
const RECORD_WRITING_FAILED_MESSAGE = 'Không ghi nhận được chữ đã viết.';

/** Lỗi khi đã ghi chữ nhưng đọc/ghi thẻ chiều viết thất bại (lần xong bài sau tạo bù). */
const CREATE_WRITING_CARDS_FAILED_MESSAGE = 'Không tạo được thẻ chiều viết.';

/** Chiều luôn được tạo khi xong bài (chiều viết có điều kiện riêng). */
const LESSON_FACETS: readonly CardFacet[] = ['meaning', 'listening'];

/** Khóa (`reviewCardId`) của các thẻ đã có. */
const cardIdsOf = (cards: readonly ReviewCard[]): ReadonlySet<string> =>
  new Set(cards.map((card) => reviewCardId(card.wordId, card.facet)));

export class SrsService {
  constructor(
    private readonly store: ProgressStore = progressStore,
    private readonly content: ContentSource = contentSource,
  ) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  private readAllCards(): Promise<ReviewCard[]> {
    return this.store.getAllCards();
  }

  private writeNewCards(cards: readonly ReviewCard[]): Promise<void> {
    return this.store.addNewCards(cards);
  }

  private readWrittenCharacters(): Promise<string[]> {
    return this.store.getWrittenCharacters();
  }

  private writeWrittenCharacter(character: string): Promise<void> {
    return this.store.addWrittenCharacter(character);
  }

  private readWords(): Promise<Word[]> {
    return this.content.getWords();
  }

  private readStrokeCharacters(): Promise<string[]> {
    return this.content.getStrokeIndex();
  }

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  // Rule: chỉ bài học kết thúc không bỏ câu nào mới tạo thẻ; bài kiểm tra không bao giờ tạo thẻ.
  isCardEligibleLesson(
    lessonType: Lesson['type'],
    session: LessonSession,
  ): boolean {
    return (
      lessonType === 'lesson' && summarizeSession(session, 'lesson').isComplete
    );
  }

  // Rule: từ của bài được tạo thẻ (bảng "Từ nào của bài được tạo thẻ").
  collectLessonWordIds(exercises: readonly Exercise[]): string[] {
    const wordIds = exercises.flatMap((exercise) => {
      if (exercise.kind === 'sound-pair') {
        return [...exercise.wordIds];
      }
      return exercise.wordId === undefined ? [] : [exercise.wordId];
    });
    return [...new Set(wordIds)];
  }

  // Rule: chữ Hán của một từ, giữ thứ tự, bỏ trùng; ký tự không phải chữ Hán bị bỏ.
  charactersOf(hanzi: string): string[] {
    const characters = Array.from(hanzi).filter(
      (character) => hanCharacterSchema.safeParse(character).success,
    );
    return [...new Set(characters)];
  }

  // Rule: chỉ lần viết xong trên khung có gợi ý mới được tính là đã viết chữ.
  countsAsStrokeWritten(writing: CharacterWriting): boolean {
    return writing.isGuided;
  }

  // Rule: tập chữ đã viết sau một lần viết; lần viết không được tính không đổi tập.
  addWrittenCharacter(
    written: ReadonlySet<string>,
    writing: CharacterWriting,
  ): ReadonlySet<string> {
    if (!this.countsAsStrokeWritten(writing)) {
      return new Set(written);
    }
    return new Set([...written, writing.character]);
  }

  // Rule: từ được có thẻ chiều viết khi mọi chữ của từ có dữ liệu nét và đã viết xong.
  canHaveWritingCard(
    word: Word,
    writtenCharacters: ReadonlySet<string>,
    strokeCharacters: ReadonlySet<string>,
  ): boolean {
    const characters = this.charactersOf(word.hanzi);
    return (
      characters.length > 0 &&
      characters.every(
        (character) =>
          strokeCharacters.has(character) && writtenCharacters.has(character),
      )
    );
  }

  // Rule: thẻ "mới" của một chiều của từ, đến hạn ngay lúc tạo, chưa ôn (không có lastReview).
  createNewCard(wordId: string, facet: CardFacet, now: number): ReviewCard {
    const card = createEmptyCard(new Date(now));
    return {
      wordId,
      facet,
      state: CARD_STATE_BY_FSRS_STATE[card.state],
      due: card.due.getTime(),
      stability: card.stability,
      difficulty: card.difficulty,
      elapsedDays: 0,
      scheduledDays: card.scheduled_days,
      learningSteps: card.learning_steps,
      reps: card.reps,
      lapses: card.lapses,
    };
  }

  // Rule: thẻ cho bài vừa xong: nghĩa + nghe cho mọi từ của bài; viết cho từ có trong nội dung
  // và đủ điều kiện chiều viết. Thẻ đã có (cùng từ, cùng chiều) không tạo lại.
  planLessonCards(input: LessonCardPlanInput): ReviewCard[] {
    const existingIds = cardIdsOf(input.cards);
    const cards = input.wordIds.flatMap((wordId) => {
      const word = input.wordsById.get(wordId);
      const isWritingAllowed =
        word !== undefined &&
        this.canHaveWritingCard(
          word,
          input.writtenCharacters,
          input.strokeCharacters,
        );
      const facets: readonly CardFacet[] = isWritingAllowed
        ? [...LESSON_FACETS, 'writing']
        : LESSON_FACETS;
      return facets.map((facet) =>
        this.createNewCard(wordId, facet, input.now),
      );
    });
    return cards.filter(
      (card) => !existingIds.has(reviewCardId(card.wordId, card.facet)),
    );
  }

  // Rule: từ đã học xong cho thẻ chiều viết khi đã có thẻ nghĩa của từ, hoặc từ thuộc bài đang
  // làm xong (bảng "Từ đã học xong cho thẻ chiều viết").
  isWordLearned(
    wordId: string,
    cards: readonly ReviewCard[],
    completingWordIds: ReadonlySet<string>,
  ): boolean {
    return (
      completingWordIds.has(wordId) ||
      cards.some((card) => card.wordId === wordId && card.facet === 'meaning')
    );
  }

  // Rule: sau một lần viết, từ trong nội dung chứa chữ vừa viết được thẻ chiều viết khi từ đã học
  // xong và đủ điều kiện chiều viết. Từ đã có thẻ chiều viết không tạo lại.
  planWritingCards(input: WritingCardPlanInput): ReviewCard[] {
    const existingIds = cardIdsOf(input.cards);
    return input.words
      .filter(
        (word) =>
          !existingIds.has(reviewCardId(word.id, 'writing')) &&
          this.charactersOf(word.hanzi).includes(input.character) &&
          this.isWordLearned(word.id, input.cards, new Set()) &&
          this.canHaveWritingCard(
            word,
            input.writtenCharacters,
            input.strokeCharacters,
          ),
      )
      .map((word) => this.createNewCard(word.id, 'writing', input.now));
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  async createCardsForFinishedLesson(
    lesson: Lesson,
    session: LessonSession,
    now: number = Date.now(),
  ): Promise<void> {
    if (!this.isCardEligibleLesson(lesson.type, session)) {
      return;
    }
    let loaded: [ReviewCard[], string[], Word[], string[]];
    try {
      loaded = await Promise.all([
        this.readAllCards(),
        this.readWrittenCharacters(),
        this.readWords(),
        this.readStrokeCharacters(),
      ]);
    } catch (error) {
      throw new Error(CREATE_CARDS_FAILED_MESSAGE, { cause: error });
    }
    const [cards, writtenCharacters, words, strokeCharacters] = loaded;
    const newCards = this.planLessonCards({
      wordIds: this.collectLessonWordIds(lesson.exercises),
      wordsById: new Map(words.map((word) => [word.id, word])),
      cards,
      writtenCharacters: new Set(writtenCharacters),
      strokeCharacters: new Set(strokeCharacters),
      now,
    });
    try {
      await this.writeNewCards(newCards);
    } catch (error) {
      throw new Error(CREATE_CARDS_FAILED_MESSAGE, { cause: error });
    }
  }

  async recordCharacterWriting(
    writing: CharacterWriting,
    now: number = Date.now(),
  ): Promise<void> {
    if (!this.countsAsStrokeWritten(writing)) {
      return;
    }
    try {
      await this.writeWrittenCharacter(writing.character);
    } catch (error) {
      throw new Error(RECORD_WRITING_FAILED_MESSAGE, { cause: error });
    }
    try {
      const [cards, writtenCharacters, words, strokeCharacters] =
        await Promise.all([
          this.readAllCards(),
          this.readWrittenCharacters(),
          this.readWords(),
          this.readStrokeCharacters(),
        ]);
      const newCards = this.planWritingCards({
        character: writing.character,
        words,
        cards,
        writtenCharacters: new Set(writtenCharacters),
        strokeCharacters: new Set(strokeCharacters),
        now,
      });
      await this.writeNewCards(newCards);
    } catch (error) {
      throw new Error(CREATE_WRITING_CARDS_FAILED_MESSAGE, { cause: error });
    }
  }
}
