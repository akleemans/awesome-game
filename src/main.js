var config = {
  type: Phaser.CANVAS,
  width: 352,
  height: 212,
  pixelArt: true,
  backgroundColor: '#404040', // or: 4488AA
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 1000}
    }
  },
  scene: [
    MainMenuScene,
    AboutScene,
    Level1Scene
  ]
};
var game = new Phaser.Game(config);
