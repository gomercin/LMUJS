/**
 * Created by GomerciN on 19.12.2015.
 */

var GameSelectionScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameSelectionLayer();
        layer.init();
        this.addChild(layer);
    }
});


var GameSelectionLayer = cc.Node.extend({
    ctor : function(){
        //1. call super class's ctor function
        this._super();

        this._gameSize = 3;
        this._isColoredGame = true;

        this._selectedSizeColor = new cc.Color(0x99, 0x00, 0xCC);
        this._notSelectedSizeColor = new cc.Color(0xFF, 0xFF, 0xFF);
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
        var labelOffset = 100;

        cc.MenuItemFont.setFontSize(60);
        cc.MenuItemFont.setFontName("AmericanTypewriter-Bold");

        this.mItemBack = new cc.MenuItemFont("< Back", this.onBack, this);
        this.mItemBack.setPosition(new cc.Point(50, this.winsize.height - 35));
        this.mItemBack.setFontSize(30);

        this.mItemGameType = new cc.MenuItemFont("Game Type:", this.onTouch, this);
        this.mItemGameType.setPosition(new cc.Point(this.winsize.width/2,this.winsize.height/2 + 3.5*labelOffset));
        this.mItemGameType.setFontSize(30);

        this.mItemPictureGame = new cc.MenuItemImage(res.imgStartPhotoGame, null, null, function(){this.onGameTypeTouch(false);}, this);
        this.mItemPictureGame.setPosition(new cc.Point(this.winsize.width/2 - 1.3 * labelOffset,this.winsize.height/2 + 2*labelOffset));
        this.mItemPictureGame.setScale(200.0 / this.mItemPictureGame.getContentSize().width);

        this.mItemColorGame = new cc.MenuItemImage(res.imgStartColoredGame, null, null, function(){this.onGameTypeTouch(true);}, this);
        this.mItemColorGame.setPosition(new cc.Point(this.winsize.width/2 + 1.3 * labelOffset,this.winsize.height/2 + 2*labelOffset));
        this.mItemColorGame.setScale(180.0 / this.mItemColorGame.getContentSize().width);

        this.mItemGameSize = new cc.MenuItemFont("Game Size:", null, this);
        this.mItemGameSize.setPosition(new cc.Point(this.winsize.width/2,this.winsize.height/2 + 0*labelOffset));
        this.mItemGameSize.setFontSize(30);

        this.mItemGame3x3 = new cc.MenuItemFont("3x3", function(){this.onGameSizeTouch(3);}, this);
        this.mItemGame3x3.setPosition(new cc.Point(this.winsize.width/2 - labelOffset,this.winsize.height/2 - 1*labelOffset));
        this.mItemGame4x4 = new cc.MenuItemFont("4x4", function(){this.onGameSizeTouch(4);}, this);
        this.mItemGame4x4.setPosition(new cc.Point(this.winsize.width/2 + labelOffset,this.winsize.height/2 - 1*labelOffset));

        this.mItemGame5x5 = new cc.MenuItemFont("5x5", function(){this.onGameSizeTouch(5);}, this);
        this.mItemGame5x5.setPosition(new cc.Point(this.winsize.width/2 - labelOffset,this.winsize.height/2 - 2*labelOffset));

        this.mItemGame6x6 = new cc.MenuItemFont("6x6", function(){this.onGameSizeTouch(6);}, this);
        this.mItemGame6x6.setPosition(new cc.Point(this.winsize.width/2 + labelOffset,this.winsize.height/2 - 2*labelOffset));

        this.mItemGame7x7 = new cc.MenuItemFont("7x7", function(){this.onGameSizeTouch(7);}, this);
        this.mItemGame7x7.setPosition(new cc.Point(this.winsize.width/2 - labelOffset,this.winsize.height/2 - 3*labelOffset));
        this.mItemGame8x8 = new cc.MenuItemFont("8x8", function(){this.onGameSizeTouch(8);}, this);
        this.mItemGame8x8.setPosition(new cc.Point(this.winsize.width/2 + labelOffset,this.winsize.height/2 - 3*labelOffset));

        this.mItemStartGame = new cc.MenuItemFont("START", this.onTouch, this);
        this.mItemStartGame.setPosition(new cc.Point(this.winsize.width/2,this.winsize.height/2 - 4*labelOffset));

        var menu = new cc.Menu( this.mItemBack,
                                    this.mItemGameType,
                            this.mItemPictureGame, this.mItemColorGame,
                                    this.mItemGameSize,
                            this.mItemGame3x3, this.mItemGame4x4,
                            this.mItemGame5x5, this.mItemGame6x6,
                            this.mItemGame7x7, this.mItemGame8x8,
                                    this.mItemStartGame)

        menu.setPosition(cc.p(0,0));
        this.addChild(menu);
    },

    updateMenu : function()
    {
        this.mItemColorGame.setOpacity(this._isColoredGame ? 255 : 110);
        this.mItemPictureGame.setOpacity(this._isColoredGame ? 110 : 255);
        //cc.log("colored: " + this._isColoredGame);
        cc.log("size: " + this._gameSize);

        this.mItemGame3x3.color = this._gameSize == 3 ? this._selectedSizeColor : this._notSelectedSizeColor;
        this.mItemGame4x4.color = this._gameSize == 4 ? this._selectedSizeColor : this._notSelectedSizeColor;
        this.mItemGame5x5.color = this._gameSize == 5 ? this._selectedSizeColor : this._notSelectedSizeColor;
        this.mItemGame6x6.color = this._gameSize == 6 ? this._selectedSizeColor : this._notSelectedSizeColor;
        this.mItemGame7x7.color = this._gameSize == 7 ? this._selectedSizeColor : this._notSelectedSizeColor;
        this.mItemGame8x8.color = this._gameSize == 8 ? this._selectedSizeColor : this._notSelectedSizeColor;
    },

    onGameTypeTouch : function(isColoredGame)
    {
        this._isColoredGame = isColoredGame;
        this.updateMenu();
    },

    onGameSizeTouch : function(size)
    {
        this._gameSize = size;
        this.updateMenu();
    },

    onTouch : function() {
        //cc.director.pushScene(new cc.TransitionFade(0.5, new GameScene(0, 3), cc.color(0,0,0)));
        //cc.director(new cc.TransitionFade(0.5, new TutorialScene(), cc.color(0,0,0)));

        cc.director.runScene(new cc.TransitionFade(0.5, new GameScene(0,3), cc.color(0,0,0)));
    },

    onBack : function() {
        CommonUtils.PopSceneWithTransition();
    }
});