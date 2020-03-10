// @flow
import Phaser from 'phaser';
import gameStart from './scene/gameStart';

export function aFunction() {
  console.log('function test');
}




const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 1000
      },
      debug: true
    },
  },
  scene: [
    gameStart
  ]
}
const game = new Phaser.Game(config);