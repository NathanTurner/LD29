// Global Variables
var NUM_CLOUDS = 16;
var SHARK_SPEED = 10;
var NUM_CLOUDS = 16;
var EXPLOSION_FRAME_RATE = 6;
var SPLASH_FRAME_RATE = 6;

'use strict';
function Play() {
  this.player = null;

  this.clouds = [];
  this.sharks = [];
  this.sharkPath = [];
  this.sharkSpacer = 10;
  this.comboText = null;
  this.hitText = null;
  this.enemyProjectiles = null;
  this.jet_explode_sfx = null;
  this.score = 0;
  this.currentComboScore = 0;
  this.maxCombo = 0;
  this.mute = false;
  this.numSharks = 0;
  this.oceanLayers = null;
  this.giantJet = null;
  this.shark_jump_sfx = null;
  this.splash_sfx = null;
  this.cursors = null;
  this.jets = [];
  this.jetCounter = 0;
  this.splash_animation = null;
  this.bombs = null;
  this.Jet = require('../objects/jet');
}
Play.prototype = {
  create: function() {
    this.game.stage.backgroundColor = '#3399FF';
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.world.setBounds(0, 0, 928, 600);
    this.jet_explode_sfx = this.game.add.audio('jet_explode', 1);
    this.shark_jump_sfx = this.game.add.audio('jump_out_of_ocean', 1);
    this.splash_sfx = this.game.add.audio('splash_down', 1);
    this.music = this.game.add.audio('bgmusic',1,true);
    this.music.play('',0,0.3,true);
    this.speaker = this.game.add.sprite(this.game.width - 32, this.game.height - 32, 'speaker');

    this.speaker.inputEnabled = true;
    this.speaker.events.onInputDown.add(function() {
      this.mute = !this.mute;
      this.speaker.frame = this.mute ? 1 : 0;
      if (this.mute) {
        this.music.pause();
      } else {
        this.music.resume();
      }
    }, this);
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.cursors.w = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    this.cursors.s = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.cursors.d = this.game.input.keyboard.addKey(Phaser.Keyboard.D);

    this.clouds.length = 0;
    for (var i=NUM_CLOUDS; i>0; i--) {
      var cloud_num = Math.ceil(i/4);
      this.clouds.push([this.game.add.sprite(this.game.rnd.integerInRange(0, this.game.width), this.game.rnd.integerInRange(0,222), 'cloud' + cloud_num.toString()), cloud_num]);
      this.clouds[NUM_CLOUDS-i][0].scale.setTo(0.5, 0.5);
    }

    oceanLayers = this.game.add.group();

    waves_bg = this.game.add.tileSprite(0, 310, 800, 155, 'waves_bg');
    oceanLayers.add(waves_bg);
    waves_bg.z = 0;
    this.game.add.tween(waves_bg).to({y: waves_bg.y - 10}, 1000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    depths = this.game.add.tileSprite(0, 384, 1010, 216, 'depths');
    oceanLayers.add(depths);
    depths.z = 1;

    waves_fg = this.game.add.tileSprite(0, 380, 800, 78, 'waves_fg');
    oceanLayers.add(waves_fg);
    waves_fg.z = 2;

    waves = this.game.add.tileSprite(0, 320, 800, 83, 'waves');
    oceanLayers.add(waves);
    waves.z = 3;

    player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY * 3/2, 'shark');
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(0.3, 0.3);
    player.aboveWater = false;
    player.health = 100;

    this.game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.maxVelocity.setTo(300, 1000);
    player.body.drag.set(1);

    this.numSharks = 5;
    for (var i=0; i<this.numSharks; i++) {
      this.sharks[i] = this.game.add.sprite(player.body.x, player.body.y, 'shark');
      this.sharks[i].anchor.setTo(0.5, 0.5);
      var scale = 0.15 + this.game.rnd.frac() * 0.25;
      this.sharks[i].scale.setTo(scale, scale);
      this.sharks[i].angSpeed = this.game.rnd.frac();
      this.game.physics.enable(this.sharks[i], Phaser.Physics.ARCADE);
    }
    for (var i=0; i <= this.numSharks * this.sharkSpacer; i++)
    {
      this.sharkPath[i] = new Phaser.Point(player.body.x, player.body.y);
    }

    this.bombs = this.game.add.group();
    this.bombs.enableBody = true;
    this.bombs.physicsBodyType = Phaser.Physics.ARCADE;
    this.bombs.createMultiple(4, 'bomb');

    this.bombs.setAll('anchor.x', 0.5);
    this.bombs.setAll('anchor.y', 0.5);
    this.bombs.setAll('outOfBoundsKill', true);
    this.bombs.setAll('checkWorldBounds', true);

    this.game.time.events.repeat(Phaser.Timer.SECOND * 2, 4, this.createJet, this);
    style = { font: "18px Permanent Marker", fill: "#660033", align: "center" };
    this.comboText = this.game.add.text(this.game.world.centerX-80, 128, 'Combo ' + this.currentComboScore, style);
    this.comboText.alpha = 0;
    this.comboText.anchor.setTo(0.5,0.5);
    this.hitText = this.game.add.text(this.game.world.centerX - 50, 256, "OUCHIES!", style);
    this.hitText.alpha = 0;
    this.hitText.anchor.setTo(0.5,0.5);

    this.scoreText = this.game.add.text(32, 32, 'Score: ' + this.score, style);
    this.score = 0;

    this.comboScoreText = this.game.add.text(32, 64, 'Max Combo: ' + this.maxCombo, style);
    this.speaker.bringToTop();
  },
  update: function () {
    this.scoreText.text = 'Score: ' + this.score;
    this.comboScoreText.text = 'Max Combo: ' + this.maxCombo;
    for (var i=0; i<this.clouds.length; i++) {
      var cloud = this.clouds[i];
      cloud[0].x -= 1 / cloud[1];
      if (cloud[0].x < -cloud[0].width) {
        cloud[0].y = this.game.rnd.integerInRange(0,222);
        cloud[0].x = this.game.rnd.integerInRange(this.game.width, this.game.width + 200);
      }
    }
    for (i in this.jets) {
      if (this.jets[i].alive) {
        this.jets[i].update();
        this.game.physics.arcade.overlap(player, this.jets[i].jet, this.sharkHitJet, null, this);
      } else {
        delete this.jets[i];
      }
    }
    for (var i=0; i<this.bombs.children.length; i++) {
      if (this.bombs.getChildAt(i).y > this.game.world.height + this.bombs.getChildAt(i).height) {
        this.bombs.getChildAt(i).kill();
      }
    }
    this.game.physics.arcade.overlap(this.bombs, player, this.bombHitShark, null, this);
    player.body.angularVelocity = 0;
    if (player.body.y > 300) {
      if (player.aboveWater) {
        this.playSplash(player, false, 0, 0);
      }
      player.aboveWater = false;
      this.scoreCombo(this.currentComboScore);
      this.currentComboScore = 0;
      if (this.cursors.right.isDown || this.cursors.d.isDown)
      {
        player.body.velocity.x += this.game.physics.arcade.velocityFromAngle(player.angle, SHARK_SPEED).x;
        player.body.velocity.y += this.game.physics.arcade.velocityFromAngle(player.angle, SHARK_SPEED).y;
      }
      else if (player.body.velocity.x > 0)
      {
        player.body.velocity.x -= 10;
      }

      player.body.velocity.y += player.angle/10;

      if ((this.cursors.up.isDown || this.cursors.w.isDown) && player.angle > -45)
      {
        player.body.angularVelocity = -200;
      }
      else if ((this.cursors.down.isDown || this.cursors.s.isDown) && player.angle < 45)
      {
        player.body.angularVelocity = 200;
      }
      if (!this.cursors.down.isDown && !this.cursors.s.isDown && !this.cursors.up.isDown && !this.cursors.w.isDown) {
        player.angle += 1 * (player.angle < 0)
          player.angle += -1 * (player.angle > 0)
      }
      if (player.body.y + 20 > this.game.height)
      {
        player.body.velocity.y = 0;
        player.body.y = this.game.height - 20;
      }

      player.body.velocity.x -= SHARK_SPEED * ((player.body.x + player.width) / 600);
    }
    else
    {
      if (!player.aboveWater) {
        this.playSplash(player, true, 0, 0);
      }
      player.aboveWater = true;
      player.angle += 1 * (player.angle - 75 < 0)
        player.angle += -1 * (player.angle - 75 > 0)
        player.body.velocity.x -= 1;
      player.body.velocity.y += 10;
    }
    if (player.body.x < -player.width/2)
    {
      player.body.velocity.x = 0;
      player.body.x = -player.width/2;
    }
    depths.tilePosition.x -= 2;
    waves_bg.tilePosition.x -= 3;
    waves_fg.tilePosition.x -= 4;
    waves.tilePosition.x -= 5;

    var part = this.sharkPath.pop();
    part.setTo(player.body.x, player.body.y);
    this.sharkPath.unshift(part);
    for (var i=0; i<this.numSharks; i++) {
      if (this.sharks[i].angle < player.angle) this.sharks[i].angle += this.sharks[i].angSpeed;
      if (this.sharks[i].angle > player.angle) this.sharks[i].angle -= this.sharks[i].angSpeed;
      this.sharks[i].x = (this.sharkPath[i * this.sharkSpacer]).x;
      this.sharks[i].y = (this.sharkPath[i * this.sharkSpacer]).y;
    }
  },
  scoreCombo: function(comboScore) {
    if(comboScore > 1)
    {
      this.comboText.alpha = 1;
      this.comboText.angle = 0;
      this.comboText.setText("Combo: " + comboScore);
      var style = { font: "65px Permanent Marker", fill: "#eeddbb", align: "center" };
      this.comboText.setStyle(style);
      this.game.add.tween(this.comboText).to({alpha: 0}, 500*comboScore, Phaser.Easing.Linear.None, true);
      this.game.add.tween(this.comboText).to({angle: 360}, 1500, Phaser.Easing.Bounce.Out, true);
      this.score += (Math.pow(comboScore,2)-this.currentComboScore)
    }
  },
  scoreCombo: function(comboScore)
  {
    if(comboScore > 1)
    {
      this.comboText.alpha = 1;
      this.comboText.angle = 0;
      this.comboText.setText("Combo: " + comboScore);
      var style = { font: "65px Permanent Marker", fill: "#eeddbb", align: "center" };
      this.comboText.setStyle(style);
      this.game.add.tween(this.comboText).to({alpha: 0}, 500*comboScore, Phaser.Easing.Linear.None, true);
      this.game.add.tween(this.comboText).to({angle: 360}, 1500, Phaser.Easing.Bounce.Out, true);
      this.score += (Math.pow(comboScore,2)-this.currentComboScore)
    }
  },

  bombHitShark: function(shark, bomb) {
    bomb.kill();
    this.playSound(this.jet_explode_sfx, '');
    this.hitText.alpha = 1;
    this.hitText.angle = 0;
    this.hitText.setText("OUCHIES!");
    var delay = 2000;
    var style = { font: "85px Permanent Marker", fill: "#ff0000", align: "center" };
    this.hitText.setStyle(style);
    this.numSharks--;
    if (this.numSharks >= 0) {
      this.game.physics.arcade.accelerateToXY(this.sharks[this.numSharks], -1000, 1000, 400, 0, 500);
    } else {
      shark.kill();
      this.endGame();
    }
    this.game.add.tween(this.hitText).to({alpha: 0}, delay, Phaser.Easing.Linear.None, true);
    this.playExplosion(shark, 60+shark.deltaX, 80+shark.deltaY);
  },
  endGame : function() {
    delay = 10000;
    this.giantJet = this.game.add.sprite(1500, 0, 'jet');
    this.giantJet.scale.setTo(4,4);

    this.hitText.setText("YOU DEAD!!!");

    this.giantJet.bringToTop();
    this.game.time.events.add(Phaser.Timer.SECOND, function() {
      this.giantJet = this.game.add.sprite(1500, 0, 'jet');
      this.giantJet.scale.setTo(4,4);

      this.game.add.tween(this.giantJet).to({x: -2200}, 2000, Phaser.Easing.Linear.None, true, 0, 0);
    }, this);
    var that = this;
    this.game.time.events.add(Phaser.Timer.SECOND * 3, function() {
      that.music.destroy(false);
      that.state.start('gameover')
    }, this);
  },
  sharkHitJet: function(shark, jet) {
    var destroyed = this.jets[jet.name].damage();
    if (destroyed)
    {
      this.playExplosion(jet, 50, 50);
      this.score += 1;
      this.currentComboScore += 1;
      if(this.currentComboScore > this.maxCombo)
      {
        this.maxCombo = this.currentComboScore;
      }
    }
  },

  createJet: function()
  {
    this.jets[this.jetCounter.toString()] = new this.Jet(this, this.jetCounter, this.game, player, this.bombs, this.createJet);
    this.jetCounter++;
  },
  playExplosion: function (obj, offX, offY)
  {
    this.playSound(this.jet_explode_sfx, '');
    explosion = this.game.add.sprite(obj.x - offX, obj.y - offY, 'explosionFms');
    explosion.animations.add("explode");
    explosion.animations.play("explode", EXPLOSION_FRAME_RATE, false, true);

    explosion.bringToTop();
  },
  playSplash : function (obj, jumping, offX, offY)
  {
    var sfx = jumping ? this.shark_jump_sfx : this.splash_sfx;
    this.playSound(sfx, '');
    var splash_scale = 0.3;
    this.splash_animation = this.game.add.sprite(obj.x - offX, obj.y - offY, 'splash');
    this.splash_animation.x -= this.splash_animation.width * splash_scale / 2;
    this.splash_animation.scale.setTo(splash_scale, splash_scale);
    this.splash_animation.animations.add('splishity_splash');
    this.splash_animation.animations.play('splishity_splash', SPLASH_FRAME_RATE, false, true);
  },
  playSound: function (sound, marker) {
    if (!this.mute) {
      sound.play(marker);
    }
  },
};

module.exports = Play;
