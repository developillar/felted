export type Rect = { x: number; y: number; width: number; height: number };
export function overlaps(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
export function arenaLayout(width: number, height: number, slots: number) {
  const seatWidth = 68;
  const avatarSize = height < 390 ? 44 : 52;
  const seatHeight = avatarSize + 43;
  const topY = 2;
  const bottomY = height - seatHeight - 4;
  const upperY =
    slots >= 7
      ? Math.max(
          topY,
          Math.min(
            topY + (bottomY - topY) * 0.26,
            bottomY - 2 * (seatHeight + 8),
          ),
        )
      : topY + (bottomY - topY) * 0.26;
  const midY =
    slots >= 7 ? (upperY + bottomY) / 2 : topY + (bottomY - topY) * 0.5;
  const xLeft = 0,
    xRight = width - seatWidth;
  let anchors: [number, number][];
  if (slots === 1) anchors = [[(width - seatWidth) / 2, topY]];
  else if (slots === 2)
    anchors = [
      [width * 0.27 - seatWidth / 2, topY],
      [width * 0.73 - seatWidth / 2, topY],
    ];
  else if (slots === 3)
    anchors = [
      [xLeft, midY],
      [(width - seatWidth) / 2, topY],
      [xRight, midY],
    ];
  else if (slots === 4)
    anchors = [
      [xLeft, bottomY],
      [width * 0.32 - seatWidth / 2, topY],
      [width * 0.68 - seatWidth / 2, topY],
      [xRight, bottomY],
    ];
  else if (slots === 5)
    anchors = [
      [xLeft, bottomY],
      [xLeft, upperY],
      [(width - seatWidth) / 2, topY],
      [xRight, upperY],
      [xRight, bottomY],
    ];
  else if (slots === 6)
    anchors = [
      [xLeft, bottomY],
      [xLeft, midY],
      [width * 0.32 - seatWidth / 2, topY],
      [width * 0.68 - seatWidth / 2, topY],
      [xRight, midY],
      [xRight, bottomY],
    ];
  else if (slots === 7)
    anchors = [
      [xLeft, bottomY],
      [xLeft, midY],
      [xLeft, upperY],
      [(width - seatWidth) / 2, topY],
      [xRight, upperY],
      [xRight, midY],
      [xRight, bottomY],
    ];
  else
    anchors = [
      [xLeft, bottomY],
      [xLeft, midY],
      [xLeft, upperY],
      [width * 0.35 - seatWidth / 2, topY],
      [width * 0.65 - seatWidth / 2, topY],
      [xRight, upperY],
      [xRight, midY],
      [xRight, bottomY],
    ];
  const cardWidth =
    slots <= 2
      ? height >= 350
        ? 52
        : 38
      : Math.min(44, (width - 2 * seatWidth - 28) / 5);
  const boardWidth = cardWidth * 5 + 16;
  const boardHeight = cardWidth > 44 ? 205 : cardWidth > 40 ? 174 : 161;
  const board = {
    x: (width - boardWidth) / 2,
    y: Math.max(seatHeight + 14, (height - boardHeight) / 2 + 26),
    width: boardWidth,
    height: boardHeight,
  };
  return {
    seats: anchors.map(([x, y]) => ({
      x,
      y,
      width: seatWidth,
      height: seatHeight,
    })),
    board,
    avatarSize,
    cardWidth,
  };
}
