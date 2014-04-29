// vim: expandtab:sw=4:ts=4:sts=4
var SPRITE_DIR = 'assets/sprites/';
var AUDIO_DIR = 'assets/audio/';
var SHARK_SPEED = 10;
var NUM_CLOUDS = 16;
var EXPLOSION_FRAME_RATE = 6;

var BasicGame = {};

BasicGame.Boot = function (game) {
};

BasicGame.Boot.prototype = {
    preload: function() {
        game.load.image('shark',    SPRITE_DIR + 'shark.png');
        game.load.image('jet',      SPRITE_DIR + 'jet.png');
        game.load.image('bomb',     SPRITE_DIR + 'bomb.png');
        game.load.image('waves',    SPRITE_DIR + 'waves.png');
        game.load.image('waves_bg', SPRITE_DIR + 'waves_bg.png');
        game.load.image('depths',   SPRITE_DIR + 'depths.png');
        game.load.image('waves_fg', SPRITE_DIR + 'waves_fg.png');
        game.load.image('cloud1',   SPRITE_DIR + 'cloud1.png');
        game.load.image('cloud2',   SPRITE_DIR + 'cloud2.png');
        game.load.image('cloud3',   SPRITE_DIR + 'cloud3.png');
        game.load.image('cloud4',   SPRITE_DIR + 'cloud4.png');
        game.load.image('splash_complete',   SPRITE_DIR + 'splash_complete.png');
        game.load.atlas('speaker',  SPRITE_DIR + 'speaker.png', null, speakerData);
        game.load.spritesheet('explosionFms', SPRITE_DIR + 'explosion_frames.png',180,149,3);

        //sound effects
        game.load.audio('jet_explode',      AUDIO_DIR + 'jet_explode.wav');
        game.load.audio('jump_out_of_ocean',AUDIO_DIR + 'jump_out_of_ocean.wav');
        game.load.audio('splash_down',      AUDIO_DIR + 'splash_down.wav');

        //background music
        game.load.audio('bgmusic',          AUDIO_DIR + 'bgmusic.wav');

        //font
        WebFontConfig = {
                google: { families: [ 'Permanent+Marker::latin' ] }
        };
        (function() {
                var wf = document.createElement('script');
                wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
                '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
        })();
    },

    create: function () {
        this.state.start('MainMenu');
    }
};

BasicGame.MainMenu = function (game) {
    this.splash_screen;
    this.text;
};

BasicGame.MainMenu.prototype = {
    preload: function () {
    },
    create: function () {
        this.stage.backgroundColor = 0x112233;
        this.splash_screen = game.add.sprite(0, 84, 'splash_complete');
        var style = { font: "28px Permanent Marker", fill: "#eeee66", align: "center" };
        this.text = game.add.text(game.width/2-120, game.height-250, 'Press Enter to start!', style);
    },
    update: function () {
        if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
        {
            this.playGame();
        }
    },
    playGame: function () {
        this.state.start('GameStart');
    }
};

var jetCounter = 0;
var jets = [];

BasicGame.GameStart = function (game) {
    this.player;

    this.clouds = [];
    this.sharks = [];
    this.sharkPath = [];
    this.sharkSpacer = 10;
    this.comboText;
    this.hitText;
    this.enemyProjectiles;
    this.jet_explode_sfx;
    this.score = 0;
    this.currentComboScore = 0;
    this.maxCombo = 0;
    this.mute = false;
    this.numSharks = 5;
    this.oceanLayers;
};

BasicGame.GameStart.prototype = {
    preload: function () {
        this.clouds.length = 0;
        this.sharks.length = 0;
        jets.length = 0;
        this.score = 0;
        this.currentComboScore = 0;
        this.numSharks = 5;
    },
    create: function () {
        game.stage.backgroundColor = '#3399FF';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, 928, 600);
        jet_explode_sfx = game.add.audio('jet_explode', 1);
        shark_jump_sfx = game.add.audio('jump_out_of_ocean', 1);
        splash_sfx = game.add.audio('splash_down', 1);
        music = game.add.audio('bgmusic',1,true);
        music.play('',0,0.3,true);
        speaker = game.add.sprite(game.width - 32, game.height - 32, 'speaker');

        speaker.inputEnabled = true;
        speaker.events.onInputDown.add(function() {
            this.mute = !this.mute;
            speaker.frame = this.mute ? 1 : 0;
            if (this.mute) {
                music.pause();
            } else {
                music.resume();
            }
        }, this);
        cursors = game.input.keyboard.createCursorKeys();
        cursors.w = game.input.keyboard.addKey(Phaser.Keyboard.W);
        cursors.s = game.input.keyboard.addKey(Phaser.Keyboard.S);
        cursors.d = game.input.keyboard.addKey(Phaser.Keyboard.D);
        for (var i=NUM_CLOUDS; i>0; i--) {
            var cloud_num = Math.ceil(i/4);
            this.clouds.push([game.add.sprite(game.rnd.integerInRange(0, game.width), game.rnd.integerInRange(0,222), 'cloud' + cloud_num.toString()), cloud_num]);
            this.clouds[NUM_CLOUDS-i][0].scale.setTo(0.5, 0.5);
        }

        oceanLayers = game.add.group();
        depths = game.add.tileSprite(0, 383, 800, 342, 'depths');
        oceanLayers.add(depths);
        depths.z = 0;

        waves_bg = game.add.tileSprite(0, 290, 800, 84, 'waves_bg');
        oceanLayers.add(waves_bg);
        waves_bg.z = 1;
        game.add.tween(waves_bg).to({y: waves_bg.y - 10}, 1000, Phaser.Easing.Linear.None, true, 0, 1000, true);

        waves_fg = game.add.tileSprite(0, 380, 800, 78, 'waves_fg');
        oceanLayers.add(waves_fg);
        waves_fg.z = 2;

        waves = game.add.tileSprite(0, 303, 800, 84, 'waves');
        oceanLayers.add(waves);
        waves.z = 3;

        player = game.add.sprite(game.world.centerX, game.world.centerY * 3/2, 'shark');
        player.anchor.setTo(0.5, 0.5);
        player.scale.setTo(0.3, 0.3);
        player.aboveWater = false;
        player.health = 100;

        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.maxVelocity.setTo(300, 1000);
        player.body.drag.set(1);

        for (var i=0; i<this.numSharks; i++) {
            this.sharks[i] = game.add.sprite(player.body.x, player.body.y, 'shark');
            this.sharks[i].anchor.setTo(0.5, 0.5);
            var scale = 0.15 + game.rnd.frac() * 0.25;
            this.sharks[i].scale.setTo(scale, scale);
            this.sharks[i].angSpeed = game.rnd.frac();
            game.physics.enable(this.sharks[i], Phaser.Physics.ARCADE);
        }
        for (var i=0; i <= this.numSharks * this.sharkSpacer; i++)
        {
            this.sharkPath[i] = new Phaser.Point(player.body.x, player.body.y);
        }

        bombs = game.add.group();
        bombs.enableBody = true;
        bombs.physicsBodyType = Phaser.Physics.ARCADE;
        bombs.createMultiple(4, 'bomb');

        bombs.setAll('anchor.x', 0.5);
        bombs.setAll('anchor.y', 0.5);
        bombs.setAll('outOfBoundsKill', true);
        bombs.setAll('checkWorldBounds', true);

        game.time.events.repeat(Phaser.Timer.SECOND * 2, 4, this.createJet, this);
        style = { font: "18px Permanent Marker", fill: "#660033", align: "center" };
        comboText = game.add.text(game.world.centerX-80, 128, 'Combo ' + this.currentComboScore, style);
        comboText.alpha = 0;
        comboText.anchor.setTo(0.5,0.5);
        hitText = game.add.text(game.world.centerX - 50, 256, "OUCHIES!", style);
        hitText.alpha = 0;
        hitText.anchor.setTo(0.5,0.5);
        this.scoreText = game.add.text(32, 32, 'Score: ' + this.score, style);
        comboScoreText = game.add.text(32, 64, 'Max Combo: ' + this.maxCombo, style);
        speaker.bringToTop();
    },
    update: function () {
        this.scoreText.text = 'Score: ' + this.score;
        comboScoreText.text = 'Max Combo: ' + this.maxCombo;
        for (var i=0; i<this.clouds.length; i++) {
            var cloud = this.clouds[i];
            cloud[0].x -= 1 / cloud[1];
            if (cloud[0].x < -cloud[0].width) {
                cloud[0].y = game.rnd.integerInRange(0,222);
                cloud[0].x = game.rnd.integerInRange(game.width, game.width + 200);
            }
        }
        for (i in jets) {
            if (jets[i].alive) {
                jets[i].update();
                game.physics.arcade.overlap(player, jets[i].jet, this.sharkHitJet, null, this);
            } else {
                delete jets[i];
            }
        }
        for (var i=0; i<bombs.children.length; i++) {
            if (bombs.getChildAt(i).y > game.world.height + bombs.getChildAt(i).height) {
                bombs.getChildAt(i).kill();
            }
        }
        game.physics.arcade.overlap(bombs, player, this.bombHitShark, null, this);
        player.body.angularVelocity = 0;
        if (player.body.y > 300) {
            if (player.aboveWater) {
                this.playSound(splash_sfx,'');
            }
            player.aboveWater = false;
            this.scoreCombo(this.currentComboScore);
            this.currentComboScore = 0;
            if (cursors.right.isDown || cursors.d.isDown)
            {
                player.body.velocity.x += game.physics.arcade.velocityFromAngle(player.angle, SHARK_SPEED).x;
                player.body.velocity.y += game.physics.arcade.velocityFromAngle(player.angle, SHARK_SPEED).y;
            }
            else if (player.body.velocity.x > 0)
            {
                player.body.velocity.x -= 10;
            }

            player.body.velocity.y += player.angle/10;

            if ((cursors.up.isDown || cursors.w.isDown) && player.angle > -45)
            {
                player.body.angularVelocity = -200;
            }
            else if ((cursors.down.isDown || cursors.s.isDown) && player.angle < 45)
            {
                player.body.angularVelocity = 200;
            }
            if (!cursors.down.isDown && !cursors.s.isDown && !cursors.up.isDown && !cursors.w.isDown) {
                player.angle += 1 * (player.angle < 0)
                    player.angle += -1 * (player.angle > 0)
            }
            if (player.body.y + 20 > game.height)
            {
                player.body.velocity.y = 0;
                player.body.y = game.height - 20;
            }

            player.body.velocity.x -= SHARK_SPEED * ((player.body.x + player.width) / 600);
        }
        else
        {
            if (!player.aboveWater) {
                this.playSound(shark_jump_sfx, '');
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

    scoreCombo: function(comboScore)
    {
        if(comboScore > 1)
        {
            comboText.alpha = 1;
            comboText.angle = 0;
            comboText.setText("Combo: " + comboScore);
            var style = { font: "65px Permanent Marker", fill: "#eeddbb", align: "center" };
            comboText.setStyle(style);
            game.add.tween(comboText).to({alpha: 0}, 500*comboScore, Phaser.Easing.Linear.None, true);
            game.add.tween(comboText).to({angle: 360}, 1500, Phaser.Easing.Bounce.Out, true);
            this.score += (Math.pow(comboScore,2)-this.currentComboScore)
        }
    },

    bombHitShark: function(shark, bomb) {
        bomb.kill();
        this.playSound(jet_explode_sfx, '');
        hitText.alpha = 1;
        hitText.angle = 0;
        hitText.setText("OUCHIES!");
        var delay = 2000;
        var style = { font: "85px Permanent Marker", fill: "#ff0000", align: "center" };
        hitText.setStyle(style);
        this.numSharks--;
        if (this.numSharks >= 0) {
            game.physics.arcade.accelerateToXY(this.sharks[this.numSharks], -1000, 1000, 400, 0, 500);
        } else {
            shark.kill();
            delay = 10000;
            hitText.setText("YOU DEAD!!!");
        }
        game.add.tween(hitText).to({alpha: 0}, delay, Phaser.Easing.Linear.None, true);
        this.playExplosion(shark, 60+shark.deltaX, 80+shark.deltaY);
    },

    sharkHitJet: function(shark, jet) {
        var destroyed = jets[jet.name].damage();
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
        jets[jetCounter.toString()] = new Jet(jetCounter, game, player, bombs, this.createJet);
        jetCounter++;
    },
    playExplosion: function (obj, offX, offY)
    {
        this.playSound(jet_explode_sfx, '');
        explosion = game.add.sprite(obj.x-offX, obj.y-offY, 'explosionFms');
        explosion.animations.add("explode");
        explosion.animations.play("explode", EXPLOSION_FRAME_RATE, false, true);

        explosion.bringToTop();
    },

    playSound: function (sound, marker) {
        if (!this.mute) {
            sound.play(marker);
        }
    },
};

function deathScreen() {
        game.state.start("DeathScreen");
}
BasicGame.DeathScreen = function (game) {
    this.splash_screen;
};

BasicGame.DeathScreen.prototype = {
    preload: function () {
    },
    create: function () {
        this.stage.backgroundColor = 0x112233;
        this.splash_screen = game.add.sprite(0, 84, 'splash_complete');
    },
    update: function () {
        if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
        {
            this.restart();
        }
    },
    restart: function () {
        this.state.start('GameStart');
    }
};


var speakerData = {
    "frames": [
        {
            "filename": "speakerOn",
            "frame": { "x": 0, "y": 0, "w": 20, "h": 20 },
            "rotated": false,
            "trimmed": false,
            "spriteSourceSize":  { "x": 0, "y": 0, "w": 20, "h": 20 },
            "sourceSize": { "w": 20, "h": 20 }
        },
        {
            "filename": "speakerOff",
            "frame": { "x": 20, "y": 0, "w": 20, "h": 20 },
            "rotated": false,
            "trimmed": false,
            "spriteSourceSize":  { "x": 0, "y": 0, "w": 32, "h": 32 },
            "sourceSize": { "w": 20, "h": 20 }
        }
    ]
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game_div');

game.state.add('Boot', BasicGame.Boot);
game.state.add('MainMenu', BasicGame.MainMenu);
game.state.add('GameStart', BasicGame.GameStart);
game.state.add('DeathScreen', BasicGame.DeathScreen);
game.state.start('Boot');
