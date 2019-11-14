class CountDownScene extends Tiny.Container {
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
        this[key] = new Laya.Sprite(`icons/${name}.png`);
        this[key].pivot(0.5);
        this[key].scale(this._initScale, this._initScale);
        this[key].pos(375, 600);
        this[key].visible = (false);
        this.addChild(this[key]);
    }
    initAnime () {
        const that = this;
        this._goAnime = new Tiny.TWEEN.Tween({
            scale: this._initScale
        }).to({
            scale: 1
        }, 1000).easing(Tiny.TWEEN.Easing.Quartic.Out).onStart(function () {
            that['_go'].setVisible(true);
        }).onUpdate(function () {
            that['_go'].setScale(this.scale);
        }).onComplete(function () {
            that['_go'].setVisible(false);
            this.scale = that._initScale;
            // 倒计时结束事件
            that.emit('done');
        });
        this._readyAnime = new Tiny.TWEEN.Tween({
            scale: this._initScale
        }).to({
            scale: 1
        }, 1000).easing(Tiny.TWEEN.Easing.Quartic.Out).onStart(function () {
            that['_ready'].setVisible(true);
        }).onUpdate(function () {
            that['_ready'].setScale(this.scale);
        }).onComplete(function () {
            that['_ready'].setVisible(false);
            this.scale = that._initScale;
            that._goAnime.start();
        });
        this._oneAnime = new Tiny.TWEEN.Tween({
            scale: this._initScale
        }).to({
            scale: 1
        }, 1000).easing(Tiny.TWEEN.Easing.Quartic.Out).onStart(function () {
            that['_one'].setVisible(true);
        }).onUpdate(function () {
            that['_one'].setScale(this.scale);
        }).onComplete(function () {
            that['_one'].setVisible(false);
            this.scale = that._initScale;
            that._readyAnime.start();
        });
        this._twoAnime = new Tiny.TWEEN.Tween({
            scale: this._initScale
        }).to({
            scale: 1
        }, 1000).easing(Tiny.TWEEN.Easing.Quartic.Out).onStart(function () {
            that['_two'].setVisible(true);
        }).onUpdate(function () {
            that['_two'].setScale(this.scale);
        }).onComplete(function () {
            that['_two'].setVisible(false);
            this.scale = that._initScale;
            that._oneAnime.start();
        });
        this._countDown = new Tiny.TWEEN.Tween({
            scale: this._initScale
        }).to({
            scale: 1
        }, 1000).easing(Tiny.TWEEN.Easing.Quartic.Out).onStart(function () {
            that['_three'].setVisible(true);
        }).onUpdate(function () {
            that['_three'].setScale(this.scale);
        }).onComplete(function () {
            that['_three'].setVisible(false);
            this.scale = that._initScale;
            that._twoAnime.start();
        });
    }
}

export default CountDownScene;