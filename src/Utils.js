/**
 * Created by GomerciN on 21.12.2015.
 */

function CommonUtils() {};

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
