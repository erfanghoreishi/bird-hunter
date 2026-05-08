import { drawBackground, drawGameObject, drawScore } from "./renderer.js";
class GameObject {
    constructor(x, y, w, h) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    intersectes(other) {
        return (this.x < other.x + other.w &&
            this.x + this.w > other.x &&
            this.y < other.y + other.h &&
            this.y + this.h > other.y);
    }
}
export class Score extends GameObject {
    constructor(screenWidth, y = 24) {
        super(screenWidth - 16, y, 0, 0);
        this.screenWidth = screenWidth;
        this.points = 0;
        this.margin = 16;
    }
    setPoints(points) {
        this.points = points;
    }
    addPoints(points = 1) {
        this.points += points;
    }
    update() {
        // Keep score anchored to top-right when canvas size changes.
        this.x = this.screenWidth - this.margin;
    }
    draw(ctx) {
        drawScore(ctx, this.points, this.x, this.y);
    }
}
class Bullet extends GameObject {
    constructor(x, y) {
        super(x, y, 5, 10);
        this.renderKind = "bullet";
        this.speed = 10;
    }
    update() {
        if (this.y > 0) {
            this.y -= this.speed;
        }
        else {
            this.active = false;
        }
    }
    draw(ctx) {
        drawGameObject(ctx, this.renderKind, this.x, this.y, this.w, this.h);
    }
}
class Bird extends GameObject {
    constructor(x, y, speed, screenWidth) {
        super(x, y, 44, 30);
        this.speed = speed;
        this.screenWidth = screenWidth;
        this.renderKind = "bird";
    }
    update() {
        this.x += this.speed;
        if (this.x > this.screenWidth) {
            this.active = false;
        }
    }
    draw(ctx) {
        drawGameObject(ctx, this.renderKind, this.x, this.y, this.w, this.h);
    }
}
export class BirdGenerator extends GameObject {
    constructor(sm, screenWidth) {
        super(0, 0, 0, 0);
        this.sm = sm;
        this.screenWidth = screenWidth;
        this.framesUntilNextBird = 0;
        this.resetTimer();
    }
    update() {
        this.framesUntilNextBird--;
        if (this.framesUntilNextBird <= 0) {
            this.generateBird();
            this.resetTimer();
        }
    }
    draw(ctx) {
        // spawner itself does not draw anything
    }
    generateBird() {
        const y = 50 + Math.random() * 120;
        const bird = new Bird(0, y, 3, this.screenWidth);
        this.sm.add(bird);
    }
    resetTimer() {
        this.framesUntilNextBird = 50 + Math.random() * 120;
    }
}
export class Gun extends GameObject {
    constructor(x, y, w, h, dx, sm) {
        super(x, y, w, h);
        this.renderKind = "gun";
        this.sm = sm;
        this.dx = dx;
    }
    update() {
    }
    draw(ctx) {
        drawGameObject(ctx, this.renderKind, this.x, this.y, this.w, this.h);
    }
    moveRight() {
        if (this.x + this.dx <= this.sm.ctx.canvas.width - this.w) {
            this.x += this.dx;
        }
    }
    moveLeft() {
        if (this.x - this.dx >= 0) {
            this.x -= this.dx;
        }
    }
    shoot() {
        const bullet = new Bullet(this.x + this.w / 2 - 2.5, this.y);
        this.sm.add(bullet);
    }
}
export class ScreenManager {
    constructor(ctx) {
        this.objects = [];
        this.ctx = ctx;
    }
    add(gameObject) {
        this.objects.push(gameObject);
    }
    isColliding(a, b) {
        return (a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y);
    }
    handleCollisions() {
        const bullets = this.objects.filter((obj) => obj instanceof Bullet);
        const birds = this.objects.filter((obj) => obj instanceof Bird);
        const score = this.objects.find((obj) => obj instanceof Score);
        for (const bullet of bullets) {
            for (const bird of birds) {
                if (bullet.intersectes(bird)) {
                    bullet.active = false;
                    bird.active = false;
                    score?.addPoints(1);
                }
            }
        }
    }
    update() {
        for (const obj of this.objects) {
            obj.update();
        }
        this.handleCollisions();
        this.objects = this.objects.filter((obj) => obj.active);
    }
    render() {
        drawBackground(this.ctx, this.ctx.canvas.width, this.ctx.canvas.height);
        for (const obj of this.objects) {
            obj.draw(this.ctx);
        }
    }
}
export class Game {
    constructor(sm, gun) {
        this.sm = sm;
        this.gun = gun;
        window.addEventListener("keydown", (e) => {
            if (e.repeat)
                return; // One action per physical key press
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
    start() {
        const loop = () => {
            this.sm.update();
            this.sm.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}
