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
        this.mItemNewGame.setPosition(new cc.p(this.winsize.width/2,this.winsize.height/2 + 2*labelOffset));
        this.mItemResume.setPosition(new cc.p(this.winsize.width/2,this.winsize.height/2 + labelOffset));
        this.mItemSoundOn.setPosition(new cc.p(this.winsize.width/2,this.winsize.height/2));
        this.mItemRate.setPosition(new cc.p(this.winsize.width/2,this.winsize.height/2 - labelOffset));
        this.mItemHowToPlay.setPosition(new cc.p(this.winsize.width/2,this.winsize.height/2 - 2*labelOffset));

        var menu = new cc.Menu(this.mItemNewGame,this.mItemResume,this.mItemSoundOn,this.mItemRate, this.mItemHowToPlay);
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
        cc.log("==newGame clicked");
        cc.director.pushScene(new cc.TransitionFade(0.5, new GameSelectionScene(), cc.color(0,0,0)));
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

        if (cc.sys.isNative) {
            var plugin = sdkbox.PluginReview;
            plugin.setListener({
                onDisplayAlert: function (data) {
                    cc.log("didDisplayAlert")
                },
                onDeclineToRate: function (data) {
                    cc.log("didDeclineToRate")
                },
                onRate: function (data) {
                    cc.log("didToRate")
                },
                onRemindLater: function (data) {
                    cc.log("didToRemindLater")
                }
            });
            plugin.init();
        }
    },

    onHowToPlay : function() {
        cc.director.pushScene(new cc.TransitionFade(0.5, new TutorialScene(), cc.color(0,0,0)));
    },

    onEnter: function (){
        this._super();

        var savedGame = PersistentStorage.GetValue("SAVEDGAME");

        if (savedGame != undefined && savedGame.length > 0)
        {
            this.mItemResume.opacity = 255;
        }
        else
        {
            this.mItemResume.opacity = 80;
        }
    }
});