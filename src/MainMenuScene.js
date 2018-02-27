var MainMenuScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize:
    function MainMenuScene() {
      Phaser.Scene.call(this, {key: 'MainMenuScene'});
    },

  preload: function () {
    this.load.image('arrow', 'assets/img/arrow.png');

  },

  create: function () {
    this.add.sprite(100, 100, 'arrow');
    this.input.once('pointerdown', function (event) {
      console.log('From MainMenuScene to Level1Scene');
      this.scene.start('Level1Scene');
    }, this);
  }
});
