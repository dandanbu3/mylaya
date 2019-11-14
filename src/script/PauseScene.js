import RESOURCES from './resources';
import GLOBAL from './Global';
import Util from '../utils';
import Sound from './Sound';

const alias = 'tileset-dialog-';

class PauseScene extends Tiny.Container {
    constructor () {
        super();
        this._bg = new Tiny.Sprite(Tiny.Texture.fromImage(RESOURCES['dialogBg']));
        this._bg.setAnchor(0);
        this._bg.setPosition(20, 192);
        this.addChild(this._bg);
        this._stop = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}btn_stop.png`));
        this._stop.setAnchor(0);
        this._stop.setPosition(204, 732);
        this._stop.setEventEnabled(true);
        this._stop.tap = (event) => {
            event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                this.close();
                this.emit('stop');
            }
        };
        this.addChild(this._stop);
        this._resume = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}btn_resume.png`));
        this._resume.setAnchor(0);
        this._resume.setPosition(438, 732);
        this._resume.setEventEnabled(true);
        this._resume.tap = (event) => {
            event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                this.close();
                this.emit('resume');
            }
        };
        this.addChild(this._resume);
        const museTexture = Tiny.Texture.fromFrame('tileset-icons-btn_muse.png');
        const soundTexture = Tiny.Texture.fromFrame('tileset-icons-btn_sound.png');
        this._muse = new Tiny.Sprite(GLOBAL.CONF.SOUND_ON ? soundTexture : museTexture);
        // @ts-ignore
        this._muse._museTexture = museTexture;
        // @ts-ignore
        this._muse._soundTexture = soundTexture;
        this._muse.setAnchor(0);
        this._muse.setPosition(565, 1003);
        this._muse.setEventEnabled(true);
        this._muse.tap = (event) => {
            event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                GLOBAL.CONF.SOUND_ON = !GLOBAL.CONF.SOUND_ON;
                this._muse.texture = GLOBAL.CONF.SOUND_ON ? soundTexture : museTexture;
                if (GLOBAL.CONF.SOUND_ON) {
                    Sound.playBg();
                } else {
                    Sound.stopBg(true);
                }
            }
        };
        this.addChild(this._muse);
        this._help = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}btn_help.png`));
        this._help.setAnchor(0);
        this._help.setPosition(658, 1003);
        this._help.setEventEnabled(true);
        this._help.tap = (event) => {
            event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                window.kfcMario.showRules && window.kfcMario.showRules();
            }
        };
        this.addChild(this._help);

        this._angle = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}angle.png`));
        this._angle.setAnchor(0.5, 0);
        this._angle.setPosition(375, 358);
        this._angle.setVisible(false);
        this.addChild(this._angle);
        const noChance = Tiny.Texture.fromFrame(`${alias}tip_no_change.png`);
        this._tip = new Tiny.Sprite(noChance);
        // @ts-ignore
        this._tip._noChance = noChance;
        // @ts-ignore
        this._tip._noAllInventory = Tiny.Texture.fromFrame(`${alias}tip_no_all_inventory.png`);
        // @ts-ignore
        this._tip._noTodayInventory = Tiny.Texture.fromFrame(`${alias}tip_no_today_inventory.png`);
        this._tip.setAnchor(0.5, 0);
        this._tip.setPosition(375, 496);
        this._tip.setVisible(false);
        this.addChild(this._tip);
        this.setVisible(false);
    }
    show (type) { // 0:no_chance 1:no_all 2:no_today other:pause
        Tiny.app.view.style['touch-action'] = 'initial';
        Tiny.app.renderer.plugins.interaction.autoPreventDefault = false;
        if (type === 0) {
            this._angle.setVisible(true);
            // @ts-ignore
            this._tip.texture = this._tip._noChance;
            this._tip.setVisible(true);
        } else if (type === 1) { // 没有总库存 这个砍掉了，不会走到这里
            this._angle.setVisible(true);
            // @ts-ignore
            this._tip.texture = this._tip._noAllInventory;
            this._tip.setVisible(true);
        } else if (type === 2) {
            this._angle.setVisible(true);
            // @ts-ignore
            this._tip.texture = this._tip._noTodayInventory;
            this._tip.setVisible(true);
        }
        // @ts-ignore
        this._muse.texture = GLOBAL.CONF.SOUND_ON ? this._muse._soundTexture : this._muse._museTexture;
        this.setVisible(true);
    }
    close () {
        Tiny.app.view.style['touch-action'] = 'none';
        Tiny.app.renderer.plugins.interaction.autoPreventDefault = true;
        this.setVisible(false);
        this._angle.setVisible(false);
        this._tip.setVisible(false);
    }
}

export default PauseScene;