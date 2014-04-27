// vim: expandtab:sw=4:ts=4:sts=4

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

var SPRITE_DIR = 'assets/sprites/';
var AUDIO_DIR = 'assets/audio/';
var SHARK_SPEED = 10;

function preload() {
    //images
    game.load.image('shark', SPRITE_DIR + 'shark.png');
    game.load.image('jet',   SPRITE_DIR + 'jet.png');
    game.load.image('waves', SPRITE_DIR + 'waves.png');
    
    //sound effects
    game.load.audio('jet_explode',      AUDIO_DIR + 'jet_explode.wav');
    game.load.audio('jump_out_of_ocean',AUDIO_DIR + 'jump_out_of_ocean.wav');
    game.load.audio('splash_down',      AUDIO_DIR + 'splash_down.wav');

    //background music
    game.load.audio('bgmusic',          AUDIO_DIR + 'bgmusic.wav');
}

var player;
var jets = [];
var comboText;
var enemyProjectiles;
var jet_explode_sfx;
var jetCounter = 0;
var score = 0;
var currentComboScore = 0;
var maxCombo = 0;

function create() {
    game.stage.backgroundColor = '#3399FF';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, 928, 600);
    game.scale.pageAlignHorizontally = true;
    game.scale.refresh();
    jet_explode_sfx = game.add.audio('jet_explode', 1);
    shark_jump_sfx = game.add.audio('jump_out_of_ocean', 1);
    splash_sfx = game.add.audio('splash_down', 1);
    music = game.add.audio('bgmusic',1,true);
    music.play('',0,1,true);
    cursors = game.input.keyboard.createCursorKeys();
    cursors.w = game.input.keyboard.addKey(Phaser.Keyboard.W);
    cursors.a = game.input.keyboard.addKey(Phaser.Keyboard.A);
    cursors.d = game.input.keyboard.addKey(Phaser.Keyboard.D);

    waves = game.add.tileSprite(0,300,800,300, 'waves');
    player = game.add.sprite(game.world.centerX, game.world.centerY * 3/2, 'shark');
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(0.3, 0.3);
    player.aboveWater = false;

    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.maxVelocity.setTo(300, 1000);
    player.body.drag.set(1);
    enemyProjectiles = game.add.group();

    game.time.events.repeat(Phaser.Timer.SECOND * 2, 4, createJet, this);
    style = { font: "65px Arial", fill: "#eeddbb", align: "center" };
    comboText = game.add.text(game.world.centerX-80, 128, 'Combo ' + currentComboScore, style);
    comboText.alpha = 0;
    comboText.anchor.setTo(0.5,0.5);
}

function createJet()
{
    jets[jetCounter.toString()] = new Jet(jetCounter, game, player, enemyProjectiles);
    jetCounter++;
}

function update() {

    for (i in jets)
    {
        if (jets[i].alive)
        {
            jets[i].update();
            game.physics.arcade.overlap(player, jets[i].jet, sharkHitJet, null, this);
        }
        else
        {
            delete jets[i];
        }
    }
    player.body.angularVelocity = 0;
    if (player.body.y > 300) {
        if (player.aboveWater)
        {
            splash_sfx.play('');
        }
        player.aboveWater = false;
        scoreCombo(currentComboScore);
        currentComboScore = 0;
        if (cursors.up.isDown || cursors.w.isDown)
        {
            player.body.velocity.x += game.physics.arcade.velocityFromAngle(player.angle, SHARK_SPEED).x;
            player.body.velocity.y += game.physics.arcade.velocityFromAngle(player.angle, SHARK_SPEED).y;
        }
        else if (player.body.velocity.x > 0)
        {
            player.body.velocity.x -= 10;
        }

        player.body.velocity.y += player.angle/10;

        if ((cursors.left.isDown || cursors.a.isDown) && player.angle > -45)
        {
            player.body.angularVelocity = -200;
        }
        else if ((cursors.right.isDown || cursors.d.isDown) && player.angle < 45)
        {
            player.body.angularVelocity = 200;
        }
        if (!cursors.right.isDown && !cursors.d.isDown && !cursors.left.isDown && !cursors.a.isDown) {
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
            shark_jump_sfx.play('');
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
    waves.tilePosition.x -= 5;
}

function scoreCombo(comboScore)
{
    if(comboScore > 1)
    {
        comboText.alpha = 1;
        comboText.angle = 0;
        comboText.setText("Combo: " + comboScore);
        var style = { font: "65px Arial", fill: "#eeddbb", align: "center" };
        comboText.setStyle(style);
        game.add.tween(comboText).to({alpha: 0}, 500*comboScore, Phaser.Easing.Linear.None, true);
        game.add.tween(comboText).to({angle: 360}, 2000, Phaser.Easing.Linear.None, true);
        score += (Math.pow(comboScore,2)-currentComboScore)
    }
}

function sharkHitJet(shark, jet) {
    var destroyed = jets[jet.name].damage();
    if (destroyed)
    {
        jet_explode_sfx.play('');
        score += 1;
        currentComboScore += 1;
        if(currentComboScore > maxCombo)
        {
            maxCombo = currentComboScore;
        }
    }
}

function render() {
    game.debug.text('Score: ' + score, 32, 32)
    game.debug.text('Max Combo: ' + maxCombo, 32, 64)
}
