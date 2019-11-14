import GLOBAL from './Global';

class HeaderScene extends Tiny.Container {
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
            const sprite = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-num-${size}_${item}.png`));
            // @ts-ignore
            sprite._num = Number(item);
            sprite.setAnchor(0.5, 1);
            if (reverse) {
                sprite.setPosition(pos.x - index * (interval), pos.y);
            } else {
                sprite.setPosition(pos.x + index * (interval), pos.y);
            }
            this[cacheKey].push(sprite);
            this.addChild(sprite);
        });
    }
    drawPrizeTotal () {
        if (!GLOBAL.DATA.IS_LOGIN) {
            const avatar = new Tiny.Sprite(Tiny.Texture.fromFrame('tileset-other-noface.png'));
            avatar.setAnchor(0);
            avatar.setPosition(60, 60);
            avatar.setEventEnabled(true);
            this.addChild(avatar);
            const login = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-other-login.png`));
            login.setAnchor(0, 1);
            login.setPosition(60, 146);
            login.setEventEnabled(true);
            avatar.tap = login.tap = (event) => {
                event.data.originalEvent.preventDefault();
                window.kfcMario.goToLogin && window.kfcMario.goToLogin();
            };
            this.addChild(login);
        }
        const bg = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-icons-header_left.png`));
        bg.setAnchor(0);
        bg.setPosition(40, 44);
        this.addChild(bg);
        const x = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-num-lg_x.png`));
        x.setAnchor(0, 1);
        x.setPosition(175, 94);
        this.addChild(x);
        this.reset();
    }
    drawRank () {
        const bgOne = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-icons-best_global.png`));
        bgOne.setAnchor(0);
        bgOne.setPosition(366, 44);
        this.addChild(bgOne);
        const bgTwo = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-icons-best_personal.png`));
        bgTwo.setAnchor(0);
        bgTwo.setPosition(366, 116);
        this.addChild(bgTwo);
        const m = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-num-sm_m.png`));
        m.setAnchor(0, 1);
        m.setPosition(678, 80);
        this.addChild(m);
        const mPersonal = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-num-sm_m.png`));
        mPersonal.setAnchor(0, 1);
        mPersonal.setPosition(678, 153);
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
                        const newSprite = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-num-lg_${item}.png`));
                        newSprite.setAnchor(0.5, 1);
                        newSprite.setPosition(207 + index * 28, 44);
                        this.addChild(newSprite);
                        const oldSprite = this._prizeNumCache[index];
                        this._prizeNumCache.splice(index, 1, newSprite);
                        const moveAction = Tiny.MoveTo(500, Tiny.point(207 + index * 28, 94));
                        newSprite.runAction(moveAction);
                        const oldAction = Tiny.MoveTo(500, Tiny.point(oldSprite.getPositionX(), oldSprite.getPositionY() + 50));
                        oldAction.onComplete = () => {
                            this.removeChild(oldSprite);
                        };
                        oldSprite.runAction(oldAction);
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
