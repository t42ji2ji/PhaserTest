import Phaser from 'phaser';


var isWalk = false;
var direction = 1;
var inAir = false;
var stars;
var TapState = [false, true, false];

var lastTime = 0;
var score = 0;
var scoreText;

const gameStart = {
  key: 'gameStart',
  preload: function () {
    this.load.image("star", require('../../assets/background/star.png'));
    this.load.image("buttons", require('../../assets/background/star.png'));

    this.load.image('bg1', require('../../assets/background/plx-1.png'));
    this.load.image('bg2', require('../../assets/background/plx-2.png'));
    this.load.image('bg3', require('../../assets/background/plx-3.png'));
    this.load.image('bg4', require('../../assets/background/plx-4.png'));
    this.load.image('bg5', require('../../assets/background/plx-5.png'));
    this.load.image('footer', require('../../assets/background/footer.png'));
    this.load.atlas('boy_walk', require('../../assets/idl/walk.png'), require('../../assets/idl/walk.json'));
    this.load.atlas('boy_idle', require('../../assets/idl/idle.png'), require('../../assets/idl/idle.json'));
    this.load.image('jump', require('../../assets/idl/jump.png'));


  },
  create: function () {
    // 資源載入完成，加入遊戲物件及相關設定
    this.bg1 = this.add.tileSprite(400, 300, 800, 600, 'bg1');
    this.bg2 = this.add.tileSprite(400, 300, 800, 600, 'bg2');
    this.bg3 = this.add.tileSprite(400, 300, 800, 600, 'bg3');
    this.bg4 = this.add.tileSprite(400, 300, 800, 600, 'bg4');
    this.bg5 = this.add.tileSprite(400, 300, 800, 600, 'bg5');
    this.footer = this.add.tileSprite(400, 588, 800, 100, 'footer');
    scoreText = this.add.text(16, 16, 'score: 0', {
      fontSize: '32px',
      fill: '#FFF'
    });
    this.playerState = this.add.sprite(40, 80, 'buttons', 0).setInteractive();
    this.playerState.on('pointerdown', function () {
      var bb = false;
      TapState.forEach((val, index, array) => {
        if (!bb) {
          if (val) {
            console.log(TapState);
            array[index] = false;
            if (index == array.length - 1) {
              array[0] = true;
              bb = true;
            } else {
              array[index + 1] = true;
              bb = true;
            }
          }
        }

      })
    })


    this.anims.create({
      key: 'walk',
      repeat: -1,
      frameRate: 20,
      frames: this.anims.generateFrameNames('boy_walk', {
        prefix: 'walk_',
        suffix: '.png',
        start: 0,
        end: 7,
        zeroPad: 1
      })
    });
    this.anims.create({
      key: 'idle',
      repeat: -1,
      frameRate: 4,
      frames: this.anims.generateFrameNames('boy_idle', {
        prefix: 'idle_',
        suffix: '.png',
        start: 0,
        end: 10,
        zeroPad: 1
      })
    });

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(600, 400, 'footer').setScale(0.7).refreshBody();
    this.platforms.create(50, 250, 'footer').setScale(0.7).refreshBody();
    this.platforms.create(750, 220, 'footer').setScale(0.7).refreshBody();
    this.platforms.add(this.footer);


    // 物件的位置和旋轉是否受其速度，加速度，阻力和重力的影響
    this.footer.body.moves = false;
    this.footer.body.immovable = true;

    // 設定物件不會動靜止不會掉下去
    this.physics.add.existing(this.footer);



    // this.player = this.add.sprite(400, 480, 'boy', 'run-outline_0007_0.png');
    // 現在改成透過 physics 再加入到畫面上
    this.player = this.physics.add.sprite(300, 400, 'boy', 'idle.png');
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(-100);
    //設定角色彈跳值
    this.player.setBounce(0.2);
    //設定角色碰撞邊界
    this.player.setSize(23, 34, 0);
    //將需要碰撞的物件綁在一起
    this.physics.add.collider(this.player, this.footer, hitSprite);
    this.physics.add.collider(this.player, this.platforms, hitSprite);
    //設定角色顯示大小
    this.player.setScale(2);

    stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: {
        x: 12,
        y: 0,
        stepX: 70
      }
    });
    stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, this.platforms);
    this.physics.add.overlap(this.player, stars, collectStar, null, this);




  },
  update: function () {

    // 遊戲狀態更新d
    if (isWalk) {
      this.bg1.tilePositionX += 1 * direction;
      this.bg2.tilePositionX += 1.5 * direction;
      this.bg3.tilePositionX += 2 * direction;
      this.bg4.tilePositionX += 2.5 * direction;
      this.bg5.tilePositionX += 3 * direction;
      this.footer.tilePositionX += 4 * direction;
    }



    var pointer = this.input.activePointer;
    var vm = this;
    this.input.on('pointerup', function (pointer) {
      lastTime = vm.time.now;
    });
    if (TapState[2]) {
      KeyWalk(this);
    } else {
      if (pointer.isDown) {
        if (TapState[0]) {
          doubleTap(this);
        }
        if (TapState[1]) TapWalk(pointer, this);
      } else {
        this.player.setVelocityX(0);
        isWalk = true;
        this.player.anims.play('walk', true);
      }
    }

  }
}

function hitSprite(player, sprite2) {
  if (inAir) {
    inAir = false;
    player.anims.play('idle');
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);
}

function doubleTap(vm) {
  let delay = vm.time.now - lastTime;
  if (vm.player.body.touching.down) {
    vm.player.setVelocityY(-430);
    vm.player.setBounce(0.2);
    vm.player.setTexture('jump', 0);
  }


  // if (delay < 350) {
  //   console.log('double', delay);
  //   vm.player.setVelocityY(-630);
  //   vm.player.setTexture('jump', 0);
  //   lastTime = 0;
  // }
}

function TapWalk(pointer, vm) {
  if (pointer.x > 300) {
    vm.player.flipX = false;
    vm.player.setVelocityX(160);
    vm.player.anims.play('walk', true);
  } else if (pointer.x < 300) {
    vm.player.flipX = true;
    vm.player.setVelocityX(-160);
    vm.player.anims.play('walk', true);
  }
}

function KeyWalk(vm) {
  vm.cursors = vm.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  if (vm.cursors.up.isDown && vm.player.body.touching.down) {
    inAir = true;

    vm.player.setVelocityY(-630);
    vm.player.setTexture('jump', 0);
  }
  if (vm.cursors.left.isDown) {
    vm.player.setVelocityX(-160);
    vm.player.flipX = true;
    if (inAir) {
      vm.player.setTexture('jump', 0);
    } else {
      vm.player.anims.play('walk', true);
    }
    isWalk = true;
    direction = -1;

  } else if (vm.cursors.right.isDown) {

    vm.player.setVelocityX(160);
    vm.player.flipX = false;
    if (inAir) {
      vm.player.setTexture('jump', 0);
    } else {
      vm.player.anims.play('walk', true);
    }
    isWalk = true;
    direction = 1;
  } else if (vm.cursors.down.isDown) {
    vm.player.anims.play('idle', true);
  } else {
    isWalk = false;
    vm.player.setVelocityX(0);
    vm.player.anims.play('idle', true);
  }
}
export default gameStart;