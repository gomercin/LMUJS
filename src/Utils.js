/**
 * Created by GomerciN on 21.12.2015.
 */

function CommonUtils() {};

CommonUtils.DesignSize = 0;
CommonUtils.DesignOffset = cc.p(0, 0);

CommonUtils.DesignPoint = function(pt) {
    //return cc.pAdd(CommonUtils.DesignOffset, pt);
    return cc.p(CommonUtils.DesignOffset.x + pt.x, pt.y + CommonUtils.DesignOffset.y);
};

CommonUtils.PopSceneWithTransition = function() {

    cc.director.popScene();

    /* TODO: implement a fadeout effect for popscene function
     var fadeOutAction = cc.fadeTo(1.0, 0);// cc.fadeOut(3.5);
     var currentScene = cc.director.getRunningScene();

     if (currentScene != null)
     {
     currentScene.runAction(cc.sequence(fadeOutAction, cc.callFunc(function(){cc.director.popScene();})));
     }
     */
};

CommonUtils.CloneSprite = function(sprite) {
    var newNode = new cc.Sprite(sprite.getTexture());
    newNode.setScale(sprite.getScale());
    newNode.setColor(sprite.getColor());
    return newNode;
};

var GameTypeEnum = Object.freeze({"COLOR_ROWS":1, "COLOR_BOTH":2, "IMG":3});
var CommonEvents = Object.freeze({"SOLVED":"event_game_solved", "STARTED":"event_game_started"});

