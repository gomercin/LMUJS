/**
 * Created by GomerciN on 20.12.2015.
 */

var PersistentStorage = ({
    SetValue : function(key, value) {
        cc.sys.localStorage.setItem(JSON.stringify(key), JSON.stringify(value));
    },

    GetValue : function(key) {
        return JSON.parse(cc.sys.localStorage.getItem(JSON.stringify(key)));
    }
});