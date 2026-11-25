import { WritingPracticeService } from './writing-practice.service';

describe('WritingPracticeService — lượt viết vừa xong chữ (S9.1)', () => {
  const completeOf = (service: WritingPracticeService) =>
    service.recordStrokeAttempt(
      service.recordStrokeAttempt(service.startPractice(2), 'correct'),
      'correct',
    );

  it('S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết: chưa xong → xong là vừa xong chữ', () => {
    const service = new WritingPracticeService();
    const afterFirst = service.recordStrokeAttempt(
      service.startPractice(2),
      'correct',
    );
    const complete = service.recordStrokeAttempt(afterFirst, 'correct');

    expect(service.hasJustCompleted(afterFirst, complete)).toBe(true);
  });

  it('S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết: đã xong → vẫn xong không phải vừa xong chữ', () => {
    const service = new WritingPracticeService();
    const complete = completeOf(service);
    const next = service.recordStrokeAttempt(complete, 'correct');

    expect(service.hasJustCompleted(complete, next)).toBe(false);
  });

  it('S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết: chưa xong → chưa xong không phải vừa xong chữ', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(2);
    const afterFirst = service.recordStrokeAttempt(initial, 'correct');

    expect(service.hasJustCompleted(initial, afterFirst)).toBe(false);
  });
});
