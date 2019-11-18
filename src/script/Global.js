const ENEMY_CONF = {
    city: {
        items: [{
            name: 'box',
            frames: 4,
            speed: 0.1,
            points: [{
                x: 16, y: 8
            }, {
                x: 45, y: 0
            }, {
                x: 74, y: 8
            }]
        }, {
            name: 'cat',
            frames: 8,
            speed: 0.1,
            points: [{
                x: 2, y: 16
            }, {
                x: 25, y: 0
            }, {
                x: 86, y: 40
            }]
        }, {
            name: 'cone',
            frames: 4,
            speed: 0.1,
            points: [{
                x: 0, y: 73
            }, {
                x: 37, y: 0
            }, {
                x: 72, y: 73
            }]
        }, {
            name: 'tc',
            frames: 4,
            speed: 0.1,
            points: [{
                x: 8, y: 22
            }, {
                x: 23, y: 0
            }, {
                x: 56, y: 16
            }]
        }]
    },
    water: {
        items: [{
            name: 'fish',
            frames: 6,
            speed: 0.2,
            points: [{
                x: 0, y: 24
            }, {
                x: 67, y: 0
            }, {
                x: 80, y: 12
            }]
        }, {
            name: 'vortex',
            frames: 4,
            speed: 0.2,
            points: [{
                x: 0, y: 20
            }, {
                x: 40, y: 0
            }, {
                x: 86, y: 24
            }]
        }]
    },
    forest: {
        items: [{
            name: 'eat_flower',
            frames: 3,
            speed: 0.1,
            points: [{
                x: 0, y: 28
            }, {
                x: 37, y: 0
            }, {
                x: 64, y: 73
            }]
        }, {
            name: 'flower',
            frames: 3,
            speed: 0.1,
            points: [{
                x: 0, y: 58
            }, {
                x: 17, y: 0
            }, {
                x: 58, y: 4
            }, {
                x: 64, y: 58
            }]
        }, {
            name: 'fire',
            frames: 3,
            speed: 0.2,
            points: [{
                x: 0, y: 72
            }, {
                x: 23, y: 0
            }, {
                x: 58, y: 70
            }]
        }, {
            name: 'ghost',
            frames: 3,
            speed: 0.1,
            points: [{
                x: 0, y: 46
            }, {
                x: 40, y: 0
            }, {
                x: 76, y: 10
            }]
        }]
    }
};

export default {
    CONF: { // 游戏配置
        PREVENT: false,
        DEFAULT_SPEED: 10, // 移动速度（像素）
        SPEED: 10, // 移动速度（像素）
        GROUND_POS_Y: 948, // 地板的位置
        PRIZE_POS_Y: 0, // 通过女孩的高度和跳起倍数动态计算
        GIRL_JUMP_TIMES: 1.5, // 2233跳起的高度倍数
        SOUND_ON: false,
        GIRL_STAT: -1, // -1:pre, 0:runing, 1:up, 2:down, 3: squat蹲
        HIT: 0, // 顶到的奖品数
        MILEAGE: 0, // 里程数
        MODE: -2, // 当前模式
        DEGRADE: false, // 是否降级
        TRY_GAME: false // 游戏试玩
    },
    MODES: { // 游戏模式
        MENU: -2,
        PRE: -1,
        PLAYING: 0,
        PAUSED: 1,
        GAME_OVER: 2
    },
    DATA: { // 接口数据
        IS_LOGIN: true, // 登录状态
        MID: 0,
        STATUS: 2, // 活动状态
        ACT_START_TIME: '', // 活动开始时间
        DISPLAY_CHANCE: 0, // 总的开箱机会
        OPEN_CHANCE: 0, // 当天的开箱机会
        NO_INVENTORY: '', // today:今日无库存 all:库存全无
        ALL_RECORD: 0, // 全站记录
        SELF_RECORD: 0, // 个人记录
        LOTTERY_LIST: [], // 抽奖中奖列表
        RANK_LIST: [],
        RANK_SELF: null,

    },
    TEXTURE_CACHES: {},
    ENEMY_CONF
};
