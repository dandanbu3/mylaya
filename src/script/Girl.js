import GLOBAL from './Global';
import Sound from './Sound';

class Girl extends Tiny.AnimatedSprite {
    constructor (who) {
        const preRun = [Tiny.Texture.fromFrame(`tileset-${who}-run_0.png`)];
        super(preRun);
        this._preTextures = this.createTextures(who, 'pre', 0, 2);
        this._runTextures = this.createTextures(who, 'run', 0, 4);
        this._jumpTextures = this.createTextures(who, 'jump', 0, 1);
        this._fallTextures = this.createTextures(who, 'jump', 1, 4);
        this._dieTextures = [Tiny.Texture.fromFrame(`tileset-${who}-die.png`)];
        this._dieGrayTextures = [Tiny.Texture.fromFrame(`tileset-${who}-die_gray.png`)];
        this.textures = this._preTextures;
        this.animationSpeed = 0.1;
        this.setAnchor(0, 1);
        this.setPosition(56, GLOBAL.CONF.GROUND_POS_Y);
        this._girlHeight = this._runTextures[0].height;
        // TODO 优化耦合性
        GLOBAL.CONF.PRIZE_POS_Y = GLOBAL.CONF.GROUND_POS_Y - this._girlHeight * (GLOBAL.CONF.GIRL_JUMP_TIMES + 1) + 30;
        this._jumpHeight = this._girlHeight * GLOBAL.CONF.GIRL_JUMP_TIMES; // 跳起的高度
        this._jumpSpeed = 400;
        this.createJumpAction();
        this.createDieAction();
    }
    createJumpAction () {
        this._jumpAction = Tiny.MoveTo(this._jumpSpeed, Tiny.point(56, GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight));
        this._jumpAction.setEasing(Tiny.TWEEN.Easing.Quadratic.Out);
        this._fallAction = Tiny.MoveTo(this._jumpSpeed, Tiny.point(56, GLOBAL.CONF.GROUND_POS_Y));
        this._fallAction.setEasing(Tiny.TWEEN.Easing.Quadratic.In);
        this._jumpAction.onComplete = () => {
            GLOBAL.CONF.GIRL_STAT = 2;
            this.runAction(this._fallAction);
        };
        this._fallAction.onComplete = () => {
            this._timer = Date.now();
            GLOBAL.CONF.GIRL_STAT = 3;
            this.textures = this._fallTextures;
        };
    }
    changeJumpDuration () { // 调整跳起下落的速度
        const conf = GLOBAL.CONF;
        const ratio = ((conf.SPEED / conf.DEFAULT_SPEED) - 1) / 2 + 1; // 保证ratio大于1
        this._jumpAction.duration = this._jumpSpeed / ratio;
        this._fallAction.duration = this._jumpSpeed / ratio;
    }
    createDieAction () {
        this._dieBlink = Tiny.Blink(50, 50);
        this._dieBlink.onComplete = () => {
            this.textures = this._dieGrayTextures;
            this.emit('die');
        };
        this._dieMoveStart = Tiny.MoveTo(150, Tiny.point(46, GLOBAL.CONF.GROUND_POS_Y - 30));
        this._dieMoveEnd = Tiny.MoveTo(150, Tiny.point(36, GLOBAL.CONF.GROUND_POS_Y));
        this._dieMoveStart.onComplete = () => {
            this.runAction(this._dieMoveEnd);
        };
    }
    createTextures (who, action, start, length) {
        const textures = [];
        for (let i = start; i < length; i++) {
            textures.push(Tiny.Texture.fromFrame(`tileset-${who}-${action}_${i}.png`));
        }
        return textures;
    }
    readyStart () { // 预备开始，主要是倒计时开始的时候用
        this.emit('notRun');
        this.setPosition(56, GLOBAL.CONF.GROUND_POS_Y);
        GLOBAL.CONF.GIRL_STAT = -1;
        this.textures = this._preTextures;
        this.animationSpeed = 0.1;
    }
    startRun () {
        GLOBAL.CONF.GIRL_STAT = 0;
        this.textures = this._runTextures;
        this.animationSpeed = 0.18;
        this.emit('run');
    }
    doJump () {
        if (GLOBAL.CONF.GIRL_STAT !== 1 && GLOBAL.CONF.GIRL_STAT !== 2) {
            GLOBAL.CONF.GIRL_STAT = 1;
            this.emit('notRun');
            Sound.playJump();
            this.textures = this._jumpTextures;
            this.runAction(this._jumpAction);
        }
    }
    beInjured () {
        GLOBAL.CONF.GIRL_STAT = -1;
        this.emit('notRun');
        Sound.playGameOver();
        this.textures = [this._runTextures[0]];
        this.removeActionsTrace();
        this.runAction(Tiny.Repeat(3, this._dieBlink));
        this.runAction(this._dieMoveStart);
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
            const moveAction = Tiny.MoveTo(speed, Tiny.point(56, GLOBAL.CONF.GROUND_POS_Y));
            moveAction.setEasing(Tiny.TWEEN.Easing.Quadratic.In);
            moveAction.onComplete = () => {
                this._timer = Date.now();
                GLOBAL.CONF.GIRL_STAT = 3;
                this.textures = this._fallTextures;
            };
            this.runAction(moveAction);
        } else if (GLOBAL.CONF.GIRL_STAT === 1) {
            const currentDis = this.getPositionY() - (GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight);
            const speed = (this._jumpSpeed - 100) * currentDis / this._jumpHeight;
            const jumpAction = Tiny.MoveTo(speed, Tiny.point(56, GLOBAL.CONF.GROUND_POS_Y - this._jumpHeight));
            jumpAction.setEasing(Tiny.TWEEN.Easing.Quadratic.Out);
            jumpAction.onComplete = () => {
                GLOBAL.CONF.GIRL_STAT = 2;
                this.runAction(this._fallAction);
            };
            this.runAction(jumpAction);
        }
    }
    updateTransform () {
        if (GLOBAL.CONF.MODE === GLOBAL.MODES.PLAYING && GLOBAL.CONF.GIRL_STAT === 3) {
            if (Date.now() - this._timer >= this.animationSpeed * 1000) {
                this.emit('run');
                this.textures = this._runTextures;
                GLOBAL.CONF.GIRL_STAT = 0;
            }
        }
        this.containerUpdateTransform();
    }
}

export default Girl;
