// vAm: expandtab:sw=4:ts=4:sts=4

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var SPRITE_DIR = 'assets/sprites/';

function preload() {
    game.load.image('shark', SPRITE_DIR + 'shark.png');
    game.load.image('jet',   SPRITE_DIR + 'jet.svg');
}

var player;

function create() {
    game.stage.backgroundColor = '#202040';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, 800, 600);
    cursors = game.input.keyboard.createCursorKeys();

    player = game.add.sprite(game.world.centerX / 2, game.world.centerY * 3/2, 'shark');
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(0.5,0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    createJet();
}

function createJet() {
    var jet = game.add.sprite(0, 0, 'jet');
    var cropRect = {x: 0, y: 0, width: jet.width, height: 35};
    jet.crop(cropRect);
    var jetTween = game.add.tween(jet);
    jetTween.to({ x: game.width + (1600 + jet.x) }, 10000, Phaser.Easing.Linear.None, true);
}

function update() {
    //  Reset the player, then check for movement keys
    player.body.velocity.setTo(0, 0);
    player.body.angularVelocity = 0;

    if (cursors.up.isDown)
    {
        player.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(player.angle, 300));
    }
    if (cursors.left.isDown)
    {
        player.body.angularVelocity = -300;
    }
    else if (cursors.right.isDown)
    {
        player.body.angularVelocity = 300;
    }
}
