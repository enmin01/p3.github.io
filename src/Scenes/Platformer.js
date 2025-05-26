class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }

    create() {

        this.runSound = this.sound.add("runs");
this.runSoundPlaying = false;
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is

        this.dash=true;
        this.doublejump=true;
          this.dashSpeed = 600;
          this.hittime=true;
        this.m=true;
        this.sinactive=false;
        
          
           
        this.hp=1;
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 100, 25);
        this.myScore=0;

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true,
            water:true,
            hitbox:true,
            wall:true,
            final:true,
            death:true
        });


        // TODO: Add createFromObjects here
           // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

         this.dia = this.map.createFromObjects("Objects", {
            name: "dia",
            key: "tilemap_sheet",
            frame: 67
        });
         this.en1 = this.map.createFromObjects("Objects", {
            name: "entrance1",
            key: "tilemap_sheet",
            frame: 132
        });
          this.en2 = this.map.createFromObjects("Objects", {
            name: "entrance2",
            key: "tilemap_sheet",
            frame: 134
        });
        this.door=this.map.createFromObjects("Objects", {
            name: "door",
            key: "tilemap_sheet",
            frame: 150
        });
        this.switch=this.map.createFromObjects("Objects", {
            name: "switch",
            key: "tilemap_sheet",
            frame: 64
        });
        
        this.spawnPoint=this.map.createFromObjects("Objects",{
            name:"spawn",
            key:"tilemap_sheet",
            frame:111
        })[0];
         this.waterTiles = this.groundLayer.filterTiles(tile => {
            return tile.properties.water == true;
        });

        this.moveTiles= this.groundLayer.filterTiles(tile => {
            return tile.properties.moveplate == true;
        });
       


       
        // TODO: Add turn into Arcade Physics here
         // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
         this.physics.world.enable(this.dia, Phaser.Physics.Arcade.STATIC_BODY);
           this.physics.world.enable(this.en1, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.en2, Phaser.Physics.Arcade.STATIC_BODY);
         this.physics.world.enable(this.door, Phaser.Physics.Arcade.STATIC_BODY);
          this.physics.world.enable(this.switch, Phaser.Physics.Arcade.STATIC_BODY);




        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.doorgroup = this.add.group(this.door); 
        this.coinGroup = this.add.group(this.coins);
       for(let coin of this.coinGroup.getChildren() ){
            coin.anims.play('coins',true);

        }
         //water bubble effect

         my.vfx.bubble = this.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_01.png', 'ircle_02.png'],
            random: true,
            scale: {start: 0.03, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 500,
            gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
             quantity: 3,
               frequency: 500,
                speed: { min: 100, max: 200 },  // 粒子速度
                angle: { min: 0, max: 360 }, 
            
        });
         my.vfx.bubble .stop();
        my.vfx.coinsaffect = this.add.particles(400, 250, "kenny-particles", {
            
            frame: ['star_05.png'],
             tint: [0xfacc22, 0xf83600, 0x9f0404],
              lifespan: 400,
            speed: { min: 150, max: 250 },
            scale: { start: 0.8, end: 0 },
            gravityY: 150,
            blendMode: 'ADD',
            emitting: false,
            scale:0.03
        });


        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        //怪物
        my.sprite.monster=this.physics.add.sprite(504,345, "platformer_characters","ile_0020.png");
         my.sprite.monster.setCollideWorldBounds(true); 
            my.sprite.monster.setBounceX(0); 
            my.sprite.monster.setBounceY(0);
             my.sprite.monster.setImmovable(true);
         this.physics.add.collider(my.sprite.monster,this.groundLayer);
           this.physics.add.collider(my.sprite.player, my.sprite.monster, (player, monster) =>{
                if(monster.body.touching.up || (player.body.velocity.y > 0 && player.y < monster.y)){
                    monster.destroy();
                    player.setVelocityY(-500);
                      this.sound.play("coinc");
                }
                else{
                     this.sound.play("death");
                    player.setPosition(this.spawnPoint.x, this.spawnPoint.y); 

                }

           });

        // Enable collision handling



        this.physics.add.collider(my.sprite.player, this.groundLayer, (player, tile) => {
            this.doublejump=true;
            this.dash=true;
    if (tile.properties.water||tile.properties.death) {
         my.vfx.bubble.x=player.x;
          my.vfx.bubble.y=player.y;
        my.vfx.bubble.start();
        this.time.delayedCall(1000, () => {
   my.vfx.bubble.stop();
}, [], this);
        if(player.x<900){
        player.setPosition(this.spawnPoint.x, this.spawnPoint.y); 
        }
        else{
             player.setPosition(936,378); 
        }
        this.sound.play("death");
    }

    if (tile.properties.hitbox&&this.hittime==true) {
    if(player.body.blocked.up){
     const worldX = tile.pixelX;  // 或 tile.getLeft()
    const worldY = tile.pixelY;  // 或 tile.getTop()
    this.mushroom=this.physics.add.sprite(worldX+8, worldY - 36, "tilemap_sheet", 128);
     this.mushroom.setCollideWorldBounds(true);
     this.hittime=false;
     this.physics.world.enable(this.mushroom); 
      this.physics.add.collider( this.mushroom,this.groundLayer);
      this.physics.add.collider(my.sprite.player,this.mushroom, (player, mushroom) => {

    player.setScale(0.5);
    mushroom.destroy();
});
    }
}
    if(tile.properties.final){
          this.scene.start("platformerScene");
    }

});




 this.physics.add.collider(my.sprite.player,this.doorgroup);
  this.physics.add.overlap(my.sprite.player, this.switch, (obj1, obj2) => {
     this.sound.play("dopen");
     if (this.sinactive == false) {
        obj2.setFrame(66);
        this.sinactive = true;    
        this.doorgroup.getChildren().forEach(door => {
        door.destroy();
});
    }
    
        });




        // TODO: Add coin collision handler
        
        
          this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.sound.play("coinc");
            obj2.destroy(); // remove coin on overlap
            my.vfx.coinsaffect.x=obj2.x;
             my.vfx.coinsaffect.y=obj2.y;
             my.vfx.coinsaffect.explode(16);
            this.myScore+=10;
        });
         this.physics.add.overlap(my.sprite.player, this.dia, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
           my.sprite.player.setScale(1.0);
        });
       this.physics.add.overlap(my.sprite.player, this.en1, (obj1, obj2) => {
            obj1.setPosition(432,396);
            
        });
         this.physics.add.overlap(my.sprite.player, this.en2, (obj1, obj2) => {
            obj1.setPosition(936,378);
            
        });


        
        

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.keyf=this.input.keyboard.addKey('f');

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

       




        // TODO: Add movement vfx here
           my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();


         this.score=this.add.text(500,0,"score"+this.myScore,{
            color: '#ffffff'

         }).setScale(3);
        

        // TODO: add camera code here
         this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
         this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
         this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }

    update() {

        //怪物行动
        if(my.sprite.monster.x<=432){
           this.m=true;
        }
        if(my.sprite.monster.x>=558){
           this.m=false;
        }
        if(this.m==true){
           my.sprite.monster.x+=1;
        }
        if(this.m==false){
          my.sprite.monster.x-=1;

        }
        this.score.x=this.cameras.main.width / 2; ;
        this.score.y= this.cameras.main.height / 2;

    
        this.score.setText("Score"+this.myScore);
        if(cursors.left.isDown) {

            if(!my.sprite.player.body.blocked.down&&Phaser.Input.Keyboard.JustDown(this.keyf)&&this.dash==true){
                  my.sprite.player.body.setVelocityX(-this.dashSpeed);
                 this.dash=false;
            }
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
               my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {
                if(!this.runSound.isPlaying){
                     this.runSound.play();
                }
                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
              if(!my.sprite.player.body.blocked.down&&Phaser.Input.Keyboard.JustDown(this.keyf)&&this.dash==true){
                  my.sprite.player.body.setVelocityX(this.dashSpeed);
                 this.dash=false;
            }
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
              my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();
                  if(!this.runSound.isPlaying){
                     this.runSound.play();
                }

            }


        } else {
            // Set acceleration to 0 and have DRAG take over
           
            my.sprite.player.anims.play('idle');
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
              if (this.runSound.isPlaying) {
        this.runSound.stop();
    }
               my.vfx.walking.stop();
        }


        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.sound.play("jumps");
        }
          if(!my.sprite.player.body.blocked.down&&Phaser.Input.Keyboard.JustDown(cursors.up)&&this.doublejump==true) {
            my.sprite.player.anims.play('jump');
              this.sound.play("jumps");
              my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.doublejump=false;
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}