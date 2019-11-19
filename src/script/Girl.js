import GLOBAL from './Global';
import Sound from './Sound';

class Girl extends Laya.Animation {
    constructor (who) {
        const preRun = [`${who}/run_0.png`];
        super();
        this.loadImages(preRun);
        this._preTextures = this.createTextures(who, 'pre', 0, 2);
        this._runTextures = this.createTextures(who, 'run', 0, 4);
        this._jumpTextures = this.createTextures(who, 'jump', 0, 1);
        this._fallTextures = this.createTextures(who, 'jump', 1, 4);
        this._dieTextures = [`${who}/die.png`];
        this._dieGrayTextures = [`${who}/die_gray.png`];
        this.loadImages(this._preTextures);
        this.interval = 160;
        this.pivot(0, 1);
        this.pos(56, GLOBAL.CONF.GROUND_POS_Y);
        const runrun = new Laya.Sprite();
        runrun.loadImage(this._runTextures[0]);

        this._girlHeight = runrun.height;
        // TODO 优化耦合性
        GLOBAL.CONF.PRIZE_POS_Y = GLOBAL.CONF.GROUND_POS_Y - this._girlHeight * (GLOBAL.CONF.GIRL_JUMP_TIMES + 1) + 30;
        this._jumpHeight = this._girlHeight * GLOBAL.CONF.GIRL_JUMP_TIMES; // 跳起的高度
        this._jumpSpeed = 400;
        this.createJumpAction();
        this.createDieAction();
    }
    createJumpAction () {
        this._jumpAction = Laya.Tween.to(
            this,
            {x: 56, y: GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight},
            this._jumpSpeed,
            Laya.Ease.quadOut,
            () => {
                GLOBAL.CONF.GIRL_STAT = 2;
                this._fallAction.resume();
            });
        this._jumpAction.pause();
        this._fallAction = Laya.Tween.to(
            this,
            {x: 56, y: GLOBAL.CONF.GROUND_POS_Y},
            this._jumpSpeed,
            Laya.Ease.quadIn,
            () => {
                this._timer = Date.now();
                GLOBAL.CONF.GIRL_STAT = 3;
                this.loadImages(this._fallTextures);
            });
        this._fallAction.pause();
    }
    changeJumpDuration () { // 调整跳起下落的速度
        const conf = GLOBAL.CONF;
        const ratio = ((conf.SPEED / conf.DEFAULT_SPEED) - 1) / 2 + 1; // 保证ratio大于1
        this._jumpAction.duration = this._jumpSpeed / ratio;
        this._fallAction.duration = this._jumpSpeed / ratio;
    }
    createDieAction () {
        this._dieBlink = new Laya.TimeLine();
        this._dieBlink.addLabel('hide').to(this, {visible: false}, 50)
            .addLabel('show').to(this, {visible: true}, 50);
        this._dieBlink.on(Laya.Event.COMPLETE, this, () => {
            this.loadImages(this._dieGrayTextures);
            this.event('die');
        });
        this._dieBlink.play();
        this._dieMoveStart = Laya.Tween.to(
            this,
            {x: 46, y: GLOBAL.CONF.GROUND_POS_Y - 30}, 
            150,
            null,
            () => {
                this._dieMoveEnd.resume();
            });
        this._dieMoveStart.pause();
        this._dieMoveEnd = Laya.Tween.to(
            this,
            {x: 36, y: GLOBAL.CONF.GROUND_POS_Y}, 
            150);
        this._dieMoveEnd.pause();
    }
    createTextures (who, action, start, length) {
        const textures = this.aniUrls(`${who}/${action}_`, start, length);
        return textures;
    }
    aniUrls(name, start, num) {
        var urls = [];
        for(var i = start;i < num;i++){
            //动画资源路径要和动画图集打包前的资源命名对应起来
            urls.push(name + i + ".png");
        }
        return urls;
    }
    readyStart () { // 预备开始，主要是倒计时开始的时候用
        this.event('notRun');
        this.pos(56, GLOBAL.CONF.GROUND_POS_Y);
        GLOBAL.CONF.GIRL_STAT = -1;
        this.loadImages(this._preTextures);
        this.interval = 160;
    }
    startRun () {
        GLOBAL.CONF.GIRL_STAT = 0;
        this.loadImages(this._runTextures);
        this.interval = 100;
        this.event('run');
    }
    doJump () {
        if (GLOBAL.CONF.GIRL_STAT !== 1 && GLOBAL.CONF.GIRL_STAT !== 2) {
            GLOBAL.CONF.GIRL_STAT = 1;
            this.event('notRun');
            Sound.playJump();
            this.loadImages(this._jumpTextures);
            this.runAction(this._jumpAction);
        }
    }
    beInjured () {
        GLOBAL.CONF.GIRL_STAT = -1;
        this.event('notRun');
        Sound.playGameOver();
        this.loadImage([this._runTextures[0]]);
        this.removeActionsTrace();
        this.runAction(Tiny.Repeat(3, this._dieBlink));
        this._dieMoveStart.resume();
    }
    freeze () {
        this.removeActionsTrace();
        this.stop();
    }
    resume () {
        this.play();
        if (GLOBAL.CONF.GIRL_STAT === 2) {
            const currentDis = GLOBAL.CONF.GROUND_POS_Y - this.getPositionY();
            const speed = this._jumpSpeed * currentDis / this._jumpHeight;
            const moveAction = new Laya.Tween.to(
                this,
                {x: 56, y: GLOBAL.CONF.GROUND_POS_Y},
                speed,
                Laya.Ease.quadIn,
                () => {
                    this._timer = Date.now();
                    GLOBAL.CONF.GIRL_STAT = 3;
                    this.loadImages(this._fallTextures);
                });
            // this.runAction(moveAction);
        } else if (GLOBAL.CONF.GIRL_STAT === 1) {
            const currentDis = this.y - (GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight);
            const speed = (this._jumpSpeed - 100) * currentDis / this._jumpHeight;
            const jumpAction = new Laya.Tween.to(
                this,
                {x: 56, y: GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight},
                speed,
                Laya.Ease.quadOut,
                () => {
                    GLOBAL.CONF.GIRL_STAT = 2;
                    this._fallAction.resume;
                });
            // this.runAction(jumpAction);
        }
    }
    updateTransform () {
        if (GLOBAL.CONF.MODE === GLOBAL.MODES.PLAYING && GLOBAL.CONF.GIRL_STAT === 3) {
            if (Date.now() - this._timer >= 100000 / 6 / this.interval ) {
                this.event('run');
                this.loadImages(this._runTextures);
                GLOBAL.CONF.GIRL_STAT = 0;
            }
        }
        this.containerUpdateTransform();
    }
}

export default Girl;
