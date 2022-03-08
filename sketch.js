const { Engine, World, Bodies, Body, Sleeping } = Matter;
let engine, world;

const colors = ['#ff2828', '#23b4ff'];

const screenRatio = 3.5 / 2;
let su = 1 / 30;
let keys = [];

let players = [];
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

  players[0] = new Player(3.5 * su, height / 2, 0);
  players[1] = new Player(width - 3.5 * su, height / 2, 1);

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

  players.forEach((player) => {
    player.step(deltaTime);
    player.show();
  });

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

  applyForce(x, y) {
    Body.applyForce(this.body, this.body.position, { x: x, y: y });
  }
}

class Player extends RectBody {
  constructor(x, y, team) {
    super(x, y, su, su, {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0.03,
      restitution: 1,
    });
    this.body.label = 'Player ' + team;

    this.team = team;
    this.deadTimer = 0;
    this.dead = false;

    this.body.onCollide((cb) => {
      let other;
      if (cb.bodyA.id == this.body.id) other = cb.bodyB;
      else other = cb.bodyA;

      let otherType = other.label.split(' ');
      if (otherType[0] == 'Player') {
        this.collidePlayer(parseInt(otherType[1]));
      } else if (otherType[0] == 'Flag') {
        this.collideFlag(other);
      }
    });
  }

  collidePlayer(otherID) {
    // let opos = other.position;
    let pos = this.body.position;

    let zone = pos.x < width / 2 ? 0 : 1;
    if (zone != this.team && players[otherID].dead == false) this.die();
  }

  step(delta) {
    // this.body.angle = 0;

    if (this.dead) {
      this.deadTimer -= delta;
      if (this.deadTimer <= 0) {
        this.dead = false;
        Sleeping.set(this.body, false);
      } else {
        return;
      }
    }

    let speed = su / 20000;

    if (this.team == 0) {
      if (keys[68]) this.applyForce(speed, 0);
      if (keys[65]) this.applyForce(-speed, 0);
      if (keys[87]) this.applyForce(0, -speed);
      if (keys[83]) this.applyForce(0, speed);
    } else {
      if (keys[39]) this.applyForce(speed, 0);
      if (keys[37]) this.applyForce(-speed, 0);
      if (keys[38]) this.applyForce(0, -speed);
      if (keys[40]) this.applyForce(0, speed);
    }
  }

  display() {
    rectMode(CENTER);
    fill(this.dead ? 80 : 0);
    rect(0, 0, this.w, this.h);
    fill(colors[this.team]);
    rect(0, 0, this.w - su / 4, this.h - su / 4);
  }

  die() {
    this.deadTimer = 2000;
    this.dead = true;
    Sleeping.set(this.body, true);
    Body.setPosition(this.body, { x: this.x, y: this.y });
    Body.setVelocity(this.body, { x: 0, y: 0 });
    Body.setAngle(this.body, 0);
  }
}

function keyPressed() {
  keys[keyCode] = true;
}

function keyReleased() {
  keys[keyCode] = false;
}
