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

        var rowcol = Math.floor((Math.random() * 100) % 5) + 1;
        var dir = (((Math.floor(Math.random() * 100)) % 2) ==0) ? 1 : 2;
        var sel = ((Math.floor(Math.random() * 100)) % 2);

        //rowcol = 2;
        //sel = 2;
        //cc.log("rowcol: " + rowcol + ", sel:" + sel);

        //this.gameBoard.moveColumn(rowcol, sel);

        //return;
        if (sel == 1)
            this.gameBoard.moveRow(rowcol, dir);
        else
            this.gameBoard.moveColumn(rowcol, dir + 2);
    },

    onMenuTouch : function() {
        cc.director.popToRootScene();
    }

});

var GameBoard = cc.Node.extend({

    DirectionEnum : {
        LEFT : 1,
        RIGHT : 2,
        UP : 3,
        DOWN : 4
    },

    boardNodes: [],
    boardValues: [],
    colors: [],

    currentRowColIndex : 0,
    currentDir : 1,
    hasMovedLastNode : false,

    isMoving: false,

    touchStartedAt : new cc.Point(-1000, -1000),
    touchEndedAt : new cc.Point(-1000, -1000),

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

        this.createActions();

        this.createTouchListener();
    },

    createTouchListener : function() {
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();

                if (target instanceof GameBoard)
                {
                    var touchLoc = touch.getLocation();
                    var locationInNode = target.convertToNodeSpace(touchLoc);

                    target.touchStartedAt = locationInNode;
                }

                return true;
            },
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();

                if ( target instanceof  GameBoard) {
                    var touchLoc = touch.getLocation();
                    var locationInNode = target.convertToNodeSpace(touchLoc);
                    target.touchEndedAt = locationInNode;

                    target.processTouch();
                }
            },

            onTouchMoved: function (touch, event) {

            }
        }, this);
    },

    processTouch : function() {
        //do we need to check if touches began and end withing board boundaries?
        //it might be enough to check if it began withing the board to understand which row or column will be moved
        //end position is only used for swipe direction reference,
        //user might swipe outside the board

        var swipeThreshold = 10;
        var halfSize = this.boardWidth / 2.0;

        if (Math.abs(this.touchStartedAt.x) < halfSize && Math.abs(this.touchStartedAt.y) < halfSize) {

            var willMove = true;

            var xDiff = this.touchEndedAt.x - this.touchStartedAt.x;
            var yDiff = this.touchEndedAt.y - this.touchStartedAt.y;
            var absXDiff = Math.abs(xDiff);
            var absYDiff = Math.abs(yDiff);


            var isHorizontalSwipe = true;

            if (absXDiff < swipeThreshold) {
                willMove = false;
            }

            if (absYDiff > absXDiff) {
                isHorizontalSwipe = false;
                willMove = true;

                if (absYDiff < swipeThreshold)
                {
                    willMove = false;
                }
            }

            if (willMove == true)
            {
                if (isHorizontalSwipe == true) {
                    var row = Math.floor((this.touchStartedAt.y + halfSize) / this.multiplier);
                    cc.log ("row: " + row + ", diff: " + xDiff);
                    this.moveRow(row + 1, (xDiff > 0) ? this.DirectionEnum.RIGHT : this.DirectionEnum.LEFT);
                }
                else {
                    var col = Math.floor((this.touchStartedAt.x + halfSize) / this.multiplier);
                    cc.log ("col: " + col + ", diff: " + yDiff);
                    this.moveColumn(col + 1, (yDiff > 0) ? this.DirectionEnum.UP : this.DirectionEnum.DOWN);
                }
            }
        }
    },

    createActions : function() {
        var actionDuration = 0.3;

        var upDownFunc = function(){
                this.moveColumnValues();
                this.redrawBoard();
                this.isMoving = false;
        };

        var leftRightFunc = function() {
                this.moveRowValues();
                this.redrawBoard();
                this.isMoving = false;
        };

        this.moveLeftAction = new cc.MoveBy(actionDuration, -this.multiplier, 0);
        this.moveRightAction = new cc.MoveBy(actionDuration, this.multiplier, 0);
        this.moveUpAction = new cc.MoveBy(actionDuration, 0, this.multiplier);
        this.moveDownAction = new cc.MoveBy(actionDuration, 0, -this.multiplier);

        this.moveLeftActionForLast = new cc.sequence(this.moveLeftAction.clone(), new cc.callFunc(leftRightFunc, this));
        this.moveRightActionForLast = new cc.sequence(this.moveRightAction.clone(), new cc.callFunc(leftRightFunc, this));
        this.moveUpActionForLast = new cc.sequence(this.moveUpAction.clone(), new cc.callFunc(upDownFunc, this));
        this.moveDownActionForLast = new cc.sequence(this.moveDownAction.clone(), new cc.callFunc(upDownFunc, this));
/*
        this.moveLeftAction = new cc.sequence(new cc.MoveBy(actionDuration, 0, 0), new cc.callFunc(leftRightFunc, this));
        this.moveRightAction = new cc.sequence(new cc.MoveBy(actionDuration, 0, 0), new cc.callFunc(leftRightFunc, this));
        this.moveUpAction = new cc.sequence(new cc.MoveBy(actionDuration, 0, 0), new cc.callFunc(upDownFunc, this));
        this.moveDownAction = new cc.sequence(new cc.MoveBy(actionDuration, 0, 0), new cc.callFunc(upDownFunc, this));
        */
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
        var halfWidth = this.boardWidth / 2.0 - 2;
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

        for (row = 0; row < this.gameSize + 2; row++) {
            this.boardNodes[row] = [];
            this.boardValues[row] = [];

            for (col = 0; col < this.gameSize + 2; col++) {
                var sq = new cc.Sprite(res.imgSquare);
                var scale = this.squareSize / sq.getContentSize().width;
                sq.setScale(scale);
                var x = (col - 1) * this.multiplier + this.offset
                var y = (row - 1) * this.multiplier + this.offset;

                //if (col == 2)
                //cc.log("x: " + x + ",y: " + y + ",row: " + row + ",col; " + col);
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

    printBoardValues : function() {
        var str = "";

        for (row = 0; row < this.gameSize + 2; row++) {
            for (col = 0; col < this.gameSize + 2; col++) {
                str += this.boardValues[row][col] + " ";
            }
            str += "\n";
        }

        cc.log(str);
    },

    redrawBoard: function () {
        //cc.log("in redraw, before hidden nodes update");
        //this.printBoardValues();

        this.updateHiddenNodes();

        //cc.log("in redraw, after hidden nodes update");
        //this.printBoardValues();

        for (row = 0; row < this.gameSize + 2; row++) {

            for (col = 0; col < this.gameSize + 2; col++) {
                var sq = this.boardNodes[row][col];
                sq.setColor(this.getColorFromValue(this.boardValues[row][col]));
                var x = (col - 1) * this.multiplier + this.offset;
                var y = (row - 1) * this.multiplier + this.offset;

                //if (col == 2)
                //cc.log("x: " + x + ",y: " + y + ",row: " + row + ",col; " + col);
                sq.setPosition(x, y);

                //this.boardValues[row][col] = row;
            }
        }
    },

    moveRowValues : function() {
        var loopStart = 0, loopEnd = 0, increment = 0;

        var row = this.currentRowColIndex;
        var dir = this.currentDir;

        if (dir == this.DirectionEnum.LEFT) {
            loopStart = 0;
            loopEnd = this.gameSize+1;
            increment = 1;
        }
        else {
            loopStart = this.gameSize+1;
            loopEnd = 0;
            increment = -1;
        }

        //cc.log("before move row:" + dir);
        //this.printBoardValues();

        for (i = loopStart; i != loopEnd; i += increment) {
            this.boardValues[row][i] = this.boardValues[row][i + increment];
        }

        this.boardValues[row][loopEnd] = this.boardValues[row][loopStart + increment];

        //cc.log("after move row:");
        //this.printBoardValues();
    },

    moveColumnValues : function() {
        var loopStart = 0, loopEnd = 0, increment = 0;

        var col = this.currentRowColIndex;
        var dir = this.currentDir;

        if (dir == this.DirectionEnum.DOWN) {
            loopStart = 0;
            loopEnd = this.gameSize+1;
            increment = 1;
        }
        else {
            loopStart = this.gameSize+1;
            loopEnd = 0;
            increment = -1;
        }

        //cc.log("before move column:" + dir);
        //this.printBoardValues();

        for (i = loopStart; i != loopEnd; i += increment) {
            this.boardValues[i][col] = this.boardValues[i+increment][col];
        }

        this.boardValues[loopEnd][col] = this.boardValues[loopStart + increment][col];

        //cc.log("after move column:");
        //this.printBoardValues();
    },

    moveRow: function (row, direction) {

        if (this.isMoving == true) return;


        this.currentDir = direction;
        this.currentRowColIndex = row;

        this.isMoving = true;

        var action = this.moveRightAction;
        var actionForLast = this.moveRightActionForLast;

        if (direction == this.DirectionEnum.LEFT) {
            action = this.moveLeftAction;
            actionForLast = this.moveLeftActionForLast;
        }

        this.hasMovedLastNode = false;

        for (i = 0; i < this.gameSize + 2; i++) {
            var sq = this.boardNodes[row][i];

            if (i == this.gameSize + 1) {
                sq.runAction(actionForLast.clone());
            }
            else {
                sq.runAction(action.clone());
            }
        }

        //this.moveRowValues(row, direction);

        //this.isMoving = false;
        //this.redrawBoard();
    },

    moveColumn: function (col, direction) {
        if (this.isMoving == true) return;


        this.currentDir = direction;
        this.currentRowColIndex = col;

        this.isMoving = true;

        var action = this.moveUpAction;
        var lastAction = this.moveUpActionForLast;

        if (direction == this.DirectionEnum.DOWN) {
            action = this.moveDownAction;
            lastAction = this.moveDownActionForLast;
        }

        for (i = 0; i < this.gameSize + 2; i++) {
            var sq = this.boardNodes[i][col];

            if (i == this.gameSize + 1) {
                sq.runAction(lastAction.clone());
            }
            else {
                sq.runAction(action.clone());
            }
        }

        //this.moveColumnValues(col, direction);

        //this.isMoving = false;
        //this.redrawBoard();
    }

});
