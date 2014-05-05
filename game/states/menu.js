
'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {
    this.splash_screen = null;
    this.text = null;
    this.shark = null;
  },
  create: function() {
    this.splash_screen = this.game.add.sprite(0, 84, 'splash_complete');

    var style = { font: "28px Permanent Marker", fill: "#eeee66", align: "center" };
    this.shark = this.game.add.sprite(-1500, 0, 'shark');
    this.text = this.game.add.text(this.game.world.centerX, this.game.height-250, 'Press Enter to start!', style);

    // Important if you want the text to be centered.
    this.text.anchor.setTo(0.5, 0.5);

    this.shark = this.game.add.sprite(-1500, 0, 'shark');
    this.shark.scale.setTo(4,4);
    this.shark.bringToTop();
  },
  update: function() {
    if(this.game.input.activePointer.justPressed() ||
       this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
         this.playGame();
       }
  },
  playGame: function () {
    this.game.add.tween(this.shark).to({x: 1500}, 1500, Phaser.Easing.Linear.None, true, 0, 0);
    this.game.time.events.add(Phaser.Timer.SECOND * 1.3, function() {
      this.state.start('play')
    }, this);
  }
};

module.exports = Menu;
