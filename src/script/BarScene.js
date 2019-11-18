import GLOBAL from './Global';

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

export default BarScene;
