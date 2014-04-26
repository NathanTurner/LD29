// vim: expandtab:sw=4:ts=4:sts=4

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

var SPRITE_DIR = 'assets/sprites/';
var SHARK_SPEED = 10;

function preload() {
    game.load.image('shark', SPRITE_DIR + 'shark.png');
    game.load.image('jet',   SPRITE_DIR + 'jet.png');
    game.load.image('water', SPRITE_DIR + 'bg.png');
}

var player;
var jets;
var score = 0;

function create() {
    game.stage.backgroundColor = '#202040';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, 928, 600);
    game.scale.pageAlignHorizontally = true;
    game.scale.refresh();
    cursors = game.input.keyboard.createCursorKeys();
    cursors.w = game.input.keyboard.addKey(Phaser.Keyboard.W);
    cursors.a = game.input.keyboard.addKey(Phaser.Keyboard.A);
    cursors.d = game.input.keyboard.addKey(Phaser.Keyboard.D);

    ocean = game.add.tileSprite(0,300,800,300, 'water');

    player = game.add.sprite(game.world.centerX, game.world.centerY * 3/2, 'shark');
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(0.3, 0.3);

    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.maxVelocity.setTo(300, 1000);

    jets = game.add.group();
    jets.enableBody = true;
    jets.physicsBodyType = Phaser.Physics.ARCADE;
    createJet();
}

function createJet() {
    var jet = game.add.sprite(game.width, 50+game.rnd.integerInRange(0, 200), 'jet');

    game.add.tween(jet).to({ x: jet.x - 1600 }, 10000, Phaser.Easing.Linear.None, true);
    game.add.tween(jet).to({ y: jet.y + 20 }, 1000, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);
    jet.scale.setTo(0.3, 0.3);
    jets.add(jet);
}


function update() {
    game.physics.arcade.overlap(player, jets, collisionHandler, null, this);
    player.body.angularVelocity = 0;
    if (player.body.y > 300) {
        
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
        if (player.body.y + player.height > game.height)
        {
            player.body.velocity.y = 0;
            player.body.y = game.height - player.height;
        }

        player.body.velocity.x -= SHARK_SPEED * ((player.body.x + player.width) / 600);
    }
    else
    {
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
    ocean.tilePosition.x -= 5;
}

function render() {
    game.debug.text('Score: ' + score, 32, 32)
}

function collisionHandler (shark, jet)
{
    jet.kill();
    createJet();
    score += 1;
}
