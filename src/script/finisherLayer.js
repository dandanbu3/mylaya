import RESOURCES from './resources';
import HeaderScene from './HeaderScene';
import GLOBAL from './Global';
const alias = 'tileset-dialog-';
class FinishLayer extends Tiny.Container {
    constructor () {
        super();
        Tiny.app.view.style['touch-action'] = 'initial';
        Tiny.app.renderer.plugins.interaction.autoPreventDefault = false;
        this._rankList = [];
        const finishBg = new Tiny.Sprite(Tiny.Texture.fromImage(RESOURCES['finishBg']));
        finishBg.setAnchor(0);
        finishBg.setPosition(16, 187);
        this.addChild(finishBg);
        this._bg = new Tiny.Sprite(Tiny.Texture.fromImage(RESOURCES['dialogBg']));
        this._bg.setAnchor(0);
        this._bg.setPosition(20, 192);
        this.addChild(this._bg);
        const title = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}act_finish_title.png`));
        title.setAnchor(0.5, 0);
        title.setPosition(375, 297);
        this.addChild(title);
        this.drawRank(1);
        this.drawRank(2);
        this.drawRank(3);
        if (GLOBAL.DATA.RANK_SELF && GLOBAL.DATA.RANK_SELF.score) {
            const dash = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}dash.png`));
            dash.setAnchor(0.5, 0);
            dash.setPosition(375, 706);
            this.addChild(dash);
            this.drawRankSelf();
        }

        const frame = new Tiny.Sprite(Tiny.Texture.fromImage(RESOURCES['frame']));
        frame.setAnchor(0);
        frame.setPosition(0);
        this.addChild(frame);
        this._header = new HeaderScene();
        this.addChild(this._header);
        window.kfcMario.showRank && window.kfcMario.showRank();
    }
    drawNum (wrapper, num, size = 'sm', pos, interval = 28, reverse = false) {
        const numArr = num.toString().split('');
        if (reverse) {
            numArr.reverse();
        }
        numArr.forEach((item, index) => {
            const sprite = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-num-${size}_${item}.png`));
            sprite.setAnchor(0, 1);
            if (reverse) {
                sprite.setPosition(pos.x - index * (interval), pos.y);
            } else {
                sprite.setPosition(pos.x + index * (interval), pos.y);
            }
            wrapper.addChild(sprite);
        });
    }
    drawRankSelf () {
        const rankItem = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}rank_bg.png`));
        rankItem.setAnchor(0.5, 0);
        rankItem.setPosition(375, 763);
        this.addChild(rankItem);
        if (GLOBAL.DATA.RANK_SELF.rank > 100) {
            const rankIcon = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}rank_overflow.png`));
            rankIcon.setPosition(-267, 26);
            rankItem.addChild(rankIcon);
        } else {
            this.drawNum(this, GLOBAL.DATA.RANK_SELF.rank, 'rank', {x: 134, y: 818}, 28);
        }
        let uname = GLOBAL.DATA.RANK_SELF.name || '';
        if (uname) {
            if (GLOBAL.DATA.RANK_SELF.name.replace(/[^\x00-\xff]/g, 'xx').length > 12) {
                const nameSplit = GLOBAL.DATA.RANK_SELF.name.split('');
                let length = 0;
                let tempName = '';
                const regex = /[^\x00-\xff]/;
                for (let i = 0; i < nameSplit.length; i++) {
                    length = length + (regex.test(nameSplit[i]) ? 2 : 1);
                    if (length <= 12) {
                        tempName += nameSplit[i];
                    } else {
                        tempName += '...';
                        break;
                    }
                }
                uname = tempName;
            }
            const name = new Tiny.Text(uname, {
                fontSize: 24,
                fontWeight: 'bold',
                fill: 'white',
                miterLimit: 50
            });
            name.setPosition(-60, 28);
            rankItem.addChild(name);
        }
        if (GLOBAL.DATA.RANK_SELF.score) {
            this.drawNum(rankItem, GLOBAL.DATA.RANK_SELF.score, 'sm', {x: 220, y: 50}, 20, true);
            const m = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-num-sm_m.png`));
            m.setAnchor(0, 1);
            m.setPosition(239, 50);
            rankItem.addChild(m);
        }
    }
    drawRank (rank) {
        const rankItem = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}rank_bg.png`));
        rankItem.setAnchor(0.5, 0);
        rankItem.setPosition(375, 450 + (rank - 1) * 82);
        const rankEnum = ['one', 'two', 'three'];
        const rankIcon = new Tiny.Sprite(Tiny.Texture.fromFrame(`${alias}${rankEnum[rank - 1]}.png`));
        rankIcon.setPosition(-244, 12);
        rankItem.addChild(rankIcon);
        const data = GLOBAL.DATA.RANK_LIST[rank - 1];
        if (data) {
            let uname = data.name || '';
            if (uname) {
                if (data.name.replace(/[^\x00-\xff]/g, 'xx').length > 12) {
                    const nameSplit = data.name.split('');
                    let length = 0;
                    let tempName = '';
                    const regex = /[^\x00-\xff]/;
                    for (let i = 0; i < nameSplit.length; i++) {
                        length = length + (regex.test(nameSplit[i]) ? 2 : 1);
                        if (length <= 12) {
                            tempName += nameSplit[i];
                        } else {
                            tempName += '...';
                            break;
                        }
                    }
                    uname = tempName;
                }
                const name = new Tiny.Text(uname, {
                    fontSize: 24,
                    fontWeight: 'bold',
                    fill: 'white',
                    miterLimit: 50
                });
                name.setPosition(-60, 28);
                rankItem.addChild(name);
            }
            if (data.score && data.score >= 0) {
                this.drawNum(rankItem, data.score, 'sm', {x: 220, y: 50}, 20, true);
                const m = new Tiny.Sprite(Tiny.Texture.fromFrame(`tileset-num-sm_m.png`));
                m.setAnchor(0, 1);
                m.setPosition(239, 50);
                rankItem.addChild(m);
            }
        }
        this.addChild(rankItem);
        this._rankList.push(rankItem);
    }
}

export default FinishLayer;