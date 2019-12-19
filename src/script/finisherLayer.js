import resource from './resource';
import HeaderScene from './HeaderScene';
import GLOBAL from './Global';
const alias = 'dialog';
class FinishLayer extends Laya.Scene {
    constructor () {
        super();
        // Tiny.app.view.style['touch-action'] = 'initial';
        // Tiny.app.renderer.plugins.interaction.autoPreventDefault = false;
        this._rankList = [];
        const finishBg = new Laya.Sprite();
        finishBg.loadImage(resource['finishBg'].url);
        finishBg.pivot(0, 0);
        finishBg.pos(16, 187);
        this.addChild(finishBg);
        this._bg = new Laya.Sprite();
        this._bg.loadImage(resource['dialogBg'].url);
        this._bg.pivot(0, 0);
        this._bg.pos(20, 192);
        this.addChild(this._bg);
        const title = new Laya.Sprite();
        title.loadImage(`${alias}act_finish_title.png`);
        title.pivot(title.width / 2, 0);
        title.pos(375, 297);
        this.addChild(title);
        this.drawRank(1);
        this.drawRank(2);
        this.drawRank(3);
        if (GLOBAL.DATA.RANK_SELF && GLOBAL.DATA.RANK_SELF.score) {
            const dash = new Laya.Sprite();
            dash.loadImage(`${alias}dash.png`);
            dash.pivot(dash.width / 2, 0);
            dash.pos(375, 706);
            this.addChild(dash);
            this.drawRankSelf();
        }

        const frame = new Laya.Sprite();
        frame(resource['frame'].url);
        frame.pivot(0, 0);
        frame.pos(0, 0);
        this.addChild(frame);
        this._header = new HeaderScene();
        this.addChild(this._header);
        window.kfcMario && window.kfcMario.showRank && window.kfcMario.showRank();
    }
    drawNum (wrapper, num, size = 'sm', pos, interval = 28, reverse = false) {
        const numArr = num.toString().split('');
        if (reverse) {
            numArr.reverse();
        }
        numArr.forEach((item, index) => {
            const sprite = new Laya.Sprite();
            sprite.loadImage(`num/${size}_${item}.png`);
            sprite.pivot(0, sprite.height);
            if (reverse) {
                sprite.pos(pos.x - index * (interval), pos.y);
            } else {
                sprite.pos(pos.x + index * (interval), pos.y);
            }
            wrapper.addChild(sprite);
        });
    }
    drawRankSelf () {
        const rankItem = new Laya.Sprite();
        rankItem.loadImage(`${alias}rank_bg.png`);
        rankItem.pivot(rankItem.width / 2, 0);
        rankItem.pos(375, 763);
        this.addChild(rankItem);
        if (GLOBAL.DATA.RANK_SELF.rank > 100) {
            const rankIcon = new Laya.Sprite();
            rankIcon.loadImage(`${alias}rank_overflow.png`);
            rankIcon.pos(-267, 26);
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
            const name = new Laya.Text();
            name.text = uname;
            name.fontSize =  24;
            name.bold = true;
            name.color = '#fff';
            name.miterLimit = 50;
            name.pos(-60, 28);
            rankItem.addChild(name);
        }
        if (GLOBAL.DATA.RANK_SELF.score) {
            this.drawNum(rankItem, GLOBAL.DATA.RANK_SELF.score, 'sm', {x: 220, y: 50}, 20, true);
            const m = new Laya.Sprite();
            m.loadImage(`num/sm_m.png`);
            m.pivot(0, m.height);
            m.pos(239, 50);
            rankItem.addChild(m);
        }
    }
    drawRank (rank) {
        const rankItem = new Laya.Sprite();
        rankItem.loadImage(`${alias}rank_bg.png`);
        rankItem.pivot(rankItem.width / 2, 0);
        rankItem.pos(375, 450 + (rank - 1) * 82);
        const rankEnum = ['one', 'two', 'three'];
        const rankIcon = new Laya.Sprite();
        rankIcon.loadImage(`${alias}${rankEnum[rank - 1]}.png`);
        rankIcon.pos(-244, 12);
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
                const name = new Laya.Text();
                name.text = uname;
                name.fontSize = 24;
                name.bold = true;
                name.color = '#fff';
                name.miterLimit = 50;
                name.pos(-60, 28);
                rankItem.addChild(name);
            }
            if (data.score && data.score >= 0) {
                this.drawNum(rankItem, data.score, 'sm', {x: 220, y: 50}, 20, true);
                const m = new Laya.Sprite();
                m.loadImage(`num/sm_m.png`);
                m.pivot(0, m.height);
                m.pos(239, 50);
                rankItem.addChild(m);
            }
        }
        this.addChild(rankItem);
        this._rankList.push(rankItem);
    }
}

export default FinishLayer;