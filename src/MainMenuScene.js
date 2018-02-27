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
    this.choice = 'play';
    this.arrow = this.add.sprite(80, 114, 'arrow');

    this.add.text(40, 40, 'Awesome game', {fontFamily: 'Helvetica', fontSize: 32, color: '#dddddd'});
    this.add.text(100, 100, 'Play', {fontFamily: 'Arial', fontSize: 22, color: '#ffffff'});
    this.add.text(100, 130, 'About', {fontFamily: 'Arial', fontSize: 22, color: '#ffffff'});

    this.cursors = this.input.keyboard.createCursorKeys();
    this.choiceTimer = 0;
  },

  update: function (time, delta) {
    if (this.choiceTimer === 0) {
      this.choiceTimer = time + 200;
    }
    if ((this.cursors.up.isDown || this.cursors.down.isDown) && time > this.choiceTimer) {
      this.choiceTimer = time + 200;
      if (this.choice === 'play') {
        this.arrow.setPosition(80, 144);
        this.choice = 'about'
      }
      else {
        this.arrow.setPosition(80, 114);
        this.choice = 'play'
      }
    }

    if (time > this.choiceTimer && (this.cursors.space.isDown || this.cursors.right.isDown)) {
      if (this.choice === 'play') {
        this.scene.start('Level1Scene');
      }
      else {
        this.scene.start('AboutScene');
      }
    }
  }

});
