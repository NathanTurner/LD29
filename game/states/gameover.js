'use strict';
function GameOver() {
  this.splash_screen = null;
  this.deathText = null;
  this.fingeance = null;
  this.shark = null;
}

GameOver.prototype = {
  preload: function () {
    this.stage.backgroundColor = 0x112233;
    this.splash_screen = this.game.add.sprite(0, 84, 'splash_complete');
    this.xOff = 100;
    this.yOff = 250;
  },
  create: function () {
    var style = { font: "28px Permanent Marker", fill: "#eeee66", align: "center" };
    this.deathText = this.game.add.text(this.game.world.centerX-this.xOff, this.game.height-250, 'You died.\n Press Enter for ', style);
    var finStyle = { font: "48px Permanent Marker", fill: "#ff0000", align: "center" };
    this.deathText.anchor.setTo(0.5, 0.5);
    this.fingeance = this.game.add.text(this.game.world.centerX-this.xOff, this.game.height-this.yOff+this.deathText.height, 'FINGEANCE!', finStyle);
    this.fingeance.anchor.setTo(0.5, 0.5);
    this.shark = this.game.add.sprite(-1500, 0, 'shark');
    this.shark.scale.setTo(4,4);
    this.shark.bringToTop();
  },
  update: function () {
    if(this.game.input.activePointer.justPressed() ||
       this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
    {
      this.restart();
    }
  },
  restart: function () {
    this.game.add.tween(this.shark).to({x: 1500}, 1500, Phaser.Easing.Linear.None, true, 0, 0);
    this.game.time.events.add(Phaser.Timer.SECOND * 1.3, function() {
      this.state.start('play')
    }, this);
  }
};
module.exports = GameOver;
