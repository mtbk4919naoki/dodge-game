import Entity from "./entity";

export default class User extends Entity {
  private speed: number;

  constructor(ctx: CanvasRenderingContext2D, options: {src: string, w: number, h: number, colorEffect?: string}, unique: {speed: number}) {
    super(ctx, options);
    this.speed = unique.speed;
  }

  walk({shift, up, down, left, right}: {shift: boolean, up: boolean, down: boolean, left: boolean, right: boolean}) {
    if (up) {
      this.move(0, -1* this.speed / (shift ? 2 : 1));
    }
    if (down) {
      this.move(0,1 * this.speed / (shift ? 2 : 1));
    }
    if (left) {
      this.move(-1 * this.speed / (shift ? 2 : 1), 0);
    }
    if (right) {
      this.move(1 * this.speed / (shift ? 2 : 1), 0);
    }
  }
}