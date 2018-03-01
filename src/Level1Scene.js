var Level1Scene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize:
    function MainMenuScene() {
      Phaser.Scene.call(this, {key: 'Level1Scene'});
    },

  preload: function () {
    this.load.spritesheet('player', 'assets/img/player.png', {frameWidth: 46, frameHeight: 46});
    this.load.spritesheet('crystal', 'assets/img/save-crystal-animated.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('invader', 'assets/invader.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('spider', 'assets/img/spider.png', {frameWidth: 24, frameHeight: 54});
    this.load.image('heart-full', 'assets/img/heart-full.png', {frameWidth: 6, frameHeight: 7});
    this.load.image('heart-half', 'assets/img/heart-half.png', {frameWidth: 6, frameHeight: 7});
    this.load.image('cog-yellow', 'assets/img/cog-yellow.png', {frameWidth: 15, frameHeight: 15});
    this.load.image('arrow', 'assets/img/arrow.png', {frameWidth: 21, frameHeight: 5});

    // base-level
    this.load.tilemapTiledJSON('map', 'assets/tilemaps/maps/level0.json');
    this.load.image('tiles', 'assets/tilemaps/tiles/platformer_tiles.png');
  },

  create: function () {
    this.prepareAnimations();

    // load map with tiles
    this.map = this.make.tilemap({key: 'map'});
    this.tileset = this.map.addTilesetImage('platformer_tiles', 'tiles');

    // TODO removing background layer for now
    // this.backgroundLayer = this.map.createStaticLayer('bg', this.tileset, 0, 0);
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

    // spider
    this.spider = this.physics.add.sprite(200, 60, 'spider');
    this.spider.body.allowGravity = false;
    this.spider.anims.play('spider-move', true);

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

    this.hud.cog = this.add.sprite(352 - 18, 16, 'cog-yellow').setScrollFactor(0).setInteractive();
    this.hud.cog.on('pointerdown', function (pointer) {
      console.log("Pressed menu cog!");
      this.setTint(0x00ff00);
    });
    this.hud.cog.on('pointerup', function (pointer) {
      this.clearTint();
    });

    this.updateHealth(this);

    // update collisions & overlaps
    this.physics.add.collider(this.player, this.collisionLayer);
    this.physics.add.overlap(this.player, this.invader, this.enemyCollision, null, this);
    this.physics.add.overlap(this.player, this.spider, this.enemyCollision, null, this);

    // follow player through the level
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player);

    // TODO scale the game - not yet available in Phaser 3
    //this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    //this.scale.setUserScale(2, 2);

    // add input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.arrowTimer = 0;
  },

  update: function (time, delta) {
    // player vertical movement
    this.player.body.setVelocityX(0);
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-200);

    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(200);
    }

    // jumping
    if (this.cursors.up.isDown && this.player.body.onFloor()) {
      this.player.body.setVelocityY(-300);
    }

    // shooting
    if (this.cursors.space.isDown && this.arrowTimer < time) {
      console.log("arrow!");
      this.arrowTimer = time + 500;
      // TODO pixel calculations for right facing, add left
      this.arrow = this.physics.add.sprite(this.player.body.x + 30, this.player.body.y + 12, 'arrow');

      if (this.player.facing === 'left') {
        this.arrow.setVelocity(-500, 0);
        this.arrow.flipX = true;
      } else {
        this.arrow.setVelocity(500, 0);
      }

      this.arrow.body.allowGravity = false;

      this.physics.add.collider(this.arrow, this.invader, this.hitEnemy);
      this.physics.add.collider(this.arrow, this.spider, this.hitEnemy);
      //this.physics.world.collide(this.arrow, this.invader, hitEnemy);
    }

    // update player animation
    if (this.cursors.left.isDown) {
      this.player.anims.play('left', true);
      this.player.facing = 'left';
      this.player.moving = true;
    } else if (this.cursors.right.isDown) {
      this.player.anims.play('right', true);
      this.player.facing = 'right';
      this.player.moving = true;
    } else {
      if (this.player.moving = true) {
        if (this.player.facing === 'left') {
          this.player.anims.play('player-idle-left');
        }
        else {
          this.player.anims.play('player-idle-right');
        }
      }
      this.player.moving = false;
    }
  },

  enemyCollision: function () {
    if (!this.player.invulnerable) {
      this.cameras.main.flash(500);
      //this.cameras.main.shake(500);

      this.player.health -= 1;
      this.updateHealth(this);
      this.player.invulnerable = true;

      this.time.delayedCall(500, function () {
        this.player.invulnerable = false;
      }, [], this);

    }
  },

  hitEnemy: function (bullet, enemy) {
    // removing both sprites for now - maybe trigger explosion
    bullet.destroy();
    enemy.destroy();
  },

  updateHealth: function (that) {
    while (sprite = that.hud.healthbar.pop()) {
      sprite.destroy();
    }

    if (this.player.health <= 0) {
      this.scene.start('MainMenuScene');
    }

    for (var i = 0; i < that.player.health; i += 2) {
      var sprite = that.player.health - i >= 2 ? 'heart-full' : 'heart-half';
      var heart = that.add.sprite(16 + 5 * i, 15, sprite).setScrollFactor(0);
      that.hud.healthbar.push(heart);
    }
  },

  prepareAnimations: function () {
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', {start: 0, end: 0}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', {start: 0, end: 8}),
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
      frames: this.anims.generateFrameNumbers('player', {start: 0, end: 0}),
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

    this.anims.create({
      key: 'spider-move',
      frames: this.anims.generateFrameNumbers('spider', {start: 0, end: 5}),
      frameRate: 5,
      repeat: -1
    });
  }
});
