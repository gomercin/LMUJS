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
        cc.log("in game menu cl icked");

        var rowcol = Math.floor((Math.random() * 100) % 5);
        var dir = (Math.random() * 100) % 2 ==0 ? -1 : 1;
        var sel = (Math.floor(Math.random() * 100)) % 2 ==0 ? -1 : 1;

        cc.log("rowcol: " + rowcol + ", sel:" + sel);

        if (sel == 1)
            this.gameBoard.moveRow(rowcol, sel);
        else
            this.gameBoard.moveColumn(rowcol, sel);
    },

    onMenuTouch : function() {
        cc.director.popToRootScene();
    }

});

var GameBoard = cc.Node.extend({

    boardNodes: [],
    boardValues: [],
    colors: [],

    isMoving: false,

    ctor: function () {
        this._super();


    },

    initWithBoardAndGameSize: function (boardWidth, gameSize) {
        this.gameSize = gameSize;
        this.boardWidth = boardWidth;

        this.initColors();

        var winSize = cc.director.getWinSize();

        var stencil = this.gameMask();
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

        var content = this.createGameBoard(); //new cc.Sprite(res.imgStartColoredGame);
        //content.setScale(boardWidth / content.getContentSize().width);
        content.x = 0;
        content.y = 0;
        clipper.addChild(content);

    },

    initColors: function () {
        this.colors[0] = new cc.Color(255, 0, 0, 255);
        this.colors[1] = new cc.Color(0, 255, 0, 255);
        this.colors[2] = new cc.Color(0, 0, 255, 255);
        this.colors[3] = new cc.Color(255, 255, 0, 255);
        this.colors[4] = new cc.Color(255, 0, 255, 255);
        this.colors[5] = new cc.Color(0, 255, 255, 255);
        this.colors[6] = new cc.Color(128, 241, 87, 255);
        this.colors[7] = new cc.Color(210, 87, 165, 255);
    },

    gameMask: function () {
        var halfWidth = this.boardWidth * 2.0 - 2;
        var shape = new cc.DrawNode();

        var rectangle = [cc.p(-halfWidth, -halfWidth),
            cc.p(halfWidth, -halfWidth),
            cc.p(halfWidth, halfWidth),
            cc.p(-halfWidth, halfWidth)];

        var green = cc.color(255, 255, 255, 255);
        shape.drawPoly(rectangle, green, 3, green);
        return shape;
    },


    createGameBoard: function () {
        this.gameBorderSize = 3;
        this.squareSize = ((this.boardWidth - this.gameBorderSize) / this.gameSize) - this.gameBorderSize;

        var board = this.gameMask();

        this.multiplier = this.squareSize + this.gameBorderSize;
        this.offset = (this.squareSize - this.boardWidth) / 2 + this.gameBorderSize;

        var actionDuration = 0.3;
        this.moveLeftAction = new cc.MoveBy(actionDuration, -this.multiplier, 0);
        this.moveRightAction = new cc.MoveBy(actionDuration, this.multiplier, 0);
        this.moveUpAction = new cc.MoveBy(actionDuration, 0, this.multiplier);
        this.moveDownAction = new cc.MoveBy(actionDuration, 0, -this.multiplier);

        for (row = 0; row < this.gameSize + 2; row++) {
            this.boardNodes[row] = [];
            this.boardValues[row] = [];

            for (col = 0; col < this.gameSize + 2; col++) {
                var sq = new cc.Sprite(res.imgSquare);
                var scale = this.squareSize / sq.getContentSize().width;
                sq.setScale(scale);
                var x = (col - 1) * this.multiplier + this.offset
                var y = (row - 1) * this.multiplier + this.offset;

                sq.setPosition(x, y);
                board.addChild(sq);

                this.boardNodes[row][col] = sq;
                this.boardValues[row][col] = row;
            }
        }

        this.updateHiddenNodes();
        this.redrawBoard();
        return board;
    },

    getColorFromValue: function (val) {
        return this.colors[val];
    },

    updateHiddenNodes: function () {
        for (i = 0; i < this.gameSize + 2; i++) {
            /*
             this.boardNodes[0][row].setColor(this.boardNodes[this.gameSize][row].getColor());
             this.boardNodes[this.gameSize+1][row].setColor(this.boardNodes[1][row].getColor());
             this.boardNodes[row][0].setColor(this.boardNodes[row][this.gameSize].getColor());
             this.boardNodes[row][this.gameSize+1].setColor(this.boardNodes[row][1].getColor());
             */

            this.boardValues[0][i] = this.boardValues[this.gameSize][i];
            this.boardValues[this.gameSize + 1][i] = this.boardValues[1][i];

            this.boardValues[i][0] = this.boardValues[i][this.gameSize];
            this.boardValues[i][this.gameSize + 1] = this.boardValues[i][1];
        }
    },

    redrawBoard: function () {
        this.updateHiddenNodes();

        for (row = 0; row < this.gameSize + 2; row++) {

            for (col = 0; col < this.gameSize + 2; col++) {
                var sq = this.boardNodes[row][col];
                sq.setColor(this.getColorFromValue(this.boardValues[row][col]));
                var x = (col - 1) * this.multiplier + this.offset;
                var y = (row - 1) * this.multiplier + this.offset;

                sq.setPosition(x, y);

                //this.boardValues[row][col] = row;
            }
        }
    },

    moveRow: function (row, direction) {

        if (this.isMoving == true) return;

        this.isMoving = true;

        var action = this.moveRightAction;
        var changeOffset = 0;
        var loopStart, loopEnd, increment;

        if (direction < 0) {
            action = this.moveLeftAction;

            loopStart = 0;
            loopEnd = this.gameSize +1;
            increment = 1;
        }
        else {
            action = this.moveRightAction;

            loopStart = this.gameSize + 1;
            loopEnd = 0;
            increment = -1;
        }

        for (i = 0; i < this.gameSize + 2; i++) {
            var sq = this.boardNodes[row][i];
            sq.runAction(action.clone());
        }

        this.boardValues[row][loopEnd] = this.boardValues[row][loopStart];

        for (i = loopStart; i != loopEnd; i += increment) {
            this.boardValues[row][i] = this.boardValues[row][i + increment];
        }

        this.isMoving = false;
        this.redrawBoard();
    },

    moveColumn: function (col, direction) {
        if (this.isMoving == true) return;

        this.isMoving = true;

        var action = this.moveUpAction;
        var changeOffset = 0;
        var loopStart, loopEnd, increment;

        if (direction < 0) {
            action = this.moveUpAction;

            loopStart = 0;
            loopEnd = this.gameSize +1;
            increment = 1;
        }
        else {
            action = this.moveDownAction;

            loopStart = this.gameSize + 1;
            loopEnd = 0;
            increment = -1;
        }

        for (i = 0; i < this.gameSize + 2; i++) {
            var sq = this.boardNodes[i][col];
            sq.runAction(action.clone());
        }

        this.boardValues[loopEnd][col] = this.boardValues[loopStart][col];

        for (i = loopStart; i != loopEnd; i += increment) {
            this.boardValues[i][col] = this.boardValues[i+increment][col];
        }

        this.isMoving = false;
        this.redrawBoard();
    }

});