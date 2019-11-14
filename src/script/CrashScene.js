import GLOBAL from './Global';
import Sound from './Sound';

class PrizeBox extends Tiny.Sprite {
    constructor () {
        const defaultTexture = Tiny.Texture.fromFrame('tileset-other-tv.png');
        super(defaultTexture);
        this._tv = defaultTexture;
        this._heart = Tiny.Texture.fromFrame('tileset-other-heart.png');
        this._empty = false;
        this.setAnchor(0, 1);
        const that = this;
        this._moveUp = new Tiny.TWEEN.Tween({y: 0}).to({y: 10}, 80).onUpdate(function () {
            that.setPositionY(GLOBAL.CONF.PRIZE_POS_Y - this.y);
        }).onComplete(function () {
            this.y = 0;
            that._moveDown.start();
        });
        this._moveDown = new Tiny.TWEEN.Tween({y: 10}).to({y: 0}, 80).onUpdate(function () {
            that.setPositionY(GLOBAL.CONF.PRIZE_POS_Y - this.y);
        }).onComplete(function () {
            this.y = 10;
        });
    }
    playAnime () {
        this._moveUp.start();
    }
    stopAnime () {
        this._moveUp.stop();
        this._moveDown.stop();
    }
}

// 顶中空气屁的动画
class EmptyFart extends Tiny.Sprite {
    constructor() {
        super(Tiny.Texture.fromFrame(`tileset-other-tvempty.png`));
        this.setAnchor(0.5, 1);
        this.setPosition(200, GLOBAL.CONF.PRIZE_POS_Y - 140);
        this._fadeAction = Tiny.FadeOut(500);
        this._fadeAction.onComplete = () => {
            this.setOpacity(1);
        };
        this._moveAction = Tiny.MoveTo(500, Tiny.point(200, GLOBAL.CONF.PRIZE_POS_Y - 190));
        this._moveAction.onComplete = () => {
            this.setPositionY(GLOBAL.CONF.PRIZE_POS_Y - 140);
            this.setVisible(false);
        };
        this.setScale(1.5);
        this.setVisible(false);
    }
    playAnime () {
        this.setVisible(true);
        this.runAction(this._moveAction);
        this.runAction(this._fadeAction);
    }
}

class EnemyBox extends Tiny.AnimatedSprite {
    constructor (item) {
        const textures = [];
        for (let i = 0; i < item.frames; i++) {
            textures.push(Tiny.Texture.fromFrame(`tileset-barrier-${item.name}_${i}.png`));
        }
        super(textures);
        this.setAnchor(0, 1);
        this._inview = false;
        this._name = item.name;
        if (item.points) {
            this._points = item.points;
        }
        this.animationSpeed = item.speed;
    }
}

class CrashScene extends Tiny.Container {
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
        enemy.setAnchor(0, 1);
        enemy.setPosition(Tiny.WIN_SIZE.width * 3, GLOBAL.CONF.GROUND_POS_Y);
        this.addChild(enemy);
        this._enemyCache.push(enemy);

        const animeTextures = [];
        for (let i = 1; i < 29; i++) {
            animeTextures.push(Tiny.Texture.fromFrame(`tileset-hit-hit_${i}.png`));
        }
        this._prizeAnime = new Tiny.AnimatedSprite(animeTextures);
        this._prizeAnime.onLoop = () => {
            this._prizeAnime.stop();
        };
        this._prizeAnime.animationSpeed = 0.4;
        this._prizeAnime.setPosition(14, 186);
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
        const randomInterval = Tiny.random(Tiny.WIN_SIZE.width * 1.5, Tiny.WIN_SIZE.width * 2.5); // 每个障碍物之间的间隔，一屏到三屏之间随机
        // @ts-ignore
        const checkPlace = this.parent._background.checkPosPlace(randomInterval);
        this.changePlace(checkPlace);
        const randomItem = this.randomEnemyItem();
        const enemy = new EnemyBox(randomItem);
        enemy.play();
        enemy.setPosition(Tiny.WIN_SIZE.width + randomInterval, GLOBAL.CONF.GROUND_POS_Y);
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
        const index = Tiny.random(0, this._enemyItems.length - 1);
        const item = this._enemyItems.splice(index, 1);
        return item[0];
    }
    addRandomPrize (enemy) {
        const needAdd = Tiny.randomFromArray([1, 1, 0, 1]);
        if (needAdd) {
            // 限制奖品箱子出现的范围
            const prevEnemy = this._enemyCache[this._enemyCache.length - 2];
            const startPos = prevEnemy.getPositionX();
            const randomPos = Tiny.random(startPos, enemy.getPositionX() - 500);
            const prizeBox = new PrizeBox();
            if (GLOBAL.DATA.OPEN_CHANCE > 0) { // 有奖品的箱子
                prizeBox.setPosition(randomPos, GLOBAL.CONF.PRIZE_POS_Y);
                this.addChild(prizeBox);
                this._prizeCache.push(prizeBox);
            } else { // 空气屁箱子
                prizeBox._empty = true;
                prizeBox.setPosition(randomPos, GLOBAL.CONF.PRIZE_POS_Y);
                this.addChild(prizeBox);
                this._prizeCache.push(prizeBox);
            }
        }
    }
    hitPrize (prize, callback) {
        prize.destroyed = true;
        prize.texture = prize._heart;
        prize.playAnime();
        if (prize._empty) {
            Sound.playHitEmpty();
            this._emptyFart.playAnime();
            if (this._isFirstEmpty && !GLOBAL.DATA.NO_INVENTORY && !GLOBAL.DATA.OPEN_CHANCE && GLOBAL.DATA.STATUS === 2) {
                this._isFirstEmpty = false;
                this.emit('noChance');
            }
            callback && callback();
        } else {
            window.kfcMario.drawLottery && window.kfcMario.drawLottery(drawed => {
                if (drawed) {
                    Sound.playHit();
                    GLOBAL.CONF.HIT++;
                    this._prizeAnime.stop();
                    this._prizeAnime.play();
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
