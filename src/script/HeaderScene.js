import GLOBAL from './Global';

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
                        Laya.Tween.to(newSprite, {
                            x: 207 + index * 28,
                            y: 94
                        }, 500);
                        Laya.Tween.to(oldSprite, {
                            x: oldSprite.x,
                            y: oldSprite.y + 50
                        }, 500, null, Laya.Handler.create(() => {
                            console.log(this);
                            this.removeChild(oldSprite);
                        }));
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

export default HeaderScene;
