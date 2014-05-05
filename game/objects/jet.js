'use strict';

function Jet(that, index, game, shark, bombs, createJet) {
  this.that = that;
  this.delay = 0
    this.createJet = createJet
    this.game = game;
  this.health = 1;
  this.shark = shark;
  this.bombs = bombs;
  this.fireRate = 100;
  this.nextFire = this.game.rnd.integerInRange(0, 100);
  this.alive = true;
  this.jet = this.game.add.sprite(this.game.width, 50+this.game.rnd.integerInRange(0, 200), 'jet');
  this.jet.name = index.toString();
  this.game.physics.enable(this.jet, Phaser.Physics.ARCADE);
  this.game.add.tween(this.jet).to({ x: this.jet.x - 1600 }, 10000, Phaser.Easing.Linear.None, true);
  this.game.add.tween(this.jet).to({ y: this.jet.y + 20 }, 1000, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);
  this.jet.scale.setTo(0.3, 0.3);
  this.jet.events.onKilled.add(function() {
    var rT = this.game.rnd.integerInRange(2,6);
    this.game.time.events.add(Phaser.Timer.SECOND*rT, this.createJet, this.that);
  }, this);
};

Jet.prototype.damage = function() {
  this.health -= 1;

  if (this.health <= 0)
  {
    this.alive = false;
    this.jet.kill();
    return true;
  }
  return false;
}

Jet.prototype.update = function() {
  this.delay++;
  if (this.jet.x + this.jet.width < 0)
  {
    this.alive = false;
    this.jet.kill();
  }
  else if (this.delay > this.nextFire && this.bombs.countDead() > 0)
  {
    this.delay = 0;
    this.nextFire = this.delay + this.fireRate + this.game.rnd.integerInRange(-50, 50);
    var bomb = this.bombs.getFirstDead();
    bomb.reset(this.jet.body.x + 50, this.jet.body.y + 50);
    this.game.physics.arcade.accelerateToXY(bomb, bomb.x, 1000, 400, 0, 500);
  }
}
module.exports = Jet;