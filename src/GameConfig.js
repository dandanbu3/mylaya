/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
import Girl from "./script/Girl"
import MainLayer from "./script/MainLayer"
import MenuLayer from "./script/menuLayer"
import CrashScene from "./script/CrashScene"
import BackgroundDegrade from "./script/BackgroundDegrade"
import BackgroundScene from "./script/BackgroundScene"

export default class GameConfig {
    static init() {
        //注册Script或者Runtime引用
        let reg = Laya.ClassUtils.regClass;
        reg("script/Girl.js",Girl);
        reg("script/MainLayer.js",MainLayer);
        reg("script/MenuLayer.js",MenuLayer);
        reg("script/CrashScene.js",CrashScene);
        reg("script/BackgroundDegrade.js",BackgroundDegrade);
        reg("script/BackgroundScene.js",BackgroundScene);
    }
}
GameConfig.width = 750;
GameConfig.height = 1144;
GameConfig.bgColor = "#5a7b9a";
GameConfig.scaleMode ="showall";
GameConfig.screenMode = "none";
GameConfig.alignV = "top";
GameConfig.alignH = "left";
// GameConfig.startScene = "test/TestScene.scene";
GameConfig.sceneRotrue
GameConfig.debug = true;
GameConfig.stat = true;
GameConfig.physicsDebug = false;
GameConfig.exportSceneToJson = true;

GameConfig.init();
