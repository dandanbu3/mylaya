import resource from './resource';
import GLOBAL from './Global';
import Util from './utils';
import Sound from './Sound';

const alias = 'dialog/';

class PauseScene extends Laya.Scene {
    constructor () {
        super();
        this._bg = new Laya.Sprite();
        this._bg.loadImage(resource['dialogBg'].url);
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
                this.event('stop');
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
                this.event('resume');
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

export default PauseScene;