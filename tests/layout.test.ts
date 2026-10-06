import assert from 'node:assert/strict';
import test from 'node:test';
import { arenaLayout, overlaps } from '../src/layout';

for (const [width, height] of [[351, 360], [366, 520], [406, 606]]) {
  test(`arena ${width}×${height}: every occupancy keeps seats, labels and five cards clear`, () => {
    for (let slots = 1; slots <= 8; slots++) {
      const { seats, board, cardWidth } = arenaLayout(width!, height!, slots);
      assert.ok(cardWidth >= 30);
      assert.equal(board.width, cardWidth * 5 + 16);
      for (const [i, seat] of seats.entries()) {
        assert.ok(seat.x >= 0 && seat.y >= 0 && seat.x + seat.width <= width! && seat.y + seat.height <= height!);
        assert.equal(overlaps(seat, board), false, `seat ${i} / board in ${slots} slots`);
        for (let j = i + 1; j < seats.length; j++) assert.equal(overlaps(seat, seats[j]!), false, `seats ${i}/${j} in ${slots} slots`);
      }
    }
  });
}
