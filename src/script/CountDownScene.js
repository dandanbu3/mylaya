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
        this._countDown.start();
    }
    drawSprite (key, name) {
        this[key] = new Laya.Sprite();
        this[key].loadImage(`icons/${name}.png`);
        this[key].pivot(0.5);
        this[key].scale(this._initScale, this._initScale);
        this[key].pos(375, 600);
        this[key].visible = false;
        this.addChild(this[key]);
    }
    initAnime () {
        const that = this;
        this['_go'].scale(this._initScale);
        that['_go'].visible = true;
        this._goAnime = Laya.Tween.to(that['_go'], {
            scale: 1
        }, 1000, Laya.TWEEN.Ease.quintOut, function () {
            that['_go'].visible = false;
            this.scale(that._initScale);
            // 倒计时结束事件
            that.emit('done');
        }).pause();
        this['_ready'].scale(this._initScale);
        this._readyAnime = Laya.Tween.to(that['_ready'], {
            scale: 1
        }, 1000, Laya.TWEEN.Ease.quintOut, function () {
            that['_ready'].visible = false;
            this.scale = that._initScale;
            that._goAnime.restart();
        }).pause();
        that['_one'].visible = true;
        this._oneAnime = Laya.Tween.to(that['_one'], {
            scale: 1
        }, 1000, Laya.TWEEN.Ease.quintOut, function () {
            that['_one'].visible = false;
            this.scale(that._initScale);
            that._readyAnime.restart();
        });
        that['_two'].visible = true;
        this._twoAnime = Laya.Tween.to(that['_two'], {
            scale: 1
        }, 1000, Laya.TWEEN.Ease.quintOut, function () {
            that['_two'].visible = false;
            this.scale = that._initScale;
            that._oneAnime.restart();
        });
        that['_three'].visible = true;
        this._countDown = Laya.Tween.to(that['_three'], {
            scale: 1
        }, 1000, Laya.TWEEN.Ease.quintOut, function () {
            that['_three'].visible = false;
            this.scale = that._initScale;
            that._twoAnime.restart();
        });
    }
}

export default CountDownScene;