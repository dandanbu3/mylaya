import resource from './resource';
import FinishLayer from './finisherLayer';
import GLOBAL from './Global';

const alias = 'dialog/';
class GameOverScene extends Laya.Scene {
    constructor () {
        super();
        this._numCache = [];
        this._bg = new Laya.Sprite();
        this._bg.loadImage(resource['dialogBg'].url);
        this._bg.pivot(0, 0);
        this._bg.pos(20, 192);
        this.addChild(this._bg);
        this._titleGameOver = new Laya.Sprite();
        this._titleGameOver.loadImage(`${alias}gameover.png`);
        this._titleGameOver.pivot(this._titleGameOver.width / 2, 0);
        this._titleGameOver.pos(375, 264);
        this._titleGameOver.visible = false;
        this.addChild(this._titleGameOver);
        this._titleGameFinish = new Laya.Sprite();
        this._titleGameFinish.loadImage(`${alias}game_finish_title.png`);
        this._titleGameFinish.pivot(this._titleGameFinish.width / 2, 0);
        this._titleGameFinish.pos(375, 265);
        this._titleGameFinish.visible = false;
        this.addChild(this._titleGameFinish);
        this._mileage = new Laya.Sprite();
        this._mileage.loadImage(`${alias}text_bg.png`);
        this._mileage.pivot(this._mileage.width / 2, 0);
        this._mileage.pos(375, 372);
        const mileageTitle = new Laya.Text();
        mileageTitle.text = '本次里程数';
        mileageTitle.fontSize = 24;
        mileageTitle.bold = true;
        mileageTitle.color = '#fff';
        mileageTitle.pos(60, 16);
        this._mileage.addChild(mileageTitle);
        this.addChild(this._mileage);
        this._breakSelf = new Laya.Sprite();
        this._breakSelf.loadImage(`${alias}break.png`);
        this._breakSelf.pivot(0, 0);
        this._breakSelf.pos(526, 320);
        this._breakSelf.visible = false;
        this.addChild(this._breakSelf);
        this._breakAll = new Laya.Sprite();
        this._breakAll.loadImage(`${alias}break_all.png`);
        this._breakAll.pivot(0, 0);
        this._breakAll.pos(526, 320);
        this._breakAll.visible = false;
        this.addChild(this._breakAll);
        this._stop = new Laya.Sprite();
        this._stop.loadImage(`${alias}btn_stop.png`);
        this._stop.pivot(0, 0);
        this._stop.pos(204, 791);
        this._stop.mouseEnabled = true;
        this._stop.on(Laya.Event.CLICK, this, (event) => {
            // event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                this.close();
                this.event('stop');
            }
        });
        this._stop.visible = false;
        this.addChild(this._stop);
        this._restart = new Laya.Sprite();
        this._restart.loadImage(`${alias}btn_restart.png`);
        this._restart.pivot(0, 0);
        this._restart.pos(439, 791);
        this._restart.mouseEnabled = true;
        this._restart.on(Laya.Event.CLICK, this, (event) => {
            // event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                window.kfcMario && window.kfcMario.logger && window.kfcMario.logger('click', {
                    key: 'restart'
                });
                this.visible = false;
                this.close();
                this.event('restart');
            }
        });
        this._restart.visible = false;
        this.addChild(this._restart);
        this._rank = new Laya.Sprite();
        this._rank.loadImage(`${alias}btn_view_rank.png`);
        this._rank.pivot(this._rank.width / 2, 0);
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
        this._submit.loadImage(`${alias}btn_submit.png`);
        this._submit.pivot(this._submit.width / 2, 0);
        this._submit.pos(375, 822);
        this._submit.mouseEnabled = true;
        this._submit.on(Laya.Event.CLICK, this, (event) => {
            // event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                this.close();
                this.event('stop');
            }
        });
        this._submit.visible = false;
        this.addChild(this._submit);
        this._share = new Laya.Sprite();
        this._share.loadImage(`${alias}btn_share.png`);
        this._share.pivot(0, 0);
        this._share.pos(270, 959);
        this._share.mouseEnabled = true;
        this._share.on(Laya.Event.CLICK, this, (event) => {
            // event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                window.kfcMario && window.kfcMario.logger && window.kfcMario.logger('click', {
                    key: 'share'
                });
                this.event('share');
            }
        });
        this.addChild(this._share);
        this._tip = new Laya.Sprite();
        this._tip.loadImage(`other/low_battery_tip.png`);
        this._tip.pivot(this._tip.width / 2, 0);
        this._tip.pos(375 , 1100);
        this._tip.visible = false;
        this.addChild(this._tip);
        this.visible = false;
    }
    setCenter () {
        this._titleGameOver.y = 464;
        this._titleGameFinish.y = 465;
        this._mileage.y = 572;
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
            sprite.pivot(0, 0);
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
            m.pivot(0, 0);
            m.pos(pos.x + (numArr.length - 1) * interval + 19, pos.y + 4);
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
            this.event('break', 1);
        } else if (GLOBAL.CONF.MILEAGE > GLOBAL.DATA.SELF_RECORD) {
            GLOBAL.DATA.SELF_RECORD = GLOBAL.CONF.MILEAGE;
            this._breakSelf.visible = true;
            this.event('break', 0);
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
            x: 200,
            y: 16
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

export default GameOverScene;