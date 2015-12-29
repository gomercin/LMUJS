/**
 * Created by GomerciN on 19.12.2015.
 */


var GameScene = cc.Scene.extend({
    ctor : function(gameType, gameSize) {
        this._super();
    },

    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        layer.init();
        this.addChild(layer);
    }
});


var GameLayer = cc.Node.extend({
    ctor : function(){
        //1. call super class's ctor function
        this._super();

        this._gameSize = 3;
        this._isColoredGame = true;

        this._selectedSizeColor = new cc.Color(0x99, 0x00, 0xCC);
        this._notSelectedSizeColor = new cc.Color(0xFF, 0xFF, 0xFF);
    },
    init:function() {

        this.winsize = cc.director.getWinSize();

        this.centerpos = cc.p(this.winsize.width / 2, this.winsize.height / 2);

        //4. create a background image and set it's position at the center of the screen
        var spritebg = new cc.Sprite(res.imgBackground);


        spritebg.setPosition(this.centerpos);
        spritebg.setScale(this.winsize.width / spritebg.getContentSize().width);
        this.addChild(spritebg);


        this.CreateMenu();


        this.gameBoard = new GameBoard();
        this.gameBoard.initWithBoardAndGameSize(this.winsize.width * 0.8, 5);
        this.gameBoard.setPosition(this.winsize.width / 2, this.winsize.height / 2);
        this.addChild(this.gameBoard);
    },

    CreateMenu : function() {
        this.mItemUndo = new cc.MenuItemImage(res.imgUndo, null, null, function(){this.onGameTypeTouch(false);}, this);
        this.mItemUndo.setPosition(new cc.Point(this.winsize.width/4,this.winsize.height - this.topMargin));
        this.mItemUndo.setScale(120.0 / this.mItemUndo.getContentSize().width);

        this.mItemMenu = new cc.MenuItemImage(res.imgMenu, null, null, function(){this.onMenuTouch();}, this);
        this.mItemMenu.setPosition(new cc.Point(this.winsize.width/2,this.winsize.height - this.topMargin));
        this.mItemMenu.setScale(120.0 / this.mItemMenu.getContentSize().width);

        this.mItemPeek = new cc.MenuItemImage(res.imgPeek, null, null, function(){this.onGameTypeTouch(true);}, this);
        this.mItemPeek.setPosition(new cc.Point(3 * this.winsize.width/4,this.winsize.height - this.topMargin));
        this.mItemPeek.setScale(120.0 / this.mItemPeek.getContentSize().width);

        var menu = new cc.Menu(this.mItemUndo, this.mItemMenu, this.mItemPeek);

        menu.setPosition(cc.p(0,this.winsize.height - 75));
        this.addChild(menu);
    },

    onGameTypeTouch : function() {
        cc.log("in game menu clicked");
    },

    onMenuTouch : function() {
        cc.director.popToRootScene();
    }

});

var GameBoard = cc.Node.extend({
    ctor : function()
    {
        this._super();


    },

    initWithBoardAndGameSize : function (boardWidth, gameSize)
    {
        var winSize = cc.director.getWinSize();

        var stencil = this.gameMask(boardWidth);
        stencil.tag = 0;
        stencil.x = 0;
        stencil.y = 0;

        var clipper = new cc.ClippingNode();
        clipper.tag = 1;
        clipper.anchorX = 0.5;
        clipper.anchorY = 0.5;
        clipper.x = 0;// winSize.width / 2 - 50;
        clipper.y = 0;//winSize.height / 2 - 50;
        clipper.stencil = stencil;
        clipper.setInverted(false);
        this.addChild(clipper);

        var content = this.createGameBoard(boardWidth, gameSize); //new cc.Sprite(res.imgStartColoredGame);
        //content.setScale(boardWidth / content.getContentSize().width);
        content.x = 0;
        content.y = 0;
        clipper.addChild(content);

    },

    gameMask:function (boardWidth) {
        var halfWidth = boardWidth / 2.0;
        var shape = new cc.DrawNode();

        var rectangle = [cc.p(-halfWidth, -halfWidth),
                         cc.p(halfWidth, -halfWidth),
                         cc.p(halfWidth, halfWidth),
                         cc.p(-halfWidth, halfWidth)];

        var green = cc.color(255, 255, 255, 255);
        shape.drawPoly(rectangle, green, 3, green);
        return shape;
    },


    createGameBoard : function(boardWidth, gameSize)
    {
        var gameBorderSize = 3;
        var squareSize = ((boardWidth - gameBorderSize) / gameSize) - gameBorderSize;

        var board = this.gameMask(boardWidth);

        var multiplier = squareSize + gameBorderSize;
        var offset = (squareSize  - boardWidth) / 2 + gameBorderSize;

        for (row = 0; row < gameSize; row++) {
            for (col = 0; col < gameSize; col++) {
                var sq = new cc.Sprite(res.imgSquare);
                sq.setColor(new cc.Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 0));
                var x = col * multiplier + offset
                var y = row * multiplier + offset;

                sq.setPosition(x, y);
                var scale = squareSize / sq.getContentSize().width;
                
                sq.setScale(scale);
                board.addChild(sq);
            }
        }


        return board;
    },


});