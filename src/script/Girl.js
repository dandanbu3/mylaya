import GLOBAL from './Global';
import Sound from './Sound';

class Girl extends Laya.Animation {
    constructor (who) {
        super();
        this.autoSize = true;
        console.log(who, 'who');
        const preRun = [`${who}/run_0.png`];
        this.loadImages(preRun);
        this._preTextures = this.createTextures(who, 'pre', 0, 2);
        this._runTextures = this.createTextures(who, 'run', 0, 4);
        this._jumpTextures = this.createTextures(who, 'jump', 0, 1);
        this._fallTextures = this.createTextures(who, 'jump', 1, 4);
        this._dieTextures = [`${who}/die.png`];
        this._dieGrayTextures = [`${who}/die_gray.png`];

        // 计算动画高度
        const runrun = new Laya.Sprite();
        runrun.autoSize = true;
        runrun.loadImage(this._runTextures[0]);
        this._girlHeight = runrun.height;
        window.runrun = runrun;
        runrun.removeSelf();
        const jumpGirl = new Laya.Sprite();
        jumpGirl.autoSize = true;
        jumpGirl.loadImage(this._jumpTextures[0]);
        this._jumpGirlHeight = jumpGirl.height;
        jumpGirl.removeSelf();
        const fallGirl = new Laya.Sprite();
        fallGirl.autoSize = true;
        fallGirl.loadImage(this._fallTextures[0]);
        this._fallGirlHeight = fallGirl.height;
        fallGirl.removeSelf();

        const preGirl = new Laya.Sprite();
        preGirl.autoSize = true;
        preGirl.loadImage(this._preTextures[0]);
        this._preGirlHeight = preGirl.height;
        preGirl.removeSelf();
        const dieGirl = new Laya.Sprite();
        dieGirl.autoSize = true;
        dieGirl.loadImage(this._dieGrayTextures[0]);
        this._dieGirlHeight = dieGirl.height;
        dieGirl.removeSelf();

        this.loadImages(this._preTextures);
        this.interval = 160;
        this.pivot(0, this._preGirlHeight);
        this.pos(56, GLOBAL.CONF.GROUND_POS_Y);
        this.play();
        
        // TODO 优化耦合性
        GLOBAL.CONF.PRIZE_POS_Y = GLOBAL.CONF.GROUND_POS_Y - this._girlHeight * (GLOBAL.CONF.GIRL_JUMP_TIMES + 1) + 30;
        this._jumpHeight = this._girlHeight * GLOBAL.CONF.GIRL_JUMP_TIMES; // 跳起的高度
        this._jumpSpeed = 400;
        this._jumpDuration = this._jumpSpeed;
        this._fallDuration = this._jumpSpeed;
        // this.createJumpAction();
        // this.createDieAction();
        Laya.timer.frameLoop(1, this, this.onUpdate);
    }
    createJumpAction () {
        this._jumpAction = Laya.Tween.to(
            this,
            {x: 56, y: GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight },
            this._jumpDuration,
            Laya.Ease.quadOut,
            Laya.Handler.create(this, () => {
                GLOBAL.CONF.GIRL_STAT = 2;
                this.createFallAction();
            }));
        this._jumpAction.pause();
    }
    createFallAction() {
        this._fallAction = Laya.Tween.to(
            this,
            {x: 56, y: GLOBAL.CONF.GROUND_POS_Y },
            this._fallDuration,
            Laya.Ease.quadIn,
            Laya.Handler.create(this, () => {
                this._timer = Date.now();
                GLOBAL.CONF.GIRL_STAT = 3;
                this.loadImages(this._fallTextures);
                this.pivot(0, this._fallGirlHeight);
            }));
    }
    changeJumpDuration () { // 调整跳起下落的速度
        const conf = GLOBAL.CONF;
        const ratio = ((conf.SPEED / conf.DEFAULT_SPEED) - 1) / 2 + 1; // 保证ratio大于1
        this._jumpDuration = this._jumpSpeed / ratio;
        this._fallDuration = this._jumpSpeed / ratio;
    }
    createDieAction () {
        this._dieBlink = new Laya.TimeLine();
        this._dieBlink.addLabel('hide').to(this, {visible: false}, 50)
            .addLabel('show').to(this, {visible: true}, 50);
        this._dieBlink.on(Laya.Event.COMPLETE, this, () => {
            this.loadImages(this._dieGrayTextures);
            this.pivot(0, this._dieGirlHeight);
            this.event('die');
        });
        // this._dieBlink.play();
        this._dieMoveStart = Laya.Tween.to(
            this,
            {x: 46, y: GLOBAL.CONF.GROUND_POS_Y - 30}, 
            150,
            null,
            Laya.Handler.create(this, () => {
                this._dieMoveEnd.resume();
            }));
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
        this.pivot(0, this._preGirlHeight)
        this.interval = 160;
    }
    startRun () {
        GLOBAL.CONF.GIRL_STAT = 0;
        this.loadImages(this._runTextures);
        this.pivot(0, this._girlHeight);
        this.interval = 100;
        this.event('run');
    }
    doJump () {
        console.log('doJump', GLOBAL.CONF.GIRL_STAT);
        if (GLOBAL.CONF.GIRL_STAT !== 1 && GLOBAL.CONF.GIRL_STAT !== 2) {
            GLOBAL.CONF.GIRL_STAT = 1;
            this.event('notRun');
            Sound.playJump();
            this.loadImages(this._jumpTextures);
            this.pivot(0, this._jumpGirlHeight)
            // this._jumpAction.restart();
            this.createJumpAction();
            this._jumpAction.resume();
        }
    }
    beInjured () {
        GLOBAL.CONF.GIRL_STAT = -1;
        this.event('notRun');
        Sound.playGameOver();
        this.loadImages([this._runTextures[0]]);
        this.pivot(0, this._girlHeight);
        // this.y = GLOBAL.CONF.GROUND_POS_Y;
        // this.removeActionsTrace();
        Laya.Tween.clearAll(this);
        // this.runAction(Tiny.Repeat(3, this._dieBlink));
        this.createDieAction();
        this._dieBlink.play(3);
        this._dieMoveStart.resume();
    }
    freeze () {
        // this.removeActionsTrace();
        Laya.Tween.clearAll(this);
        this.stop();
    }
    resume () {
        this.play();
        console.log(GLOBAL.CONF.GIRL_STAT, 'GLOBAL.CONF.GIRL_STAT');
        if (GLOBAL.CONF.GIRL_STAT === 2) {
            const currentDis = GLOBAL.CONF.GROUND_POS_Y - this.y;
            const speed = this._jumpSpeed * currentDis / this._jumpHeight;
            const moveAction = Laya.Tween.to(
                this,
                {x: 56, y: GLOBAL.CONF.GROUND_POS_Y - 200},
                speed,
                Laya.Ease.quadIn,
                Laya.Handler.create(this, () => {
                    this._timer = Date.now();
                    GLOBAL.CONF.GIRL_STAT = 3;
                    this.loadImages(this._fallTextures);
                    this.pivot(0, this._fallGirlHeight);
                }));
            // this.runAction(moveAction);
        } else if (GLOBAL.CONF.GIRL_STAT === 1) {
            const currentDis = this.y - (GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight);
            const speed = (this._jumpSpeed - 100) * currentDis / this._jumpHeight;
            const jumpAction = Laya.Tween.to(
                this,
                {x: 56, y: GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight},
                speed,
                Laya.Ease.quadOut,
                Laya.Handler.create(this, () => {
                    GLOBAL.CONF.GIRL_STAT = 2;
                    this.createFallAction();
                }));
            // this.runAction(jumpAction);
        }
    }
    onUpdate () {
        if (GLOBAL.CONF.MODE === GLOBAL.MODES.PLAYING && GLOBAL.CONF.GIRL_STAT === 3) {
            if (Date.now() - this._timer >= 100000 / (6 * this.interval)) {
                this.event('run');
                this.loadImages(this._runTextures);
                this.pivot(0, this._girlHeight);
                GLOBAL.CONF.GIRL_STAT = 0;
            }
        }
    }
}

export default Girl;
