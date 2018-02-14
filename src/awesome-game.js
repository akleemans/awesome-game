// 16 x 12 Tiles visible => scaling will do the rest
var game = new Phaser.Game(352, 192, Phaser.CANVAS, 'phaser-example', {
  preload: preload,
  create: create,
  update: update,
  render: render
});

var DEBUG = false;

function preload() {
  game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');

  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
  game.load.image('background', 'assets/background2.png');
  game.load.spritesheet('save-crystal', 'assets/img/save-crystal.png', 32, 32);

  game.load.tilemap('base-level', 'assets/tilemaps/maps/level0.json', null, Phaser.Tilemap.TILED_JSON);

  //  Next we load the tileset. This is just an image, loaded in via the normal way we load images:
  game.load.image('tiles', 'assets/tilemaps/tiles/platformer_tiles.png');
}

var player;
var facing = 'right';
var jumpTimer = 0;
var cursors;
var jumpButton;
var backgroundLayer;
var baseLayer;
var collisionLayer;
var baseSpeed = 200;

var map;
var layer;

// map meta objects
var finishRectangle;
var startRectangle;
var torchRectangle;
var pitRectangle;

var statusText;
var statusTimer = 0;

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.gravity.y = 300;
  // bg = game.add.tileSprite(0, 0, 800, 600, 'background');
  // game.stage.backgroundColor = "#111111";

  map = game.add.tilemap('base-level');

  // platformer_tiles: tileset name, tiles: key in Phaser.Cache
  map.addTilesetImage('platformer_tiles', 'tiles');

  // new layer from map_tiles-layer in map data, like Phaser.Sprite, in display list
  backgroundLayer = map.createLayer('bg');
  baseLayer = map.createLayer('map_tiles');

  // load collision layer, also a tilemap layer
  collisionLayer = map.createLayer('collision');
  collisionLayer.visible = false;
  map.setCollisionByExclusion([], true, collisionLayer);

  //  This resizes the game world to match the layer dimensions
  collisionLayer.resizeWorld();

  prepareMetaObjects();

  saveCrystal = game.add.sprite(100, 100, 'save-crystal');

  // player
  player = game.add.sprite(32, 100, 'dude');
  game.physics.enable(player, Phaser.Physics.ARCADE);

  player.body.collideWorldBounds = true;
  player.body.gravity.y = 1000;
  player.body.maxVelocity.y = 500;
  player.body.setSize(20, 32, 5, 16);

  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('turn', [4], 20, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  // follow player through the level
  game.camera.follow(player);

  // scale the game
  game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
  game.scale.setUserScale(2, 2);

  // enable crisp rendering
  game.renderer.renderSession.roundPixels = true;
  Phaser.Canvas.setImageRenderingCrisp(game.canvas);

  // add input
  cursors = game.input.keyboard.createCursorKeys();
  jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function update() {

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

  this.game.physics.arcade.collide(player, collisionLayer);

  if (game.time.now > statusTimer && Phaser.Rectangle.containsPoint(finishRectangle, player.position)) {
    console.log("reached finish");

    statusText = game.add.bitmapText(20, 50, 'carrier_command', 'Finish!', 24);
    statusTimer = game.time.now + 3000;

    resetPlayer();
  }

  if (Phaser.Rectangle.containsPoint(pitRectangle, player.position)) {
    console.log("reached pit - showing text");

    statusText = game.add.bitmapText(20, 50, 'carrier_command', 'You\'re dead!', 24);
    statusTimer = game.time.now + 3000;

    resetPlayer();
  }

  if (game.time.now > statusTimer && Phaser.Rectangle.containsPoint(torchRectangle, player.position)) {
    console.log("reached torch");

    statusText = game.add.bitmapText(20, 50, 'carrier_command', 'Got torch!', 24);
    statusTimer = game.time.now + 3000;
  }

  if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
    player.body.velocity.y = -350;
    jumpTimer = game.time.now + 300;
  }

  // cleanup status text
  if (statusText && game.time.now > statusTimer) {
    statusText.destroy();
  }
}

function render() {
  if (DEBUG) {
    // debug info
    //game.debug.bodyInfo(player, 16, 24);

    game.debug.body(player);
    game.debug.geom(finishRectangle, 'rgba(255,0,0,0.2)');
    game.debug.geom(pitRectangle, 'rgba(255,0,0,0.2)');
    game.debug.geom(torchRectangle, 'rgba(255,0,0,0.2)');
  }

  // game.debug.text( "This is debug text", 100, 380 );

}

function prepareMetaObjects() {
  // prepare start rectangle
  var start = map.objects.meta.find(function (o) {
    return o.name === 'start'
  });
  startRectangle = new Phaser.Rectangle(start.x, start.y, start.width, start.height);
  console.log("startRectangle:", startRectangle);

  // prepare finish rectangle
  var finish = map.objects.meta.find(function (o) {
    return o.name === 'finish'
  });
  finishRectangle = new Phaser.Rectangle(finish.x, finish.y, finish.width, finish.height);
  console.log("finishRectangle:", finishRectangle);

  // prepare finish rectangle
  var pit = map.objects.meta.find(function (o) {
    return o.name === 'pit'
  });
  pitRectangle = new Phaser.Rectangle(pit.x, pit.y, pit.width, pit.height);
  console.log("pitRectangle:", pitRectangle);

  // prepare torch rectangle
  var torch = map.objects.meta.find(function (o) {
    return o.name === 'torch'
  });
  torchRectangle = new Phaser.Rectangle(torch.x, torch.y, torch.width, torch.height);
  console.log("torchRectangle:", torchRectangle);
}

function resetPlayer() {
  player.position.set(startRectangle.x, startRectangle.y);
  player.angle = 0;
}