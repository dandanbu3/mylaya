import RESOURCES from './resources';
import GLOBAL from './Global';
const SceneArr = ['forest', 'water', 'city'];
class BackgroundScene extends Tiny.Container {
    constructor () {
        super();
        this._bgCache = [];
        this._cloudCache = [];
        this._mgCache = [];
        this._fgCache = [];
        this._groundCache = [];
        this._newGroundIndex = 1;

        const bgLeft = Tiny.Texture.fromImage(RESOURCES['bgLeft']);
        const bgRight = Tiny.Texture.fromImage(RESOURCES['bgRight']);
        
        this._bgWidth = 2180;
        for (let i = 0; i < 4; i++) {
            const mode = i % 2;
            const sprite = new Tiny.Sprite(mode === 0 ? bgLeft : bgRight);
            sprite.setAnchor(0);
            sprite.setPosition(this._bgWidth * i, 190);
            this.addChild(sprite);
            this._bgCache.push(sprite);
        }
        
        const cloudSmallLeft = Tiny.Texture.fromImage(RESOURCES['cloudSmallLeft']);
        const cloudSmallRight = Tiny.Texture.fromImage(RESOURCES['cloudSmallRight']);
        const cloudLargeLeft = Tiny.Texture.fromImage(RESOURCES['cloudLargeLeft']);
        const cloudLargeRight = Tiny.Texture.fromImage(RESOURCES['cloudLargeRight']);
        this._cloudList = [cloudSmallLeft, cloudSmallRight, cloudLargeLeft, cloudLargeRight, cloudSmallLeft, cloudSmallRight];
        let cloudPosX = 0;
        for (let i = 0; i < 2; i++) {
            const sprite = new Tiny.Sprite(this._cloudList[i]);
            sprite.setAnchor(0);
            sprite.setPosition(cloudPosX, 293);
            this.addChild(sprite);
            this._cloudCache.push(sprite);
            cloudPosX += sprite.width;
        }

        this._mgList = [
            Tiny.Texture.fromImage(RESOURCES['mgForestLeft']),
            Tiny.Texture.fromImage(RESOURCES['mgForestRight']),
            Tiny.Texture.fromImage(RESOURCES['mgWaterLeft']),
            Tiny.Texture.fromImage(RESOURCES['mgWaterRight']),
            Tiny.Texture.fromImage(RESOURCES['mgCityLeft']),
            Tiny.Texture.fromImage(RESOURCES['mgCityRight'])
        ];
        let mgPosX = 0;
        for (let i = 0; i < 2; i++) {
            const sprite = new Tiny.Sprite(this._mgList[i]);
            sprite.setAnchor(0);
            sprite.setPosition(mgPosX, 60);
            this.addChild(sprite);
            this._mgCache.push(sprite);
            mgPosX += sprite.width;
        }

        this._fgList = [
            Tiny.Texture.fromImage(RESOURCES['fgForestLeft']),
            Tiny.Texture.fromImage(RESOURCES['fgForestRight']),
            Tiny.Texture.fromImage(RESOURCES['fgWaterLeft']),
            Tiny.Texture.fromImage(RESOURCES['fgWaterRight']),
            Tiny.Texture.fromImage(RESOURCES['fgCityLeft']),
            Tiny.Texture.fromImage(RESOURCES['fgCityRight'])
        ];
        let fgPosX = 50;
        for (let i = 0; i < 2; i++) {
            const sprite = new Tiny.Sprite(this._fgList[i]);
            sprite.setAnchor(0);
            sprite.setPosition(fgPosX, 60);
            this.addChild(sprite);
            this._fgCache.push(sprite);
            fgPosX += sprite.width;
        }

        // 2233广告牌
        const ad22Textures = [];
        for (let i = 0; i < 43; i++) {
            ad22Textures.push(Tiny.Texture.fromFrame(`ad_22_${i}.png`));
        }
        this._fgCache[0]._adAnime = new Tiny.AnimatedSprite(ad22Textures);
        this._fgCache[0]._adAnime.animationSpeed = 0.5;
        this._fgCache[0]._adAnime.setAnchor(0, 1);
        this._fgCache[0]._adAnime.setPosition(408, 756);
        this._fgCache[0]._adAnime.play();
        this._fgCache[0]._adAnime.setVisible(false);
        this._fgCache[0].addChild(this._fgCache[0]._adAnime);
        const ad33Textures = [];
        for (let i = 0; i < 21; i++) {
            ad33Textures.push(Tiny.Texture.fromFrame(`ad_33_${i}.png`));
        }
        this._fgCache[1]._adAnime = new Tiny.AnimatedSprite(ad33Textures);
        this._fgCache[1]._adAnime.animationSpeed = 0.5;
        this._fgCache[1]._adAnime.setAnchor(0, 1);
        this._fgCache[1]._adAnime.setPosition(1060, 764);
        this._fgCache[1]._adAnime.play();
        this._fgCache[1]._adAnime.setVisible(false);
        this._fgCache[1].addChild(this._fgCache[1]._adAnime);

        // 便利店招牌
        // const shophTextures = [];
        // for (let i = 0; i < 25; i++) {
        //     shophTextures.push(Tiny.Texture.fromFrame(`shoph_${i}.png`));
        // }
        // this._fgCache[1]._shopH = new Tiny.AnimatedSprite(shophTextures);
        // this._fgCache[1]._shopH.animationSpeed = 0.4;
        // this._fgCache[1]._shopH.setPosition(1034, 608);
        // this._fgCache[1]._shopH.play();
        // this._fgCache[1]._shopH.setVisible(false);
        // this._fgCache[1].addChild(this._fgCache[1]._shopH);
        // 便利店字幕
        // const shopTextures = [];
        // for (let i =0; i < 26; i++) {
        //     shopTextures.push(Tiny.Texture.fromFrame(`shop_${i}.png`));
        // }
        // this._fgCache[1]._shop = new Tiny.AnimatedSprite(shopTextures);
        // this._fgCache[1]._shop.animationSpeed = 0.4;
        // this._fgCache[1]._shop.setPosition(586, 608);
        // this._fgCache[1]._shop.play();
        // this._fgCache[1]._shop.setVisible(false);
        // this._fgCache[1].addChild(this._fgCache[1]._shop);

        // 大楼银幕
        const buildTextures = [];
        for (let i = 0; i < 10; i++) {
            buildTextures.push(Tiny.Texture.fromFrame(`build_${i}.png`));
        }
        this._fgCache[0]._build = new Tiny.AnimatedSprite(buildTextures);
        this._fgCache[0]._build.animationSpeed = 0.4;
        this._fgCache[0]._build.setPosition(777, 160);
        this._fgCache[0]._build.play();
        this._fgCache[0]._build.setVisible(false);
        this._fgCache[0].addChild(this._fgCache[0]._build);

        // 咖啡厅招牌
        // const cofTextures = [];
        // for (let i = 0; i < 8; i++) {
        //     cofTextures.push(Tiny.Texture.fromFrame(`cof_${i}.png`));
        // }
        // this._fgCache[0]._cof = new Tiny.AnimatedSprite(cofTextures);
        // this._fgCache[0]._cof.animationSpeed = 0.4;
        // this._fgCache[0]._cof.setPosition(1148, 564);
        // this._fgCache[0]._cof.play();
        // this._fgCache[0]._cof.setVisible(false);
        // this._fgCache[0].addChild(this._fgCache[0]._cof);

        // 海鸥
        for (let i  = 0; i < 3; i ++) {
            const birdTextures = [];
            for (let j = 0; j < 6; j++) {
                birdTextures.push(Tiny.Texture.fromFrame(`bird_${i}_${j}.png`));
            }
            const flyAction = Tiny.MoveBy(500, Tiny.point(0, 50));
            if (i === 0) {
                this._fgCache[0]._bird0 = new Tiny.AnimatedSprite(birdTextures);
                this._fgCache[0]._bird0.animationSpeed = 0.2;
                this._fgCache[0]._bird0.setPosition(1160, -580);
                this._fgCache[0]._bird0.play();
                this._fgCache[0]._bird0.runAction(Tiny.RepeatForever(Tiny.Back(flyAction)));
                this._fgCache[0].addChild(this._fgCache[0]._bird0);
            } else {
                this._fgCache[1][`_bird${i}`] = new Tiny.AnimatedSprite(birdTextures);
                this._fgCache[1][`_bird${i}`].animationSpeed = 0.2;
                this._fgCache[1][`_bird${i}`].setPosition(i === 1 ? 340 : 580, -780);
                this._fgCache[1][`_bird${i}`].play();
                this._fgCache[1][`_bird${i}`].runAction(Tiny.RepeatForever(Tiny.Back(flyAction)));
                this._fgCache[1].addChild(this._fgCache[1][`_bird${i}`]);
            }
        }
        
        this._groundList = [
            Tiny.Texture.fromImage(RESOURCES['grassLeft']),
            Tiny.Texture.fromImage(RESOURCES['grassRight']),
            Tiny.Texture.fromImage(RESOURCES['bridgeLeft']),
            Tiny.Texture.fromImage(RESOURCES['bridgeRight']),
            Tiny.Texture.fromImage(RESOURCES['roadLeft']),
            Tiny.Texture.fromImage(RESOURCES['roadRight'])
        ];
        let groundPosX = 0;
        for (let i = 0; i < 2; i++) {
            const ground = new Tiny.Sprite(this._groundList[i]);
            // @ts-ignore
            ground._inview = true;
            // @ts-ignore
            ground._allinview = true;
            ground.setAnchor(0);
            ground.setPosition(groundPosX, GLOBAL.CONF.GROUND_POS_Y - 20);
            this.addChild(ground);
            this._groundCache.push(ground);
            groundPosX += ground.width;
        }
    }
    checkPosPlace (posX) {
        let posRange = this._groundList[this._newGroundIndex].width - (Tiny.WIN_SIZE.width - this._groundCache[this._newGroundIndex % 2].getPositionX()); // 边界
        let index = this._newGroundIndex;
        const checkRange = () => {
            if (posX > posRange) {
                index = (index + 1) % 6;
                posRange += this._groundList[index].width;
                checkRange();
            }
        };
        checkRange();
        return SceneArr[Math.floor(index / 2)];
    }
    updateTransform () {
        const speed = GLOBAL.CONF.SPEED;
        if (GLOBAL.CONF.MODE === GLOBAL.MODES.PLAYING) {
            for (let i = 0; i < 4; i++) {
                let bgPos = this._bgCache[i].getPositionX();
                const offsetBg = bgPos + this._bgWidth * 2;
                if (offsetBg <= 0) {
                    bgPos = this._bgWidth * 2 + offsetBg;
                }
                this._bgCache[i].setPositionX(bgPos - 5);
                if (i < 2) {
                    // 地板的处理
                    const piece = this._groundCache[i];
                    let pos = piece.getPositionX();
                    const pieceWidth = piece.width;
                    const offset = pos + pieceWidth;
                    if (!piece._inview && pos - speed <= Tiny.WIN_SIZE.width) {
                        piece._inview = true;
                        this._newGroundIndex = (this._newGroundIndex + 1) % 6;
                        if (this._newGroundIndex === 4) {
                            this._fgCache[0]._adAnime.setVisible(true);
                            this._fgCache[0]._build.setVisible(true);
                            // this._fgCache[0]._cof.setVisible(true);
                        }
                        if (this._newGroundIndex === 5) {
                            this._fgCache[1]._adAnime.setVisible(true);
                            // this._fgCache[1]._shopH.setVisible(true);
                            // this._fgCache[1]._shop.setVisible(true);
                        }
                        if (this._newGroundIndex % 2 === 0) {
                            this._mgCache[0].texture = this._mgList[this._newGroundIndex];
                            this._fgCache[0].texture = this._fgList[this._newGroundIndex];
                            const which = Math.floor(this._newGroundIndex / 2);
                            if (which === 1) {
                                this._mgCache[0].setAnchor(0, 1);
                                this._mgCache[0].setPositionY(GLOBAL.CONF.GROUND_POS_Y + 64);
                                this._fgCache[0].setAnchor(0, 1);
                                this._fgCache[0].setPositionY(1136);
                            } else {
                                this._mgCache[0].setAnchor(0);
                                this._mgCache[0].setPositionY(60);
                                this._fgCache[0].setAnchor(0);
                                this._fgCache[0].setPositionY(60);
                            }
                            this._cloudCache[0].texture = this._cloudList[this._newGroundIndex];
                            this._cloudCache[0].setPositionX(Tiny.WIN_SIZE.width + 100);
                            this._mgCache[0].setPositionX(Tiny.WIN_SIZE.width);
                            this._fgCache[0].setPositionX(Tiny.WIN_SIZE.width + (which === 0 ? 50 : 0));
                        }
                    }
                    if (offset <= 0) {
                        piece._inview = false;
                        piece._allinview = false;
                        if (this._newGroundIndex === 5) {
                            this._fgCache[0]._adAnime.setVisible(false);
                            this._fgCache[0]._build.setVisible(false);
                            // this._fgCache[0]._cof.setVisible(false);
                        }
                        if (this._newGroundIndex === 0) {
                            this._fgCache[1]._adAnime.setVisible(false);
                            // this._fgCache[1]._shopH.setVisible(false);
                            // this._fgCache[1]._shop.setVisible(false);
                        }
                        const nextIndex = (this._newGroundIndex + 1) % 6;
                        piece.texture = this._groundList[nextIndex];
                        if (Math.floor(nextIndex / 2) === 1) {
                            piece.setPositionY(GLOBAL.CONF.GROUND_POS_Y - 109);
                        } else {
                            piece.setPositionY(GLOBAL.CONF.GROUND_POS_Y - 20);
                        }
                        pos = this._groundCache[(i + 1) % 2].width + offset;
                    }
                    piece.setPositionX(pos - speed);

                    // 云、中景、前景的处理
                    if (i === 0 && !piece._allinview && pos <= 0) {
                        piece._allinview = true;
                        const nextIndex = (this._newGroundIndex + 1) % 6;
                        this._cloudCache[1].texture = this._cloudList[nextIndex];
                        this._mgCache[1].texture = this._mgList[nextIndex];
                        this._fgCache[1].texture = this._fgList[nextIndex];
                        const which = Math.floor(nextIndex / 2);
                        if (which === 1) {
                            this._mgCache[1].setAnchor(0, 1);
                            this._mgCache[1].setPositionY(GLOBAL.CONF.GROUND_POS_Y + 64);
                            this._fgCache[1].setAnchor(0, 1);
                            this._fgCache[1].setPositionY(1136);
                        } else {
                            this._mgCache[1].setAnchor(0);
                            this._mgCache[1].setPositionY(60);
                            this._fgCache[1].setAnchor(0);
                            this._fgCache[1].setPositionY(60);
                        }
                        this._cloudCache[1].setPositionX(this._cloudCache[0].width + this._cloudCache[0].getPositionX());
                        this._mgCache[1].setPositionX(this._mgCache[0].width + this._mgCache[0].getPositionX());
                        this._fgCache[1].setPositionX(this._fgCache[0].width + this._fgCache[0].getPositionX());
                    }
                    // 云
                    const cloudPos = this._cloudCache[i].getPositionX();
                    this._cloudCache[i].setPositionX(cloudPos - speed * 0.7);
                    // 中景
                    const mgPos = this._mgCache[i].getPositionX();
                    this._mgCache[i].setPositionX(mgPos - (speed * 0.95));
                    // 前景
                    const fgPos = this._fgCache[i].getPositionX();
                    this._fgCache[i].setPositionX(fgPos - speed);
                }
            }
        }
        this.containerUpdateTransform();
    }
}

export default BackgroundScene;
