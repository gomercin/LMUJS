/**
 * Created by GomerciN on 19.12.2015.
 */

var MenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MenuLayer();
        layer.init();
        this.addChild(layer);
    }
});


var MenuLayer = cc.Layer.extend({
    ctor : function(){
        //1. call super class's ctor function
        this._super();
    },
    init:function(){
        //call super class's super function
        this._super();

        //2. get the screen size of your game canvas
        var winsize = cc.director.getWinSize();

        //3. calculate the center point
        var centerpos = cc.p(winsize.width / 2, winsize.height / 2);

        //4. create a background image and set it's position at the center of the screen
        var spritebg = new cc.Sprite(res.imgBackground);


        spritebg.setPosition(centerpos);
        spritebg.setScale(winsize.width / spritebg.getContentSize().width);
        this.addChild(spritebg);

        //5.
        cc.MenuItemFont.setFontSize(60);
        cc.MenuItemFont.setFontName("AmericanTypewriter-Bold");

        var mItemNewGame = new cc.MenuItemFont("New Game",this.onPlay,this);
        var mItemResume = new cc.MenuItemFont("Resume",this.onPlay,this);
        var mItemSoundOn = new cc.MenuItemFont("Sound: On",this.onPlay,this);
        var mItemRate = new cc.MenuItemFont("Rate",this.onPlay,this);
        var mItemHowToPlay = new cc.MenuItemFont("How To Play",this.onPlay,this);

        var labelOffset = 100;
        mItemNewGame.setPosition(new cc.Point(winsize.width/2,winsize.height/2 + 2*labelOffset));
        mItemResume.setPosition(new cc.Point(winsize.width/2,winsize.height/2 + labelOffset));
        mItemSoundOn.setPosition(new cc.Point(winsize.width/2,winsize.height/2));
        mItemRate.setPosition(new cc.Point(winsize.width/2,winsize.height/2 - labelOffset));
        mItemHowToPlay.setPosition(new cc.Point(winsize.width/2,winsize.height/2 - 2*labelOffset));

        var menu = cc.Menu.create(mItemNewGame,mItemResume,mItemSoundOn,mItemRate, mItemHowToPlay);
        menu.setPosition(cc.p(0,0));
        this.addChild(menu);
    },

    onPlay : function(){
        cc.log("==onplay clicked");
    }
});