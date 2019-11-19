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
        this._goAnime = Laya.Tween.to(this['_go'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, Laya.Handler.create(this, function () {
            this['_go'].visible = false;
            this['_go'].scale(this._initScale, this._initScale);
            // 倒计时结束事件
            this.event('done');
        }));
        this._goAnime.pause();
        this._readyAnime = Laya.Tween.to(this['_ready'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, Laya.Handler.create(this, function () {
            this['_ready'].visible = false;
            this['_ready'].scale(this._initScale, this._initScale);
            this['_go'].visible = true;
            this['_go'].scale(this._initScale, this._initScale);
            this._goAnime.resume();
        }));
        this._readyAnime.pause();
        this._oneAnime = Laya.Tween.to(this['_one'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, Laya.Handler.create(this, function () {
            this['_one'].visible = false;
            this['_one'].scale(this._initScale, this._initScale);
            this['_ready'].visible = true;
            this['_ready'].scale(this._initScale, this._initScale);
            this._readyAnime.resume();
        }));
        this._oneAnime.pause();
        this._twoAnime = Laya.Tween.to(this['_two'], {
            scaleX: 1,
            scaleY: 1,
        }, 1000, Laya.Ease.quintOut, Laya.Handler.create(this, function () {
            this['_two'].visible = false;
            this['_two'].scale(this._initScale, this._initScale);
            this['_one'].visible = true;
            this['_one'].scale(this._initScale, this._initScale);
            this._oneAnime.resume();
        }));
        this._twoAnime.pause();
        this._countDown = Laya.Tween.to(this['_three'], {
            scaleX: 1,
            scaleY: 1
        }, 1000, Laya.Ease.quintOut, Laya.Handler.create(this, function () {
            console.log('end');
            this['_three'].visible = false;
            this['_three'].scale(this._initScale, this._initScale);
            this['_two'].visible = true;
            this['_two'].scale(this._initScale, this._initScale);
            this._twoAnime.resume();
        }));
        this._countDown.pause();
    }
}

export default CountDownScene;