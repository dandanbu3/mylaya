class CountDownScene extends Laya.Scene {
    constructor () {
        super();
        this._initScale = 2.5;
        this.drawSprite('_three', 'start_3');
        this.drawSprite('_two', 'start_2');
        this.drawSprite('_one', 'start_1');
        this.drawSprite('_ready', 'start_ready');
        this.drawSprite('_go', 'start_go');
        this.initAnime();
    }
    start () {
        this['_three'].visible = true;
        this._countDown.resume();
    }
    drawSprite (key, name) {
        this[key] = new Laya.Sprite();
        this[key].loadImage(`icons/${name}.png`);
        this[key].pivot(0.5, 0.5);
        this[key].scale(this._initScale, this._initScale);
        this[key].pos(375, 600);
        this[key].visible = false;
        this.addChild(this[key]);
    }
    initAnime () {
        const that = this;
        this._goAnime = Laya.Tween.to(that['_go'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, Laya.Handler.create(function () {
            that['_go'].visible = false;
            that['_go'].scale(that._initScale, that._initScale);
            // 倒计时结束事件
            that.event('done');
        }));
        this._goAnime.pause();
        this._readyAnime = Laya.Tween.to(that['_ready'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, Laya.Handler.create(function () {
            that['_ready'].visible = false;
            that['_ready'].scale(that._initScale, that._initScale);
            that['_go'].visible = true;
            that['_go'].scale(that._initScale, that._initScale);
            that._goAnime.resume();
        }));
        this._readyAnime.pause();
        this._oneAnime = Laya.Tween.to(that['_one'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, Laya.Handler.create(function () {
            that['_one'].visible = false;
            that['_one'].scale(that._initScale, that._initScale);
            that['_ready'].visible = true;
            this['_ready'].scale(that._initScale, that._initScale);
            that._readyAnime.resume();
        }));
        this._oneAnime.pause();
        this._twoAnime = Laya.Tween.to(that['_two'], {
            scaleX: 1,
            scaleY: 1,
        }, 1000, Laya.Ease.quintOut, Laya.Handler.create(function () {
            that['_two'].visible = false;
            that['_two'].scale(that._initScale, that._initScale);
            that['_one'].visible = true;
            this['_one'].scale(that._initScale, that._initScale);
            that._oneAnime.resume();
        }));
        this._twoAnime.pause();
        this._countDown = Laya.Tween.to(that['_three'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, Laya.Handler.create(function () {
            that['_three'].visible = false;
            that['_three'].scale(that._initScale, that._initScale);
            that['_two'].visible = true;
            that['_two'].scale(that._initScale, that._initScale);
            this._twoAnime.resume();
        }));
        this._countDown.pause();
    }
}

export default CountDownScene;