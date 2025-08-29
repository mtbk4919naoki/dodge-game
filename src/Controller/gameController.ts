import Entity from "../Classes/entity";
import User from "../Classes/user";
import Enemy from "../Classes/enemy";

const MODES = {
  READY: "ready",
  PLAYING: "playing",
  GAMEOVER: "gameover",
} as const;

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
  private enemyAmount: number = 10;
  public score: number = 0;
  private lastTime: number;
  private mode: typeof MODES[keyof typeof MODES];

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.mode = MODES.READY;
    this.lastTime = performance.now();
    if (!this.canvas) {
      throw new Error("Canvas not found");
    }
    
    this.ctx = this.canvas.getContext("2d")!;
    if (!this.ctx) {
      throw new Error("Canvas context not found");
    }

    this.user = new User(this.ctx, {src: "/dodge-game/images/self.svg", w: 40, h: 40, colorEffect: "aqua"}, {speed: 8});
  }

  async init() {
    console.log("init");

    // キャンバスサイズを設定
    this.canvas.width = 600;
    this.canvas.height = 600;

    // 設定値を初期化
    this.enemyAmount = 10;
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
    if (this.isMode(MODES.READY)) {
      await this.ready();
    }
    this.start();
  }

  async loadImages(entities: Entity[]) {
    console.log("loadImages");

    await Promise.all(entities.map(entity => entity.load()));

    console.log("loadImages done");
  }

  /**
   * ゲーム開始前の準備
   */
  async ready() {
    console.log("ready");

    this.modeChange(MODES.READY);
    this.ctx.fillStyle = "white";
    this.ctx.font = "24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Press any key to start.", this.canvas.width / 2, this.canvas.height / 2);

    await new Promise<void>(resolve => {
      const handleAnyKeydown = () => {
        window.removeEventListener("keydown", handleAnyKeydown);
        resolve();
      };
      window.addEventListener("keydown", handleAnyKeydown);
    });
  }

  /**
   * ゲーム開始
   */
  start() {
    console.log("start");

    this.modeChange(MODES.PLAYING);
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

  createRandomEnemy(): Enemy {
    const size = Math.floor(Math.random() * 40) + 20;
    const spawnX = Math.floor(Math.random() * this.canvas.width);
    const spawnY = Math.floor(Math.random() * this.canvas.height);
    const speed = Math.floor(Math.random() * 6 + 4);
    const direction = Math.floor(Math.random() * 5); // 0-3 は直線、 4 は自機狙い

    if (direction === 0) {
      // top to bottom
      const actualSpawnX = spawnX;
      const actualSpawnY = -1 * size;
      const actualSpeedX = 0;
      const actualSpeedY = speed;
      const enemy = new Enemy(this.ctx, {src: "/dodge-game/images/enemy.svg", w: size, h: size}, {x: actualSpeedX, y: actualSpeedY});
      enemy.spawn(actualSpawnX, actualSpawnY, {center: true});
      this.enemies.push(enemy);
      return enemy;
    } else if (direction === 1) {
      // right to left
      const actualSpawnX = this.canvas.width + size;
      const actualSpawnY = spawnY;
      const actualSpeedX = speed * -1;
      const actualSpeedY = 0;
      const enemy = new Enemy(this.ctx, {src: "/dodge-game/images/enemy.svg", w: size, h: size}, {x: actualSpeedX, y: actualSpeedY});
      enemy.spawn(actualSpawnX, actualSpawnY, {center: true});
      this.enemies.push(enemy);
      return enemy;
    } else if (direction === 2) {
      // bottom to top
      const actualSpawnX = spawnX;
      const actualSpawnY = this.canvas.height + size; // 画面下の外側に確実にスポーン
      const actualSpeedX = 0;
      const actualSpeedY = speed * -1;
      const enemy = new Enemy(this.ctx, {src: "/dodge-game/images/enemy.svg", w: size, h: size}, {x: actualSpeedX, y: actualSpeedY});
      enemy.spawn(actualSpawnX, actualSpawnY, {center: true});
      this.enemies.push(enemy);
      return enemy;
    } else if (direction === 3) {
      // left to right
      const actualSpawnX = -1 * size;
      const actualSpawnY = spawnY;
      const actualSpeedX = speed;
      const actualSpeedY = 0;
      const enemy = new Enemy(this.ctx, {src: "/dodge-game/images/enemy.svg", w: size, h: size}, {x: actualSpeedX, y: actualSpeedY});
      enemy.spawn(actualSpawnX, actualSpawnY, {center: true});
      this.enemies.push(enemy);
      return enemy;
    } else {
      // target user
      // 8方向からランダムに選択（-1, 0, 1の組み合わせ）
      const offsetX = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const offsetY = Math.floor(Math.random() * 3) - 1; // -1, 0, 1

      // 0,0の場合は再帰
      if(offsetX === 0 && offsetY === 0) {
        return this.createRandomEnemy();
      }
      
      // スポーン地点は8方向に散らす
      let actualSpawnX = spawnX;
      let actualSpawnY = spawnY;
      if (offsetX === 1) {
        actualSpawnX = this.canvas.width + size;
      } else if (offsetX === -1) {
        actualSpawnX = -1 * size;
      }
      if (offsetY === 1) {
        actualSpawnY = this.canvas.height + size;
      } else if (offsetY === -1) {
        actualSpawnY = -1 * size;
      }
  
      // 角度計算
      const targetX = this.user.x + this.user.w / 2;
      const targetY = this.user.y + this.user.h / 2;
      const enemySpawnCenterX = actualSpawnX + size / 2;
      const enemySpawnCenterY = actualSpawnY + size / 2;

      const dx = targetX - enemySpawnCenterX;
      const dy = targetY - enemySpawnCenterY;

      const angle = Math.atan2(dy, dx);
      
      // 角度を速度にはめ込む
      const actualSpeedX = Math.cos(angle) * speed;
      const actualSpeedY = Math.sin(angle) * speed;
      
      // 自機狙いはオレンジ色にする
      const enemy = new Enemy(this.ctx, {src: "/dodge-game/images/enemy.svg", w: size, h: size, colorEffect: "orange"}, {x: actualSpeedX, y: actualSpeedY});
      enemy.spawn(actualSpawnX, actualSpawnY, {center: true});
      this.enemies.push(enemy);
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
    const size = (e1.w / 3 + e2.w / 3) / (this.keydown.Shift ? 2 : 1);
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
    if (this.isMode(MODES.GAMEOVER)) return;

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

      // コリジョンチェック
      const isCollided = this.collisionCheck(this.user, enemy);
      if (isCollided) {
        console.log("collided");
        this.modeChange(MODES.GAMEOVER);
      }

      return isAlive;
    });
    while(this.enemies.length < this.enemyAmount) {
      this.createRandomEnemy();
    }
  }

  showGameOver() {
    // オーバーレイ
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.66)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Game Over
    this.ctx.fillStyle = "red";
    this.ctx.font = "48px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Game over", this.canvas.width / 2, this.canvas.height / 2);

    // Press any key to restart.
    this.ctx.fillStyle = "white";
    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Press any key to restart.", this.canvas.width / 2, this.canvas.height / 2 + 60);

    // Score
    this.ctx.fillStyle = "white";
    this.ctx.font = "24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Score: " + this.score, this.canvas.width / 2, this.canvas.height / 2 - 80);

    // 1000ms後にリスタート可能にする
    window.setTimeout(() => {
      new Promise<void>(resolve => {
        const handleAnyKeydown = () => {
          window.removeEventListener("keydown", handleAnyKeydown);
          // playing modeで初期化するとreadyをスキップする
          this.modeChange(MODES.PLAYING);
          this.init();
          resolve();
        };
        window.addEventListener("keydown", handleAnyKeydown);
      });
    }, 1000);
  }

  showEnemyAmount() {
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Enemy: ${this.enemyAmount}`, 10, 50);
  }

  addScore(addScore: number) {
    this.score += addScore || 0;
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
  }

  isMode(mode: typeof MODES[keyof typeof MODES]) {
    return this.mode === mode;
  }

  modeChange(mode: typeof MODES[keyof typeof MODES]) {
    this.mode = mode;
  }

  render() {
    // 位置計算とコリジョンチェック
    this.userCalc();
    this.enemyCalc();

    // リセット
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // エンティティ表示
    if(this.keydown.Shift) {
      this.user.render(function(self: Entity) {
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
    if (this.isMode(MODES.GAMEOVER)) {
      this.showGameOver();
    }
  }
}
