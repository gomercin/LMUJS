/**
 * Created by GomerciN on 20.12.2015.
 */


var TutorialScene = cc.Scene.extend({

    onEnter:function () {
        this._super();

        this.tutorialNodes = [];
        var tut1 = new TutorialSprite(res.imgTutorial1);
        var tut2 = new TutorialSprite(res.imgTutorial2);
        var tut3 = new TutorialSprite(res.imgTutorial3);

        tut1.name = "tut1";
        tut2.name = "tut2";
        tut3.name = "tut3";

        tut1.nextTutorialNode = tut2;
        tut2.nextTutorialNode = tut3;
        tut3.nextTutorialNode = null;

        this.tutorialNodes.push(tut3);
        this.tutorialNodes.push(tut2);
        this.tutorialNodes.push(tut1);

        tut3.hide();
        tut2.hide();
        tut1.show();

        for (var tutIndex in this.tutorialNodes)
        {
            this.addChild(this.tutorialNodes[tutIndex]);
        }
    }
});

var TutorialSprite = cc.Sprite.extend({
    nextTutorialNode : 0,
    name : "",

    ctor : function(tutImg){
        //1. call super class's ctor function
        this._super(tutImg);

        //2. get the screen size of your game canvas
        this.winsize = cc.director.getWinSize();

        //3. calculate the center point
        this.centerpos = cc.p(this.winsize.width / 2, this.winsize.height / 2);

        this.setPosition(this.centerpos);
        this.setScale(this.winsize.width / this.getContentSize().width);

        var eventListener = cc.EventListener.create({//event listener
            event: cc.EventListener.TOUCH_ONE_BY_ONE, //one click
            swallowTouches: true, //is onTouch return true, stop event propagation
            onTouchBegan: this.onTouchBegan });

        cc.eventManager.addListener(eventListener, this);//start the event listener

    },

    hide : function() {
        this.setVisible(false);
    },

    show : function() {
        this.setVisible(true);
    },

    onTouchBegan: function(touch, event) {//touchbegan callback

        var fadeOutAction = new cc.fadeOut(0.5);
        var fadeInAction = new cc.fadeIn(0.5);
        var targetNode = event._currentTarget;

        if (targetNode.isVisible() == false) return false;

        if (targetNode.nextTutorialNode == null)
        {
            //return to main menu
            //cc.director.popScene();
            CommonUtils.PopSceneWithTransition();
            //pushScene(new cc.TransitionFade(0.5, new TutorialScene(), cc.color(0,0,0)));

        }
        else
        {
            targetNode.nextTutorialNode.show();
            var funct = function () {
                targetNode.hide();

            };

            var seq = cc.sequence(fadeOutAction, cc.callFunc(funct, this));
            targetNode.runAction(seq);
        }
        return true;

        //this.runAction(fadeOutAction);


        //targetNode.runAction(fadeOutAction);



        //targetNode.nextTutorialNode.runAction(fadeInAction);
    }
});
