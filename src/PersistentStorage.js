/**
 * Created by GomerciN on 20.12.2015.
 */

var GameSettingsKeys = Object.freeze({"LAST_GAME":1, "UNDO_LIST":2, "LAST_GAME_SIZE":3, "LAST_GAME_TYPE" : 4, "LAST_GAME_DURATION" : 5});

var PersistentStorage = ({
    SetValue : function(key, value) {
        cc.sys.localStorage.setItem(JSON.stringify(key), JSON.stringify(value));
    },

    GetValue : function(key) {
        return JSON.parse(cc.sys.localStorage.getItem(JSON.stringify(key)));
    }
});