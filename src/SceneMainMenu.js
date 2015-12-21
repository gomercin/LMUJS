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
        this.winsize = cc.director.getWinSize();

        //3. calculate the center point
        this.centerpos = cc.p(this.winsize.width / 2, this.winsize.height / 2);

        //4. create a background image and set it's position at the center of the screen
        var spritebg = new cc.Sprite(res.imgBackground);


        spritebg.setPosition(this.centerpos);
        spritebg.setScale(this.winsize.width / spritebg.getContentSize().width);
        this.addChild(spritebg);

        this.createMenu();
        this.updateMenu();
    },

    createMenu : function() {
        cc.MenuItemFont.setFontSize(60);
        cc.MenuItemFont.setFontName("AmericanTypewriter-Bold");

        this.mItemNewGame = new cc.MenuItemFont("New Game",this.onNewGame,this);
        this.mItemResume = new cc.MenuItemFont("Resume",this.onResume,this);
        this.mItemSoundOn = new cc.MenuItemFont("Sound: On",this.onSound,this);
        this.mItemRate = new cc.MenuItemFont("Rate",this.onRate,this);
        this.mItemHowToPlay = new cc.MenuItemFont("How To Play",this.onHowToPlay,this);

        var labelOffset = 100;
        this.mItemNewGame.setPosition(new cc.Point(this.winsize.width/2,this.winsize.height/2 + 2*labelOffset));
        this.mItemResume.setPosition(new cc.Point(this.winsize.width/2,this.winsize.height/2 + labelOffset));
        this.mItemSoundOn.setPosition(new cc.Point(this.winsize.width/2,this.winsize.height/2));
        this.mItemRate.setPosition(new cc.Point(this.winsize.width/2,this.winsize.height/2 - labelOffset));
        this.mItemHowToPlay.setPosition(new cc.Point(this.winsize.width/2,this.winsize.height/2 - 2*labelOffset));

        var menu = cc.Menu.create(this.mItemNewGame,this.mItemResume,this.mItemSoundOn,this.mItemRate, this.mItemHowToPlay);
        menu.setPosition(cc.p(0,0));
        this.addChild(menu);
    },

    updateMenu : function() {
        if (PersistentStorage.GetValue("LASTGAME") == null)
        {
            this.mItemResume.setOpacity(120);
        }
        else
        {
            this.mItemResume.setOpacity(255);
        }

        if (PersistentStorage.GetValue("SOUND") == "OFF")
        {
            this.mItemSoundOn.setString("Sound: Off");
        }
        else
        {
            this.mItemSoundOn.setString("Sound: On");
        }
    },

    onNewGame : function() {
        cc.log("==onNewGame clicked");
    },

    onResume : function() {
        cc.log("==onResume clicked");
    },

    onSound : function() {
        if (PersistentStorage.GetValue("SOUND") == "OFF")
        {
            PersistentStorage.SetValue("SOUND", "ON");
        }
        else
        {
            PersistentStorage.SetValue("SOUND", "OFF");
        }

        this.updateMenu();
    },

    onRate : function() {
        cc.log("==onRate clicked");
    },

    onHowToPlay : function() {
        cc.log("==onHowToPlay clicked");
        //Director::getInstance()->replaceScene(TransitionFade::create(0.5, myScene, Color3B(0,255,255)));
        cc.director.runScene(new cc.TransitionFade(0.5, new TutorialScene(), cc.color(0,0,0)));
    }
});