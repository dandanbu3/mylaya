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
                    window.kfcMario.goToLogin && window.kfcMario.goToLogin();
                });
                login.on(Laya.Event.CLICK, this, (event) => {
                    // event.data.originalEvent.preventDefault();
                    window.kfcMario.goToLogin && window.kfcMario.goToLogin();
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
                            // const moveAction = Tiny.MoveTo(500, Tiny.point(207 + index * 28, 94));
                            // newSprite.runAction(moveAction);
                            // const oldAction = Tiny.MoveTo(500, Tiny.point(oldSprite.getPositionX(), oldSprite.getPositionY() + 50));
                            // oldAction.onComplete = () => {
                            //     this.removeChild(oldSprite);
                            // };
                            // oldSprite.runAction(oldAction);
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

    const alias = 'icons/';
    class menuLayer extends Laya.Scene {
        constructor() {
            super();
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
                let ani = new Laya.Animation();
                this.addChild(ani);
                ani.interval = 30;			// 设置播放间隔（单位：毫秒）
                ani.index = 1;				// 当前播放索引	
                ani.pivot(0.5, 0);
                ani.pos(534, 904);
                ani.loadImages(this.aniUrls("other/hand_", 12));
                ani.play();
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
                sprite.loadImage(`${alias}tip_bg.png`);
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
                icon.loadImage(`${alias}tip_horn.png`);
                icon.pos(310 - text.width / 2, 6);
                this.addChild(icon);
                this.addChild(sprite);
            } else if (GLOBAL.DATA.NO_INVENTORY) {
                sprite.loadImage(`${alias}tip_no_${GLOBAL.DATA.NO_INVENTORY}_inventory.png`);
                this.addChild(sprite);
            } else if (GLOBAL.DATA.OPEN_CHANCE === 0) {
                sprite.loadImage(`${alias}tip_no_prize.png`);
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
            textBg.loadImage(`${alias}text_bg.png`);
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
            // const stopAction = Tiny.MoveTo(1000, Tiny.point(375, currentPos));
            // const moveAction = Tiny.MoveTo(800, Tiny.point(375, posY));
            // stopAction.onComplete = () => {
            //     this._storySetting.runAction(moveAction);
            // };
            // moveAction.onComplete = () => {
            //     if (currentPos <= 284) {
            //         this._storySetting.setPositionY(548);
            //     }
            //     this.startStoryScroll();
            // };
            // this._storySetting.runAction(stopAction);
        }
        drawFrame () {
            let logo = new Laya.Animation();
            logo.width = 240;
            logo.height = 120;
            logo.loadImages(this.aniUrls("logo/logo_", 27));
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
                this._btnStart.loadImage(`${alias}btn_start_gray.png`);
            } else if (GLOBAL.DATA.NO_INVENTORY) {
                this._btnStart.loadImage(`${alias}btn_start_ease.png`);
            } else if (GLOBAL.DATA.OPEN_CHANCE === 0) {
                this._btnStart.loadImage(`${alias}btn_try.png`);
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
            this._btnRule.loadImage(`${alias}btn_rule.png`);
            this._btnRule.pivot(0, 0);
            this._btnRule.pos(94, 1003);
            this._btnRule.mouseEnabled = (true);
            this._btnRule.on(Laya.Event.CLICK, this, (event) => {
                // event.data.originalEvent.preventDefault();
                if (!GLOBAL.CONF.PREVENT) {
                    window.kfcMario.showRules && window.kfcMario.showRules();
                }
            });
            this.addChild(this._btnRule);

            const museTexture = new Laya.Sprite();
            museTexture.loadImage(`${alias}btn_muse_large.png`);
            const soundTexture = new Laya.Sprite();
            soundTexture.loadImage(`${alias}btn_sound_large.png`);
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
                        window.kfcMario.logger && window.kfcMario.logger('click', {
                            key: 'start',
                            score: GLOBAL.DATA.OPEN_CHANCE,
                            mid: GLOBAL.DATA.MID
                        });
                        // const startLayer = new MainLayer(this._choosen);
                        // startLayer.on('transitionend', () => {
                        //     startLayer.startRunAction();
                        // });
                        // Tiny.app.replaceScene(startLayer);
                        // startLayer.emit('transitionend');
                        GLOBAL.CONF.MODE = GLOBAL.MODES.PRE;
                    } else {
                        window.kfcMario.goToLogin && window.kfcMario.goToLogin();
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
            this._selectBg.loadImage(`${alias}select_bg.png`);
            this._selectBg.width = 160;
            this._selectBg.height = 160;
            this._selectFront = new Laya.Sprite();
            this._selectFront.loadImage(`${alias}select_front.png`);
            this._selectFront.width = 188;
            this._selectFront.height = 192;
            this._selectedBg = new Laya.Sprite();
            this._selectedBg.loadImage(`${alias}selected_bg.png`);
            this._selectedBg.width = 160;
            this._selectedBg.height = 160;
            this._selectedFront = new Laya.Sprite();
            this._selectedFront.loadImage(`${alias}selected_front.png`);
            this._selectedFront.width = 188;
            this._selectedFront.height = 192;
            this._selectedIcon = new Laya.Sprite();
            this._selectedIcon.loadImage(`${alias}selected_icon.png`);
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
