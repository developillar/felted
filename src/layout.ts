export type Rect = { x: number; y: number; width: number; height: number };
export function overlaps(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
export function arenaLayout(width: number, height: number, slots: number) {
  const dense = slots >= 6;
  const seatWidth = 68;
  const avatarSize = height < 390 ? 44 : 52;
  const seatHeight = avatarSize + 43;
  const topY = 2;
  const bottomY = height - seatHeight - 4;
  const midY = topY + (bottomY - topY) * (slots >= 7 ? .63 : .5);
  const upperY = topY + (bottomY - topY) * .26;
  const xLeft = 0, xRight = width - seatWidth;
  let anchors: [number, number][];
  if (slots === 1) anchors = [[(width - seatWidth) / 2, topY]];
  else if (slots === 2) anchors = [[width * .27 - seatWidth / 2, topY], [width * .73 - seatWidth / 2, topY]];
  else if (slots === 3) anchors = [[xLeft, midY], [(width - seatWidth) / 2, topY], [xRight, midY]];
  else if (slots === 4) anchors = [[xLeft, bottomY], [width * .32 - seatWidth / 2, topY], [width * .68 - seatWidth / 2, topY], [xRight, bottomY]];
  else if (slots === 5) anchors = [[xLeft, bottomY], [xLeft, upperY], [(width - seatWidth) / 2, topY], [xRight, upperY], [xRight, bottomY]];
  else if (slots === 6) anchors = [[xLeft, bottomY], [xLeft, midY], [width * .32 - seatWidth / 2, topY], [width * .68 - seatWidth / 2, topY], [xRight, midY], [xRight, bottomY]];
  else if (slots === 7) anchors = [[xLeft, bottomY], [xLeft, midY], [xLeft, upperY], [(width - seatWidth) / 2, topY], [xRight, upperY], [xRight, midY], [xRight, bottomY]];
  else anchors = [[xLeft, bottomY], [xLeft, midY], [xLeft, upperY], [width * .35 - seatWidth / 2, topY], [width * .65 - seatWidth / 2, topY], [xRight, upperY], [xRight, midY], [xRight, bottomY]];
  const cardWidth = dense ? Math.min(34, (width - 2 * seatWidth - 30 - 16) / 5) : 38;
  const boardWidth = cardWidth * 5 + 16;
  const boardHeight = 161;
  const board = { x: (width - boardWidth) / 2, y: Math.max(seatHeight + 14, (height - boardHeight) / 2 + 26), width: boardWidth, height: boardHeight };
  return { seats: anchors.map(([x, y]) => ({ x, y, width: seatWidth, height: seatHeight })), board, avatarSize, cardWidth };
}
