// Global Variables
var SPRITE_DIR = 'assets/sprites/';
var AUDIO_DIR = 'assets/audio/';
var speakerData = {
    "frames": [
        {
            "filename": "speakerOn",
            "frame": { "x": 0, "y": 0, "w": 20, "h": 20 },
            "rotated": false,
            "trimmed": false,
            "spriteSourceSize":  { "x": 0, "y": 0, "w": 20, "h": 20 },
            "sourceSize": { "w": 20, "h": 20 }
        },
        {
            "filename": "speakerOff",
            "frame": { "x": 20, "y": 0, "w": 20, "h": 20 },
            "rotated": false,
            "trimmed": false,
            "spriteSourceSize":  { "x": 0, "y": 0, "w": 32, "h": 32 },
            "sourceSize": { "w": 20, "h": 20 }
        }
    ]
};


'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('yeoman', 'assets/yeoman-logo.png');
    this.load.image('shark',    SPRITE_DIR + 'shark.png');
    this.load.image('jet',      SPRITE_DIR + 'jet.png');
    this.load.image('bomb',     SPRITE_DIR + 'bomb.png');
    this.load.image('waves',    SPRITE_DIR + 'waves.png');
    this.load.image('waves_bg', SPRITE_DIR + 'waves_bg.png');
    this.load.image('depths',   SPRITE_DIR + 'depths.png');
    this.load.image('waves_fg', SPRITE_DIR + 'waves_fg.png');
    this.load.image('cloud1',   SPRITE_DIR + 'cloud1.png');
    this.load.image('cloud2',   SPRITE_DIR + 'cloud2.png');
    this.load.image('cloud3',   SPRITE_DIR + 'cloud3.png');
    this.load.image('cloud4',   SPRITE_DIR + 'cloud4.png');
    this.load.image('splash_complete',    SPRITE_DIR + 'splash_complete.png');
    this.load.atlas('speaker',            SPRITE_DIR + 'speaker.png', null, speakerData);
    this.load.spritesheet('explosionFms', SPRITE_DIR + 'explosion_frames.png', 180, 149, 3);
    this.load.spritesheet('splash',       SPRITE_DIR + 'splash_animation.png', 312, 282, 4);

    //sound effects
    this.load.audio('jet_explode',      AUDIO_DIR + 'jet_explode.wav');
    this.load.audio('jump_out_of_ocean',AUDIO_DIR + 'jump_out_of_ocean.wav');
    this.load.audio('splash_down',      AUDIO_DIR + 'splash_down.wav');

    //background music
    this.load.audio('bgmusic',          AUDIO_DIR + 'bgmusic.wav');

    //font
    WebFontConfig = {
        google: { families: [ 'Permanent+Marker::latin' ] }
    };

    (function() {
        var wf = document.createElement('script');
        wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
    })();

  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;
