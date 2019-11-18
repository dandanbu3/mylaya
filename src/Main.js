import GameConfig from "./GameConfig";
import resource from "./script/resource";
import GLOBAL from './script/Global';
import MenuLayer from './script/menuLayer';
class Main {
	constructor() {
		//根据IDE设置初始化引擎		
		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
		Laya["Physics"] && Laya["Physics"].enable();
		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
		Laya.stage.scaleMode = GameConfig.scaleMode;
		Laya.stage.screenMode = GameConfig.screenMode;
		Laya.stage.alignV = GameConfig.alignV;
		Laya.stage.alignH = GameConfig.alignH;
		Laya.stage.bgColor = GameConfig.bgColor;
		//兼容微信不支持加载scene后缀场景
		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
		if (GameConfig.stat) Laya.Stat.show();
		Laya.alertGlobalError = true;

		window.kfcMario  = {};
		this.GLOBAL = GLOBAL;
		if (this.GLOBAL.CONF.DEGRADE) {
			delete resource.cloudSmallLeft;
			delete resource.cloudSmallRight;
            delete resource.cloudLargeLeft;
            delete resource.cloudLargeRight;
            delete resource.mgForestLeft;
            delete resource.mgForestRight;
            delete resource.mgWaterLeft;
            delete resource.mgWaterRight;
            delete resource.mgCityLeft;
            delete resource.mgCityRight;
            delete resource.fgForestLeft;
            delete resource.fgForestRight;
            delete resource.fgWaterLeft;
            delete resource.fgWaterRight;
            delete resource.fgCityLeft;
            delete resource.fgCityRight;
            delete resource.grassLeft;
            delete resource.grassRight;
            delete resource.bridgeLeft;
            delete resource.bridgeRight;
            delete resource.roadLeft;
            delete resource.roadRight;
		} else {
            delete resource.forestDegLeft;
            delete resource.forestDegRight;
            delete resource.waterDegLeft;
            delete resource.waterDegRight;
            delete resource.cityDegLeft;
            delete resource.cityDegRight;
		}
		var loadSource = Object.values(resource).map(function(item) {return item.url});
		console.log(loadSource, 'loadSource');
		Laya.loader.load(loadSource,
			Laya.Handler.create(this, this.loadComplete),
			Laya.Handler.create(this, this.loadProgress, [], false)
		);
		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
	}

	onVersionLoaded() {
		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
	}

	onConfigLoaded() {
		//加载IDE指定的场景
		if (this.GLOBAL.CONF.STATUS !== 4) {
			var test = new MenuLayer();
			Laya.stage.addChild(test);
		}
	}
	/** 资源加载完成时回调*/
	loadComplete(isSuccess) {
		console.log(666);
		const progressTip = document.getElementById('progress_tip');
		const progress = document.getElementById('progress');
		const percent = document.getElementById('percent');
		const body = document.body;
		body.className = body.className.replace('no-scroll', '');
		body.removeChild(progress.parentNode);
		body.removeChild(progressTip);
		// if (GLOBAL.DATA.STATUS !== 4) {
		//     const finishLayer = new FinishLayer();
		//     Tiny.app.run(finishLayer);
		// } else {
		//     const menuLayer = new MenuLayer();
		//     Tiny.app.run(menuLayer);
		// }
		// window.kfcMario.runDanmu && window.kfcMario.runDanmu();
		// window.kfcMario.gameInitCallback && window.kfcMario.gameInitCallback();
	}
	
	/**资源加载过程中的进度回调
	 * progress 取值 0-1 */
	loadProgress(pro) {
		const progressTip = document.getElementById('progress_tip');
		const progress = document.getElementById('progress');
		const percent = document.getElementById('percent');
		const num = ((+pro)*100).toFixed();
		percent.innerHTML = `${num}%`;
		progress.style.width = `${num}%`;
	}
}
//激活启动类
new Main();
