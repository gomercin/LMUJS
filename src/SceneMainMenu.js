/**
 * Created by GomerciN on 19.12.2015.
 */

var MenuScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new MenuLayer();
        layer.init();
        this.addChild(layer);
    }
});


var MenuLayer = cc.LayerColor.extend({
    ctor: function () {
        this._super();
    },

    init: function () {
        this._super(cc.color(230, 230, 255, 255));

        this.winsize = CommonUtils.DesignSize;//cc.director.getWinSize();
        

        this._gameType = GameTypeEnum.COLOR_ROWS;
        this._gameSize = 4;

        var last_game_size = PersistentStorage.GetValue(GameSettingsKeys.LAST_GAME_SIZE);
        var last_game_type = PersistentStorage.GetValue(GameSettingsKeys.LAST_GAME_TYPE);

        if (last_game_size != null && last_game_size != "") {
            this._gameSize = last_game_size;
        }

        if (last_game_type != null && last_game_type != "") {
            this._gameType = last_game_type;
        }

        this.createMenu();
        this.updateMenu();

        if (typeof sdkbox != 'undefined') {
            sdkbox.PluginSdkboxAds.playAd("AdMob", "home");
        }  
    },

    createMenu: function () {
        cc.MenuItemFont.setFontSize(48);
        cc.MenuItemFont.setFontName("Lucida Fax");

        var lblNewGame = new cc.LabelTTF('New Game', 'Lucida Fax', 48);
        lblNewGame.setPosition(CommonUtils.DesignPoint(cc.p(320, this.winsize.height - 140)));
        lblNewGame.setColor(cc.color(0, 0, 0));
        this.addChild(lblNewGame);

        var lblGameMode = new cc.LabelTTF('mode', 'Lucida Fax', 36);
        lblGameMode.setPosition(CommonUtils.DesignPoint(cc.p(320, this.winsize.height - 212)));
        lblGameMode.setColor(cc.color(0, 0, 0));
        this.addChild(lblGameMode);

        this.mItemRowsGame = new cc.MenuItemImage(res.imgRowsGame, res.imgRowsGame, res.imgRowsGame, function () {
            this.onGameTypeTouch(GameTypeEnum.COLOR_ROWS);
        }, this);
        this.mItemRowsGame.setScale(160 / this.mItemRowsGame.getContentSize().width);

        this.mItemRowsGame.setPosition(CommonUtils.DesignPoint(cc.p(188, this.winsize.height - 324)));

        this.mItemColsGame = new cc.MenuItemImage(res.imgColsGame, res.imgColsGame, res.imgColsGame, function () {
            this.onGameTypeTouch(GameTypeEnum.COLOR_BOTH);
        }, this);
        this.mItemColsGame.setScale(160 / this.mItemColsGame.getContentSize().width);
        this.mItemColsGame.setPosition(CommonUtils.DesignPoint(cc.p(456, this.winsize.height - 324)));

        var lblSize = new cc.LabelTTF('size', 'Lucida Fax', 36);
        lblSize.setPosition(CommonUtils.DesignPoint(cc.p(320, this.winsize.height - 470)));
        lblSize.setColor(cc.color(0, 0, 0));
        this.addChild(lblSize);

        this.lblGameSize = new cc.LabelTTF('5', 'Lucida Fax', 48);
        this.lblGameSize.setPosition(CommonUtils.DesignPoint(cc.p(320, this.winsize.height - 530)));
        this.lblGameSize.setColor(cc.color(0, 0, 0));
        this.addChild(this.lblGameSize);

        this.mItemReduceGameSize = new cc.MenuItemImage(res.imgArrow, res.imgArrow, res.imgArrow, function () {
            this.onGameSizeTouch(false);
        }, this);
        this.mItemReduceGameSize.setPosition(CommonUtils.DesignPoint(cc.p(222, this.winsize.height - 530)));
        this.mItemReduceGameSize.setRotation(180);

        this.mItemIncreaseGameSize = new cc.MenuItemImage(res.imgArrow, res.imgArrow, res.imgArrow, function () {
            this.onGameSizeTouch(true);
        }, this);
        this.mItemIncreaseGameSize.setPosition(CommonUtils.DesignPoint(cc.p(416, this.winsize.height - 530)));

        var startBg = new cc.Sprite(res.imgBtnBg);
        startBg.setPosition(CommonUtils.DesignPoint(cc.p(320, this.winsize.height - 650)));
        this.addChild(startBg);

        this.lblStartNewGame = new cc.LabelTTF('Start', 'Lucida Fax', 44, startBg.getContentSize(), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.mItemStartNewGame = new cc.MenuItemLabel(this.lblStartNewGame, function () {this.onNewGame();}, this);
        this.mItemStartNewGame.setPosition(CommonUtils.DesignPoint(cc.p(320, this.winsize.height - 650)));
        this.mItemStartNewGame.setColor(cc.color(0, 0, 0));

        this.mItemSeperator = new cc.MenuItemImage(res.imgLine, res.imgLine, res.imgLine, function () {});
        this.mItemSeperator.setPosition(CommonUtils.DesignPoint(cc.p(320, this.winsize.height - 720)));

        var resumeBg = new cc.Sprite(res.imgBtnBg);
        resumeBg.setPosition(CommonUtils.DesignPoint(cc.p(320, this.winsize.height - 775)));
        this.addChild(resumeBg);

        this.lblResumeNewGame = new cc.LabelTTF('Resume', 'Lucida Fax', 44, resumeBg.getContentSize(), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.mItemResume = new cc.MenuItemLabel(this.lblResumeNewGame, function () {this.onResume();}, this);
        this.mItemResume.setPosition(CommonUtils.DesignPoint(cc.p(320, this.winsize.height - 775)));
        this.mItemResume.setColor(cc.color(0, 0, 0));

        var menu = new cc.Menu(this.mItemRowsGame, this.mItemColsGame,
            this.mItemReduceGameSize, this.mItemIncreaseGameSize,
            this.mItemStartNewGame, this.mItemSeperator, this.mItemResume);
        menu.setPosition(cc.p(0, 0));
        this.addChild(menu);
    },

    updateMenu: function () {
        var lastGame = PersistentStorage.GetValue(GameSettingsKeys.LAST_GAME);
        if (lastGame === null || lastGame === "") {
            this.mItemResume.enabled = false;
        } else {
            this.mItemResume.enabled = true;
        }

        this.mItemRowsGame.setOpacity(this._gameType == GameTypeEnum.COLOR_ROWS ? 255 : 50);
        this.mItemColsGame.setOpacity(this._gameType == GameTypeEnum.COLOR_BOTH ? 255 : 50);

        if (this._gameSize < 3) 
            this._gameSize = 3;
        else if (this._gameSize > 8)
            this._gameSize = 8;

        if (this._gameSize <= 3) {
            this.mItemReduceGameSize.enabled = false;
            this.mItemReduceGameSize.opacity = 112;
        } else 
        {
            this.mItemReduceGameSize.enabled = true;
            this.mItemReduceGameSize.opacity = 255
        }
        
        if (this._gameSize >= 8) {
            this.mItemIncreaseGameSize.enabled = false;
            this.mItemIncreaseGameSize.opacity = 112;
        } else {
            this.mItemIncreaseGameSize.enabled = true;
            this.mItemIncreaseGameSize.opacity = 255;
        }

        this.lblGameSize.setString(this._gameSize);
    },

    onNewGame: function () {
        cc.log("==newGame clicked");
        cc.director.pushScene(new cc.TransitionFade(0.5, new GameScene(this._gameType, this._gameSize, false), cc.color(0, 0, 0)));
    },

    onGameTypeTouch: function (gameType) {
        cc.log("==game type touched " + gameType);

        this._gameType = gameType;
        this.updateMenu();        
    },

    onGameSizeTouch: function (increase) {
        cc.log("==game size touched " + increase);

        this._gameSize += (increase ? 1 : -1);
        this.updateMenu();     
    },

    onResume: function () {
        var lastGame = PersistentStorage.GetValue(GameSettingsKeys.LAST_GAME);
        if (lastGame === null || lastGame === "") {
            cc.log("== won't resume");
        } else {
            cc.log("== will resume");

            var savedGame = PersistentStorage.GetValue(GameSettingsKeys.LAST_GAME);
            cc.log("resume with: " + savedGame);

            cc.director.pushScene(new cc.TransitionFade(0.5, new GameScene(this._gameType, this._gameSize, true), cc.color(0, 0, 0)));            
        }  
    },

    onRate: function () {
        cc.log("==onRate clicked");

        if (cc.sys.isNative) {
            var plugin = sdkbox.PluginReview;
            plugin.setListener({
                onDisplayAlert: function (data) {
                    cc.log("didDisplayAlert");
                },
                onDeclineToRate: function (data) {
                    cc.log("didDeclineToRate");
                },
                onRate: function (data) {
                    cc.log("didToRate");
                },
                onRemindLater: function (data) {
                    cc.log("didToRemindLater");
                }
            });
            plugin.init();
        }
    },

    onHowToPlay: function () {
        cc.director.pushScene(new cc.TransitionFade(0.5, new TutorialScene(), cc.color(0, 0, 0)));
    },

    onEnter: function () {
        this._super();

        var savedGame = PersistentStorage.GetValue(GameSettingsKeys.LAST_GAME);

        this.mItemResume.opacity = 80;

        if (savedGame !== null) {
            if (savedGame.length > 0)
                this.mItemResume.opacity = 255;
        }
    }
});