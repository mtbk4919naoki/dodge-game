export default class Entity {
  public x: number;
  public y: number;
  public w: number;
  public h: number;
  public image: HTMLImageElement;
  public isLoaded: boolean = false;
  public rotation: number = 0;
  public colorEffect: string | null = null; // 色エフェクトの種類
  public effectIntensity: number = 1.0; // エフェクトの強度

  constructor(public ctx: CanvasRenderingContext2D, public options: {src: string, w: number, h: number, colorEffect?: string}) {
    this.w = options.w;
    this.h = options.h;
    this.x = 0;
    this.y = 0;
    this.colorEffect = options.colorEffect || null;

    this.image = new Image();
    this.image.onload = () => {
      this.isLoaded = true;
    };
    this.image.src = options.src;
  }

  spawn(x: number, y: number, options: {center: boolean}) {
    if (options.center) {
      this.x = x - this.w / 2;
      this.y = y - this.h / 2;
    } else {
      this.x = x;
      this.y = y;
    }
  }

  move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }

  rotate(rotation: number) {
    this.rotation = rotation;
  }

  render() {
    this.ctx.save();
    this.ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    this.ctx.rotate(this.rotation);
    
    this.ctx.drawImage(this.image, -this.w / 2, -this.h / 2, this.w, this.h);

    // 色エフェクトを適用
    if (this.colorEffect) {
      this.ctx.globalCompositeOperation = "source-atop";
      this.ctx.fillStyle = this.colorEffect;
      this.ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    }

    this.ctx.restore();
  }

  load(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isLoaded) {
        resolve();
      } else {
        this.image.onload = () => {
          this.isLoaded = true;
          resolve();
        };
      }
    });
  }
}