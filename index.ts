import { drawBackground, drawGameObject, drawScore, type RenderKind } from "./renderer.js";

abstract class GameObject {

    active = true;
    x: number;
    y: number;
    w: number;
    h: number;


    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    intersectes(other: GameObject) {

        return (
            this.x < other.x + other.w &&
            this.x + this.w > other.x &&
            this.y < other.y + other.h &&
            this.y + this.h > other.y
        )
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract update(): void;

}

export class Score extends GameObject {
    private points = 0;
    private readonly margin = 16;

    constructor(private screenWidth: number, y = 24) {
        super(screenWidth - 16, y, 0, 0);
    }

    setPoints(points: number): void {
        this.points = points;
    }

    addPoints(points = 1): void {
        this.points += points;
    }

    update(): void {
        // Keep score anchored to top-right when canvas size changes.
        this.x = this.screenWidth - this.margin;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        drawScore(ctx, this.points, this.x, this.y);
    }
}

class Bullet extends GameObject {
    private readonly renderKind: RenderKind = "bullet";
    speed: number = 10;

    constructor(x: number, y: number) {
        super(x, y, 5, 10)
    }

    update() {
        if (this.y > 0) {
            this.y -= this.speed;
        } else {
            this.active = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        drawGameObject(ctx, this.renderKind, this.x, this.y, this.w, this.h);
    }
}


class Bird extends GameObject {
    private readonly renderKind: RenderKind = "bird";
    constructor(
        x: number,
        y: number,
        private speed: number,
        private screenWidth: number
    ) {
        super(x, y, 44, 30)
    }

    update(): void {
        this.x += this.speed
        if (this.x > this.screenWidth) {
            this.active = false
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        drawGameObject(ctx, this.renderKind, this.x, this.y, this.w, this.h);
    }
}


export class BirdGenerator extends GameObject {
    private framesUntilNextBird = 0

    constructor(
        private sm: ScreenManager,
        private screenWidth: number
    ) {
        super(0, 0, 0, 0)
        this.resetTimer()
    }

    update(): void {
        this.framesUntilNextBird--

        if (this.framesUntilNextBird <= 0) {
            this.generateBird()
            this.resetTimer()
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // spawner itself does not draw anything
    }

    private generateBird(): void {
        const y = 50 + Math.random() * 120

        const bird = new Bird(0, y, 3, this.screenWidth)
        this.sm.add(bird)
    }

    private resetTimer(): void {
        this.framesUntilNextBird = 50 + Math.random() * 120
    }
}

export class Gun extends GameObject {
    private readonly renderKind: RenderKind = "gun";
    private sm: ScreenManager;
    private dx: number;

    constructor(x: number, y: number, w: number, h: number, dx: number, sm: ScreenManager) {
        super(x, y, w, h);
        this.sm = sm;
        this.dx = dx;
    }

    update(): void {
    }

    draw(ctx: CanvasRenderingContext2D): void {
        drawGameObject(ctx, this.renderKind, this.x, this.y, this.w, this.h);
    }

    moveRight(): void {
        if (this.x + this.dx <= this.sm.ctx.canvas.width - this.w) {
            this.x += this.dx;
        }
    }

    moveLeft(): void {
        if (this.x - this.dx >= 0) {
            this.x -= this.dx;
        }
    }

    shoot(): void {
        const bullet = new Bullet(this.x + this.w / 2 - 2.5, this.y);
        this.sm.add(bullet);
    }
}

export class ScreenManager {
    private objects: Array<GameObject> = [];
    public ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    add(gameObject: GameObject) {
        this.objects.push(gameObject);
    }
    private isColliding(a: Bullet, b: Bird): boolean {
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
        )

    }
    private handleCollisions(): void {

        const bullets = this.objects.filter((obj) => obj instanceof Bullet) as Bullet[]
        const birds = this.objects.filter((obj) => obj instanceof Bird) as Bird[]
        const score = this.objects.find((obj) => obj instanceof Score) as Score | undefined

        for (const bullet of bullets) {
            for (const bird of birds) {

                if (bullet.intersectes(bird)) {
                    bullet.active = false
                    bird.active = false
                    score?.addPoints(1)
                }
            }
            }

        }

        update(): void {
            for(const obj of this.objects) {
            obj.update();
        }
        this.handleCollisions()
        this.objects = this.objects.filter((obj) => obj.active);
    }



    render(): void {
        drawBackground(this.ctx, this.ctx.canvas.width, this.ctx.canvas.height);

        for (const obj of this.objects) {
            obj.draw(this.ctx);
        }
    }
}

export class Game {
    constructor(
        private sm: ScreenManager,
        private gun: Gun
    ) {
        window.addEventListener("keydown", (e) => {
            if (e.repeat) return; // One action per physical key press
            if (e.key === "ArrowLeft") {
                this.gun.moveLeft();
            }
            if (e.key === "ArrowRight") {
                this.gun.moveRight();
            }
            if (e.key === " ") {
                this.gun.shoot();
            }
        });
    }

    start(): void {
        const loop = () => {
            this.sm.update();
            this.sm.render();
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}
