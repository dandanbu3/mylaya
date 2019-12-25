import GLOBAL from './Global';
import Sound from './Sound';

class PrizeBox extends Laya.Sprite {
    constructor () {
        const defaultTexture = 'other/tv.png';
        super();
        this.autoSize = true;
        this.loadImage(defaultTexture);
        this._tv = defaultTexture;
        this._heart = 'other/heart.png';
        this._empty = false;
        this.pivot(0, this.height);
        this.y = 0;
        this.barrierHeight = this.height;
        this.barrierWidth = this.width;
    }
    playAnime () {
        this.y = GLOBAL.CONF.PRIZE_POS_Y;
        this._moveUp = Laya.Tween.to(this, {y: GLOBAL.CONF.PRIZE_POS_Y - 10}, 80, null, Laya.Handler.create(this, () => {
            this.y = GLOBAL.CONF.PRIZE_POS_Y - this.y;
            this._moveDown.resume();
        }));
        this._moveDown = Laya.Tween.to(this, {y: GLOBAL.CONF.PRIZE_POS_Y}, 80, null, Laya.Handler.create(this, () => {
            this.y = 10;
        }), 80);
        this._moveDown.pause();
    }
    stopAnime () {
        this._moveUp && this._moveUp.pause();
        this._moveDown && this._moveDown.pause();
    }
}

// 顶中空气屁的动画
class EmptyFart extends Laya.Sprite {
    constructor() {
        super();
        this.autoSize = true;
        this.loadImage(`other/tvempty.png`);
        this.pivot(this.width / 2, this.height);
        this.pos(200, GLOBAL.CONF.PRIZE_POS_Y - 140);
        this.barrierHeight = this.height;
        this.barrierWidth = this.width;
        this.scale(1.5, 1.5);
        this.visible = false;
    }
    playAnime () {
        this.visible = true;
        this._fadeAction = Laya.Tween.to(this, {alpha: 0}, 500, null, Laya.Handler.create(this, () => {
            this.alpha = 1;
        }));
        this._fadeAction.pause();
        this._moveAction = Laya.Tween.to(this, {x: 200, y: GLOBAL.CONF.PRIZE_POS_Y - 190}, 500, null, Laya.Handler.create(this, () => {
            this.y = GLOBAL.CONF.PRIZE_POS_Y - 140;
            this.visible = false;
        }));
    }
}

class EnemyBox extends Laya.Animation {
    constructor (item) {
        super();
        this.autoSize = true;
        const textures = [];
        for (let i = 0; i < item.frames; i++) {
            textures.push(`barrier/${item.name}_${i}.png`);
        }
        this.loadImages(textures);
        this.on(Laya.Event.COMPLETE, this, () => {
            console.log(this.getGraphicBounds(), 'box');
        });
        const barrier = new Laya.Sprite();
        barrier.autoSize = true;
        barrier.loadImage(textures[0]);
        this.barrierHeight = barrier.height;
        this.barrierWidth = barrier.width;
        barrier.removeSelf();
        this.pivot(0, this.barrierHeight);
        this._inview = false;
        this._name = item.name;
        if (item.points) {
            this._points = item.points;
        }
        this.interval = item.interval;
    }
}

class CrashScene extends Laya.Scene {
    constructor () {
        super();
        this._isFirstEmpty = GLOBAL.DATA.OPEN_CHANCE !== 0;
        this._place = 'forest'; // 场景
        this._enemyItems = GLOBAL.ENEMY_CONF[this._place].items.slice(); // 场景下有哪些障碍物
    }
    init () {
        this.removeChildren();
        this._enemyCache = []; // 渲染的障碍物
        this._prizeCache = []; // 渲染的奖品箱
        // 初始化障碍
        const randomItem = this.randomEnemyItem();
        const enemy = new EnemyBox(randomItem);
        enemy.play();
        enemy.pivot(0, enemy.barrierHeight);
        enemy.pos(Laya.stage.width * 3, GLOBAL.CONF.GROUND_POS_Y);
        this.addChild(enemy);
        this._enemyCache.push(enemy);

        const animeTextures = [];
        for (let i = 1; i < 29; i++) {
            animeTextures.push(`hit/hit_${i}.png`);
        }
        this._prizeAnime = new Laya.Animation();
        this._prizeAnime.loadImages(animeTextures);
        // this._prizeAnime.onLoop = () => {
        //     this._prizeAnime.stop();
        // };
        this._prizeAnime.interval = 42;
        this._prizeAnime.pos(14, 186);
        this.addChild(this._prizeAnime);
        this._emptyFart = new EmptyFart();
        this.addChild(this._emptyFart);
    }
    changePlace (place) {
        if (this._place !== place && GLOBAL.ENEMY_CONF[place]) {
            this._place = place;
            this._enemyItems = GLOBAL.ENEMY_CONF[this._place].items.slice();
        }
    }
    addNext () { // 当有障碍进入可视区域时，提前添加下一个障碍
        const randomInterval = this.getRandom(Laya.stage.width * 1.5, Laya.stage.width * 2.5); // 每个障碍物之间的间隔，一屏到三屏之间随机
        // @ts-ignore
        const checkPlace = this.parent._background.checkPosPlace(randomInterval);
        this.changePlace(checkPlace);
        const randomItem = this.randomEnemyItem();
        const enemy = new EnemyBox(randomItem);
        enemy.play();
        enemy.pos(Laya.stage.width + randomInterval, GLOBAL.CONF.GROUND_POS_Y);
        this._enemyCache.push(enemy);
        this.addChild(enemy);
        this.addRandomPrize(enemy);
    }
    removeEnemy () { // 当有障碍移出可视区域时，将障碍从缓存中移除
        const enemy = this._enemyCache[0];
        this._enemyCache.splice(0, 1);
        this.removeChild(enemy);
    }
    removePrize () { // 移除第一个
        const prize = this._prizeCache[0];
        prize.stopAnime();
        this._prizeCache.splice(0, 1);
        this.removeChild(prize);
    }
    startAnime () {
        this._enemyCache.forEach(enemy => {
            enemy.play();
        });
    }
    stopAnime () {
        this._enemyCache.forEach(enemy => {
            enemy.stop();
        });
    }
    randomEnemyItem () {
        this._enemyItems = this._enemyItems.length === 0 ? GLOBAL.ENEMY_CONF[this._place].items.slice() : this._enemyItems;
        const index = this.getRandom(0, this._enemyItems.length - 1);
        const item = this._enemyItems.splice(index, 1);
        return item[0];
    }
    getRandom(val1, val2) {
        var random = Math.random();
        return val1 + Math.floor((val2 - val1 + 1) * random);

    }
    addRandomPrize (enemy) {
        const arr = [1, 1, 0, 1];
        const needAdd = arr[this.getRandom(0, 3)];
        if (needAdd) {
            // 限制奖品箱子出现的范围
            const prevEnemy = this._enemyCache[this._enemyCache.length - 2];
            const startPos = prevEnemy.x;
            const randomPos = this.getRandom(startPos, enemy.x - 500);
            const prizeBox = new PrizeBox();
            if (GLOBAL.DATA.OPEN_CHANCE > 0) { // 有奖品的箱子
                prizeBox.pos(randomPos, GLOBAL.CONF.PRIZE_POS_Y);
                this.addChild(prizeBox);
                this._prizeCache.push(prizeBox);
            } else { // 空气屁箱子
                prizeBox._empty = true;
                prizeBox.pos(randomPos, GLOBAL.CONF.PRIZE_POS_Y);
                this.addChild(prizeBox);
                this._prizeCache.push(prizeBox);
            }
        }
    }
    hitPrize (prize, callback) {
        prize.removeSelf();
        console.log(prize.texture);
        // prize.destroy && prize.destroy(true);
        prize.loadImage(prize._heart);
        prize.playAnime();
        if (prize._empty) {
            Sound.playHitEmpty();
            this._emptyFart.playAnime();
            if (this._isFirstEmpty && !GLOBAL.DATA.NO_INVENTORY && !GLOBAL.DATA.OPEN_CHANCE && GLOBAL.DATA.STATUS === 2) {
                this._isFirstEmpty = false;
                this.event('noChance');
            }
            callback && callback();
        } else {
            window.kfcMario && window.kfcMario.drawLottery && window.kfcMario.drawLottery(drawed => {
                if (drawed) {
                    Sound.playHit();
                    GLOBAL.CONF.HIT++;
                    // this._prizeAnime.stop();
                    this._prizeAnime.play(0, false);
                } else {
                    prize._empty = true;
                    Sound.playHitEmpty();
                    this._emptyFart.playAnime();
                }
                callback && callback(true);
            });
            
        }
    }
}

export default CrashScene;
