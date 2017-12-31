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

        var refPos = this.boardNodes[0][0].getPosition();
        cc.log("ref position: " + refPos.x + ", " + refPos.y);

        this.createHints();

        this.createActions();

        this.createTouchListener();

        this.shuffle();
    },

    createHints : function() {
        var refNode = this.boardNodes[0][0];

        var rowHints_x = -255;//refNode.getPosition().x;

        for (row = 1; row <= this.gameSize; row++) {
            var sq = new cc.Sprite(res.imgArrow3D);
            sq.setScale(0.5);
            sq.setColor(this.getColorFromValue(row));            
            var y = (row - 1) * this.multiplier + this.offset;
            sq.setPosition(rowHints_x, y);
            this.addChild(sq);
        }
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

        var valueMultipler = (this.gameType == GameTypeEnum.COLOR_ROWS) ? 0 : 10;

        for (row = 0; row < this.gameSize + 2; row++) {
            this.boardNodes[row] = [];
            this.boardValues[row] = [];

            for (col = 0; col < this.gameSize + 2; col++) {
                var sq = new cc.Sprite(res.imgSquare);
                if (this.gameType == GameTypeEnum.COLOR_BOTH)
                {
                    var label = new cc.LabelTTF((this.gameType == GameTypeEnum.COLOR_ROWS) ? '0' : col, 'Lucida Fax', 90);
                    //label.setColor(cc.color(0, 0, 0));
                  
                    //label.fillStyle = cc.color(0, 0, 0);
                    label.setPosition(sq.getContentSize().width / 2, sq.getContentSize().height / 2);
                    //label.enableStroke(cc.color(254, 254, 254, 255), 10);
                  var color = this.getColorFromValue(row);
                      var a = 1 - ( 0.299 * color.r + 0.587 * color.g + 0.114 * color.b)/255;

    if (a < 0.5)
       d = 0; // bright colors - black font
    else
       d = 255; // dark colors - white font

                  label.setColor(cc.color(d, d, d));
    //return  Color.FromArgb(d, d, d);
                    label.retain();
                    sq.addChild(label);
                }
                sq.retain();
                var scale = this.squareSize / sq.getContentSize().width;
                sq.setScale(scale);
                var x = (col - 1) * this.multiplier + this.offset
                var y = (row - 1) * this.multiplier + this.offset;

                sq.setPosition(x, y);
                board.addChild(sq);

                this.boardNodes[row][col] = sq;
                this.boardValues[row][col] = valueMultipler * col + row;
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
  
  getOpposingColorFromValue : function (val) {
    var color = this.getColorFromValue(val);
   
                      var a = 1 - ( 0.299 * color.r + 0.587 * color.g + 0.114 * color.b)/255;

    if (a < 0.5)
       d = 0; // bright colors - black font
    else
       d = 255; // dark colors - white font

    return cc.color(d, d, d);
    //return  Color.FromArgb(d, d, d);
  },

    updateHiddenNodes: function () {
        for (i = 0; i < this.gameSize + 2; i++) {
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

    redrawBoard : function () {
        this.updateHiddenNodes();

        var isSolved = true;

        for (row = 0; row < this.gameSize + 2; row++) {

            for (col = 0; col < this.gameSize + 2; col++) {
                var val = this.boardValues[row][col];
                var sq = this.boardNodes[row][col];
                sq.setColor(this.getColorFromValue(val % 10));
                var x = (col - 1) * this.multiplier + this.offset;
                var y = (row - 1) * this.multiplier + this.offset;

                if (this.gameType == GameTypeEnum.COLOR_BOTH)
                {
                    if (sq.childrenCount > 0) 
                    {
                        sq.getChildren()[0].setString(Math.floor(val / 10));
                      sq.getChildren()[0].setColor(this.getOpposingColorFromValue(val %10));
                    }
                }

                sq.setPosition(x, y);

                if (row != 0 && col != 0 && row != this.gameSize + 1 && col != this.gameSize + 1) {
                    if (this.boardValues[row][col] != this.originalBoardValues[row][col]) {
                        isSolved = false;
                    }
                }
            }
        }

        if (isSolved == true) {
            cc.log("SOLVED!");
        }

        PersistentStorage.SetValue("SAVEDGAME", this.boardValues);
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

        for (var i = loopStart; i != loopEnd; i += increment) {
            this.boardValues[row][i] = this.boardValues[row][i + increment];
        }

        this.boardValues[row][loopEnd] = this.boardValues[row][loopStart + increment];
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

        for (var i = loopStart; i != loopEnd; i += increment) {
            this.boardValues[i][col] = this.boardValues[i+increment][col];
        }

        this.boardValues[loopEnd][col] = this.boardValues[loopStart + increment][col];
    },

    shuffle : function() {

        for (var i = 0; i < 1000; i++) 
        {
            var rowcol = Math.ceil(Math.random() * this.gameSize);
            
            var dir = Math.floor(Math.random() * 2) + 1;
            
            if (Math.floor(Math.random() * 2) % 2) {
                dir *= -1;
            }

            this.currentDir = dir;
            this.currentRowColIndex = rowcol;

            if (dir == 2 || dir == -2) {
                this.moveColumnValues();
            } else {
                this.moveRowValues();
            }

            this.updateHiddenNodes();            
        }

        this.redrawBoard();

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
    },

    makeMove : function(move, saveToHistory) {
        if (this.isMoving == true) return;
        this.isMoving = true;

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

        if (this.moveHistory.length > 0) {
            var move = this.moveHistory.pop();
            cc.log("undo: popped");
            move.direction *= -1;

            this.makeMove(move, false);
        }

        return this.moveHistory.length > 0;
    }
});
