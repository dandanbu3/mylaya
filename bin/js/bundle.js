(function () {
    'use strict';

    /**
     * 子弹脚本，实现子弹飞行逻辑及对象池回收机制
     */
    class Bullet extends Laya.Script {
        constructor() { super(); }
        onEnable() {
            //设置初始速度
            var rig = this.owner.getComponent(Laya.RigidBody);
            rig.setVelocity({ x: 0, y: -10 });
        }

        onTriggerEnter(other, self, contact) {
            //如果被碰到，则移除子弹
            this.owner.removeSelf();
        }

        onUpdate() {
            //如果子弹超出屏幕，则移除子弹
            if (this.owner.y < -10) {
                this.owner.removeSelf();
            }
        }

        onDisable() {
            //子弹被移除时，回收子弹到对象池，方便下次复用，减少对象创建开销
            Laya.Pool.recover("bullet", this.owner);
        }
    }

    /**
     * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
     * 更多类型定义，请参考官方文档
     */
    class GameControl extends Laya.Script {
        /** @prop {name:dropBox,tips:"掉落容器预制体对象",type:Prefab}*/
        /** @prop {name:bullet,tips:"子弹预制体对象",type:Prefab}*/
        /** @prop {name:createBoxInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:1000}*/

        constructor() { super(); }
        onEnable() {
            //间隔多少毫秒创建一个下跌的容器
            this.createBoxInterval = 1000;
            //开始时间
            this._time = Date.now();
            //是否已经开始游戏
            this._started = false;
            //子弹和盒子所在的容器对象
            this._gameBox = this.owner.getChildByName("gameBox");
        }

        onUpdate() {
            //每间隔一段时间创建一个盒子
            let now = Date.now();
            if (now - this._time > this.createBoxInterval&&this._started) {
                this._time = now;
                this.createBox();
            }
        }

        createBox() {
            //使用对象池创建盒子
            let box = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
            box.pos(Math.random() * (Laya.stage.width - 100), -100);
            this._gameBox.addChild(box);
        }

        onStageClick(e) {
            //停止事件冒泡，提高性能，当然也可以不要
            e.stopPropagation();
            //舞台被点击后，使用对象池创建子弹
            let flyer = Laya.Pool.getItemByCreateFun("bullet", this.bullet.create, this.bullet);
            flyer.pos(Laya.stage.mouseX, Laya.stage.mouseY);
            this._gameBox.addChild(flyer);
        }

        /**开始游戏，通过激活本脚本方式开始游戏*/
        startGame() {
            if (!this._started) {
                this._started = true;
                this.enabled = true;
            }
        }

        /**结束游戏，通过非激活本脚本停止游戏 */
        stopGame() {
            this._started = false;
            this.enabled = false;
            this.createBoxInterval = 1000;
            this._gameBox.removeChildren();
        }
    }

    /**
     * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
     * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
     * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
     */
    class GameUI extends Laya.Scene {
        constructor() {
            super();
            //设置单例的引用方式，方便其他类引用
            GameUI.instance = this;
            //关闭多点触控，否则就无敌了
            Laya.MouseManager.multiTouchEnabled = false;
            //加载场景文件
            this.loadScene("test/TestScene.scene");
        }

        onEnable() {
            //戏控制脚本引用，避免每次获取组件带来不必要的性能开销
            this._control = this.getComponent(GameControl);
            //点击提示文字，开始游戏
            this.tipLbll.on(Laya.Event.CLICK, this, this.onTipClick);
        }

        onTipClick(e) {
            this.tipLbll.visible = false;
            this._score = 0;
            this.scoreLbl.text = "";
            this._control.startGame();
        }

        /**增加分数 */
        addScore(value) {
            this._score += value;
            this.scoreLbl.changeText("分数：" + this._score);
            //随着分数越高，难度增大
            if (this._control.createBoxInterval > 600 && this._score % 20 == 0) this._control.createBoxInterval -= 20;
        }

        /**停止游戏 */
        stopGame() {
            this.tipLbll.visible = true;
            this.tipLbll.text = "游戏结束了，点击屏幕重新开始";
            this._control.stopGame();
        }
    }

    /**
     * 掉落盒子脚本，实现盒子碰撞及回收流程
     */
    class DropBox extends Laya.Script {
        constructor() { super(); }
        onEnable() {
            /**获得组件引用，避免每次获取组件带来不必要的查询开销 */
            this._rig = this.owner.getComponent(Laya.RigidBody);
            //盒子等级
            this.level = Math.round(Math.random() * 5) + 1;
            //等级文本对象引用
            this._text = this.owner.getChildByName("levelTxt");
            this._text.text = this.level + "";
        }

        onUpdate() {
            //让持续盒子旋转
            this.owner.rotation++;
        }

        onTriggerEnter(other, self, contact) {
            var owner = this.owner;
            if (other.label === "buttle") {
                //碰撞到子弹后，增加积分，播放声音特效
                if (this.level > 1) {
                    this.level--;
                    this._text.changeText(this.level + "");
                    owner.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: -10 });
                    Laya.SoundManager.playSound("sound/hit.wav");
                } else {
                    if (owner.parent) {
                        let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                        effect.pos(owner.x, owner.y);
                        owner.parent.addChild(effect);
                        effect.play(0, true);
                        owner.removeSelf();
                        Laya.SoundManager.playSound("sound/destroy.wav");
                    }
                }
                GameUI.instance.addScore(1);
            } else if (other.label === "ground") {
                //只要有一个盒子碰到地板，则停止游戏
                owner.removeSelf();
                GameUI.instance.stopGame();
            }
        }

        /**使用对象池创建爆炸动画 */
        createEffect() {
            let ani = new Laya.Animation();
            ani.loadAnimation("test/TestAni.ani");
            ani.on(Laya.Event.COMPLETE, null, recover);
            function recover() {
                ani.removeSelf();
                Laya.Pool.recover("effect", ani);
            }
            return ani;
        }

        onDisable() {
            //盒子被移除时，回收盒子到对象池，方便下次复用，减少对象创建开销。
            Laya.Pool.recover("dropBox", this.owner);
        }
    }

    /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */

    class GameConfig {
        static init() {
            //注册Script或者Runtime引用
            let reg = Laya.ClassUtils.regClass;
    		reg("script/GameUI.js",GameUI);
    		reg("script/GameControl.js",GameControl);
    		reg("script/Bullet.js",Bullet);
    		reg("script/DropBox.js",DropBox);
        }
    }
    GameConfig.width = 750;
    GameConfig.height = 1144;
    GameConfig.bgColor = "#5a7b9a";
    GameConfig.scaleMode ="fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = true;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;

    GameConfig.init();

    const publicPath = '';
    const frame = {url: `${publicPath}res/frame.png`, name: "frame"};
    const menuBg = {url: `${publicPath}res/menu_bg.png`, name: "menuBg"};
    const storySetting = {url: `${publicPath}res/story_setting.png`, name: "storySetting"};
    const finishBg = {url: `${publicPath}res/finish_bg.png`, name: "finishBg"};
    const bgLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/9a8b151509713d312f5f50f4ff68f919372e1e7f.png`, name: "bgLeft"};
    const bgRight = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/a305e973913ed408d5bcc10e656d2de6827ff070.png`, name: "bgRight"};

    const cloudSmallLeft = {url: `${publicPath}res/cloud_small_left.png`, name: "cloudSmallLeft"};
    const cloudSmallRight = {url: `${publicPath}res/cloud_small_right.png`, name: "cloudSmallRight"};
    const cloudLargeLeft = {url: `${publicPath}res/cloud_large_left.png`, name: "cloudLargeLeft"};
    const cloudLargeRight = {url: `${publicPath}res/cloud_large_right.png`, name: "cloudLargeRight"};

    const mgForestLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/18d828975b3df41c70d3c5dc4af5da8eaedc70a6.png`, name: "mgForestLeft"};
    const mgForestRight = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/b997e9ff85ab732691546acddab5febaab7d64a7.png`, name: "mgForestRight"};
    const mgWaterLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/893892609e737dcc1353721ed3b9b794143523d8.png`, name: "mgWaterLeft"};
    const mgWaterRight = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/665b4e7180b870730a21b985a92552076f3d626c.png`, name: "mgWaterRight"};
    const mgCityLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/6cfcd32eb78c80b0ebf38b586f7a454a01c92052.png`, name: "mgCityLeft"};
    const mgCityRight = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/5653fe8f74ab9902ce88f98657b114acfa03f5b8.png`, name: "mgCityRight"};

    const fgForestLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/647129cdf757ae39ebbbda479d109d99bf96a1e7.png`, name: "fgForestLeft"};
    const fgForestRight = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/b151c360973bd1b75177c265c2fc1f27abfecf6b.png`, name: "fgForestRight"};
    const fgWaterLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/bcf67b436ae262977a8dd838e71c34a5fcc7554b.png`, name: "fgWaterLeft"};
    const fgWaterRight ={url: `http://i0.hdslb.com/bfs/kfptfe/floor/6262cae21a7d3e80af755493a5a17adb5195e303.png`, name: "fgWaterRight"};
    const fgCityLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/e2f804dad092dc1bde05221f44efbcf7d51b44b3.png`, name: "fgCityLeft"};
    const fgCityRight = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/fb6b1e9b944b4ca2ed71d1a4c916855f4d1e0c2b.png`, name: "fgCityRight"};

    const grassLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/e3a19e4a89c9195f048675d7b7553fee8f15380c.png`, name: "grassLeft"};
    const grassRight = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/129c7cf29e75df512b8bdd27ce1f6a83459b4c8c.png`, name: "grassRight"};
    const bridgeLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/199ec474c224550e6df2a688038120d9a33c7caf.png`, name: "bridgeLeft"};
    const bridgeRight = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/2250e29af5e34924262e56c6cef1ea363b258d71.png`, name: "bridgeRight"};
    const roadLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/fa1738ca68ccba0c8112c54be3b89aca156e869a.png`, name: "roadLeft"};
    const roadRight = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/e77fefe63815402f15b1ff2ff9d83a1123730ec5.png`, name: "roadRight"};

    const forestDegLeft = {url: `${publicPath}res/forest_degrade_left.png`, name: "forestDegLeft"};
    const forestDegRight = {url: `${publicPath}res/forest_degrade_right.png`, name: "forestDegRight"};
    const waterDegLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/536927047321badf9db66a38694df57e3c6708ed.png`, name: "waterDegLeft"};
    const waterDegRight = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/69b02e88fc86e6d9b67a28e05233b14fbe5c344b.png`, name: "waterDegRight"};
    const cityDegLeft = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/68f3aab4826a6efa1cd268ffa6d2b79fdd0f22a9.png`, name: "cityDegLeft"};
    const cityDegRight = {url: `http://i0.hdslb.com/bfs/kfptfe/floor/16a6b87fb994320ebddf8c21c80e936915a615d2.png`, name: "cityDegRight"};

    const dialogBg = {url: `${publicPath}res/dialog_bg.png`, name: "dialogBg"};
    const bgFrame = {url: `${publicPath}res/atlas/bg.atlas`, name: "bgFrame"};
    const iconsFrame = {url: `${publicPath}res/atlas/icons.atlas`, name: "iconsFrame"};
    const numFrame = {url: `${publicPath}res/atlas/num.atlas`, name: "numFrame"};
    const girl22 = {url: `${publicPath}res/atlas/girl22.atlas`, name: "girl22"};
    const girl33 = {url: `${publicPath}res/atlas/girl33.atlas`, name: "girl33"};
    const barrierFrame = {url: `${publicPath}res/atlas/barrier.atlas`, name: "barrierFrame"};
    const dialogFrame = {url: `${publicPath}res/atlas/dialog.atlas`, name: "dialogFrame"};
    const otherFrame = {url: `${publicPath}res/atlas/other.atlas`, name: "otherFrame"};
    const logoFrame = {url: `${publicPath}res/atlas/logo.atlas`, name: "logoFrame"};
    const hitFrame = {url: `${publicPath}res/atlas/hit.atlas`, name: "hitFrame"};

    const bgOgg = {url: `${publicPath}sound/bg.ogg`, name: "bgOgg"};
    const boxhitOgg = {url: `${publicPath}sound/boxhit.ogg`, name: "boxhitOgg"};
    const boxhitemptyOgg = {url: `${publicPath}sound/boxhitempty.ogg`, name: "boxhitemptyOgg"};
    const jumpOgg = {url: `${publicPath}sound/jump.ogg`, name: "jumpOgg"};
    const gameoverOgg = {url: `${publicPath}sound/gameover.ogg`, name: "gameoverOgg"};
    const countdownOgg = {url: `${publicPath}sound/countdown.ogg`, name: "countdownOgg"};

    const RESOURCES = {
        frame,
        menuBg,
        storySetting,
        finishBg,
        bgLeft,
        bgRight,

        cloudSmallLeft,
        cloudSmallRight,
        cloudLargeLeft,
        cloudLargeRight,

        mgForestLeft,
        mgForestRight,
        mgWaterLeft,
        mgWaterRight,
        mgCityLeft,
        mgCityRight,

        fgForestLeft,
        fgForestRight,
        fgWaterLeft,
        fgWaterRight,
        fgCityLeft,
        fgCityRight,

        grassLeft,
        grassRight,
        bridgeLeft,
        bridgeRight,
        roadLeft,
        roadRight,

        forestDegLeft,
        forestDegRight,
        waterDegLeft,
        waterDegRight,
        cityDegLeft,
        cityDegRight,

        dialogBg,
        girl22,
        girl33,
        bgFrame,
        iconsFrame,
        numFrame,
        barrierFrame,
        dialogFrame,
        otherFrame,
        logoFrame,
        hitFrame,

        bgOgg,
        boxhitOgg,
        boxhitemptyOgg,
        jumpOgg,
        gameoverOgg,
        countdownOgg
    };

    const ENEMY_CONF = {
        city: {
            items: [{
                name: 'box',
                frames: 4,
                speed: 0.1,
                points: [{
                    x: 16, y: 8
                }, {
                    x: 45, y: 0
                }, {
                    x: 74, y: 8
                }]
            }, {
                name: 'cat',
                frames: 8,
                speed: 0.1,
                points: [{
                    x: 2, y: 16
                }, {
                    x: 25, y: 0
                }, {
                    x: 86, y: 40
                }]
            }, {
                name: 'cone',
                frames: 4,
                speed: 0.1,
                points: [{
                    x: 0, y: 73
                }, {
                    x: 37, y: 0
                }, {
                    x: 72, y: 73
                }]
            }, {
                name: 'tc',
                frames: 4,
                speed: 0.1,
                points: [{
                    x: 8, y: 22
                }, {
                    x: 23, y: 0
                }, {
                    x: 56, y: 16
                }]
            }]
        },
        water: {
            items: [{
                name: 'fish',
                frames: 6,
                speed: 0.2,
                points: [{
                    x: 0, y: 24
                }, {
                    x: 67, y: 0
                }, {
                    x: 80, y: 12
                }]
            }, {
                name: 'vortex',
                frames: 4,
                speed: 0.2,
                points: [{
                    x: 0, y: 20
                }, {
                    x: 40, y: 0
                }, {
                    x: 86, y: 24
                }]
            }]
        },
        forest: {
            items: [{
                name: 'eat_flower',
                frames: 3,
                speed: 0.1,
                points: [{
                    x: 0, y: 28
                }, {
                    x: 37, y: 0
                }, {
                    x: 64, y: 73
                }]
            }, {
                name: 'flower',
                frames: 3,
                speed: 0.1,
                points: [{
                    x: 0, y: 58
                }, {
                    x: 17, y: 0
                }, {
                    x: 58, y: 4
                }, {
                    x: 64, y: 58
                }]
            }, {
                name: 'fire',
                frames: 3,
                speed: 0.2,
                points: [{
                    x: 0, y: 72
                }, {
                    x: 23, y: 0
                }, {
                    x: 58, y: 70
                }]
            }, {
                name: 'ghost',
                frames: 3,
                speed: 0.1,
                points: [{
                    x: 0, y: 46
                }, {
                    x: 40, y: 0
                }, {
                    x: 76, y: 10
                }]
            }]
        }
    };

    var GLOBAL = {
        CONF: { // 游戏配置
            PREVENT: false,
            DEFAULT_SPEED: 10, // 移动速度（像素）
            SPEED: 10, // 移动速度（像素）
            GROUND_POS_Y: 948, // 地板的位置
            PRIZE_POS_Y: 0, // 通过女孩的高度和跳起倍数动态计算
            GIRL_JUMP_TIMES: 1.5, // 2233跳起的高度倍数
            SOUND_ON: false,
            GIRL_STAT: -1, // -1:pre, 0:runing, 1:up, 2:down, 3: squat蹲
            HIT: 0, // 顶到的奖品数
            MILEAGE: 0, // 里程数
            MODE: -2, // 当前模式
            DEGRADE: false, // 是否降级
            TRY_GAME: false // 游戏试玩
        },
        MODES: { // 游戏模式
            MENU: -2,
            PRE: -1,
            PLAYING: 0,
            PAUSED: 1,
            GAME_OVER: 2
        },
        DATA: { // 接口数据
            IS_LOGIN: false, // 登录状态
            MID: 0,
            STATUS: 1, // 活动状态
            ACT_START_TIME: '', // 活动开始时间
            DISPLAY_CHANCE: 0, // 总的开箱机会
            OPEN_CHANCE: 0, // 当天的开箱机会
            NO_INVENTORY: '', // today:今日无库存 all:库存全无
            ALL_RECORD: 0, // 全站记录
            SELF_RECORD: 0, // 个人记录
            LOTTERY_LIST: [], // 抽奖中奖列表
            RANK_LIST: [],
            RANK_SELF: null,

        },
        TEXTURE_CACHES: {},
        ENEMY_CONF
    };

    const SceneArr = ['forest', 'water', 'city'];
    class BackgroundScene extends Laya.Sprite {
        constructor () {
            super();
            this._bgCache = [];
            this._cloudCache = [];
            this._mgCache = [];
            this._fgCache = [];
            this._groundCache = [];
            this._newGroundIndex = 1;

            const bgLeft = Laya.Sprite();
            bgLeft.loadImage(RESOURCES['bgLeft'].url);
            const bgRight = Laya.Sprite();
            bgRight.loadImage(RESOURCES['bgRight'].url);
            
            this._bgWidth = 2180;
            for (let i = 0; i < 4; i++) {
                const mode = i % 2;
                const sprite = new Laya.Sprite();
                sprite.loadImage(mode === 0 ? bgLeft : bgRight);
                sprite.pivot(0, 0);
                sprite.pos(this._bgWidth * i, 190);
                this.addChild(sprite);
                this._bgCache.push(sprite);
            }
            
            const cloudSmallLeft = Laya.Sprite();
            cloudSmallLeft.loadImage(RESOURCES['cloudSmallLeft'].url);
            const cloudSmallRight = Laya.Sprite();
            cloudSmallRight.loadImage(RESOURCES['cloudSmallRight'].url);
            const cloudLargeLeft = Laya.Sprite();
            cloudLargeLeft.loadImage(RESOURCES['cloudLargeLeft'].url);
            const cloudLargeRight = Laya.Sprite();
            cloudLargeRight.loadImage(RESOURCES['cloudLargeRight'].url);
            this._cloudList = [cloudSmallLeft, cloudSmallRight, cloudLargeLeft, cloudLargeRight, cloudSmallLeft, cloudSmallRight];
            let cloudPosX = 0;
            for (let i = 0; i < 2; i++) {
                const sprite = new Laya.Sprite();
                sprite.loadImage(this._cloudList[i]);
                sprite.pivot(0, 0);
                sprite.pos(cloudPosX, 293);
                this.addChild(sprite);
                this._cloudCache.push(sprite);
                cloudPosX += sprite.width;
            }

            this._mgList = [
                RESOURCES['mgForestLeft'].url,
                RESOURCES['mgForestRight'].url,
                RESOURCES['mgWaterLeft'].url,
                RESOURCES['mgWaterRight'].url,
                RESOURCES['mgCityLeft'].url,
                RESOURCES['mgCityRight'].url
            ];
            let mgPosX = 0;
            for (let i = 0; i < 2; i++) {
                const sprite = new Laya.Sprite();
                sprite.loadImage(this._mgList[i]);
                sprite.pivot(0, 0);
                sprite.pos(mgPosX, 60);
                this.addChild(sprite);
                this._mgCache.push(sprite);
                mgPosX += sprite.width;
            }

            this._fgList = [
                RESOURCES['fgForestLeft'].url,
                RESOURCES['fgForestRight'].url,
                RESOURCES['fgWaterLeft'].url,
                RESOURCES['fgWaterRight'].url,
                RESOURCES['fgCityLeft'].url,
                RESOURCES['fgCityRight'].url
            ];
            let fgPosX = 50;
            for (let i = 0; i < 2; i++) {
                const sprite = new Laya.Sprite();
                sprite.loadImage(this._fgList[i]);
                sprite.pivot(0, 0);
                sprite.pos(fgPosX, 60);
                this.addChild(sprite);
                this._fgCache.push(sprite);
                fgPosX += sprite.width;
            }

            // 2233广告牌
            this._fgCache[0]._adAnime = new Laya.Animation();
            this._fgCache[0]._adAnime.loadImages(this.aniUrls("bg/ad_22_",43));
            this._fgCache[0]._adAnime.interval = 33;
            this._fgCache[0]._adAnime.pivot(0, 1);
            this._fgCache[0]._adAnime.pos(408, 756);
            this._fgCache[0]._adAnime.play();
            this._fgCache[0]._adAnime.visible = (false);
            this._fgCache[0].addChild(this._fgCache[0]._adAnime);
            this._fgCache[1]._adAnime = new Laya.Animation();
            this._fgCache[1]._adAnime.loadImages(this.aniUrls("bg/ad_33_",32));
            this._fgCache[1]._adAnime.interval = 33;
            this._fgCache[1]._adAnime.pivot(0, 1);
            this._fgCache[1]._adAnime.pos(1060, 764);
            this._fgCache[1]._adAnime.play();
            this._fgCache[1]._adAnime.visible = (false);
            this._fgCache[1].addChild(this._fgCache[1]._adAnime);

            // 便利店招牌
            // const shophTextures = [];
            // for (let i = 0; i < 25; i++) {
            //     shophTextures.push(Tiny.Texture.fromFrame(`shoph_${i}.png`));
            // }
            // this._fgCache[1]._shopH = new Tiny.AnimatedSprite(shophTextures);
            // this._fgCache[1]._shopH.animationSpeed = 0.4;
            // this._fgCache[1]._shopH.setPosition(1034, 608);
            // this._fgCache[1]._shopH.play();
            // this._fgCache[1]._shopH.setVisible(false);
            // this._fgCache[1].addChild(this._fgCache[1]._shopH);
            // 便利店字幕
            // const shopTextures = [];
            // for (let i =0; i < 26; i++) {
            //     shopTextures.push(Tiny.Texture.fromFrame(`shop_${i}.png`));
            // }
            // this._fgCache[1]._shop = new Tiny.AnimatedSprite(shopTextures);
            // this._fgCache[1]._shop.animationSpeed = 0.4;
            // this._fgCache[1]._shop.setPosition(586, 608);
            // this._fgCache[1]._shop.play();
            // this._fgCache[1]._shop.setVisible(false);
            // this._fgCache[1].addChild(this._fgCache[1]._shop);

            // 大楼银幕
            this._fgCache[0]._build = new Laya.Animation();
            this._fgCache[0]._build.loadImages("bg/uild_", 10);
            this._fgCache[0]._build.interval = 40;
            this._fgCache[0]._build.pos(777, 160);
            this._fgCache[0]._build.play();
            this._fgCache[0]._build.visible = (false);
            this._fgCache[0].addChild(this._fgCache[0]._build);

            // 咖啡厅招牌
            // const cofTextures = [];
            // for (let i = 0; i < 8; i++) {
            //     cofTextures.push(Tiny.Texture.fromFrame(`cof_${i}.png`));
            // }
            // this._fgCache[0]._cof = new Tiny.AnimatedSprite(cofTextures);
            // this._fgCache[0]._cof.animationSpeed = 0.4;
            // this._fgCache[0]._cof.setPosition(1148, 564);
            // this._fgCache[0]._cof.play();
            // this._fgCache[0]._cof.setVisible(false);
            // this._fgCache[0].addChild(this._fgCache[0]._cof);

            // 海鸥
            for (let i  = 0; i < 3; i ++) {
                const birdTextures = [];
                for (let j = 0; j < 6; j++) {
                    birdTextures.push(Tiny.Texture.fromFrame(`bird_${i}_${j}.png`));
                }
                const flyAction = Tiny.MoveBy(500, Tiny.point(0, 50));
                if (i === 0) {
                    this._fgCache[0]._bird0 = new Tiny.AnimatedSprite(birdTextures);
                    this._fgCache[0]._bird0.animationSpeed = 0.2;
                    this._fgCache[0]._bird0.setPosition(1160, -580);
                    this._fgCache[0]._bird0.play();
                    this._fgCache[0]._bird0.runAction(Tiny.RepeatForever(Tiny.Back(flyAction)));
                    this._fgCache[0].addChild(this._fgCache[0]._bird0);
                } else {
                    this._fgCache[1][`_bird${i}`] = new Tiny.AnimatedSprite(birdTextures);
                    this._fgCache[1][`_bird${i}`].animationSpeed = 0.2;
                    this._fgCache[1][`_bird${i}`].setPosition(i === 1 ? 340 : 580, -780);
                    this._fgCache[1][`_bird${i}`].play();
                    this._fgCache[1][`_bird${i}`].runAction(Tiny.RepeatForever(Tiny.Back(flyAction)));
                    this._fgCache[1].addChild(this._fgCache[1][`_bird${i}`]);
                }
            }
            
            this._groundList = [
                Tiny.Texture.fromImage(RESOURCES['grassLeft']),
                Tiny.Texture.fromImage(RESOURCES['grassRight']),
                Tiny.Texture.fromImage(RESOURCES['bridgeLeft']),
                Tiny.Texture.fromImage(RESOURCES['bridgeRight']),
                Tiny.Texture.fromImage(RESOURCES['roadLeft']),
                Tiny.Texture.fromImage(RESOURCES['roadRight'])
            ];
            let groundPosX = 0;
            for (let i = 0; i < 2; i++) {
                const ground = new Tiny.Sprite(this._groundList[i]);
                // @ts-ignore
                ground._inview = true;
                // @ts-ignore
                ground._allinview = true;
                ground.setAnchor(0);
                ground.setPosition(groundPosX, GLOBAL.CONF.GROUND_POS_Y - 20);
                this.addChild(ground);
                this._groundCache.push(ground);
                groundPosX += ground.width;
            }
        }
        checkPosPlace (posX) {
            let posRange = this._groundList[this._newGroundIndex].width - (Tiny.WIN_SIZE.width - this._groundCache[this._newGroundIndex % 2].getPositionX()); // 边界
            let index = this._newGroundIndex;
            const checkRange = () => {
                if (posX > posRange) {
                    index = (index + 1) % 6;
                    posRange += this._groundList[index].width;
                    checkRange();
                }
            };
            checkRange();
            return SceneArr[Math.floor(index / 2)];
        }
        updateTransform () {
            const speed = GLOBAL.CONF.SPEED;
            if (GLOBAL.CONF.MODE === GLOBAL.MODES.PLAYING) {
                for (let i = 0; i < 4; i++) {
                    let bgPos = this._bgCache[i].getPositionX();
                    const offsetBg = bgPos + this._bgWidth * 2;
                    if (offsetBg <= 0) {
                        bgPos = this._bgWidth * 2 + offsetBg;
                    }
                    this._bgCache[i].setPositionX(bgPos - 5);
                    if (i < 2) {
                        // 地板的处理
                        const piece = this._groundCache[i];
                        let pos = piece.getPositionX();
                        const pieceWidth = piece.width;
                        const offset = pos + pieceWidth;
                        if (!piece._inview && pos - speed <= Tiny.WIN_SIZE.width) {
                            piece._inview = true;
                            this._newGroundIndex = (this._newGroundIndex + 1) % 6;
                            if (this._newGroundIndex === 4) {
                                this._fgCache[0]._adAnime.setVisible(true);
                                this._fgCache[0]._build.setVisible(true);
                                // this._fgCache[0]._cof.setVisible(true);
                            }
                            if (this._newGroundIndex === 5) {
                                this._fgCache[1]._adAnime.setVisible(true);
                                // this._fgCache[1]._shopH.setVisible(true);
                                // this._fgCache[1]._shop.setVisible(true);
                            }
                            if (this._newGroundIndex % 2 === 0) {
                                this._mgCache[0].texture = this._mgList[this._newGroundIndex];
                                this._fgCache[0].texture = this._fgList[this._newGroundIndex];
                                const which = Math.floor(this._newGroundIndex / 2);
                                if (which === 1) {
                                    this._mgCache[0].setAnchor(0, 1);
                                    this._mgCache[0].setPositionY(GLOBAL.CONF.GROUND_POS_Y + 64);
                                    this._fgCache[0].setAnchor(0, 1);
                                    this._fgCache[0].setPositionY(1136);
                                } else {
                                    this._mgCache[0].setAnchor(0);
                                    this._mgCache[0].setPositionY(60);
                                    this._fgCache[0].setAnchor(0);
                                    this._fgCache[0].setPositionY(60);
                                }
                                this._cloudCache[0].texture = this._cloudList[this._newGroundIndex];
                                this._cloudCache[0].setPositionX(Tiny.WIN_SIZE.width + 100);
                                this._mgCache[0].setPositionX(Tiny.WIN_SIZE.width);
                                this._fgCache[0].setPositionX(Tiny.WIN_SIZE.width + (which === 0 ? 50 : 0));
                            }
                        }
                        if (offset <= 0) {
                            piece._inview = false;
                            piece._allinview = false;
                            if (this._newGroundIndex === 5) {
                                this._fgCache[0]._adAnime.setVisible(false);
                                this._fgCache[0]._build.setVisible(false);
                                // this._fgCache[0]._cof.setVisible(false);
                            }
                            if (this._newGroundIndex === 0) {
                                this._fgCache[1]._adAnime.setVisible(false);
                                // this._fgCache[1]._shopH.setVisible(false);
                                // this._fgCache[1]._shop.setVisible(false);
                            }
                            const nextIndex = (this._newGroundIndex + 1) % 6;
                            piece.texture = this._groundList[nextIndex];
                            if (Math.floor(nextIndex / 2) === 1) {
                                piece.setPositionY(GLOBAL.CONF.GROUND_POS_Y - 109);
                            } else {
                                piece.setPositionY(GLOBAL.CONF.GROUND_POS_Y - 20);
                            }
                            pos = this._groundCache[(i + 1) % 2].width + offset;
                        }
                        piece.setPositionX(pos - speed);

                        // 云、中景、前景的处理
                        if (i === 0 && !piece._allinview && pos <= 0) {
                            piece._allinview = true;
                            const nextIndex = (this._newGroundIndex + 1) % 6;
                            this._cloudCache[1].texture = this._cloudList[nextIndex];
                            this._mgCache[1].texture = this._mgList[nextIndex];
                            this._fgCache[1].texture = this._fgList[nextIndex];
                            const which = Math.floor(nextIndex / 2);
                            if (which === 1) {
                                this._mgCache[1].setAnchor(0, 1);
                                this._mgCache[1].setPositionY(GLOBAL.CONF.GROUND_POS_Y + 64);
                                this._fgCache[1].setAnchor(0, 1);
                                this._fgCache[1].setPositionY(1136);
                            } else {
                                this._mgCache[1].setAnchor(0);
                                this._mgCache[1].setPositionY(60);
                                this._fgCache[1].setAnchor(0);
                                this._fgCache[1].setPositionY(60);
                            }
                            this._cloudCache[1].setPositionX(this._cloudCache[0].width + this._cloudCache[0].getPositionX());
                            this._mgCache[1].setPositionX(this._mgCache[0].width + this._mgCache[0].getPositionX());
                            this._fgCache[1].setPositionX(this._fgCache[0].width + this._fgCache[0].getPositionX());
                        }
                        // 云
                        const cloudPos = this._cloudCache[i].getPositionX();
                        this._cloudCache[i].setPositionX(cloudPos - speed * 0.7);
                        // 中景
                        const mgPos = this._mgCache[i].getPositionX();
                        this._mgCache[i].setPositionX(mgPos - (speed * 0.95));
                        // 前景
                        const fgPos = this._fgCache[i].getPositionX();
                        this._fgCache[i].setPositionX(fgPos - speed);
                    }
                }
            }
            this.containerUpdateTransform();
        }
    }

    const SceneArr$1 = ['forest', 'water', 'city'];
    class BackgroundDegrade extends Laya.Sprite {
        constructor () {
            super();
            this._bgCache = [];
            this._bgList = [
                RESOURCES['forestDegLeft'].url,
                RESOURCES['forestDegRight'].url,
                RESOURCES['waterDegLeft'].url,
                RESOURCES['waterDegRight'].url,
                RESOURCES['cityDegLeft'].url,
                RESOURCES['cityDegRight'].url
            ];
            this._newGroundIndex = 1;
            let bgPos = 0;
            for (let i = 0; i < 2; i++) {
                const bg = new Laya.Sprite();
                bg.loadImage(this._bgList[i]);
                // @ts-ignore
                bg._inview = true;
                // @ts-ignore
                bg._allinview = true;
                bg.pivot(0, 1);
                bg.pos(bgPos, Laya.stage.height);
                this.addChild(bg);
                this._bgCache.push(bg);
                bgPos += bg.width;
            }
        }
        checkPosPlace (posX) {
            let posRange = this._bgList[this._newGroundIndex].width - (Laya.stage.width - this._bgCache[this._newGroundIndex % 2].getPositionX()); // 边界
            let index = this._newGroundIndex;
            const checkRange = () => {
                if (posX > posRange) {
                    index = (index + 1) % 6;
                    posRange += this._bgList[index].width;
                    checkRange();
                }
            };
            checkRange();
            return SceneArr$1[Math.floor(index / 2)];
        }
        updateTransform () {
            const speed = GLOBAL.CONF.SPEED;
            if (GLOBAL.CONF.MODE === GLOBAL.MODES.PLAYING) {
                for (let i = 0; i < 2; i++) {
                    // 地板的处理
                    const bg = this._bgCache[i];
                    let pos = bg.x;
                    const pieceWidth = bg.width;
                    const offset = pos + pieceWidth;
                    if (!bg._inview && pos - speed <= Laya.stage.width) {
                        bg._inview = true;
                        this._newGroundIndex = (this._newGroundIndex + 1) % 6;
                    }
                    if (offset <= 0) {
                        bg._inview = false;
                        bg._allinview = false;
                        const nextIndex = (this._newGroundIndex + 1) % 6;
                        bg.texture = this._bgList[nextIndex];
                        pos = this._bgCache[(i + 1) % 2].width + offset;
                    }
                    bg.x = pos - speed;
                }
            }
            this.customRender();
        }
    }

    class BarScene extends Laya.Sprite {
        constructor () {
            super();
            this._prizeNumCache = [];
            this._mileageNumCache = [];
            this.createPrizeCount();
            this.createMileage();
            this.createPause();
        }
        drawNum (cacheKey, num, size = 'lg', pos, interval = 28, reverse = false) {
            this[cacheKey].forEach(item => {
                this.removeChild(item);
            });
            this[cacheKey] = [];
            const numArr = num.toString().split('');
            if (reverse) {
                numArr.reverse();
            }
            numArr.forEach((item, index) => {
                const sprite = new Laya.Sprite();
                sprite.loadImage(`num/${size}_${item}.png`);
                sprite.pivot(0.5, 1);
                if (reverse) {
                    sprite.pos(pos.x - index * (interval), pos.y);
                } else {
                    sprite.pos(pos.x + index * (interval), pos.y);
                }
                this.addChild(sprite);
                this[cacheKey].push(sprite);
            });
        }
        createPrizeCount () {
            this._prizeIcon = new Laya.Sprite();
            this._prizeIcon.loadImage('icons/gift_bg.png');
            this._prizeIcon.pivot(0, 0);
            this._prizeIcon.pos(30, 200);
            this.addChild(this._prizeIcon);
            const x = new Laya.Sprite();
            x.loadImage(`num/lg_x.png`);
            x.pivot(0, 1);
            x.pos(104, 242);
            this.addChild(x);
            this.drawNum('_prizeNumCache', GLOBAL.CONF.HIT, 'sm', {
                x: 133,
                y: 242
            }, 20);
        }
        createMileage () {
            this._mileageIcon = new Laya.Sprite();
            this._mileageIcon.loadImage('icons/mileage_bg.png');
            this._mileageIcon.pivot(0, 0);
            this._mileageIcon.pos(284, 200);
            this.addChild(this._mileageIcon);
            const m = new Laya.Sprite(`tileset-num-sm_m.png`);
            m.loadImage(`num/sm_m.png`);
            m.pivot(0, 1);
            m.pos(479, 242);
            this.addChild(m);
            this.drawNum('_mileageNumCache', GLOBAL.CONF.MILEAGE, 'sm', {
                x: 467,
                y: 242
            }, 20, true);
        }
        createPause () {
            this._pause = new Laya.Sprite();
            this._pause.loadImage('icons/btn_pause.png');
            this._pause.pivot(0, 0);
            this._pause.pos(658, 206);
            this._pause.mouseEnabled = true;
            this._pause.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (GLOBAL.CONF.MODE === GLOBAL.MODES.PLAYING) {
                    this.emit('pause');
                }
            });
            this.addChild(this._pause);
        }
        reset () {
            this.drawNum('_mileageNumCache', GLOBAL.CONF.MILEAGE, 'sm', {
                x: 467,
                y: 242
            }, 20, true);
            this.drawNum('_prizeNumCache', GLOBAL.CONF.HIT, 'sm', {
                x: 133,
                y: 242
            }, 20);
        }
        addPrize () {
            const newValue = GLOBAL.CONF.HIT.toString();
            const oldValue = (GLOBAL.CONF.HIT - 1).toString();
            if (newValue.length < oldValue.length) {
                this.drawNum('_prizeNumCache', GLOBAL.CONF.HIT, 'sm', {
                    x: 133,
                    y: 242
                }, 20);
            } else {
                const newArr = newValue.split('');
                const oldArr = oldValue.split('');
                newArr.forEach((item, index) => {
                    if (item !== oldArr[index]) {
                        const newSprite = new Laya.Sprite();
                        newSprite.loadImage(`num/sm_${item}.png`);
                        newSprite.pivot(0.5, 1);
                        newSprite.pos(133 + index * 20, 202);
                        this.addChild(newSprite);
                        const oldSprite = this._prizeNumCache[index];
                        this._prizeNumCache.splice(index, 1, newSprite);
                        // const moveAction = Tiny.MoveTo(500, Tiny.point(133 + index * 20, 242));
                        // newSprite.runAction(moveAction);
                        // const oldAction = Tiny.MoveTo(500, Tiny.point(oldSprite.getPositionX(), oldSprite.getPositionY() + 40));
                        // oldAction.onComplete = () => {
                        //     this.removeChild(oldSprite);
                        // };
                        // oldSprite.runAction(oldAction);
                        console.log(444);
                        const moveAction = Laya.Tween.to(newSprite, {
                            x: 133 + index * 20,
                            y: 242
                        }, 500);
                        const oldAction = Laya.Tween.to(newSprite, {
                            x: oldSprite.x,
                            y: oldSprite.y + 40
                        }, 500, null, () => {
                            this.removeChild(oldSprite);
                        });
                        console.log(444);
                    }
                });
            }
        }
        syncMileage () {
            this.drawNum('_mileageNumCache', GLOBAL.CONF.MILEAGE, 'sm', {
                x: 467,
                y: 242
            }, 20, true);
        }
    }

    const cache = {};

    class Sound {
        playSfx (sfx, loop = false) {
            if (GLOBAL.CONF.SOUND_ON) {
                // @ts-ignore
                const audio = Laya.SoundManager.playSound(sfx, loop ? 0 : 1);
                audio.autoReleaseSound = false;
                return audio;
            }
        }
        playBg () {
            if (cache.bg) {
                if (GLOBAL.CONF.SOUND_ON) {
                    cache.bg.play();
                }
            } else {
                cache.bg = this.playSfx(RESOURCES['bgOgg'].url, true);
            }
        }
        stopBg (isPause = false) {
            if (cache.bg) {
                cache.bg[isPause ? 'pause' : 'stop']();
            }
        }
        playHit () {
            if (cache.hit) {
                if (GLOBAL.CONF.SOUND_ON) {
                    cache.hit.stop();
                    cache.hit.play();
                }
            } else {
                cache.hit = this.playSfx(RESOURCES['boxhitOgg'].url);
            }
        }
        playHitEmpty () {
            if (cache.hitEmpty) {
                if (GLOBAL.CONF.SOUND_ON) {
                    cache.hitEmpty.stop();
                    cache.hitEmpty.play();
                }
            } else {
                cache.hitEmpty = this.playSfx(RESOURCES['boxhitemptyOgg'].url);
            }
        }
        playJump () {
            if (cache.jump) {
                if (GLOBAL.CONF.SOUND_ON) {
                    cache.jump.stop();
                    cache.jump.play();
                }
            } else {
                cache.jump = this.playSfx(RESOURCES['jumpOgg'].url);
            }
        }
        playGameOver () {
            if (cache.gameOver) {
                if (GLOBAL.CONF.SOUND_ON) {
                    cache.gameOver.play();
                }
            } else {
                cache.gameOver = this.playSfx(RESOURCES['gameoverOgg'].url);
            }
        }
        playCountDown () {
            if (cache.countdown) {
                if (GLOBAL.CONF.SOUND_ON) {
                    cache.countdown.play();
                }
            } else {
                cache.countdown = this.playSfx(RESOURCES['countdownOgg'].url);
            }
        }
    }

    class Girl extends Laya.Animation {
        constructor (who) {
            const preRun = [Tiny.Texture.fromFrame(`tileset-${who}-run_0.png`)];
            super(preRun);
            this._preTextures = this.createTextures(who, 'pre', 0, 2);
            this._runTextures = this.createTextures(who, 'run', 0, 4);
            this._jumpTextures = this.createTextures(who, 'jump', 0, 1);
            this._fallTextures = this.createTextures(who, 'jump', 1, 4);
            this._dieTextures = [`${who}/die.png`];
            this._dieGrayTextures = [`${who}/die_gray.png`];
            this.loadImages(this._preTextures);
            this.interval = 160;
            this.pivot(0, 1);
            this.pos(56, GLOBAL.CONF.GROUND_POS_Y);
            this._girlHeight = this._runTextures[0].height;
            // TODO 优化耦合性
            GLOBAL.CONF.PRIZE_POS_Y = GLOBAL.CONF.GROUND_POS_Y - this._girlHeight * (GLOBAL.CONF.GIRL_JUMP_TIMES + 1) + 30;
            this._jumpHeight = this._girlHeight * GLOBAL.CONF.GIRL_JUMP_TIMES; // 跳起的高度
            this._jumpSpeed = 400;
            this.createJumpAction();
            this.createDieAction();
        }
        createJumpAction () {
            console.log(444);
            this._jumpAction = Laya.Tween.to(
                this,
                {x: 56, y: GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight},
                this._jumpSpeed,
                Laya.Ease.Quadratic.Out,
                () => {
                    GLOBAL.CONF.GIRL_STAT = 2;
                    this._fallAction.resume();
                });
            this._jumpAction.pause();
            this._fallAction = Laya.Tween.to(
                this,
                {x: 56, y: GLOBAL.CONF.GROUND_POS_Y},
                this._jumpSpeed,
                Laya.Ease.Quadratic.In,
                () => {
                    this._timer = Date.now();
                    GLOBAL.CONF.GIRL_STAT = 3;
                    this.loadImages(this._fallTextures);
                });
            this._fallAction.pause();
            console.log(444);
        }
        changeJumpDuration () { // 调整跳起下落的速度
            const conf = GLOBAL.CONF;
            const ratio = ((conf.SPEED / conf.DEFAULT_SPEED) - 1) / 2 + 1; // 保证ratio大于1
            this._jumpAction.duration = this._jumpSpeed / ratio;
            this._fallAction.duration = this._jumpSpeed / ratio;
        }
        createDieAction () {
            this._dieBlink = new Laya.TimeLine();
            this._dieBlink.addLabel('hide').to(this, {visible: false}, 50)
                .addLabel('show').to(this, {visible: true}, 50);
            this._dieBlink.on(Laya.Event.COMPLETE, this, () => {
                this.loadImages(this._dieGrayTextures);
                this.emit('die');
            });
            this._dieBlink.play();
            console.log(444);
            this._dieMoveStart = Laya.Tween.to(
                this,
                {x: 46, y: GLOBAL.CONF.GROUND_POS_Y - 30}, 
                150,
                null,
                () => {
                    this._dieMoveEnd.resume();
                });
            this._dieMoveStart.pause();
            this._dieMoveEnd = Laya.Tween.to(
                this,
                {x: 36, y: GLOBAL.CONF.GROUND_POS_Y}, 
                150);
            this._dieMoveEnd.pause();
            console.log(444);
        }
        createTextures (who, action, start, length) {
            const textures = new Laya.Animation();
            textures.loadImages(this.aniUrls(`${who}/${action}_`, start, length));
            return textures;
        }
        aniUrls(name, start, num) {
            var urls = [];
            for(var i = start;i < num;i++){
                //动画资源路径要和动画图集打包前的资源命名对应起来
                urls.push(name + i + ".png");
            }
            return urls;
        }
        readyStart () { // 预备开始，主要是倒计时开始的时候用
            this.emit('notRun');
            this.pos(56, GLOBAL.CONF.GROUND_POS_Y);
            GLOBAL.CONF.GIRL_STAT = -1;
            this.loadImages(this._preTextures);
            this.interval = 160;
        }
        startRun () {
            GLOBAL.CONF.GIRL_STAT = 0;
            this.loadImages(this._runTextures);
            this.interval = 100;
            this.emit('run');
        }
        doJump () {
            if (GLOBAL.CONF.GIRL_STAT !== 1 && GLOBAL.CONF.GIRL_STAT !== 2) {
                GLOBAL.CONF.GIRL_STAT = 1;
                this.emit('notRun');
                Sound.playJump();
                this.loadImages(this._jumpTextures);
                this.runAction(this._jumpAction);
            }
        }
        beInjured () {
            GLOBAL.CONF.GIRL_STAT = -1;
            this.emit('notRun');
            Sound.playGameOver();
            this.loadImage([this._runTextures[0]]);
            this.removeActionsTrace();
            this.runAction(Tiny.Repeat(3, this._dieBlink));
            this._dieMoveStart.resume();
        }
        freeze () {
            this.removeActionsTrace();
            this.stop();
        }
        resume () {
            this.play();
            if (GLOBAL.CONF.GIRL_STAT === 2) {
                const currentDis = GLOBAL.CONF.GROUND_POS_Y - this.getPositionY();
                const speed = this._jumpSpeed * currentDis / this._jumpHeight;
                console.log(444);
                const moveAction = new Laya.Tween.to(
                    this,
                    {x: 56, y: GLOBAL.CONF.GROUND_POS_Y},
                    speed,
                    Laya.Ease.QuadIn,
                    () => {
                        this._timer = Date.now();
                        GLOBAL.CONF.GIRL_STAT = 3;
                        this.loadImages(this._fallTextures);
                    });
                console.log(444);
                // this.runAction(moveAction);
            } else if (GLOBAL.CONF.GIRL_STAT === 1) {
                const currentDis = this.y - (GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight);
                const speed = (this._jumpSpeed - 100) * currentDis / this._jumpHeight;
                console.log(444);
                const jumpAction = new Laya.Tween.to(
                    this,
                    {x: 56, y: GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight},
                    speed,
                    Laya.Ease.QuadOut,
                    () => {
                        GLOBAL.CONF.GIRL_STAT = 2;
                        this._fallAction.resume;
                    });
                console.log(444);
                // this.runAction(jumpAction);
            }
        }
        updateTransform () {
            if (GLOBAL.CONF.MODE === GLOBAL.MODES.PLAYING && GLOBAL.CONF.GIRL_STAT === 3) {
                if (Date.now() - this._timer >= 100000 / 6 / this.interval ) {
                    this.emit('run');
                    this.loadImages(this._runTextures);
                    GLOBAL.CONF.GIRL_STAT = 0;
                }
            }
            this.containerUpdateTransform();
        }
    }

    class PrizeBox extends Laya.Sprite {
        constructor () {
            const defaultTexture = 'other/tv.png';
            super();
            this.loadImage(defaultTexture);
            this._tv = defaultTexture;
            this._heart = 'other/heart.png';
            this._empty = false;
            this.pivot(0, 1);
            this.y = 0;
            console.log(444);
            this._moveUp = Laya.Tween.to(this, {y: 10}, 80, null, () => {
                this.y = 0;
            });
            this._moveDown = Laya.Tween.to(this, {y: 10}, 80, null, () => {
                this.y = 10;
            }, 80);
            console.log(444);
        }
        playAnime () {
            this._moveUp.resume();
        }
        stopAnime () {
            this._moveUp.pause();
            this._moveDown.pause();
        }
    }

    // 顶中空气屁的动画
    class EmptyFart extends Laya.Sprite {
        constructor() {
            super();
            this.loadImage(`other/tvempty.png`);
            this.pivot(0.5, 1);
            this.pos(200, GLOBAL.CONF.PRIZE_POS_Y - 140);
            this._fadeAction = Laya.Tween.to(this, {alpha: 0}, 500, null, () => {
                this.alpha = 1;
            });
            this._fadeAction.pause();
            this._moveAction = Laya.Tween.to(this, {x: 200, y: GLOBAL.CONF.PRIZE_POS_Y - 190}, 500, null, () => {
                this.y = GLOBAL.CONF.PRIZE_POS_Y - 140;
                this.visible = false;
            });
            this._moveAction.pause();
            this.scale(1.5, 1.5);
            this.visible = false;
        }
        playAnime () {
            this.visible = true;
            this._moveAction.resume();
            this._fadeAction.resume();
        }
    }

    class EnemyBox extends Laya.Animation {
        constructor (item) {
            const textures = [];
            for (let i = 0; i < item.frames; i++) {
                textures.push(`barrier/${item.name}_${i}.png`);
            }
            super();
            this.loadImages(textures);
            this.pivot(0, 1);
            this._inview = false;
            this._name = item.name;
            if (item.points) {
                this._points = item.points;
            }
            this.interval = item.interval;
        }
    }

    class CrashScene extends Laya.Scene {
        constructor () {
            super();
            this._isFirstEmpty = GLOBAL.DATA.OPEN_CHANCE !== 0;
            this._place = 'forest'; // 场景
            this._enemyItems = GLOBAL.ENEMY_CONF[this._place].items.slice(); // 场景下有哪些障碍物
        }
        init () {
            this.removeChildren();
            this._enemyCache = []; // 渲染的障碍物
            this._prizeCache = []; // 渲染的奖品箱
            // 初始化障碍
            const randomItem = this.randomEnemyItem();
            const enemy = new EnemyBox(randomItem);
            enemy.play();
            enemy.pivot(0, 1);
            enemy.pos(Tiny.WIN_SIZE.width * 3, GLOBAL.CONF.GROUND_POS_Y);
            this.addChild(enemy);
            this._enemyCache.push(enemy);

            const animeTextures = [];
            for (let i = 1; i < 29; i++) {
                animeTextures.push(`hit/hit_${i}.png`);
            }
            this._prizeAnime = new Laya.Animation();
            this._prizeAnime.loadImages(animeTextures);
            this._prizeAnime.onLoop = () => {
                this._prizeAnime.stop();
            };
            this._prizeAnime.interval = 42;
            this._prizeAnime.pos(14, 186);
            this.addChild(this._prizeAnime);
            this._emptyFart = new EmptyFart();
            this.addChild(this._emptyFart);
        }
        changePlace (place) {
            if (this._place !== place && GLOBAL.ENEMY_CONF[place]) {
                this._place = place;
                this._enemyItems = GLOBAL.ENEMY_CONF[this._place].items.slice();
            }
        }
        addNext () { // 当有障碍进入可视区域时，提前添加下一个障碍
            const randomInterval = this.getRandom(Tiny.WIN_SIZE.width * 1.5, Tiny.WIN_SIZE.width * 2.5); // 每个障碍物之间的间隔，一屏到三屏之间随机
            // @ts-ignore
            const checkPlace = this.parent._background.checkPosPlace(randomInterval);
            this.changePlace(checkPlace);
            const randomItem = this.randomEnemyItem();
            const enemy = new EnemyBox(randomItem);
            enemy.play();
            enemy.pos(Laya.stage.width + randomInterval, GLOBAL.CONF.GROUND_POS_Y);
            this._enemyCache.push(enemy);
            this.addChild(enemy);
            this.addRandomPrize(enemy);
        }
        removeEnemy () { // 当有障碍移出可视区域时，将障碍从缓存中移除
            const enemy = this._enemyCache[0];
            this._enemyCache.splice(0, 1);
            this.removeChild(enemy);
        }
        removePrize () { // 移除第一个
            const prize = this._prizeCache[0];
            prize.stopAnime();
            this._prizeCache.splice(0, 1);
            this.removeChild(prize);
        }
        startAnime () {
            this._enemyCache.forEach(enemy => {
                enemy.play();
            });
        }
        stopAnime () {
            this._enemyCache.forEach(enemy => {
                enemy.stop();
            });
        }
        randomEnemyItem () {
            this._enemyItems = this._enemyItems.length === 0 ? GLOBAL.ENEMY_CONF[this._place].items.slice() : this._enemyItems;
            const index = this.getRandom(0, this._enemyItems.length - 1);
            const item = this._enemyItems.splice(index, 1);
            return item[0];
        }
        getRandom(val1, val2) {
            var random = Math.random();
            return val1 + Math.floor((val2 - val1 + 1) * random);

        }
        addRandomPrize (enemy) {
            const arr = [1, 1, 0, 1];
            const needAdd = arr[this.getRandom(0, 3)];
            if (needAdd) {
                // 限制奖品箱子出现的范围
                const prevEnemy = this._enemyCache[this._enemyCache.length - 2];
                const startPos = prevEnemy.x;
                const randomPos = this.getRandom(startPos, enemy.getPositionX() - 500);
                const prizeBox = new PrizeBox();
                if (GLOBAL.DATA.OPEN_CHANCE > 0) { // 有奖品的箱子
                    prizeBox.pos(randomPos, GLOBAL.CONF.PRIZE_POS_Y);
                    this.addChild(prizeBox);
                    this._prizeCache.push(prizeBox);
                } else { // 空气屁箱子
                    prizeBox._empty = true;
                    prizeBox.setPosition(randomPos, GLOBAL.CONF.PRIZE_POS_Y);
                    this.addChild(prizeBox);
                    this._prizeCache.push(prizeBox);
                }
            }
        }
        hitPrize (prize, callback) {
            prize.destroyed = true;
            prize.loadImage(prize._heart);
            prize.playAnime();
            if (prize._empty) {
                Sound.playHitEmpty();
                this._emptyFart.playAnime();
                if (this._isFirstEmpty && !GLOBAL.DATA.NO_INVENTORY && !GLOBAL.DATA.OPEN_CHANCE && GLOBAL.DATA.STATUS === 2) {
                    this._isFirstEmpty = false;
                    this.emit('noChance');
                }
                callback && callback();
            } else {
                window.kfcMario && window.kfcMario.drawLottery && window.kfcMario.drawLottery(drawed => {
                    if (drawed) {
                        Sound.playHit();
                        GLOBAL.CONF.HIT++;
                        this._prizeAnime.stop();
                        this._prizeAnime.play();
                    } else {
                        prize._empty = true;
                        Sound.playHitEmpty();
                        this._emptyFart.playAnime();
                    }
                    callback && callback(true);
                });
                
            }
        }
    }

    class HeaderScene extends Laya.Scene {
        constructor () {
            super();
            this._remainBox = GLOBAL.DATA.DISPLAY_CHANCE;
            this._prizeNumCache = [];
            this._recordAllNumCache = [];
            this._recordSelfNumCache = [];
            this.drawPrizeTotal();
            this.drawRank();
        }
        drawNum (cacheKey, num, size = 'lg', pos, interval = 28, reverse = false) {
            this[cacheKey].forEach(sprite => {
                this.removeChild(sprite);
            });
            this[cacheKey] = [];
            const numArr = num.toString().split('');
            if (reverse) {
                numArr.reverse();
            }
            numArr.forEach((item, index) => {
                const sprite = new Laya.Sprite();
                sprite.loadImage(`num/${size}_${item}.png`);
                // @ts-ignore
                sprite._num = Number(item);
                sprite.pivot(0.5, 1);
                if (reverse) {
                    sprite.pos(pos.x - index * (interval), pos.y);
                } else {
                    sprite.pos(pos.x + index * (interval), pos.y);
                }
                this[cacheKey].push(sprite);
                this.addChild(sprite);
            });
        }
        drawPrizeTotal () {
            if (!GLOBAL.DATA.IS_LOGIN) {
                const avatar = new Laya.Sprite();
                avatar.loadImage('other/noface.png');
                avatar.autoSize = true;
                avatar.pivot(0, 0);
                avatar.pos(60, 60);
                avatar.mouseEnabled = true;
                this.addChild(avatar);
                const login = new Laya.Sprite();
                login.loadImage(`other/login.png`);
                login.autoSize = true;
                login.pivot(0, 1);
                login.pos(60, 146);
                login.mouseEnabled = true;
                avatar.on(Laya.Event.CLICK, this, (event) => {
                    // event.data.originalEvent.preventDefault();
                    window.kfcMario && window.kfcMario.goToLogin && window.kfcMario.goToLogin();
                });
                login.on(Laya.Event.CLICK, this, (event) => {
                    // event.data.originalEvent.preventDefault();
                    window.kfcMario && window.kfcMario.goToLogin && window.kfcMario.goToLogin();
                });
                this.addChild(login);
            }
            const bg = new Laya.Sprite();
            bg.loadImage(`icons/header_left.png`);
            bg.autoSize = true;
            bg.pivot(0, 0);
            bg.pos(40, 44);
            this.addChild(bg);
            const x = new Laya.Sprite();
            x.loadImage(`num/lg_x.png`);
            x.autoSize = true;
            x.pivot(0, 1);
            x.pos(175, 94);
            this.addChild(x);
            this.reset();
        }
        drawRank () {
            const bgOne = new Laya.Sprite();
            bgOne.loadImage(`icons/best_global.png`);
            bgOne.autoSize = true;
            bgOne.pivot(0, 0);
            bgOne.pos(366, 44);
            this.addChild(bgOne);
            const bgTwo = new Laya.Sprite();
            bgTwo.loadImage(`icons/best_personal.png`);
            bgTwo.autoSize = true;
            bgTwo.pivot(0, 0);
            bgTwo.pos(366, 116);
            this.addChild(bgTwo);
            const m = new Laya.Sprite();
            m.loadImage(`num/sm_m.png`);
            m.pivot(0, 1);
            m.pos(678, 80);
            this.addChild(m);
            const mPersonal = new Laya.Sprite();
            mPersonal.loadImage(`num/sm_m.png`);
            mPersonal.pivot(0, 1);
            mPersonal.pos(678, 153);
            this.addChild(mPersonal);
            this.syncRecord();
        }
        releaseOneBox () {
            if (this._remainBox > 0) {
                const oldValue = this._remainBox.toString();
                const newValue = (--this._remainBox).toString();
                if (newValue.length < oldValue.length) {
                    this.reset();
                } else {
                    const newArr = newValue.split('');
                    const oldArr = oldValue.split('');
                    newArr.forEach((item, index) => {
                        if (item !== oldArr[index]) {
                            const newSprite = new Laya.Sprite();
                            newSprite.loadImage(`num/lg_${item}.png`);
                            newSprite.pivot(0.5, 1);
                            newSprite.pos(207 + index * 28, 44);
                            this.addChild(newSprite);
                            const oldSprite = this._prizeNumCache[index];
                            this._prizeNumCache.splice(index, 1, newSprite);
                            console.log(444);
                            Laya.Tween.to(newSprite, {
                                x: 207 + index * 28,
                                y: 94
                            }, 500);
                            Laya.Tween.to(oldSprite, {
                                x: oldSprite.x,
                                y: oldSprite.y + 50
                            }, 500, null, () => {
                                console.log(this);
                                this.removeChild(oldSprite);
                            });
                            console.log(444);
                        }
                    });
                }
            }
        }
        reset (remainBox) {
            this._remainBox = remainBox === undefined ? GLOBAL.DATA.DISPLAY_CHANCE : remainBox;
            this.drawNum('_prizeNumCache', this._remainBox, 'lg', {x: 207, y: 94});
        }
        syncRecord () {
            this.drawNum('_recordAllNumCache', GLOBAL.DATA.ALL_RECORD, 'sm', {x: 665, y: 80}, 20, true);
            this.drawNum('_recordSelfNumCache', GLOBAL.DATA.SELF_RECORD, 'sm', {x: 665, y: 153}, 20, true);
        }
    }

    class CountDownScene extends Laya.Scene {
        constructor () {
            super();
            this._initScale = 2.5;
            this.drawSprite('_three', 'start_3');
            this.drawSprite('_two', 'start_2');
            this.drawSprite('_one', 'start_1');
            this.drawSprite('_ready', 'start_ready');
            this.drawSprite('_go', 'start_go');
            this.initAnime();
        }
        start () {
            this._countDown.start();
        }
        drawSprite (key, name) {
            this[key] = new Laya.Sprite();
            this[key].loadImage(`icons/${name}.png`);
            this[key].pivot(0.5, 0.5);
            this[key].scale(this._initScale, this._initScale);
            this[key].pos(375, 600);
            this[key].visible = false;
            this.addChild(this[key]);
        }
        initAnime () {
            const that = this;
            this['_go'].scale(this._initScale, this._initScale);
            that['_go'].visible = true;
            console.log(444);
            this._goAnime = Laya.Tween.to(that['_go'], {
                scaleX: 1,
                scaleY: 1
            }, 1000, Laya.Ease.quintOut, function () {
                that['_go'].visible = false;
                this.scale(that._initScale, that._initScale);
                // 倒计时结束事件
                that.emit('done');
            }, 4000);
            this['_ready'].visible = true;
            this._readyAnime = Laya.Tween.to(that['_ready'], {
                scaleX: 1,
                scaleY: 1
            }, 1000, Laya.Ease.quintOut, function () {
                that['_ready'].visible = false;
                this.scale(that._initScale, that._initScale);
                // that._goAnime.restart();
            }, 3000);
            that['_one'].visible = true;
            this._oneAnime = Laya.Tween.to(that['_one'], {
                scaleX: 1,
                scaleY: 1
            }, 1000, Laya.Ease.quintOut, function () {
                that['_one'].visible = false;
                this.scale(that._initScale);
                // that._readyAnime.restart();
            }, 2000);
            that['_two'].visible = true;
            this._twoAnime = Laya.Tween.to(that['_two'], {
                scaleX: 1,
                scaleY: 1,
            }, 1000, Laya.Ease.quintOut, function () {
                that['_two'].visible = false;
                this.scale(that._initScale, that._initScale);
                // that._oneAnime.restart();
            }, 1000);
            that['_three'].visible = true;
            this._countDown = Laya.Tween.to(that['_three'], {
                scaleX: 1,
                scaleY: 1
            }, 1000, Laya.Ease.quintOut, function () {
                that['_three'].visible = false;
                this.scale(that._initScale, that._initScale);
            });
            console.log(444);
        }
    }

    const Util = {
        webp: (function() {
            try {
                return (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0);
            } catch (err) {
                return false;
            }
        })(),
        blackList: ['MI NOTE LTE Build/MMB29M'],
        cookie (name, value, options) {
            if (typeof value !== 'undefined') {
                options = options || {};
                if (value === null) {
                    value = '';
                    options.expires = -1;
                }
                let expires = '';
                if (options.expires && (typeof options.expires === 'number' || options.expires.toUTCString)) {
                    let date;
                    if (typeof options.expires === 'number') {
                        date = new Date();
                        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                    } else {
                        date = options.expires;
                    }
                    expires = '; expires=' + date.toUTCString();
                }
                const path = options.path ? '; path=' + (options.path) : '';
                const domain = options.domain ? '; domain=' + (options.domain) : '';
                const secure = options.secure ? '; secure' : '';
                document.cookie = [ name, '=', encodeURIComponent(value), expires, path, domain, secure ].join('');
            } else {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[ i ].replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }
        },
        trimHttp (url) {
            return url ? url.replace(/^http(s)?:/, '') : '';
        },
        webpImage (url, w, h, c = false) {
            if (!url) {
                return url;
            }
            const suffix = url.match(/(.*\.(jpg|jpeg|gif|png))(\?.*)?/);
            // 路径是否包含/bfs/
            const isBfs = url.indexOf('/bfs/') !== -1;
            // 是否是GIF图片
            if (!suffix || suffix[2] === 'gif' || !isBfs) {
                return this.trimHttp(url);
            }
            // 裁剪规则
            w = Math.ceil(w);
            h = Math.ceil(h);
            let cut = w && h ? `@${w}w_${h}h` : (w ? `@${w}w` : (h ? `@${h}h` : '@'));
            if (c) {
                cut += '_1c';
            }
            // 图片后参数 比如视频动态图
            const args = suffix[3] ? suffix[3] : '';
            if (this.webp) {
                return this.trimHttp(`${suffix[1]}${cut}.webp${args}`);
            } else {
                return this.trimHttp(`${suffix[1]}${cut}.${suffix[2]}${args}`);
            }
        },
        getQueryString (name, hasParams = false) {
            var reg = new RegExp('(^|&|#)' + name + '=([^&]*)(&|$)', 'i');
            let r = location.hash.match(reg) || window.location.search.slice(1).match(reg);
            return r == null ? (hasParams ? null : '') : decodeURI(r[2]);
        },
        ver: (function (u) {
            u = u === undefined ? window.navigator.userAgent : u;
            let uaList = u.split('BiliApp/')[1] || '';
            let verStr = uaList.split(' ')[0] || '';
            let ver = isNaN(Number(verStr)) ? 0 : Number(verStr);
            let isIos = (/\(i[^;]+;( U;)? CPU.+Mac OS X/i).test(u);
            let isAndroid = (/Android/i).test(u) || (/Linux/i).test(u);
            let matchSafari = u.match(/Version\/(\d+)/) || [];
            let matchOs = u.match(/OS\s(\d+)/) || [];
            let matchAndroid = u.match(/Android\s(\d+)/) || [];
            return u ? {
                ios: isIos, // ios终端
                android: isAndroid, // android终端或者uc浏览器
                iPhone: (/iPhone/i).test(u), // 是否为iPhone
                osCheck (check, ver) {
                    if (check === 'gt') {
                        return matchOs[1] > ver || matchSafari[1] > ver;
                    } else if (check === 'lt') {
                        return matchOs[1] < ver || matchSafari[1] < ver;
                    } else if (check === 'gte') {
                        return matchOs[1] >= ver || matchSafari[1] >= ver;
                    } else if (check === 'lte') {
                        return matchOs[1] <= ver || matchSafari[1] <= ver;
                    }
                },
                androidCheck (check, ver) {
                    if (check === 'gt') {
                        return matchAndroid[1] && matchAndroid[1] > ver;
                    } else if (check === 'lt') {
                        return matchAndroid[1] && matchAndroid[1] < ver;
                    } else if (check === 'gte') {
                        return matchAndroid[1] && matchAndroid[1] >= ver;
                    } else if (check === 'lte') {
                        return matchAndroid[1] && matchAndroid[1] <= ver;
                    }
                },
                ios9: (/iPhone OS\ 9_/i).test(u),
                iPad: (/iPad/i).test(u), // 是否iPad
                bili: (/bili/i).test(u),
                biliVer: ver
            } : {};
        })(),
        getScrollTop(element = window) {
            if (element === window) {
                return Math.max(window.pageYOffset || 0, window.document.documentElement.scrollTop || window.document.body.scrollTop);
            } else {
                // @ts-ignore
                return element.scrollTop;
            }
        },
        jumpToTop (scrollTop = 0) {
            if (document.documentElement.scrollTop !== 0) {
                document.documentElement.scrollTop = scrollTop;
            } else {
                document.body.scrollTop = scrollTop;
            }
        }
    };

    const storage = {
        support: (function () {
            try {
                window.localStorage.setItem('storage', '');
                window.localStorage.removeItem('storage');
            } catch (e) {
                if (e.name === 'SECURITY_ERR' || e.name === 'QuotaExceededError') {
                    console.warn('Warning: localStorage isn\'t enabled. Please confirm browser cookie or privacy option');
                }
                return false;
            }
            return true;
        })(),
        get (key) {
            if (this.support) {
                return window.localStorage.getItem(key);
            } else {
                return Util.cookie(key);
            }
        },
        set (key, value) {
            if (this.support) {
                window.localStorage.setItem(key, value);
            } else {
                Util.cookie(key, value);
            }
        }
    };

    Util.storage = storage;

    const alias = 'dialog/';

    class PauseScene extends Laya.Scene {
        constructor () {
            super();
            this._bg = new Laya.Sprite();
            this._bg.loadImage(RESOURCES['dialogBg'].url);
            this._bg.pivot(0, 0);
            this._bg.pos(20, 192);
            this.addChild(this._bg);
            this._stop = new Laya.Sprite();
            this._stop.loadImage(`${alias}btn_stop.png`);
            this._stop.pivot(0, 0);
            this._stop.pos(204, 732);
            this._stop.mouseEnabled = true;
            this._stop.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    this.close();
                    this.emit('stop');
                }
            });
            this.addChild(this._stop);
            this._resume = new Laya.Sprite();
            this._resume.loadImage(`${alias}btn_resume.png`);
            this._resume.pivot(0, 0);
            this._resume.pos(438, 732);
            this._resume.mouseEnabled = true;
            this._resume.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    this.close();
                    this.emit('resume');
                }
            });
            this.addChild(this._resume);
            const museTexture = 'tileset-icons-btn_muse.png';
            const soundTexture = 'tileset-icons-btn_sound.png';
            this._muse = new Laya.Sprite();
            this._muse.loadImage(GLOBAL.CONF.SOUND_ON ? soundTexture : museTexture);
            // @ts-ignore
            this._muse._museTexture = museTexture;
            // @ts-ignore
            this._muse._soundTexture = soundTexture;
            this._muse.pivot(0, 0);
            this._muse.pos(565, 1003);
            this._muse.mouseEnabled = true;
            this._muse.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    GLOBAL.CONF.SOUND_ON = !GLOBAL.CONF.SOUND_ON;
                    this._muse.loadImage(GLOBAL.CONF.SOUND_ON ? soundTexture : museTexture);
                    if (GLOBAL.CONF.SOUND_ON) {
                        Sound.playBg();
                    } else {
                        Sound.stopBg(true);
                    }
                }
            });
            this.addChild(this._muse);
            this._help = new Laya.Sprite();
            this._help.loadImage(`${alias}btn_help.png`);
            this._help.pivot(0, 0);
            this._help.pos(658, 1003);
            this._help.mouseEnabled = true;
            this._help.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    window.kfcMario && window.kfcMario.showRules && window.kfcMario.showRules();
                }
            });
            this.addChild(this._help);

            this._angle = new Laya.Sprite();
            this._angle.loadImage(`${alias}angle.png`);
            this._angle.pivot(0.5, 0);
            this._angle.pos(375, 358);
            this._angle.visible = false;
            this.addChild(this._angle);
            const noChance = `${alias}tip_no_change.png`;
            this._tip = new Laya.Sprite();
            this._tip.loadImage(noChance);
            // @ts-ignore
            this._tip._noChance = noChance;
            // @ts-ignore
            this._tip._noAllInventory = `${alias}tip_no_all_inventory.png`;
            // @ts-ignore
            this._tip._noTodayInventory = `${alias}tip_no_today_inventory.png`;
            this._tip.pivot(0.5, 0);
            this._tip.pos(375, 496);
            this._tip.visible = false;
            this.addChild(this._tip);
            this.visible = false;
        }
        show (type) { // 0:no_chance 1:no_all 2:no_today other:pause
            // Tiny.app.view.style['touch-action'] = 'initial';
            // Tiny.app.renderer.plugins.interaction.autoPreventDefault = false;
            if (type === 0) {
                this._angle.visible = true;
                // @ts-ignore
                this._tip.loadImage(this._tip._noChance);
                this._tip.visible = true;
            } else if (type === 1) { // 没有总库存 这个砍掉了，不会走到这里
                this._angle.visible = true;
                // @ts-ignore
                this._tip.loadImage(this._tip._noAllInventory);
                this._tip.visible = true;
            } else if (type === 2) {
                this._angle.visible = true;
                // @ts-ignore
                this._tip.loadImage(this._tip._noTodayInventory);
                this._tip.visible = true;
            }
            // @ts-ignore
            this._muse.loadImage(GLOBAL.CONF.SOUND_ON ? this._muse._soundTexture : this._muse._museTexture);
            this.visible = true;
        }
        close () {
            // Tiny.app.view.style['touch-action'] = 'none';
            // Tiny.app.renderer.plugins.interaction.autoPreventDefault = true;
            this.visible = false;
            this._angle.visible = false;
            this._tip.visible = false;
        }
    }

    const alias$1 = 'dialog';
    class FinishLayer extends Laya.Scene {
        constructor () {
            super();
            // Tiny.app.view.style['touch-action'] = 'initial';
            // Tiny.app.renderer.plugins.interaction.autoPreventDefault = false;
            this._rankList = [];
            const finishBg = new Laya.Sprite();
            finishBg.loadImage(RESOURCES['finishBg'].url);
            finishBg.pivot(0, 0);
            finishBg.pos(16, 187);
            this.addChild(finishBg);
            this._bg = new Laya.Sprite();
            this._bg.loadImage(RESOURCES['dialogBg'].url);
            this._bg.pivot(0, 0);
            this._bg.pos(20, 192);
            this.addChild(this._bg);
            const title = new Laya.Sprite();
            title.loadImage(`${alias$1}act_finish_title.png`);
            title.pivot(0.5, 0);
            title.pos(375, 297);
            this.addChild(title);
            this.drawRank(1);
            this.drawRank(2);
            this.drawRank(3);
            if (GLOBAL.DATA.RANK_SELF && GLOBAL.DATA.RANK_SELF.score) {
                const dash = new Laya.Sprite();
                dash.loadImage(`${alias$1}dash.png`);
                dash.pivot(0.5, 0);
                dash.pos(375, 706);
                this.addChild(dash);
                this.drawRankSelf();
            }

            const frame = new Laya.Sprite();
            frame(RESOURCES['frame'].url);
            frame.pivot(0, 0);
            frame.pos(0, 0);
            this.addChild(frame);
            this._header = new HeaderScene();
            this.addChild(this._header);
            window.kfcMario && window.kfcMario.showRank && window.kfcMario.showRank();
        }
        drawNum (wrapper, num, size = 'sm', pos, interval = 28, reverse = false) {
            const numArr = num.toString().split('');
            if (reverse) {
                numArr.reverse();
            }
            numArr.forEach((item, index) => {
                const sprite = new Laya.Sprite();
                sprite.loadImage(`num/${size}_${item}.png`);
                sprite.pivot(0, 1);
                if (reverse) {
                    sprite.pos(pos.x - index * (interval), pos.y);
                } else {
                    sprite.pos(pos.x + index * (interval), pos.y);
                }
                wrapper.addChild(sprite);
            });
        }
        drawRankSelf () {
            const rankItem = new Laya.Sprite();
            rankItem.loadImage(`${alias$1}rank_bg.png`);
            rankItem.pivot(0.5, 0);
            rankItem.pos(375, 763);
            this.addChild(rankItem);
            if (GLOBAL.DATA.RANK_SELF.rank > 100) {
                const rankIcon = new Laya.Sprite();
                rankIcon.loadImage(`${alias$1}rank_overflow.png`);
                rankIcon.pos(-267, 26);
                rankItem.addChild(rankIcon);
            } else {
                this.drawNum(this, GLOBAL.DATA.RANK_SELF.rank, 'rank', {x: 134, y: 818}, 28);
            }
            let uname = GLOBAL.DATA.RANK_SELF.name || '';
            if (uname) {
                if (GLOBAL.DATA.RANK_SELF.name.replace(/[^\x00-\xff]/g, 'xx').length > 12) {
                    const nameSplit = GLOBAL.DATA.RANK_SELF.name.split('');
                    let length = 0;
                    let tempName = '';
                    const regex = /[^\x00-\xff]/;
                    for (let i = 0; i < nameSplit.length; i++) {
                        length = length + (regex.test(nameSplit[i]) ? 2 : 1);
                        if (length <= 12) {
                            tempName += nameSplit[i];
                        } else {
                            tempName += '...';
                            break;
                        }
                    }
                    uname = tempName;
                }
                const name = new Laya.Text();
                name.text = uname;
                name.fontSize =  24;
                name.bold = true;
                name.color = '#fff';
                name.miterLimit = 50;
                name.pos(-60, 28);
                rankItem.addChild(name);
            }
            if (GLOBAL.DATA.RANK_SELF.score) {
                this.drawNum(rankItem, GLOBAL.DATA.RANK_SELF.score, 'sm', {x: 220, y: 50}, 20, true);
                const m = new Laya.Sprite();
                m.loadImage(`num/sm_m.png`);
                m.pivot(0, 1);
                m.pos(239, 50);
                rankItem.addChild(m);
            }
        }
        drawRank (rank) {
            const rankItem = new Laya.Sprite();
            rankItem.loadImage(`${alias$1}rank_bg.png`);
            rankItem.pivot(0.5, 0);
            rankItem.pos(375, 450 + (rank - 1) * 82);
            const rankEnum = ['one', 'two', 'three'];
            const rankIcon = new Laya.Sprite();
            rankIcon.loadImage(`${alias$1}${rankEnum[rank - 1]}.png`);
            rankIcon.pos(-244, 12);
            rankItem.addChild(rankIcon);
            const data = GLOBAL.DATA.RANK_LIST[rank - 1];
            if (data) {
                let uname = data.name || '';
                if (uname) {
                    if (data.name.replace(/[^\x00-\xff]/g, 'xx').length > 12) {
                        const nameSplit = data.name.split('');
                        let length = 0;
                        let tempName = '';
                        const regex = /[^\x00-\xff]/;
                        for (let i = 0; i < nameSplit.length; i++) {
                            length = length + (regex.test(nameSplit[i]) ? 2 : 1);
                            if (length <= 12) {
                                tempName += nameSplit[i];
                            } else {
                                tempName += '...';
                                break;
                            }
                        }
                        uname = tempName;
                    }
                    const name = new Laya.Text();
                    name.text = uname;
                    name.fontSize = 24;
                    name.bold = true;
                    name.color = '#fff';
                    name.miterLimit = 50;
                    name.pos(-60, 28);
                    rankItem.addChild(name);
                }
                if (data.score && data.score >= 0) {
                    this.drawNum(rankItem, data.score, 'sm', {x: 220, y: 50}, 20, true);
                    const m = new Laya.Sprite();
                    m.loadImage(`num/sm_m.png`);
                    m.pivot(0, 1);
                    m.pos(239, 50);
                    rankItem.addChild(m);
                }
            }
            this.addChild(rankItem);
            this._rankList.push(rankItem);
        }
    }

    const alias$2 = 'dialog/';
    class GameOverScene extends Laya.Scene {
        constructor () {
            super();
            this._numCache = [];
            this._bg = new Laya.Sprite();
            this._bg.loadImage(RESOURCES['dialogBg'].url);
            this._bg.pivot(0, 0);
            this._bg.pos(20, 192);
            this.addChild(this._bg);
            this._titleGameOver = new Laya.Sprite();
            this._titleGameOver.loadImage(`${alias$2}gameover.png`);
            this._titleGameOver.pivot(0.5, 0);
            this._titleGameOver.pos(375, 264);
            this._titleGameOver.visible = false;
            this.addChild(this._titleGameOver);
            this._titleGameFinish = new Laya.Sprite();
            this._titleGameFinish.loadImage(`${alias$2}game_finish_title.png`);
            this._titleGameFinish.pivot(0.5, 0);
            this._titleGameFinish.pos(375, 265);
            this._titleGameFinish.visible = false;
            this.addChild(this._titleGameFinish);
            this._mileage = new Laya.Sprite();
            this._mileage.loadImage(`${alias$2}text_bg.png`);
            this._mileage.pivot(0.5, 0);
            this._mileage.pos(375, 372);
            const mileageTitle = new Laya.Text();
            mileageTitle.text = '本次里程数';
            mileageTitle.fontSize = 24;
            mileageTitle.bold = true;
            mileageTitle.color = '#fff';
            mileageTitle.pos(-160, 14);
            this._mileage.addChild(mileageTitle);
            this.addChild(this._mileage);
            this._breakSelf = new Laya.Sprite();
            this._breakSelf.loadImage(`${alias$2}break.png`);
            this._breakSelf.pivot(0, 0);
            this._breakSelf.pos(526, 320);
            this._breakSelf.visible = false;
            this.addChild(this._breakSelf);
            this._breakAll = new Laya.Sprite();
            this._breakAll.loadImage(`${alias$2}break_all.png`);
            this._breakAll.pivot(0, 0);
            this._breakAll.pos(526, 320);
            this._breakAll.visible = false;
            this.addChild(this._breakAll);
            this._stop = new Laya.Sprite();
            this._stop.loadImage(`${alias$2}btn_stop.png`);
            this._stop.pivot(0, 0);
            this._stop.pos(204, 791);
            this._stop.mouseEnabled = true;
            this._stop.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    this.close();
                    this.emit('stop');
                }
            });
            this._stop.visible = false;
            this.addChild(this._stop);
            this._restart = new Laya.Sprite();
            this._restart.loadImage(`${alias$2}btn_restart.png`);
            this._restart.pivot(0, 0);
            this._restart.pos(439, 791);
            this._restart.mouseEnabled(true);
            this._restart.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    window.kfcMario && window.kfcMario.logger && window.kfcMario.logger('click', {
                        key: 'restart'
                    });
                    this.removeSelf();
                    this.emit('restart');
                }
            });
            this._restart.visible = false;
            this.addChild(this._restart);
            this._rank = new Laya.Sprite();
            this._rank.loadImage(`${alias$2}btn_view_rank.png`);
            this._rank.pivot(0.5, 0);
            this._rank.pos(375, 791);
            this._rank.mouseEnabled = true;
            this._rank.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    this.removeSelf();
                    window.kfcMario && window.kfcMario.refreshRank && window.kfcMario.refreshRank(() => {
                        const finishLayer = new FinishLayer();
                        // @ts-ignore
                        Laya.stage.addChild(finishLayer);
                    });
                }
            });
            this._rank.visible = false;
            this.addChild(this._rank);
            this._submit = new Laya.Sprite();
            this._submit.loadImage(`${alias$2}btn_submit.png`);
            this._submit.pivot(0.5, 0);
            this._submit.pos(375, 822);
            this._submit.mouseEnabled = true;
            this._submit.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    this.close();
                    this.emit('stop');
                }
            });
            this._submit.visible = false;
            this.addChild(this._submit);
            this._share = new Laya.Sprite();
            this._share.loadImage(`${alias$2}btn_share.png`);
            this._share.pivot(0);
            this._share.pos(270, 959);
            this._share.mouseEnabled = true;
            this._share.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    window.kfcMario && window.kfcMario.logger && window.kfcMario.logger('click', {
                        key: 'share'
                    });
                    this.emit('share');
                }
            });
            this.addChild(this._share);
            this._tip = new Laya.Sprite();
            this._tip.loadImage(`other/low_battery_tip.png`);
            this._tip.pivot(0.5, 0);
            this._tip.pos(375, 1100);
            this._tip.visible = false;
            this.addChild(this._tip);
            this.visible = false;
        }
        setCenter () {
            this._titleGameOver.y = 464;
            this._titleGameFinish.y = 465;
            this._mileage.y = (572);
            this._breakSelf.y = 520;
            this._breakAll.y = 520;

            this._stop.y = 691;
            this._restart.y = 691;
            this._rank.y = 691;
            this._submit.y = 722;
            this._share.y = 859;
        }
        setDefault () {
            this._titleGameOver.y = 264;
            this._titleGameFinish.y = 265;
            this._mileage.y = 372;
            this._breakSelf.y = 320;
            this._breakAll.y = 320;

            this._stop.y = 791;
            this._restart.y = 791;
            this._rank.y = 791;
            this._submit.y = 822;
            this._share.y = 959;
        }
        drawNum (wrapper, num, size = 'lg', pos, interval = 28, reverse = false) {
            const numArr = num.toString().split('');
            if (reverse) {
                numArr.reverse();
            }
            numArr.forEach((item, index) => {
                const sprite = new Laya.Sprite();
                sprite.loadImage(`num/${size}_${item}.png`);
                sprite.pivot(0.5, 1);
                if (reverse) {
                    sprite.pos(pos.x - index * (interval), pos.y);
                } else {
                    sprite.pos(pos.x + index * (interval), pos.y);
                    this._numCache.push(sprite);
                }
                wrapper.addChild(sprite);
            });
            if (!reverse) {
                const m = new Laya.Sprite();
                m.loadImage(`num/${size}_m.png`);
                m.pivot(0, 1);
                m.pos(pos.x + (numArr.length - 1) * interval + 13, pos.y);
                wrapper.addChild(m);
                this._numCache.push(m);
            }
        }
        show (info = {}) {
            // Tiny.app.view.style['touch-action'] = 'initial';
            // Tiny.app.renderer.plugins.interaction.autoPreventDefault = false;
            window.kfcMario && window.kfcMario.updateRecord && window.kfcMario.updateRecord(GLOBAL.CONF.MILEAGE);
            if (GLOBAL.CONF.MILEAGE > GLOBAL.DATA.ALL_RECORD) {
                GLOBAL.DATA.ALL_RECORD = GLOBAL.CONF.MILEAGE;
                GLOBAL.DATA.SELF_RECORD = GLOBAL.CONF.MILEAGE;
                this._breakAll.visible = true;
                this.emit('break', 1);
            } else if (GLOBAL.CONF.MILEAGE > GLOBAL.DATA.SELF_RECORD) {
                GLOBAL.DATA.SELF_RECORD = GLOBAL.CONF.MILEAGE;
                this._breakSelf.visible = true;
                this.emit('break', 0);
            }
            if (info.type === 'gameover') {
                this._tip.visible = true;
                this._titleGameOver.visible = true;
                this._stop.visible = true;
                this._restart.visible = true;
            } else if (info.type === 'gamefinish') {
                this._titleGameFinish.visible = true;
                this._rank.visible = true;
            } else if (info.type === 'userexit') {
                this._submit.visible = true;
            }
            this.drawNum(this._mileage, GLOBAL.CONF.MILEAGE, 'sm', {
                x: 0,
                y: 37
            }, 20);
            if (GLOBAL.CONF.HIT === 0) {
                this.setCenter();
            }
            window.kfcMario && window.kfcMario.showLottery && window.kfcMario.showLottery(true);
            this.visible = true;
        }
        close () {
            // Tiny.app.view.style['touch-action'] = 'none';
            // Tiny.app.renderer.plugins.interaction.autoPreventDefault = true;
            this.visible = false;
            this._tip.visible = false;
            this._titleGameOver.visible = false;
            this._titleGameFinish.visible = false;
            this._breakSelf.visible = false;
            this._breakAll.visible = false;
            this._stop.visible = false;
            this._restart.visible = false;
            this._rank.visible = false;
            this._submit.visible = false;
            if (GLOBAL.CONF.HIT === 0) {
                this.setDefault();
            } else {
                window.kfcMario && window.kfcMario.showLottery && window.kfcMario.showLottery(false);
            }
            this._numCache.forEach(item => {
                this._mileage.removeChild(item);
            });
            this._numCache = [];
        }
    }

    class MainLayer extends Laya.Scene {
        constructor (who) {
            super();
            // Tiny.app.view.style['touch-action'] = 'none';
            // Tiny.app.renderer.plugins.interaction.autoPreventDefault = true;
            this._defaultTickerDuration = 500;
            // 全局的定时器
            // @ts-ignore
            this._ticker = Laya.timer.loop(
                this._defaultTickerDuration,
                this,
                () => {
                    GLOBAL.CONF.MILEAGE++;
                    this._statusBar.syncMileage();
                    if (GLOBAL.CONF.MILEAGE % 50 === 0) {
                        this._defaultTickerDuration--;
                        GLOBAL.CONF.SPEED += 0.4;
                        this._girl.changeJumpDuration();
                    }
                }
            );
            this.init(who);
        }
        startRunAction() {
            this.startCountDown();
        }
        init (who) {
            // 背景
            if (GLOBAL.CONF.DEGRADE) {
                this._background = new BackgroundDegrade();
            } else {
                this._background = new BackgroundScene();
            }
            this.addChild(this._background);
            // 状态栏
            this._statusBar = new BarScene();
            this._statusBar.on('pause', () => {
                this.gamePause();
                this._pauseDialog.show();
            });
            this.addChild(this._statusBar);
            // 灰尘
            this._dust = new Laya.Animation();
            this._dust.loadImages(this.aniUrls("other/dust_", 13));
            this._dust.interval = 44;
            this._dust.pivot(1, 1);
            this._dust.pos(120, GLOBAL.CONF.GROUND_POS_Y);
            this._dust.play();
            this._dust.visible = false;
            this.addChild(this._dust);
            // 2233
            this._girl = new Girl(who);
            this._girl.on('notRun', () => {
                this._dust.visible = false;
            });
            this._girl.on('run', () => {
                this._dust.visible = true;
            });
            this._girl.on('die', () => {
                this._dieAnime.visible = true;
                this._dieAnime.play();
            });
            this.addChild(this._girl);
            // 可碰撞内容
            this._crash = new CrashScene();
            this._crash.on('noChance', () => {
                this.gamePause();
                this._pauseDialog.show(0);
            });
            this.addChild(this._crash);
            // 死亡特效
            this._dieAnime = new Laya.Animation();
            this._dieAnime.loadImages(this.aniUrls(`${who}-die_`, 18));
            this._dieAnime.interval = 83;
            this._dieAnime.pivot(0, 1);
            if (who === 'girl22') {
                this._dieAnime.pos(32, GLOBAL.CONF.GROUND_POS_Y + 1);
            } else {
                this._dieAnime.pos(16, GLOBAL.CONF.GROUND_POS_Y + 3);
            }
            this._dieAnime.onLoop = () => {
                this._dieAnime.stop();
                this._dieAnime.visible = false;
                this._gameoverDialog.show({
                    type: 'gameover'
                });
            };
            this._dieAnime.visible = false;
            this.addChild(this._dieAnime);

            // 跳跃按钮
            this._jumpBtn = this.createJumpBtn();
            this.addChild(this._jumpBtn);
            const isFrist = Util.storage.get('bili_mario_gamed') !== 'gamed';
            if (isFrist) { // 加手提示
                const hand = new Laya.Animation();
                hand.loadImages(this.aniUrls('other/hand_', 12));
                hand.pivot(0, 0);
                hand.pos(534, 1050);
                hand.interval = 83;
                hand.play();
                this.addChild(hand);
                this._hand = hand;
            } else {
                // @ts-ignore
                this._jumpBtn._clicked = true;
            }

            // 倒计时
            this._countDown = new CountDownScene();
            this._countDown.on('done', () => {
                GLOBAL.CONF.MODE = GLOBAL.MODES.PLAYING;
                Sound.playBg();
                this._girl.startRun();
                this._crash.startAnime();
                this._ticker.start();
            });
            this.addChild(this._countDown);
            // 外框架
            const frame = new Laya.Sprite();
            frame.loadImage(RESOURCES['frame'].url);
            frame.pivot(0, 0);
            frame.pos(0);
            this.addChild(frame);
            this._header = new HeaderScene();
            this.addChild(this._header);

            // 各种弹层
            this._pauseDialog = new PauseScene();
            this._pauseDialog.on('resume', () => {
                if (GLOBAL.CONF.MODE === GLOBAL.MODES.PAUSED) {
                    GLOBAL.CONF.MODE = GLOBAL.MODES.PLAYING;
                    this._dust.visible = false;
                    this._girl.resume();
                    this._crash.startAnime();
                    this._ticker.start();
                }
            });
            this._pauseDialog.on('stop', () => {
                GLOBAL.CONF.MODE = GLOBAL.MODES.MENU;
                if (GLOBAL.DATA.LOTTERY_LIST.length === 0) {
                    const menuLayer$1 = new menuLayer();
                    // @ts-ignore
                    Laya.stage.addChild(menuLayer$1);
                } else {
                    this._gameoverDialog.show({
                        type: 'userexit'
                    });
                }
            });
            this.addChild(this._pauseDialog);
            this._gameoverDialog = new GameOverScene();
            this._gameoverDialog.on('restart', () => {
                this.startCountDown();
            });
            this._gameoverDialog.on('stop', () => {
                GLOBAL.CONF.MODE = GLOBAL.MODES.MENU;
                const menuLayer$1 = new menuLayer();
                // @ts-ignore
                Laya.stage.addChild(menuLayer$1);
            });
            this._gameoverDialog.on('share', () => {
                window.kfcMario && window.kfcMario.showShare && window.kfcMario.showShare();
            });
            this._gameoverDialog.on('break', type => {
                this._header.syncRecord();
            });
            this.addChild(this._gameoverDialog);
            window.kfcMario.pause = type => {
                this.gamePause();
                this._pauseDialog.show(type);
            };
            window.kfcMario.gameOver = info => {
                this.gamePause();
                GLOBAL.CONF.MODE = GLOBAL.MODES.GAME_OVER;
                this._gameoverDialog.show(info);
            };
        }
        aniUrls(name, num) {
            var urls = [];
            for(var i = 0;i < num;i++){
                //动画资源路径要和动画图集打包前的资源命名对应起来
                urls.push(name + i + ".png");
            }
            return urls;
        }
        startCountDown () {
            window.kfcMario.resetLottery && window.kfcMario.resetLottery();
            GLOBAL.CONF.SPEED = GLOBAL.CONF.DEFAULT_SPEED;
            GLOBAL.CONF.MODE = GLOBAL.MODES.PRE;
            GLOBAL.CONF.HIT = 0;
            GLOBAL.CONF.MILEAGE = 0;
            this._girl.changeJumpDuration();
            this._crash.init();
            this._header.reset();
            this._statusBar.reset();
            this._girl.readyStart();
            this._ticker.duration = this._defaultTickerDuration;
            Sound.playCountDown();
            this._countDown.start();
        }
        createJumpBtn () {
            const btnJump = new Laya.Sprite();
            btnJump.loadImage('icons/btn_jump.png');
            // @ts-ignore
            btnJump._clicked = false;
            btnJump.pivot(0, 0);
            btnJump.pos(94, 1012);
            btnJump.mouseEnabled = true;
            btnJump.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                // @ts-ignore
                if (!btnJump._clicked) {
                    // @ts-ignore
                    btnJump._clicked = true;
                    Util.storage.set('bili_mario_gamed', 'gamed');
                    if (this._hand) {
                        this.removeChild(this._hand);
                        delete this._hand;
                    }
                }
                if (GLOBAL.CONF.MODE === GLOBAL.MODES.PLAYING) {
                    this._girl.doJump();
                }
            });
            return btnJump;
        }
        gamePause () {
            GLOBAL.CONF.MODE = GLOBAL.MODES.PAUSED;
            this._dust.visible = false;
            this._girl.freeze();
            this._crash.stopAnime();
            this._ticker.pause();
        }
        collide (girl, rect) {
            const girlRect = girl.getBounds();
            const collideRect = rect.getBounds();
            girlRect.x += 26;
            girlRect.width -= 40;
            if (rect._points) {
                const pointLength = rect._points.length;
                let hit = false;
                for (let i = 0; i < pointLength; i++) {
                    const point = rect._points[i];
                    const p = new Tiny.Point(point.x + collideRect.x, point.y + collideRect.y);
                    if (collideRect.x > 0 && Tiny.rectContainsPoint(girlRect, p)) {
                        hit = true;
                        break;
                    }
                }
                return hit;
            } else {
                return collideRect.x > 0 && Tiny.rectIntersectsRect(girlRect, collideRect);
            }
        }
        // OVERWRITE
        updateTransform () {
            if (GLOBAL.CONF.MODE === GLOBAL.MODES.PLAYING) {
                const speed = GLOBAL.CONF.SPEED;
                const enemyCache = this._crash._enemyCache;
                const prizeCache = this._crash._prizeCache;
                enemyCache.forEach(enemy => {
                    const enemyPos = enemy.x;
                    const enemyWidth = enemy.getBounds().width;
                    if (!enemy._destroyed && enemyPos <= -enemyWidth * 2) {
                        enemy._destroyed = true;
                        this._crash.removeEnemy();
                    } else if (!enemy._inview && enemyPos < Laya.stage.width) {
                        enemy._inview = true;
                        this._crash.addNext();
                    } else if (!enemy._destroyed) {
                        enemy.x = enemyPos - speed;
                    }
                    if (!enemy._destroyed && GLOBAL.CONF.GIRL_STAT !== -1 && this.collide(this._girl, enemy)) {
                        GLOBAL.CONF.MODE = GLOBAL.MODES.GAME_OVER;
                        this._girl.beInjured();
                        this._crash.stopAnime();
                        this._ticker.stop();
                        Sound.stopBg();
                    }
                });
                prizeCache.forEach(prize => {
                    const prizePos = prize.getPositionX();
                    if (!prize._destroyed && prizePos <= -224) {
                        prize._destroyed = true;
                        this._crash.removePrize();
                    } else if (!prize._destroyed) {
                        prize.setPositionX(prizePos - speed);
                    }
                    if (!prize.destroyed && this.collide(this._girl, prize)) {
                        this._crash.hitPrize(prize, (release) => {
                            if (release) {
                                this._header.releaseOneBox();
                            }
                            if (!prize._empty) {
                                this._statusBar.addPrize();
                            }
                        });
                        
                    }
                });
            }
            this.containerUpdateTransform();
        }
    }

    const alias$3 = 'icons/';
    class menuLayer extends Laya.Scene {
        constructor() {
            super();
            var moveAction = Laya.Tween.to(
                this,
                {x: 375, y: 375},
                800,
                null,
                () => {
                    this.startStoryScroll();
                });
            moveAction.pause();
            window.moveAction = moveAction;
            // moveAction.resume();
            console.log(moveAction, 'moveAction');
            this._choosen = 'girl22';
            this.height = 1144;
            this.width = 750;
            this.drawSetting();
            this.drawRadio();
            this.drawBtns();
            this.drawTips();
            this.drawFrame();
            this._header = new HeaderScene();
            this.addChild(this._header);
            const isFrist = Util.storage.get('bili_mario_visited') !== 'visited';
            if (isFrist) { // 第一次进入页面，加手提示
                var ani = new Laya.Animation();
                ani.interval = 30;			// 设置播放间隔（单位：毫秒）
                // ani.index = 1;				// 当前播放索引	
                ani.pivot(0.5, 0);
                ani.pos(534, 904);
                ani.loadImages(this.aniUrls("other/hand_", 12));
                ani.play();
                this.addChild(ani);
            }
        }

        aniUrls(name, num) {
            var urls = [];
            for(var i = 0;i < num;i++){
                //动画资源路径要和动画图集打包前的资源命名对应起来
                urls.push(name + i + ".png");
            }
            console.log(urls, 'urls');
            return urls;
        }
        drawTips () {
            const sprite = new Laya.Sprite();
            sprite.pivot(0, 0);
            sprite.pos(20, 192);
            if (GLOBAL.DATA.STATUS === 1) {
                sprite.loadImage(`${alias$3}tip_bg.png`);
                const text = new Laya.Text();
                text.text = GLOBAL.DATA.ACT_START_TIME;
                text.fontSize =  32;
                text.bold = true;
                text.color = '#ffffff';
                // text.dropShadow = true,
                // text.dropShadowColor = 0xd98a0b,
                // text.dropShadowDistance = 2
                text.pivot(0, 0);
                text.x = 355;
                text.y = 6;
                this.addChild(text);
                const icon = new Laya.Sprite();
                icon.loadImage(`${alias$3}tip_horn.png`);
                icon.pos(310 - text.width / 2, 6);
                this.addChild(icon);
                this.addChild(sprite);
            } else if (GLOBAL.DATA.NO_INVENTORY) {
                sprite.loadImage(`${alias$3}tip_no_${GLOBAL.DATA.NO_INVENTORY}_inventory.png`);
                this.addChild(sprite);
            } else if (GLOBAL.DATA.OPEN_CHANCE === 0) {
                sprite.loadImage(`${alias$3}tip_no_prize.png`);
                this.addChild(sprite);
            }
        }
        drawRadio () {
            const anime22 = new Laya.Animation();
            anime22.loadImages(this.aniUrls("girl22/choose_", 5));
            anime22.pos(-87, -70);
            anime22.interval = 200;
            this._radio22 = new GrilRadio(anime22, true);
            this._radio22.pos(240, 736);
            this._radio22.mouseEnabled = true;
            this._radio22.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    this._choosen = 'girl22';
                    this._radio33.click(false);
                    this._radio22.click(true);
                }
            });
            this.addChild(this._radio22);
            const anime33 = new Laya.Animation();
            anime33.loadImages(this.aniUrls("girl33/choose_", 5));
            anime33.pos(-67, -70);
            anime33.interval = 200;
            this._radio33 = new GrilRadio(anime33, false);
            this._radio33.pos(507, 736);
            this._radio33.mouseEnabled = true;
            this._radio33.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    this._choosen = 'girl33';
                    this._radio22.click(false);
                    this._radio33.click(true);
                }
            });
            this.addChild(this._radio33);
        }

        drawSetting () { // 背景图&故事背景
            const textBg = new Laya.Sprite();
            textBg.loadImage(`${alias$3}text_bg.png`);
            textBg.autoSize = true;
            textBg.pivot(0.5, 1);
            textBg.pos(375, 588);
            this.addChild(textBg);
            this._storySetting = new Laya.Sprite();
            this._storySetting.loadImage(RESOURCES['storySetting'].url);
            this._storySetting.autoSize = true;
            this._storySetting.pivot(0.5, 0);
            this._storySetting.pos(375, 548);
            const copy = new Laya.Sprite();
            copy.loadImage(RESOURCES['storySetting'].url);
            copy.autoSize = true;
            copy.pos(-239.5, 308);
            this.addChild(copy);
            this.addChild(this._storySetting);
            this.startStoryScroll();
            const menuBg = new Laya.Sprite();
            menuBg.loadImage(RESOURCES['menuBg'].url);
            menuBg.pivot(0, 0);
            menuBg.pos(20, 192);
            this.addChild(menuBg);
        }
        startStoryScroll () {
            const currentPos = this._storySetting.y;
            const posY = currentPos - 44;
            console.log(444);
            const stopAction = Laya.Tween.to(
                this._storySetting,
                {x: 375, y: currentPos},
                1000,
                null,
                Laya.Handler.create(() => {
                    moveAction.resume();
                }));
            window.stopAction = stopAction;
            console.log(stopAction, 'stopAction');
            const moveAction = Laya.Tween.to(
                this._storySetting,
                {x: 375, y: posY},
                800,
                null,
                () => {
                    if (currentPos <= 284) {
                        this._storySetting.y = 548;
                    }
                    this.startStoryScroll();
                });
            moveAction.pause();
            console.log(444);
        }
        drawFrame () {
            let logo = new Laya.Animation();
            logo.loadImages(this.aniUrls('logo/logo_', 26));
            logo.interval = 160;
            logo.pivot(0, 0);
            logo.pos(55, 277);
            logo.play();
            this.addChild(logo);
            const frame = new Laya.Sprite();
            frame.loadImage(RESOURCES['frame'].url);
            frame.pivot(0, 0);
            frame.pos(0, 0);
            this.addChild(frame);
        }
        drawBtns () {
            this._btnStart = new Laya.Sprite();
            console.log(GLOBAL.DATA.STATUS, 'GLOBAL.DATA.STATUS');
            if (GLOBAL.DATA.STATUS === 1) {
                this._btnStart.loadImage(`${alias$3}btn_start_gray.png`);
            } else if (GLOBAL.DATA.NO_INVENTORY) {
                this._btnStart.loadImage(`${alias$3}btn_start_ease.png`);
            } else if (GLOBAL.DATA.OPEN_CHANCE === 0) {
                this._btnStart.loadImage(`${alias$3}btn_try.png`);
            } else {
                const anime = new Laya.Animation();
                anime.loadImages(this.aniUrls("other/btn_start_", 20));
                anime.interval = 80;
                anime.pos(281, 15);
                anime.play();
                anime.pivot(0.5, 0);
                this.addChild(anime);
            }
            this._btnStart.pivot(0, 0);
            this._btnStart.pos(94, 867);
            this._btnStart.mouseEnabled = true;
            this._btnStart.on(Laya.Event.CLICK, this, this.onReady);
            this.addChild(this._btnStart);
            this._btnRule = new Laya.Sprite();
            this._btnRule.loadImage(`${alias$3}btn_rule.png`);
            this._btnRule.pivot(0, 0);
            this._btnRule.pos(94, 1003);
            this._btnRule.mouseEnabled = (true);
            this._btnRule.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    window.kfcMario && window.kfcMario.showRules && window.kfcMario.showRules();
                }
            });
            this.addChild(this._btnRule);

            const museTexture = new Laya.Sprite();
            museTexture.loadImage(`${alias$3}btn_muse_large.png`);
            const soundTexture = new Laya.Sprite();
            soundTexture.loadImage(`${alias$3}btn_sound_large.png`);
            if (GLOBAL.CONF.SOUND_ON) {
                Sound.playBg();
            }
            this._btnMuse = new Laya.Sprite(GLOBAL.CONF.SOUND_ON ? soundTexture : museTexture);
            this._btnMuse.pivot(0, 0);
            this._btnMuse.pos(650, 766);
            this._btnMuse.mouseEnabled = true;
            this._btnMuse.on(Laya.Event.CLICK, this,(event) => {
                event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    GLOBAL.CONF.SOUND_ON = !GLOBAL.CONF.SOUND_ON;
                    this._btnMuse.texture = GLOBAL.CONF.SOUND_ON ? soundTexture : museTexture;
                    if (GLOBAL.CONF.SOUND_ON) {
                        Sound.playBg();
                    } else {
                        Sound.stopBg(true);
                    }
                }
            });
            this.addChild(this._btnMuse);
        }
        onReady (event) {
            // event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                if (GLOBAL.DATA.STATUS !== 1) {
                    if (GLOBAL.DATA.IS_LOGIN) {
                        Util.jumpToTop();
                        Util.storage.set('bili_mario_visited', 'visited');
                        Sound.stopBg();
                        window.kfcMario && window.kfcMario.logger && window.kfcMario.logger('click', {
                            key: 'start',
                            score: GLOBAL.DATA.OPEN_CHANCE,
                            mid: GLOBAL.DATA.MID
                        });
                        const startLayer = new MainLayer(this._choosen);
                        startLayer.on('transitionend', () => {
                            startLayer.startRunAction();
                        });
                        Laya.stage.addChild(startLayer);
                        this.removeSelf();
                        startLayer.emit('transitionend');
                        GLOBAL.CONF.MODE = GLOBAL.MODES.PRE;
                    } else {
                        window.kfcMario && window.kfcMario.goToLogin && window.kfcMario.goToLogin();
                    }
                }
            }
        }
    }
    class GrilRadio extends Laya.Sprite {
        constructor(animateSprite, checked = false) {
            super();
            this.width = 120;
            this.height = 120;
            this._checked = checked;
            this._selectBg = new Laya.Sprite();
            this._selectBg.loadImage(`${alias$3}select_bg.png`);
            this._selectBg.width = 160;
            this._selectBg.height = 160;
            this._selectFront = new Laya.Sprite();
            this._selectFront.loadImage(`${alias$3}select_front.png`);
            this._selectFront.width = 188;
            this._selectFront.height = 192;
            this._selectedBg = new Laya.Sprite();
            this._selectedBg.loadImage(`${alias$3}selected_bg.png`);
            this._selectedBg.width = 160;
            this._selectedBg.height = 160;
            this._selectedFront = new Laya.Sprite();
            this._selectedFront.loadImage(`${alias$3}selected_front.png`);
            this._selectedFront.width = 188;
            this._selectedFront.height = 192;
            this._selectedIcon = new Laya.Sprite();
            this._selectedIcon.loadImage(`${alias$3}selected_icon.png`);
            this._selectedIcon.width = 56;
            this._selectedIcon.height = 56;
            this._bgSprite = this._checked ? this._selectedBg : this._selectBg;
            this._bgSprite.pos(-79, -82);
            this.addChild(this._bgSprite);
            
            this._frontSprite = this._checked ? this._selectedFront : this._selectFront;
            this._frontSprite.pos(-93, -96);
            this.addChild(this._frontSprite);
            this._iconSprite = this._selectedIcon;
            if (!this._checked) {
                this._iconSprite.visible = false;
            } else {
                this.scale(1.1, 1.1);
            }
            this._iconSprite.pos(51, 40);
            this.addChild(this._iconSprite);
            if (animateSprite) {
                animateSprite.play();
                this.addChild(animateSprite);
            }
        }
        click (isChecked) {
            this._checked = isChecked;
            this._bgSprite = this._checked ? this._selectedBg : this._selectBg;
            this._frontSprite = this._checked ? this._selectedFront: this._selectFront;
            this._iconSprite.visible = (this._checked);
            if (this._checked) {
                this.scale(1.1, 1.1);
            } else {
                this.scale(1, 1);
            }
        }
    }

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
    			delete RESOURCES.cloudSmallLeft;
    			delete RESOURCES.cloudSmallRight;
                delete RESOURCES.cloudLargeLeft;
                delete RESOURCES.cloudLargeRight;
                delete RESOURCES.mgForestLeft;
                delete RESOURCES.mgForestRight;
                delete RESOURCES.mgWaterLeft;
                delete RESOURCES.mgWaterRight;
                delete RESOURCES.mgCityLeft;
                delete RESOURCES.mgCityRight;
                delete RESOURCES.fgForestLeft;
                delete RESOURCES.fgForestRight;
                delete RESOURCES.fgWaterLeft;
                delete RESOURCES.fgWaterRight;
                delete RESOURCES.fgCityLeft;
                delete RESOURCES.fgCityRight;
                delete RESOURCES.grassLeft;
                delete RESOURCES.grassRight;
                delete RESOURCES.bridgeLeft;
                delete RESOURCES.bridgeRight;
                delete RESOURCES.roadLeft;
                delete RESOURCES.roadRight;
    		} else {
                delete RESOURCES.forestDegLeft;
                delete RESOURCES.forestDegRight;
                delete RESOURCES.waterDegLeft;
                delete RESOURCES.waterDegRight;
                delete RESOURCES.cityDegLeft;
                delete RESOURCES.cityDegRight;
    		}
    		var loadSource = Object.values(RESOURCES).map(function(item) {return item.url});
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
    			var test = new menuLayer();
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

}());
