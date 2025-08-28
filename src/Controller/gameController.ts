import Entity from "../Classes/entity";
import User from "../Classes/user";
import Enemy from "../Classes/enemy";

export default class GameController {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public keydown: {
    Shift: boolean;
    ArrowRight: boolean;
    ArrowLeft: boolean;
    ArrowUp: boolean;
    ArrowDown: boolean;
  } = {
    Shift: false,
    ArrowRight: false,
    ArrowLeft: false,
    ArrowUp: false,
    ArrowDown: false,
  };
  public user: User;
  private enemies: Enemy[] = [];
  private enemyAmount: number = 20;
  public score: number = 0;
  private lastTime: number;
  private gameOver: boolean = false;

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.lastTime = performance.now();
    if (!this.canvas) {
      throw new Error("Canvas not found");
    }
    
    this.ctx = this.canvas.getContext("2d")!;
    if (!this.ctx) {
      throw new Error("Canvas context not found");
    }

    this.user = new User(this.ctx, {src: "/images/self.svg", w: 40, h: 40}, {speed: 8});
  }

  async init() {
    console.log("init");

    // キャンバスサイズを設定
    this.canvas.width = 600;
    this.canvas.height = 600;

    // 設定値を初期化
    this.enemyAmount = 10;
    this.gameOver = false;
    this.score = 0;
    this.enemies = [];
    this.lastTime = performance.now();
    this.keydown = {
      Shift: false,
      ArrowRight: false,
      ArrowLeft: false,
      ArrowUp: false,
      ArrowDown: false,
    };
    
    // 画像を読み込む
    await this.loadImages([this.user]);
    this.start();
  }

  async loadImages(entities: Entity[]) {
    console.log("loadImages");

    await Promise.all(entities.map(entity => entity.load()));

    console.log("loadImages done");
  }

  start = () => {
    console.log("start");

    window.addEventListener("keydown", this.handleKeydown.bind(this));
    window.addEventListener("keyup", this.handleKeyup.bind(this));
    this.user.spawn(this.canvas.width / 2, this.canvas.height / 2, {center: true});
    Array.from({length: this.enemyAmount}).forEach(() => {
      this.createRandomEnemy();
    });
    this.animate();
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === "Shift") {
      this.keydown.Shift = true;
    }
    if (event.key === "ArrowRight") {
      this.keydown.ArrowRight = true;
    }
    if (event.key === "ArrowLeft") {
      this.keydown.ArrowLeft = true;
    }
    if (event.key === "ArrowUp") {
      this.keydown.ArrowUp = true;
    }
    if (event.key === "ArrowDown") {
      this.keydown.ArrowDown = true;
    }
  }

  handleKeyup(event: KeyboardEvent) {
    if (event.key === "Shift") {
      this.keydown.Shift = false;
    }
    if (event.key === "ArrowRight") {
      this.keydown.ArrowRight = false;
    }
    if (event.key === "ArrowLeft") {
      this.keydown.ArrowLeft = false;
    }
    if (event.key === "ArrowUp") {
      this.keydown.ArrowUp = false;
    }
    if (event.key === "ArrowDown") {
      this.keydown.ArrowDown = false;
    }
  }

  createRandomEnemy() {
    const size = Math.floor(Math.random() * 40) + 20;
    const spawnX = Math.floor(Math.random() * this.canvas.width);
    const spawnY = Math.floor(Math.random() * this.canvas.height);
    const speed = Math.floor(Math.random() * 6 + 4);
    const direction = Math.floor(Math.random() * 4);
    if (direction === 0) {
      // top to bottom
      const actualSpawnX = spawnX;
      const actualSpawnY = -1 * spawnY;
      const actualSpeedX = 0;
      const actualSpeedY = speed;
      const enemy = new Enemy(this.ctx, {src: "/images/enemy.svg", w: size, h: size}, {x: actualSpeedX, y: actualSpeedY});
      enemy.spawn(actualSpawnX, actualSpawnY, {center: true});
      this.enemies.push(enemy);
      return enemy;
    } else if (direction === 1) {
      // right to left
      const actualSpawnX = spawnX + this.canvas.width;
      const actualSpawnY = spawnY;
      const actualSpeedX = speed * -1;
      const actualSpeedY = 0;
      const enemy = new Enemy(this.ctx, {src: "/images/enemy.svg", w: size, h: size}, {x: actualSpeedX, y: actualSpeedY});
      this.enemies.push(enemy);
      enemy.spawn(actualSpawnX, actualSpawnY, {center: true});
      return enemy;
    } else if (direction === 2) {
      // bottom to top
      const actualSpawnX = spawnX;
      const actualSpawnY = spawnY + this.canvas.height;
      const actualSpeedX = 0;
      const actualSpeedY = speed * -1;
      const enemy = new Enemy(this.ctx, {src: "/images/enemy.svg", w: size, h: size}, {x: actualSpeedX, y: actualSpeedY});
      enemy.spawn(actualSpawnX, actualSpawnY, {center: true});
      this.enemies.push(enemy);
      return enemy;
    } else {
      // left to right
      const actualSpawnX = spawnX - this.canvas.width;
      const actualSpawnY = spawnY;
      const actualSpeedX = speed;
      const actualSpeedY = 0;
      const enemy = new Enemy(this.ctx, {src: "/images/enemy.svg", w: size, h: size}, {x: actualSpeedX, y: actualSpeedY});
      this.enemies.push(enemy);
      enemy.spawn(actualSpawnX, actualSpawnY, {center: true});
      return enemy;
    }
  }

  collisionCheck(e1: Entity, e2: Entity) {
    // 中心座標を計算
    const e1CenterX = e1.x + e1.w / 2;
    const e1CenterY = e1.y + e1.h / 2;
    const e2CenterX = e2.x + e2.w / 2;
    const e2CenterY = e2.y + e2.h / 2;
    
    const dx = e1CenterX - e2CenterX;
    const dy = e1CenterY - e2CenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // シフトキーを押している場合は、接触判定を小さくする
    const size = (e1.w / 2 + e2.w / 2) / (this.keydown.Shift ? 2 : 1);
    return distance < size;
  }

  animate() {
    // FPSを30にする
    const currentTime = performance.now();
    const interval = 1000 / 30; // target 30fps
    const deltaTime = currentTime - this.lastTime;
    if (deltaTime > interval) {
      this.render();
      this.lastTime = currentTime;
    }
    
    // ゲームオーバーしていたら終了
    if (this.gameOver) return;

    // 次のフレームを予約
    requestAnimationFrame(this.animate.bind(this));
  }

  userCalc() {
    const direction = {
      shift: this.keydown.Shift,
      up: this.keydown.ArrowUp,
      down: this.keydown.ArrowDown,
      left: this.keydown.ArrowLeft,
      right: this.keydown.ArrowRight,
    };
    this.user.walk(direction);
  }

  enemyCalc() {
    // 敵の処理
    this.enemies = this.enemies.filter(enemy => {
      // 敵の移動
      const isAlive = enemy.next();
      if (!isAlive) console.log("enemy dead");

      // コリジョンチェック
      const isCollided = this.collisionCheck(this.user, enemy);
      if (isCollided) {
        console.log("collided");
        this.gameOver = true;
      }

      return isAlive;
    });
    while(this.enemies.length < this.enemyAmount) {
      this.createRandomEnemy();
    }
  }

  showGameOver() {
    this.ctx.fillStyle = "red";
    this.ctx.font = "48px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Game Over", this.canvas.width / 2, this.canvas.height / 2);
  }

  showEnemyAmount() {
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Enemy: ${this.enemyAmount}`, 10, 40);
  }

  addScore(addScore: number) {
    this.score += addScore || 0;
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
  }

  render() {
    // 位置計算とコリジョンチェック
    this.userCalc();
    this.enemyCalc();

    // リセット
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // エンティティ表示
    if(this.keydown.Shift) {
      this.user.render(function(self: User) {
        self.ctx.scale(0.6, 0.6);
      });
    } else {
      this.user.render();
    }
    this.enemies.forEach(enemy => {
      enemy.render();
    });

    // スコア加算
    this.addScore(1);
    // 敵の数をスコアに応じて増やす
    this.enemyAmount = Math.floor(this.score / 40) + 10;
    this.showEnemyAmount();

    // ゲームーオーバー表示
    if (this.gameOver) {
      this.showGameOver();
    }
  }
}
