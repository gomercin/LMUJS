/**
 * Created by GomerciN on 19.12.2015.
 */


var GameScene = cc.Scene.extend({

    _gameType : GameTypeEnum.COLOR_ROWS,
    _gameSize : 0,
    _resume : false,

    ctor : function(gameType, gameSize, resume) {
        this._super();

        this._gameType = gameType;
        this._gameSize = gameSize;
        this._resume = resume;

        if (typeof sdkbox != 'undefined') {
            cc.log("playing banner ad")
            
            sdkbox.PluginSdkboxAds.playAd("AdMob", "home");

            cc.log("after banner ad")
        } 
    },

    onEnter:function () {
        this._super();
        var layer = new GameLayer(this._gameType, this._gameSize, this._resume);
        layer.init();
        this.addChild(layer);
    }
});


var GameLayer = cc.LayerColor.extend({

    ctor : function(gameType, gameSize, resume){
        //1. call super class's ctor function
        this._super();
        
        this._gameSize = gameSize;
        this._gameType = gameType;
        this._resume = resume;
        this._solved = false;
    },

    init:function() {
        this._super(cc.color(230, 230, 255, 255));
        
        this.winsize = CommonUtils.DesignSize;

        this.centerpos = cc.p(this.winsize.width / 2, this.winsize.height / 2);

        this.CreateMenu();

        this.gameBoard = new GameBoard(this._gameType, this._gameSize, this._resume);
        this.gameBoard.initWithBoardSize(this.winsize.width * 0.7);
        this.gameBoard.setPosition(CommonUtils.DesignPoint(cc.p(this.winsize.width / 2, this.winsize.height / 2)));
        this.gameBoard.surroundingLayer = this;
        this.addChild(this.gameBoard);

        this.gameBoard.updateUndoStatus();

        this._totalTime = 0.0;

        if (this._resume == true) {
            this._totalTime = +PersistentStorage.GetValue(GameSettingsKeys.LAST_GAME_DURATION);
        } 
        this._lastSavedTime = this._totalTime;    

        var selfPointer = this;
        
        this._gameSolvedListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: CommonEvents.SOLVED,
            callback: function(event){
                cc.log("solved event");
                selfPointer._solved = true;
                cc.eventManager.removeListener(selfPointer._gameSolvedListener);			//remove a listener from cc.eventManager
            }
        });    
        cc.eventManager.addListener(this._gameSolvedListener, 1);

        this.scheduleUpdate( );        
    },

    CreateMenu : function() {
        this.topMargin = 75;

        this.mItemUndo = new cc.MenuItemImage(res.imgBtnNarrowBg, res.imgBtnNarrowBg, res.imgBtnNarrowBg, function(){this.onUndoTouch();}, this);
        this.mItemUndo.setPosition(CommonUtils.DesignPoint(cc.p(this.winsize.width/4,this.winsize.height - this.topMargin)));

        var lblUndo = new cc.LabelTTF('Undo', 'Lucida Fax', 36);//, this.mItemUndo.getContentSize(), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        lblUndo.setColor(cc.color(0, 0, 0));

        lblUndo.setPosition(this.mItemUndo.getContentSize().width / 2, this.mItemUndo.getContentSize().height / 2);
        this.mItemUndo.addChild(lblUndo);
        this.mItemUndo.opacity = 100;

        this.mItemMenu = new cc.MenuItemImage(res.imgBtnNarrowBg, res.imgBtnNarrowBg, res.imgBtnNarrowBg, function(){this.onMenuTouch();}, this);
        this.mItemMenu.setPosition(CommonUtils.DesignPoint(cc.p(3*this.winsize.width/4,this.winsize.height - this.topMargin)));
        var lblMenu = new cc.LabelTTF('Menu', 'Lucida Fax', 36);
        lblMenu.setColor(cc.color(0,0,0));
        lblMenu.setPosition(this.mItemMenu.getContentSize().width / 2, this.mItemMenu.getContentSize().height / 2);
        this.mItemMenu.addChild(lblMenu);

        this.lblTimer = new cc.LabelTTF('00:00:00', 'Lucida Fax', 30);
        this.lblTimer.setPosition(CommonUtils.DesignPoint(cc.p(320, this.winsize.height - 780)));
        this.lblTimer.setColor(cc.color(0, 0, 0));
        this.addChild(this.lblTimer);

        var menu = new cc.Menu(this.mItemUndo, this.mItemMenu);

        this.addChild(menu);

        menu.setPosition(cc.p(0 ,0));
    },

    onUndoTouch : function() {
        this.gameBoard.undo()

        return;
    },

    onMenuTouch : function() {
        cc.director.popToRootScene();
    },

    update : function(dt) {
        if (this._solved == true) return;

        this._totalTime += dt;
        var min = Math.floor(this._totalTime / 60);
        var sec = Math.floor(this._totalTime % 60);
        var msec = Math.floor((this._totalTime * 100) % 100);

        var minStr = (min < 10 ? "0" : "") + min;
        var secStr = (sec < 10 ? "0" : "") + sec;
        var msecStr = (msec < 10 ? "0" : "") + msec;
        
        this.lblTimer.setString(minStr + ":" + secStr + ":" + msecStr);


        if (this._totalTime - this._lastSavedTime > 1) {
            PersistentStorage.SetValue(GameSettingsKeys.LAST_GAME_DURATION, this._totalTime);
            this._lastSavedTime = this._totalTime;
        }
    }
});
