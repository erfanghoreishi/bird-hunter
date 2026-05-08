import { BirdGenerator, Game, Gun, Score, ScreenManager } from "./index.js";
const canvas = document.getElementById("myCanvas");
if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Canvas not found");
}
const ctx = canvas.getContext("2d");
if (!ctx)
    throw new Error("No context");
const sm = new ScreenManager(ctx);
const gun = new Gun(canvas.width / 2 - 20, canvas.height - 40, 40, 20, 15, sm);
const score = new Score(canvas.width);
const birdGenerator = new BirdGenerator(sm, canvas.width);
sm.add(gun);
sm.add(score);
sm.add(birdGenerator);
const game = new Game(sm, gun);
game.start();
