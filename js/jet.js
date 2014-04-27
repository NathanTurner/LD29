Jet = function (index, game, shark, projectiles) {
    this.game = game;
    this.health = 1;
    this.shark = shark;
    this.projectiles = projectiles;
    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;
    this.jet = game.add.sprite(game.width, 50+game.rnd.integerInRange(0, 200), 'jet');
    this.jet.name = index.toString();
    game.physics.enable(this.jet, Phaser.Physics.ARCADE);
    game.add.tween(this.jet).to({ x: this.jet.x - 1600 }, 10000, Phaser.Easing.Linear.None, true);
    game.add.tween(this.jet).to({ y: this.jet.y + 20 }, 1000, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);
    this.jet.scale.setTo(0.3, 0.3);
    this.jet.events.onKilled.add(createJet, this);
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
    if (this.jet.x + this.jet.width < 0)
    {
        this.alive = false;
        this.jet.kill();
    }
}