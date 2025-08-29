import Entity from "./entity";

export default class Enemy extends Entity {
  private direction: {x: number, y: number};
  private rotationSpeed: number = Math.floor(Math.random() * 0.2) + 0.1;

  constructor(ctx: CanvasRenderingContext2D, options: {src: string, w: number, h: number, colorEffect?: string}, direction: {x: number, y: number}) {
    super(ctx, options);
    this.direction = direction;
  }

  next() {
    this.rotation += (Math.PI / 2) * this.rotationSpeed;
    this.move(this.direction.x, this.direction.y);
    
    if (
      this.x < this.ctx.canvas.width * -1 ||
      this.x > this.ctx.canvas.width * 2 ||
      this.y < this.ctx.canvas.height * -1 ||
      this.y > this.ctx.canvas.height * 2
    ) {
      return false;
    }
    return true;
  }
}