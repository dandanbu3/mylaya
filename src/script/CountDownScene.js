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
        this[key].pivot(0.5, 0.5);
        this[key].scale(this._initScale, this._initScale);
        this[key].pos(375, 600);
        this[key].visible = false;
        this.addChild(this[key]);
    }
    initAnime () {
        const that = this;
        this['_go'].scale(this._initScale, this._initScale);
        that['_go'].visible = true;
        this._goAnime = Laya.Tween.to(that['_go'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, function () {
            that['_go'].visible = false;
            this.scale(that._initScale, that._initScale);
            // 倒计时结束事件
            that.emit('done');
        }, 4000);
        this['_ready'].visible = true;
        this._readyAnime = Laya.Tween.to(that['_ready'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, function () {
            that['_ready'].visible = false;
            this.scale(that._initScale, that._initScale);
            // that._goAnime.restart();
        }, 3000);
        that['_one'].visible = true;
        this._oneAnime = Laya.Tween.to(that['_one'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, function () {
            that['_one'].visible = false;
            this.scale(that._initScale);
            // that._readyAnime.restart();
        }, 2000);
        that['_two'].visible = true;
        this._twoAnime = Laya.Tween.to(that['_two'], {
            scaleX: 1,
            scaleY: 1,
        }, 1000, Laya.Ease.quintOut, function () {
            that['_two'].visible = false;
            this.scale(that._initScale, that._initScale);
            // that._oneAnime.restart();
        }, 1000);
        that['_three'].visible = true;
        this._countDown = Laya.Tween.to(that['_three'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, function () {
            that['_three'].visible = false;
            this.scale(that._initScale, that._initScale);
        });
    }
}

export default CountDownScene;