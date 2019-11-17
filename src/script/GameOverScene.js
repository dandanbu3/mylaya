import resource from './resource';
import FinishLayer from './FinishLayer';
import GLOBAL from './Global';

const alias = 'dialog/';
class GameOverScene extends Laya.Scene {
    constructor () {
        super();
        this._numCache = [];
        this._bg = new Laya.Sprite();
        this._bg.loadImage(resource['dialogBg'].url);
        this._bg.pivot(0);
        this._bg.pos(20, 192);
        this.addChild(this._bg);
        this._titleGameOver = new Laya.Sprite();
        this._titleGameOver.loadImage(`${alias}gameover.png`);
        this._titleGameOver.pivot(0.5, 0);
        this._titleGameOver.pos(375, 264);
        this._titleGameOver.visible = false;
        this.addChild(this._titleGameOver);
        this._titleGameFinish = new Laya.Sprite();
        this._titleGameFinish.loadImage(`${alias}game_finish_title.png`);
        this._titleGameFinish.pivot(0.5, 0);
        this._titleGameFinish.pos(375, 265);
        this._titleGameFinish.visible = false;
        this.addChild(this._titleGameFinish);
        this._mileage = new Laya.Sprite();
        this._mileage.loadImage(`${alias}text_bg.png`);
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
                this.emit('stop');
            }
        });
        this._stop.visible = false;
        this.addChild(this._stop);
        this._restart = new Laya.Sprite();
        this._restart.loadImage(`${alias}btn_restart.png`/);
        this._restart.pivot(0, 0);
        this._restart.pos(439, 791);
        this._restart.mouseEnabled(true);
        this._restart.on(Laya.Event.CLICK, this, (event) => {
            // event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                window.kfcMario.logger && window.kfcMario.logger('click', {
                    key: 'restart'
                });
                this.close();
                this.emit('restart');
            }
        });
        this._restart.visible = false;
        this.addChild(this._restart);
        this._rank = new Laya.Sprite();
        this._rank.loadImage(`${alias}btn_view_rank.png`);
        this._rank.pivot(0.5, 0);
        this._rank.pos(375, 791);
        this._rank.mouseEnabled = true;
        this._rank.on() = (event) => {
            event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                this.close();
                window.kfcMario.refreshRank && window.kfcMario.refreshRank(() => {
                    const finishLayer = new FinishLayer();
                    // @ts-ignore
                    Tiny.app.replaceScene(finishLayer);
                });
            }
        };
        this._rank.setVisible(false);
        this.addChild(this._rank);
        this._submit = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}btn_submit.png`));
        this._submit.setAnchor(0.5, 0);
        this._submit.setPosition(375, 822);
        this._submit.setEventEnabled(true);
        this._submit.tap = (event) => {
            event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                this.close();
                this.emit('stop');
            }
        };
        this._submit.setVisible(false);
        this.addChild(this._submit);
        this._share = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}btn_share.png`));
        this._share.setAnchor(0);
        this._share.setPosition(270, 959);
        this._share.setEventEnabled(true);
        this._share.tap = (event) => {
            event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                window.kfcMario.logger && window.kfcMario.logger('click', {
                    key: 'share'
                });
                this.emit('share');
            }
        };
        this.addChild(this._share);
        this._tip = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-other-low_battery_tip.png`));
        this._tip.setAnchor(0.5, 0);
        this._tip.setPosition(375, 1100);
        this._tip.setVisible(false);
        this.addChild(this._tip);
        this.setVisible(false);
    }
    setCenter () {
        this._titleGameOver.setPositionY(464);
        this._titleGameFinish.setPositionY(465);
        this._mileage.setPositionY(572);
        this._breakSelf.setPositionY(520);
        this._breakAll.setPositionY(520);

        this._stop.setPositionY(691);
        this._restart.setPositionY(691);
        this._rank.setPositionY(691);
        this._submit.setPositionY(722);
        this._share.setPositionY(859);
    }
    setDefault () {
        this._titleGameOver.setPositionY(264);
        this._titleGameFinish.setPositionY(265);
        this._mileage.setPositionY(372);
        this._breakSelf.setPositionY(320);
        this._breakAll.setPositionY(320);

        this._stop.setPositionY(791);
        this._restart.setPositionY(791);
        this._rank.setPositionY(791);
        this._submit.setPositionY(822);
        this._share.setPositionY(959);
    }
    drawNum (wrapper, num, size = 'lg', pos, interval = 28, reverse = false) {
        const numArr = num.toString().split('');
        if (reverse) {
            numArr.reverse();
        }
        numArr.forEach((item, index) => {
            const sprite = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-num-${size}_${item}.png`));
            sprite.setAnchor(0.5, 1);
            if (reverse) {
                sprite.setPosition(pos.x - index * (interval), pos.y);
            } else {
                sprite.setPosition(pos.x + index * (interval), pos.y);
                this._numCache.push(sprite);
            }
            wrapper.addChild(sprite);
        });
        if (!reverse) {
            const m = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-num-${size}_m.png`));
            m.setAnchor(0, 1);
            m.setPosition(pos.x + (numArr.length - 1) * interval + 13, pos.y);
            wrapper.addChild(m);
            this._numCache.push(m);
        }
    }
    show (info = {}) {
        Tiny.app.view.style['touch-action'] = 'initial';
        Tiny.app.renderer.plugins.interaction.autoPreventDefault = false;
        window.kfcMario.updateRecord && window.kfcMario.updateRecord(GLOBAL.CONF.MILEAGE);
        if (GLOBAL.CONF.MILEAGE > GLOBAL.DATA.ALL_RECORD) {
            GLOBAL.DATA.ALL_RECORD = GLOBAL.CONF.MILEAGE;
            GLOBAL.DATA.SELF_RECORD = GLOBAL.CONF.MILEAGE;
            this._breakAll.setVisible(true);
            this.emit('break', 1);
        } else if (GLOBAL.CONF.MILEAGE > GLOBAL.DATA.SELF_RECORD) {
            GLOBAL.DATA.SELF_RECORD = GLOBAL.CONF.MILEAGE;
            this._breakSelf.setVisible(true);
            this.emit('break', 0);
        }
        if (info.type === 'gameover') {
            this._tip.setVisible(true);
            this._titleGameOver.setVisible(true);
            this._stop.setVisible(true);
            this._restart.setVisible(true);
        } else if (info.type === 'gamefinish') {
            this._titleGameFinish.setVisible(true);
            this._rank.setVisible(true);
        } else if (info.type === 'userexit') {
            this._submit.setVisible(true);
        }
        this.drawNum(this._mileage, GLOBAL.CONF.MILEAGE, 'sm', {
            x: 0,
            y: 37
        }, 20);
        if (GLOBAL.CONF.HIT === 0) {
            this.setCenter();
        }
        window.kfcMario.showLottery && window.kfcMario.showLottery(true);
        this.setVisible(true);
    }
    close () {
        Tiny.app.view.style['touch-action'] = 'none';
        Tiny.app.renderer.plugins.interaction.autoPreventDefault = true;
        this.setVisible(false);
        this._tip.setVisible(false);
        this._titleGameOver.setVisible(false);
        this._titleGameFinish.setVisible(false);
        this._breakSelf.setVisible(false);
        this._breakAll.setVisible(false);
        this._stop.setVisible(false);
        this._restart.setVisible(false);
        this._rank.setVisible(false);
        this._submit.setVisible(false);
        if (GLOBAL.CONF.HIT === 0) {
            this.setDefault();
        } else {
            window.kfcMario.showLottery && window.kfcMario.showLottery(false);
        }
        this._numCache.forEach(item => {
            this._mileage.removeChild(item);
        });
        this._numCache = [];
    }
}

export default GameOverScene;