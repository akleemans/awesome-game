// 20 x 10 Tiles visible => 320 x 160, scaling will do the rest
var game = new Phaser.Game(320, 160, Phaser.CANVAS, 'phaser-example', {
  preload: preload,
  create: create,
  update: update,
  render: render
});

function preload() {

  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
  game.load.image('background', 'assets/background2.png');


  game.load.tilemap('base-level', 'assets/tilemaps/maps/test16.json', null, Phaser.Tilemap.TILED_JSON);

  //  Next we load the tileset. This is just an image, loaded in via the normal way we load images:
  game.load.image('tiles', 'assets/tilemaps/tiles/platformer_tiles.png');

}

var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var bg;
var baseSpeed = 250;

var map;
var layer;

function create() {

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.gravity.y = 300;
  // bg = game.add.tileSprite(0, 0, 800, 600, 'background');

  map = game.add.tilemap('base-level');

  // platformer_tiles: tileset name, tiles: key in Phaser.Cache
  map.addTilesetImage('platformer_tiles', 'tiles');

  // new layer from map_tiles-layer in map data, like Phaser.Sprite, in display list
  layer = map.createLayer('map_tiles');

  // define collision for tile # 43 = ground
  map.setCollisionBetween(40, 43);

  //  This resizes the game world to match the layer dimensions
  layer.resizeWorld();

  // player
  player = game.add.sprite(32, 20, 'dude');
  game.physics.enable(player, Phaser.Physics.ARCADE);

  player.body.collideWorldBounds = true;
  player.body.gravity.y = 1000;
  player.body.maxVelocity.y = 800;
  player.body.setSize(20, 32, 5, 16);

  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('turn', [4], 20, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  // follow player through the level
  game.camera.follow(player);

  // scale the game
  game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
  game.scale.setUserScale(3, 3);

  // enable crisp rendering
  game.renderer.renderSession.roundPixels = true;
  Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

  // add input
  cursors = game.input.keyboard.createCursorKeys();
  jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

function update() {
  this.game.physics.arcade.collide(player, layer);

  player.body.velocity.x = 0;

  if (cursors.left.isDown) {
    player.body.velocity.x = -baseSpeed;

    if (facing !== 'left') {
      player.animations.play('left');
      facing = 'left';
    }
  }
  else if (cursors.right.isDown) {
    player.body.velocity.x = baseSpeed;

    if (facing !== 'right') {
      player.animations.play('right');
      facing = 'right';
    }
  }
  else {
    if (facing !== 'idle') {
      player.animations.stop();

      if (facing === 'left') {
        player.frame = 0;
      }
      else {
        player.frame = 5;
      }

      facing = 'idle';
    }
  }

  if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
    player.body.velocity.y = -500;
    jumpTimer = game.time.now + 750;
  }

}

function render() {

  // debug info
  // game.debug.bodyInfo(player, 16, 24);
  // game.debug.body(player);

}