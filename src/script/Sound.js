import resource from './resource';
import GLOBAL from './Global';

const cache = {};

function playSfx (sfx, loop = false) {
    if (GLOBAL.CONF.SOUND_ON) {
        // @ts-ignore
        const audio = Laya.SoundManager.playSound(sfx, loop ? 0 : 1);
        audio.autoReleaseSound = false;
        return audio;
    }
}
function playBg () {
    if (cache.bg) {
        if (GLOBAL.CONF.SOUND_ON) {
            cache.bg.play();
        }
    } else {
        cache.bg = this.playSfx(resource['bgOgg'].url, true);
    }
}
function stopBg (isPause = false) {
    if (cache.bg) {
        cache.bg[isPause ? 'pause' : 'stop']();
    }
}
function playHit () {
    if (cache.hit) {
        if (GLOBAL.CONF.SOUND_ON) {
            cache.hit.stop();
            cache.hit.play();
        }
    } else {
        cache.hit = this.playSfx(resource['boxhitOgg'].url);
    }
}
function playHitEmpty () {
    if (cache.hitEmpty) {
        if (GLOBAL.CONF.SOUND_ON) {
            cache.hitEmpty.stop();
            cache.hitEmpty.play();
        }
    } else {
        cache.hitEmpty = this.playSfx(resource['boxhitemptyOgg'].url);
    }
}
function playJump () {
    if (cache.jump) {
        if (GLOBAL.CONF.SOUND_ON) {
            cache.jump.stop();
            cache.jump.play();
        }
    } else {
        cache.jump = this.playSfx(resource['jumpOgg'].url);
    }
}
function playGameOver () {
    if (cache.gameOver) {
        if (GLOBAL.CONF.SOUND_ON) {
            cache.gameOver.play();
        }
    } else {
        cache.gameOver = this.playSfx(resource['gameoverOgg'].url);
    }
}
function playCountDown () {
    if (cache.countdown) {
        if (GLOBAL.CONF.SOUND_ON) {
            cache.countdown.play();
        }
    } else {
        cache.countdown = this.playSfx(resource['countdownOgg'].url);
    }
}

export default { playSfx, playBg, stopBg, playHit, playHitEmpty, playJump, playGameOver, playCountDown };
