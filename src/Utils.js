/**
 * Created by GomerciN on 21.12.2015.
 */

function PopSceneWithTransition()
{
    var fadeOutAction = cc.fadeOut(0.5);
    var currentScene = cc.director.getRunningScene();

    if (currentScene != null)
    {
        currentScene.runAction(cc.sequence(fadeOutAction, cc.callFunc(function(){cc.director.popScene();})));
    }
}