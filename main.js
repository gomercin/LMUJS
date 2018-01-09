/**
 * A brief explanation for "project.json":
 * Here is the content of project.json file, this is the global configuration for your game, you can modify it to customize some behavior.
 * The detail of each field is under it.
 {
    "project_type": "javascript",
    // "project_type" indicate the program language of your project, you can ignore this field

    "debugMode"     : 1,
    // "debugMode" possible values :
    //      0 - No message will be printed.
    //      1 - cc.error, cc.assert, cc.warn, cc.log will print in console.
    //      2 - cc.error, cc.assert, cc.warn will print in console.
    //      3 - cc.error, cc.assert will print in console.
    //      4 - cc.error, cc.assert, cc.warn, cc.log will print on canvas, available only on web.
    //      5 - cc.error, cc.assert, cc.warn will print on canvas, available only on web.
    //      6 - cc.error, cc.assert will print on canvas, available only on web.

    "showFPS"       : true,
    // Left bottom corner fps information will show when "showFPS" equals true, otherwise it will be hide.

    "frameRate"     : 60,
    // "frameRate" set the wanted frame rate for your game, but the real fps depends on your game implementation and the running environment.

    "noCache"       : false,
    // Set "noCache" to true can make the loader ignoring the html page cache while loading your resources, 
    // especially useful in Android web browsers.

    "id"            : "gameCanvas",
    // "gameCanvas" sets the id of your canvas element on the web page, it's useful only on web.

    "renderMode"    : 0,
    // "renderMode" sets the renderer type, only useful on web :
    //      0 - Automatically chosen by engine
    //      1 - Forced to use canvas renderer
    //      2 - Forced to use WebGL renderer, but this will be ignored on mobile browsers

    "engineDir"     : "frameworks/cocos2d-html5/",
    // In debug mode, if you use the whole engine to develop your game, you should specify its relative path with "engineDir",
    // but if you are using a single engine file, you can ignore it.

    "modules"       : ["cocos2d"],
    // "modules" defines which modules you will need in your game, it's useful only on web,
    // using this can greatly reduce your game's resource size, and the cocos console tool can package your game with only the modules you set.
    // For details about modules definitions, you can refer to "../../frameworks/cocos2d-html5/modulesConfig.json".

    "jsList"        : [
    ]
    // "jsList" sets the list of js files in your game.
 }
 *
 */


cc.game.onStart = function(){
    if(!cc.sys.isNative && document.getElementById("cocosLoading")) //If referenced loading.js, please remove it
        document.body.removeChild(document.getElementById("cocosLoading"));

    // Pass true to enable retina display, on Android disabled by default to improve performance
    cc.view.enableRetina(cc.sys.os === cc.sys.OS_IOS ? true : false);
    // Adjust viewport meta
    cc.view.adjustViewPort(true);
    
    // Uncomment the following line to set a fixed orientation for your game
    cc.view.setOrientation(cc.ORIENTATION_PORTRAIT);

    // Setup the resolution policy and design resolution size
    //cc.view.setDesignResolutionSize(640, 960, cc.ResolutionPolicy.SHOW_ALL);
    // Instead of set design resolution, you can also set the real pixel resolution size
    // Uncomment the following line and delete the previous line.
    // cc.view.setRealPixelResolution(960, 640, cc.ResolutionPolicy.SHOW_ALL);
    // The game will be resized when browser size change
    cc.view.resizeWithBrowserSize(true);

    var frameSize = cc.view.getFrameSize();
    /* 
    we want to fill the screen with the background
    but we want to have the items more or less on similar positions, with where they would be with
        cc.ResolutionPolicy.SHOW_ALL
    I will compare the real screen size with my design resolution. I will calculate the size and position of the 
    black borders that would normally appear and store them as design offsets.
    These offsets will be used by all absolute positions. 

    inspired by: 
    http://discuss.cocos2d-x.org/t/multiresolution-how-to-show-all-without-black-borders/26508/11

    */
    var designSize = cc.size(640, 960);
    var designRatio = designSize.width / designSize.height;
    //calculating real screen ratio
    var realRatio = frameSize.width / frameSize.height;

    var offset_x = 0;
    var offset_y = 0;

    var final_design_width = designSize.width;
    var final_design_height = designSize.height;

    if (realRatio > designRatio) {
        //means larger width, thus black-borders would be at left and right
        var expectedWidth = (Math.floor)(frameSize.height * designRatio);

        final_design_width = frameSize.width / (frameSize.height / designSize.height);
        offset_x = (Math.floor)((final_design_width - designSize.width) / 2);
    } else {
        //means larger height, thus black-borders would be at top and bottom
        var expectedHeight = (Math.floor)(frameSize.width / designRatio);

        final_design_height = frameSize.height / (frameSize.width / designSize.width);
        offset_y = (Math.floor)((final_design_height - designSize.height) / 2);
    }

    cc.log("original frame size     : " + frameSize.width + ", " + frameSize.height);
    cc.log("calculated width, height: " + final_design_width + ", " + final_design_height);
    cc.log("offset x, y             : " + offset_x + ", " + offset_y);

    CommonUtils.DesignSize = designSize;
    CommonUtils.DesignOffset = cc.p(offset_x, offset_y);

    cc.view.setDesignResolutionSize(final_design_width, final_design_height, cc.ResolutionPolicy.SHOW_ALL);

    if (typeof sdkbox != 'undefined') {
        cc.log("initing ads")
        sdkbox.PluginSdkboxAds.init();
    }
    
    //var gl = cc._renderContext;
    //gl.clearColor(1.0, 1.0, 1.0, 1.0);
    //gl.clear(0xFFFFFFFF);

    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new MenuScene());
    }, this);
};
cc.game.run();