var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('shark', 'assets/sprites/shark.png');
}

var player;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, 800, 600);
    cursors = game.input.keyboard.createCursorKeys();

    player = game.add.sprite(game.world.centerX / 2, game.world.centerY * 3/2, 'shark');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    
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
