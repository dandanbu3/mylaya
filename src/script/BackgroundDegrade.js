import resource from './resource';
import GLOBAL from './Global';
const SceneArr = ['forest', 'water', 'city'];
class BackgroundDegrade extends Laya.Sprite {
    constructor () {
        super();
        this._bgCache = [];
        this._bgList = [
            resource['forestDegLeft'].url,
            resource['forestDegRight'].url,
            resource['waterDegLeft'].url,
            resource['waterDegRight'].url,
            resource['cityDegLeft'].url,
            resource['cityDegRight'].url
        ];
        this._newGroundIndex = 1;
        let bgPos = 0;
        for (let i = 0; i < 2; i++) {
            const bg = new Laya.Sprite();
            bg.loadImage(this._bgList[i]);
            // @ts-ignore
            bg._inview = true;
            // @ts-ignore
            bg._allinview = true;
            bg.pivot(0, 1);
            bg.pos(bgPos, Laya.stage.height);
            this.addChild(bg);
            this._bgCache.push(bg);
            bgPos += bg.width;
        }
        Laya.timer.frameLoop(1, this, this.onUpdate);
    }
    checkPosPlace (posX) {
        let posRange = this._bgList[this._newGroundIndex].width - (Laya.stage.width - this._bgCache[this._newGroundIndex % 2].x); // 边界
        let index = this._newGroundIndex;
        const checkRange = () => {
            if (posX > posRange) {
                index = (index + 1) % 6;
                posRange += this._bgList[index].width;
                checkRange();
            }
        };
        checkRange();
        return SceneArr[Math.floor(index / 2)];
    }
    onUpdate () {
        const speed = GLOBAL.CONF.SPEED;
        if (GLOBAL.CONF.MODE === GLOBAL.MODES.PLAYING) {
            for (let i = 0; i < 2; i++) {
                // 地板的处理
                const bg = this._bgCache[i];
                let pos = bg.x;
                const pieceWidth = bg.width;
                const offset = pos + pieceWidth;
                if (!bg._inview && pos - speed <= Laya.stage.width) {
                    bg._inview = true;
                    this._newGroundIndex = (this._newGroundIndex + 1) % 6;
                }
                if (offset <= 0) {
                    bg._inview = false;
                    bg._allinview = false;
                    const nextIndex = (this._newGroundIndex + 1) % 6;
                    bg.texture = this._bgList[nextIndex];
                    pos = this._bgCache[(i + 1) % 2].width + offset;
                }
                bg.x = pos - speed;
            }
        }
        // this.containerUpdateTransform();
    }
}

export default BackgroundDegrade;