const { Engine, World, Bodies, Body } = Matter;
let engine, world;

const colors = ['#ff2828', '#23b4ff'];
let keys = [];

const screenRatio = 3.5 / 2;
let su = 1 / 30;

let player;
let obstacles = [];

function setup() {
  if (windowHeight * screenRatio > windowWidth)
    createCanvas(windowWidth * 0.9, (windowWidth / screenRatio) * 0.9);
  else createCanvas(windowHeight * screenRatio * 0.9, windowHeight * 0.9);
  su *= width;

  engine = Engine.create({ gravity: { scale: 0 } });
  world = engine.world;

  obstacles.push(new RectBody(width / 2, -su / 2, width, su));
  obstacles.push(new RectBody(width / 2, height + su / 2, width, su));
  obstacles.push(new RectBody(-su / 2, height / 2, su, height));
  obstacles.push(new RectBody(width + su / 2, height / 2, su, height));

  obstacles.push(new RectBody(width / 2, height * 0.3, su * 6, height / 7));
  obstacles.push(new RectBody(width / 2, height * 0.7, su * 6, height / 7));

  obstacles.forEach((ob) => {
    ob.body.isStatic = true;
    ob.body.restitution = 1;
  });

  player = new Player(100, 100, su, su, 0);
  Body.setVelocity(player.body, { x: 2, y: -2 });

  noStroke();
}

function draw() {
  background(51);
  Engine.update(engine);

  rectMode(CORNER);
  fill(colors[0]);
  rect(0, 0, width / 2, height);

  fill(colors[1]);
  rect(width / 2, 0, width / 2, height);

  player.step();
  player.show();

  obstacles.forEach((ob) => ob.show());
}

class RectBody {
  constructor(x, y, w, h, opts = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.body = Bodies.rectangle(x, y, w, h, opts);
    World.add(world, this.body);
  }

  show() {
    const pos = this.body.position;
    const rot = this.body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(rot);
    this.display(pos, rot);
    pop();
  }

  display() {
    rectMode(CENTER);
    fill(0);
    rect(0, 0, this.w, this.h);
  }
}

class Player extends RectBody {
  constructor(x, y, w, h, team) {
    super(x, y, w, h, { friction: 0, frictionAir: 0.03, restitution: 0.2 });
    this.team = team;
  }

  step() {
    // this.body.angle = 0;

    let speed = su / 20000;
    if (keys[68])
      Body.applyForce(this.body, this.body.position, { x: speed, y: 0 });
    if (keys[65])
      Body.applyForce(this.body, this.body.position, { x: -speed, y: 0 });
    if (keys[87])
      Body.applyForce(this.body, this.body.position, { x: 0, y: -speed });
    if (keys[83])
      Body.applyForce(this.body, this.body.position, { x: 0, y: speed });

    // if (keys[39]) Body.applyForce(this.body, this.body.position, {x: speed, y: 0})
    // if (keys[37]) Body.applyForce(this.body, this.body.position, {x: -speed, y: 0})
    // if (keys[38]) Body.applyForce(this.body, this.body.position, {x: 0, y: -speed})
    // if (keys[40]) Body.applyForce(this.body, this.body.position, {x: 0, y: speed})
  }

  display() {
    rectMode(CENTER);
    fill(0);
    rect(0, 0, this.w, this.h);
    fill(colors[this.team]);
    rect(0, 0, this.w - su / 4, this.h - su / 4);
  }
}

function keyPressed() {
  keys[keyCode] = true;
  console.log();
}

function keyReleased() {
  keys[keyCode] = false;
}
