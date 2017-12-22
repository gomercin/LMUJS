/**
 * Created by GomerciN on 19.12.2015.
 */


var GameScene = cc.Scene.extend({

    _gameType : 0,
    _gameSize : 0,

    ctor : function(gameType, gameSize) {
        this._super();

        this._gameType = gameType;
        this._gameSize = gameSize;
    },

    onEnter:function () {
        this._super();
        var layer = new GameLayer(this._gameType, this._gameSize);
        layer.init();
        this.addChild(layer);
    }
});


var GameLayer = cc.LayerColor.extend({

    isPeeking : false,

    ctor : function(gameType, gameSize){
        //1. call super class's ctor function
        this._super();
        
        this._gameSize = gameSize;
        this._isColoredGame = gameType;

        this._selectedSizeColor = new cc.Color(0x99, 0x00, 0xCC);
        this._notSelectedSizeColor = new cc.Color(0xFF, 0xFF, 0xFF);
    },

    init:function() {
        this._super(cc.color(230, 230, 255, 255));
        
        this.winsize = cc.director.getWinSize();

        this.centerpos = cc.p(this.winsize.width / 2, this.winsize.height / 2);

        this.CreateMenu();

        this.gameBoard = new GameBoard(this._isColoredGame, this._gameSize);
        this.gameBoard.initWithBoardSize(this.winsize.width * 0.8);
        this.gameBoard.setPosition(this.winsize.width / 2, this.winsize.height / 2);
        this.gameBoard.surroundingLayer = this;
        this.addChild(this.gameBoard);

        this._totalTime = 0.0;

        this.scheduleUpdate( );        
    },

    CreateMenu : function() {
        this.topMargin = 75;
        this.mItemUndo = new cc.MenuItemImage(res.imgUndo, res.imgUndo, res.imgUndo, function(){this.onUndoTouch();}, this);
        this.mItemUndo.setPosition(cc.p(this.winsize.width/4,this.winsize.height - this.topMargin));
        this.mItemUndo.setScale(120.0 / this.mItemUndo.getContentSize().width);
        this.mItemUndo.opacity = 100;
        //this.mItemUndo.retain();

        this.mItemMenu = new cc.MenuItemImage(res.imgMenu, res.imgMenu, res.imgMenu, function(){this.onMenuTouch();}, this);
        this.mItemMenu.setPosition(cc.p(this.winsize.width/2,this.winsize.height - this.topMargin));
        this.mItemMenu.setScale(120.0 / this.mItemMenu.getContentSize().width);
        //this.mItemMenu.retain();

        this.mItemPeek = new cc.MenuItemImage(res.imgPeek, res.imgPeek, res.imgPeek, function(){this.onPeekTouch();}, this);
        this.mItemPeek.setPosition(cc.p(3 * this.winsize.width/4,this.winsize.height - this.topMargin));
        this.mItemPeek.setScale(120.0 / this.mItemPeek.getContentSize().width);
        //this.mItemPeek.retain();

        this.lblTimer = new cc.LabelTTF('00:00:00', 'Lucida Fax', 30);
        this.lblTimer.setPosition(new cc.p(320, this.winsize.height - 780));
        this.lblTimer.setColor(cc.color(0, 0, 0));
        this.addChild(this.lblTimer);

        var menu = new cc.Menu(this.mItemUndo, this.mItemMenu, this.mItemPeek);

        this.addChild(menu);

        //menu.setPosition(new cc.p(100,this.winsize.height - 75));

        menu.setPosition(new cc.p(0 ,0));
    },

    onUndoTouch : function() {
        cc.log("in game menu cl icked");

        this.gameBoard.undo()
        /*
        if (this.gameBoard.undo() == true)
        {
            this.mItemUndo.opacity = 255;
        }
        else
        {
            this.mItemUndo.opacity = 100;
        }
        */
        return;
    },

    onMenuTouch : function() {
        cc.director.popToRootScene();
    },

    onPeekTouch : function() {
        this.changePeekState(!this.isPeeking);
    },

    changePeekState : function(peekEnabled) {
        this.isPeeking = peekEnabled;

        this.mItemPeek.setNormalImage(new cc.Sprite(this.isPeeking ? res.imgPeekHighlight : res.imgPeek));
        this.mItemPeek.setSelectedImage(new cc.Sprite(this.isPeeking ? res.imgPeekHighlight : res.imgPeek));

        this.gameBoard.changePeekState(peekEnabled);
    },

    update : function(dt) {
        this._totalTime += dt;
        var min = Math.floor(this._totalTime / 60);
        var sec = Math.floor(this._totalTime % 60);
        var msec = Math.floor((this._totalTime * 100) % 100);

        var minStr = (min < 10 ? "0" : "") + min;
        var secStr = (sec < 10 ? "0" : "") + sec;
        var msecStr = (msec < 10 ? "0" : "") + msec;
        
        this.lblTimer.setString(minStr + ":" + secStr + ":" + msecStr);
    }
});

function GameMove(rowColVal, direction) {
    this.rowColVal = rowColVal;
    this.direction = direction;
};

var GameBoard = cc.Node.extend({

    DirectionEnum : {
        LEFT : 1,
        RIGHT : -1,
        UP : 2,
        DOWN : -2
    },

    boardNodes: [],
    boardValues: [],
    originalBoardValues : [],
    colors: [],

    moveHistory : [],

    currentRowColIndex : 0,
    currentDir : 1,
    hasMovedLastNode : false,

    isMoving: false,

    touchStartedAt : new cc.p(-1000, -1000),
    touchEndedAt : new cc.p(-1000, -1000),

    surroundingLayer : 0,

    isPeeking : false,

    ctor: function (gameType, gameSize) {
        this._super();

        this.gameSize = gameSize;
        this.gameType = gameType;

        this.boardNodes = [];
        this.boardValues = [];
        this.originalBoardValues = [];
        this.colors = [];
        this.moveHistory = [];
        this.isMoving = false;
    },

    initWithBoardSize: function (boardWidth) {
        this.boardWidth = boardWidth;
        this.halfWidth = boardWidth / 2;

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

                    if (Math.abs(locationInNode.x) <= target.halfWidth && Math.abs(locationInNode.y) <= target.halfWidth) {
                        if (target.isPeeking == true) {
                            target.changePeekState(false);
                        }
                    }
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
                var rowColVal = 0;
                var direction = this.DirectionEnum.LEFT;

                if (isHorizontalSwipe == true) {
                    rowColVal = Math.floor((this.touchStartedAt.y + halfSize) / this.multiplier) + 1;
                    direction = (xDiff > 0) ? this.DirectionEnum.RIGHT : this.DirectionEnum.LEFT;
                }
                else {
                    rowColVal = Math.floor((this.touchStartedAt.x + halfSize) / this.multiplier) + 1;
                    direction = (yDiff > 0) ? this.DirectionEnum.UP : this.DirectionEnum.DOWN;
                }

                this.makeMove(new GameMove(rowColVal, direction));
            }
        }
    },

    createActions : function() {
        var actionDuration = 0.3;

        this.upDownFunc = function () {
            this.moveColumnValues();
            this.redrawBoard();
            this.isMoving = false;

            if (this.surroundingLayer != 0 && this.moveHistory.length > 0) {
                this.surroundingLayer.mItemUndo.opacity = 255;
            }
            else {
                this.surroundingLayer.mItemUndo.opacity = 100;
            }
        };

        this.leftRightFunc = function () {
            this.moveRowValues();
            this.redrawBoard();
            this.isMoving = false;

            if (this.surroundingLayer != 0 && this.moveHistory.length > 0) {
                this.surroundingLayer.mItemUndo.opacity = 255;
            }
            else {
                this.surroundingLayer.mItemUndo.opacity = 100;
            }
        };

        this.moveLeftAction = new cc.MoveBy(actionDuration, -this.multiplier, 0);
        this.moveRightAction = new cc.MoveBy(actionDuration, this.multiplier, 0);
        this.moveUpAction = new cc.MoveBy(actionDuration, 0, this.multiplier);
        this.moveDownAction = new cc.MoveBy(actionDuration, 0, -this.multiplier);

        this.moveLeftActionForLast = new cc.Sequence(this.moveLeftAction.clone(), new cc.CallFunc(this.leftRightFunc, this));
        this.moveRightActionForLast = new cc.Sequence(this.moveRightAction.clone(), new cc.CallFunc(this.leftRightFunc, this));
        this.moveUpActionForLast = new cc.Sequence(this.moveUpAction.clone(), new cc.CallFunc(this.upDownFunc, this));
        this.moveDownActionForLast = new cc.Sequence(this.moveDownAction.clone(), new cc.CallFunc(this.upDownFunc, this));

        this.moveLeftAction.retain();
        this.moveRightAction.retain();
        this.moveUpAction.retain();
        this.moveDownAction.retain();

        this.moveLeftActionForLast.retain();
        this.moveRightActionForLast.retain();
        this.moveUpActionForLast.retain();
        this.moveDownActionForLast.retain();

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
        this.colors[8] = new cc.Color(50, 212, 98, 255);
    },

    gameMask: function () {
        var halfWidth = this.boardWidth / 2.0 - 2;
        var shape = new cc.DrawNode();

        var rectangle = [cc.p(-halfWidth, -halfWidth),
            cc.p(halfWidth, -halfWidth),
            cc.p(halfWidth, halfWidth),
            cc.p(-halfWidth, halfWidth)];

        var bgColor = cc.color(110, 100, 5, 10);
        shape.drawPoly(rectangle, bgColor, 3, bgColor);
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
                sq.retain();
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
        for (row = 0; row < this.gameSize + 2; row++)
        {
            this.originalBoardValues[row] = [];

            for(col=0; col< this.gameSize + 2; col++)
            {
                this.originalBoardValues[row][col] = this.boardValues[row][col];
            }
        }
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
                sq.setColor(this.getColorFromValue( this.isPeeking ? this.originalBoardValues[row][col] : this.boardValues[row][col]));
                var x = (col - 1) * this.multiplier + this.offset;
                var y = (row - 1) * this.multiplier + this.offset;

                //if (col == 2)
                //cc.log("x: " + x + ",y: " + y + ",row: " + row + ",col; " + col);
                sq.setPosition(x, y);

                //this.boardValues[row][col] = row;
            }
        }

        if (this.isPeeking == false) {
            PersistentStorage.SetValue("SAVEDGAME", this.boardValues);
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
        this.currentDir = direction;
        this.currentRowColIndex = row;

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
        this.currentDir = direction;
        this.currentRowColIndex = col;

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
    },

    makeMove : function(move, saveToHistory) {
        if (this.isMoving == true) return;
        this.isMoving = true;

        if (this.isPeeking == true)
        {
            this.changePeekState(false);
        }

        if (move.direction == this.DirectionEnum.LEFT ||
            move.direction == this.DirectionEnum.RIGHT) {
            this.moveRow(move.rowColVal, move.direction);
        }
        else {
            this.moveColumn(move.rowColVal, move.direction);
        }

        if (typeof saveToHistory === "undefined" || saveToHistory == true) {
            this.moveHistory.push(move);

            if (this.surroundingLayer != 0)
            {
                this.surroundingLayer.mItemUndo.opacity = 255;
            }
        }
    },

    undo : function() {
        if (this.isMoving == true)
        {
            cc.log("undo: rejected");
            return true;
        }

        if (this.isPeeking == true)
        {
            this.changePeekState(false);
        }

        if (this.moveHistory.length > 0) {
            var move = this.moveHistory.pop();
            cc.log("undo: popped");
            move.direction *= -1;

            this.makeMove(move, false);
        }

        return this.moveHistory.length > 0;
    },

    changePeekState : function(isPeeking) {

        if (this.isPeeking != isPeeking) {

            this.isPeeking = isPeeking;

            this.redrawBoard();
            this.surroundingLayer.changePeekState(isPeeking);
        }
    }
});
