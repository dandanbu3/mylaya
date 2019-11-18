import BackgroundScene from './BackgroundScene';
import BackgroundDegrade from './BackgroundDegrade';
import BarScene from './BarScene';
import Girl from './Girl';
import CrashScene from './CrashScene';
import GLOBAL from './Global';
import resource from './resource';
import Sound from './Sound';
import HeaderScene from './HeaderScene';
import CountDownScene from './CountDownScene';
import PauseScene from './PauseScene';
import MenuLayer from './menuLayer';
import GameOverScene from './GameOverScene';
import Util from './utils';

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
        frame.loadImage(resource['frame'].url);
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
                const menuLayer = new MenuLayer();
                // @ts-ignore
                Laya.stage.addChild(menuLayer);
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
            const menuLayer = new MenuLayer();
            // @ts-ignore
            Laya.stage.addChild(menuLayer);
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

export default MainLayer;
