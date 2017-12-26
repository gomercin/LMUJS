/**
 * Created by GomerciN on 21.12.2015.
 */

function CommonUtils() {};

CommonUtils.DesignSize = 0;
CommonUtils.DesignOffsetX = 0;
CommonUtils.DesignOffsetY = 0;

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

