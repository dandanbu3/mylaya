import resource from './resource';
// import MainLayer from './MainLayer';
import HeaderScene from './HeaderScene';
import GLOBAL from './Global';
import Util from './utils';
// import Sound from './Sound';

const alias = 'icons/';
export default class menuLayer extends Laya.Scene {
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
            const icon = new Laya.Sprite(`${alias}tip_horn.png`);
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
        this._radio22.tap = (event) => {
            event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                this._choosen = 'girl22';
                this._radio33.click(false);
                this._radio22.click(true);
            }
        };
        this.addChild(this._radio22);
        const anime33 = new Laya.Animation();
        anime33.loadImages(this.aniUrls("girl33/choose_", 5));
        anime33.pos(-67, -70);
        anime33.interval = 200;
        this._radio33 = new GrilRadio(anime33, false);
        this._radio33.pos(440, 736);
        this._radio33.tap = (event) => {
            event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                this._choosen = 'girl33';
                this._radio22.click(false);
                this._radio33.click(true);
            }
        };
        this.addChild(this._radio33);
    }

    drawSetting () { // 背景图&故事背景
        const textBg = new Laya.Sprite(`${alias}text_bg.png`);
        textBg.autoSize = true;
        textBg.pivot(0.5, 1);
        textBg.pos(375, 588);
        this.addChild(textBg);
        this._storySetting = new Laya.Sprite(resource['storySetting'].url);
        this._storySetting.autoSize = true;
        this._storySetting.pivot(0.5, 0);
        this._storySetting.pos(375, 548);
        const copy = new Laya.Sprite(resource['storySetting'].url);
        copy.autoSize = true;
        copy.pos(-239.5, 308);
        this.addChild(copy);
        this.addChild(this._storySetting);
        // this.startStoryScroll();
        const menuBg = new Laya.Sprite(resource['menuBg'].url);
        menuBg.pivot(0, 0);
        menuBg.pos(20, 192);
        this.addChild(menuBg);
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
        const frame = new Laya.Sprite(resource['frame'].url);
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
        // this._btnStart.setEventEnabled(true);
        // this._btnStart.tap = this.onReady.bind(this);
        this.addChild(this._btnStart);
        this._btnRule = new Laya.Sprite(`${alias}btn_rule.png`);
        this._btnRule.pivot(0, 0);
        this._btnRule.pos(94, 1003);
        // this._btnRule.setEventEnabled(true);
        this._btnRule.tap = (event) => {
            event.data.originalEvent.preventDefault();
            if (!GLOBAL.CONF.PREVENT) {
                window.kfcMario.showRules && window.kfcMario.showRules();
            }
        };
        this.addChild(this._btnRule);

        const museTexture = new Laya.Sprite(`${alias}btn_muse_large.png`);
        const soundTexture = new Laya.Sprite(`${alias}btn_sound_large.png`);
        if (GLOBAL.CONF.SOUND_ON) {
            Sound.playBg();
        }
        this._btnMuse = new Laya.Sprite(GLOBAL.CONF.SOUND_ON ? soundTexture : museTexture);
        this._btnMuse.pivot(0, 0);
        this._btnMuse.pos(650, 766);
        // this._btnMuse.setEventEnabled(true);
        this._btnMuse.tap = (event) => {
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
        };
        this.addChild(this._btnMuse);
    }
}
class GrilRadio extends Laya.Sprite {
    constructor(animateSprite, checked = false) {
        super();
        this.width = 120;
        this.height = 120;
        this._checked = checked;
        this._selectBg = new Laya.Sprite(`${alias}select_bg.png`);
        this._selectBg.width = 160;
        this._selectBg.height = 160;
        this._selectFront = new Laya.Sprite(`${alias}select_front.png`);
        this._selectFront.width = 188;
        this._selectFront.height = 192;
        this._selectedBg = new Laya.Sprite(`${alias}selected_bg.png`);
        this._selectedBg.width = 160;
        this._selectedBg.height = 160;
        this._selectedFront = new Laya.Sprite(`${alias}selected_front.png`);
        this._selectedFront.width = 188;
        this._selectedFront.height = 192;
        this._selectedIcon = new Laya.Sprite(`${alias}selected_icon.png`);
        this._selectedIcon.width = 56;
        this._selectedIcon.height = 56;
        this._bgSprite = this._checked ? this._selectedBg : this._selectBg;
        this._bgSprite.pos(0, 0);
        this.addChild(this._bgSprite);
        
        this._frontSprite = this._checked ? this._selectedFront : this._selectFront;
        this._frontSprite.pos(0, 0);
        this.addChild(this._frontSprite);
        this._iconSprite = this._selectedIcon;
        if (!this._checked) {
            this._iconSprite.visible = false;
        } else {
            this.scale(1.1, 1.1);
        }
        this._iconSprite.pos(0, 0);
        this.addChild(this._iconSprite);
        if (animateSprite) {
            animateSprite.play();
            this.addChild(animateSprite);
        }
    }
}