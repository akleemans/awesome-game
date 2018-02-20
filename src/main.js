var config = {
  type: Phaser.AUTO,
  width: 352,
  height: 212,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 1000}
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};
var game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet('player', 'assets/dude.png', {frameWidth: 32, frameHeight: 48});
  this.load.spritesheet('crystal', 'assets/img/save-crystal-animated.png', {frameWidth: 32, frameHeight: 32});
  this.load.spritesheet('invader', 'assets/invader.png', {frameWidth: 32, frameHeight: 32});
  this.load.image('heart-full', 'assets/img/heart-full.png', {frameWidth: 6, frameHeight: 7});
  this.load.image('heart-half', 'assets/img/heart-half.png', {frameWidth: 6, frameHeight: 7});
  this.load.image('cog-yellow', 'assets/img/cog-yellow.png', {frameWidth: 15, frameHeight: 15});

  // base-level
  this.load.tilemapTiledJSON('map', 'assets/tilemaps/maps/level0.json');
  this.load.image('tiles', 'assets/tilemaps/tiles/platformer_tiles.png');
}

function create() {
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', {start: 0, end: 3}),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', {start: 5, end: 8}),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'player-idle-left',
    frames: this.anims.generateFrameNumbers('player', {start: 0, end: 0}),
    frameRate: 1,
    repeat: 0
  });
  this.anims.create({
    key: 'player-idle-right',
    frames: this.anims.generateFrameNumbers('player', {start: 5, end: 5}),
    frameRate: 1,
    repeat: 0
  });
  this.anims.create({
    key: 'crystal-turn',
    frames: this.anims.generateFrameNumbers('crystal', {start: 0, end: 2}),
    frameRate: 5,
    repeat: -1
  });
  this.anims.create({
    key: 'invader-move',
    frames: this.anims.generateFrameNumbers('invader', {start: 0, end: 3}),
    frameRate: 5,
    repeat: -1
  });

  // load map with tiles
  this.map = this.make.tilemap({key: 'map'});
  this.tileset = this.map.addTilesetImage('platformer_tiles', 'tiles');

  this.backgroundLayer = this.map.createStaticLayer('bg', this.tileset, 0, 0);
  this.baseLayer = this.map.createStaticLayer('map_tiles', this.tileset, 0, 0);

  // load collision layer, also a tilemap layer
  this.collisionLayer = this.map.createStaticLayer('collision', this.tileset, 0, 0);
  this.collisionLayer.visible = false;

  //this.map.setCollisionByExclusion([], true, this.collisionLayer);
  this.collisionLayer.setCollisionBetween(1, 999);

  // crystal
  this.crystal = this.add.sprite(100, 100, 'crystal');
  this.crystal.anims.play('crystal-turn', true);

  // invader
  this.invader = this.physics.add.sprite(400, 100, 'invader').setVelocity(100, 0).setBounce(1, 0);
  this.invader.body.maxVelocity.y = 200;
  this.invader.anims.play('invader-move', true);
  this.physics.add.collider(this.invader, this.collisionLayer);

  // create player sprite
  this.player = this.physics.add.sprite(32, 100, 'player'); // .setVelocity(0, 0).setBounce(0);
  // player = this.player;
  this.player.invulnerable = false;
  this.player.health = 10;
  //this.player.body.collideWorldBounds = true;
  this.player.body.maxVelocity.y = 500;

  // set player body - was before this.player.body.setSize(20, 32, 5, 16);
  this.player.body.width = 20;
  this.player.body.height = 32;
  this.player.body.offset.x = (this.player.width - this.player.body.width) / 2;
  this.player.body.offset.y = (this.player.height - this.player.body.height);

  // hud: bars, settings cog, hearts
  this.hud = {
    blackbars: null,
    healthbar: [],
    cog: null
  };
  this.hud.blackbars = this.add.graphics();
  this.hud.blackbars.fillStyle(0x000000, 1);
  this.hud.blackbars.fillRect(0, 0, 352, 30);
  this.hud.blackbars.fillRect(0, 212 - 30, 352, 212);
  this.hud.blackbars.setScrollFactor(0);

  this.hud.cog = this.add.sprite(352 - 18, 16, 'cog-yellow').setScrollFactor(0);

  updateHealth(this);

  this.physics.add.collider(this.player, this.collisionLayer);
  this.physics.add.overlap(this.player, this.invader, enemyCollision, null, this);

  // (object1, object2, overlapCallback, processCallback, callbackContext)
  // this.physics.add.overlap(player, coinLayer); // collectibles layer

  // follow player through the level
  //this.cameras.main.setViewport(0, 20, 352, 152);
  this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  this.cameras.main.startFollow(this.player);

  // scale the game - not yet available in Phaser 3
  //this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
  //this.scale.setUserScale(2, 2);

  // add input
  this.cursors = this.input.keyboard.createCursorKeys();
  this.jumpButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACEBAR);
  this.jumpTimer = 0;
}

function update(time, delta) {
  // player vertical movement
  this.player.body.setVelocityX(0);
  if (this.cursors.left.isDown) {
    this.player.body.setVelocityX(-200);

  } else if (this.cursors.right.isDown) {
    this.player.body.setVelocityX(200);
  }

  // jumping
  if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
    this.player.body.setVelocityY(-300);
  }

  // update player animation
  if (this.cursors.left.isDown) {
    this.player.anims.play('left', true);
    this.facing = 'left';
  } else if (this.cursors.right.isDown) {
    this.player.anims.play('right', true);
    this.facing = 'right';
  } else {
    if (this.facing !== 'idle') {
      if (this.facing === 'left') {
        this.player.anims.play('player-idle-left');
      }
      else {
        this.player.anims.play('player-idle-right');
      }
      this.facing = 'idle';
    }
  }
}

function enemyCollision() {
  if (!this.player.invulnerable) {
    this.cameras.main.flash(500);
    //this.cameras.main.shake(500);

    this.player.health -= 1;
    updateHealth(this);
    this.player.invulnerable = true;

    this.time.delayedCall(500, function () {
      this.player.invulnerable = false;
    }, [], this);

  }
}

function updateHealth(that) {
  while (sprite = that.hud.healthbar.pop()) {
    sprite.destroy();
  }

  for (var i = 0; i < that.player.health; i += 2) {
    var sprite = that.player.health - i >= 2 ? 'heart-full' : 'heart-half';
    var heart = that.add.sprite(16 + 5 * i, 15, sprite).setScrollFactor(0);
    that.hud.healthbar.push(heart);
  }
}
