/**
 * Created by GomerciN on 20.12.2015.
 */


var TutorialScene = cc.Scene.extend({
    tutorialNodes : [],
    tutorialIndex : 0,

    onEnter:function () {
        this._super();
        var tut1 = new TutorialSprite(res.imgTutorial1);
        var tut2 = new TutorialSprite(res.imgTutorial2);
        var tut3 = new TutorialSprite(res.imgTutorial3);

        tut1.nextTutorialNode = tut2;
        tut2.nextTutorialNode = tut3;
        tut3.nextTutorialNode = tut1;

        this.tutorialNodes.push(tut1);
        this.tutorialNodes.push(tut2);
        this.tutorialNodes.push(tut3);

        for (var tutIndex in this.tutorialNodes)
        {
            this.addChild(this.tutorialNodes[tutIndex]);
        }


        //tut1.tutSprite.setOpacity(255);

        //this.addChild(tut1);
    }
});

var TutorialSprite = cc.Sprite.extend({
    nextTutorialNode : 0,

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

    onTouchBegan: function(touch, event){//touchbegan callback
        var fadeOutAction = new cc.fadeOut(1);
        var fadeInAction = new cc.fadeIn(1);

        //this.runAction(fadeOutAction);
        //this.nextTutorialNode.runAction(fadeInAction);
    }
});
