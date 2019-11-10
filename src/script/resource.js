const publicPath = process.env.NODE_ENV === 'production' ? '//s1.hdslb.com/bfs/static/activities/static/' : '';
const frame = {url: `${publicPath}res/images/frame.png`, name: "frame"};
const menuBg = {url: `${publicPath}res/images/menu_bg.png`, name: "menuBg"};
const storySetting = {url: `${publicPath}res/images/story_setting.png`, name: "storySetting"};
const finishBg = {url: `${publicPath}res/images/finish_bg.png`, name: "finishBg"};
const bgLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/9a8b151509713d312f5f50f4ff68f919372e1e7f.png`, name: "bgLeft"};
const bgRight = {url: `//i0.hdslb.com/bfs/kfptfe/floor/a305e973913ed408d5bcc10e656d2de6827ff070.png`, name: "bgRight"};

const cloudSmallLeft = {url: `${publicPath}res/images/cloud_small_left.png`, name: "cloudSmallLeft"};
const cloudSmallRight = {url: `${publicPath}res/images/cloud_small_right.png`, name: "cloudSmallRight"};
const cloudLargeLeft = {url: `${publicPath}res/images/cloud_large_left.png`, name: "cloudLargeLeft"};
const cloudLargeRight = {url: `${publicPath}res/images/cloud_large_right.png`, name: "cloudLargeRight"};

const mgForestLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/18d828975b3df41c70d3c5dc4af5da8eaedc70a6.png`, name: "mgForestLeft"};
const mgForestRight = {url: `//i0.hdslb.com/bfs/kfptfe/floor/b997e9ff85ab732691546acddab5febaab7d64a7.png`, name: "mgForestRight"};
const mgWaterLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/893892609e737dcc1353721ed3b9b794143523d8.png`, name: "mgWaterLeft"};
const mgWaterRight = {url: `//i0.hdslb.com/bfs/kfptfe/floor/665b4e7180b870730a21b985a92552076f3d626c.png`, name: "mgWaterRight"};
const mgCityLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/6cfcd32eb78c80b0ebf38b586f7a454a01c92052.png`, name: "mgCityLeft"};
const mgCityRight = {url: `//i0.hdslb.com/bfs/kfptfe/floor/5653fe8f74ab9902ce88f98657b114acfa03f5b8.png`, name: "mgCityRight"};

const fgForestLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/647129cdf757ae39ebbbda479d109d99bf96a1e7.png`, name: "fgForestLeft"};
const fgForestRight = {url: `//i0.hdslb.com/bfs/kfptfe/floor/b151c360973bd1b75177c265c2fc1f27abfecf6b.png`, name: "fgForestRight"};
const fgWaterLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/bcf67b436ae262977a8dd838e71c34a5fcc7554b.png`, name: "fgWaterLeft"};
const fgWaterRight ={url: `//i0.hdslb.com/bfs/kfptfe/floor/6262cae21a7d3e80af755493a5a17adb5195e303.png`, name: "fgWaterRight"};
const fgCityLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/e2f804dad092dc1bde05221f44efbcf7d51b44b3.png`, name: "fgCityLeft"};
const fgCityRight = {url: `//i0.hdslb.com/bfs/kfptfe/floor/fb6b1e9b944b4ca2ed71d1a4c916855f4d1e0c2b.png`, name: "fgCityRight"};

const grassLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/e3a19e4a89c9195f048675d7b7553fee8f15380c.png`, name: "grassLeft"};
const grassRight = {url: `//i0.hdslb.com/bfs/kfptfe/floor/129c7cf29e75df512b8bdd27ce1f6a83459b4c8c.png`, name: "grassRight"};
const bridgeLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/199ec474c224550e6df2a688038120d9a33c7caf.png`, name: "bridgeLeft"};
const bridgeRight = {url: `//i0.hdslb.com/bfs/kfptfe/floor/2250e29af5e34924262e56c6cef1ea363b258d71.png`, name: "bridgeRight"};
const roadLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/fa1738ca68ccba0c8112c54be3b89aca156e869a.png`, name: "roadLeft"};
const roadRight = {url: `//i0.hdslb.com/bfs/kfptfe/floor/e77fefe63815402f15b1ff2ff9d83a1123730ec5.png`, name: "roadRight"};

const forestDegLeft = {url: `${publicPath}res/images/forest_degrade_left.png`, name: "forestDegLeft"};
const forestDegRight = {url: `${publicPath}res/images/forest_degrade_right.png`, name: "forestDegRight"};
const waterDegLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/536927047321badf9db66a38694df57e3c6708ed.png`, name: "waterDegLeft"};
const waterDegRight = {url: `//i0.hdslb.com/bfs/kfptfe/floor/69b02e88fc86e6d9b67a28e05233b14fbe5c344b.png`, name: "waterDegRight"};
const cityDegLeft = {url: `//i0.hdslb.com/bfs/kfptfe/floor/68f3aab4826a6efa1cd268ffa6d2b79fdd0f22a9.png`, name: "cityDegLeft"};
const cityDegRight = {url: `//i0.hdslb.com/bfs/kfptfe/floor/16a6b87fb994320ebddf8c21c80e936915a615d2.png`, name: "cityDegRight"};

const dialogBg = {url: `${publicPath}res/images/dialog_bg.png`, name: "dialogBg"};
const bgFrame = {url: `${publicPath}res/atlas/bg.atlas`, name: "bgFrame"};
const iconsFrame = {url: `${publicPath}res/atlas/icons.atlas`, name: "iconsFrame"};
const numFrame = {url: `${publicPath}res/atlas/num.atlas`, name: "numFrame"};
const girl22 = {url: `${publicPath}res/atlas/girl22.atlas`, name: "girl22"};
const girl33 = {url: `${publicPath}res/atlas/girl33.atlas`, name: "girl33"};
const barrierFrame = {url: `${publicPath}res/atlas/barrier.atlas`, name: "barrierFrame"};
const dialogFrame = {url: `${publicPath}res/atlas/dialog.atlas`, name: "dialogFrame"};
const otherFrame = {url: `${publicPath}res/atlas/other.atlas`, name: "otherFrame"};
const logoFrame = {url: `${publicPath}res/atlas/logo.atlas`, name: "logoFrame"};
const hitFrame = {url: `${publicPath}res/atlas/hit.atlas`, name: "hitFrame"};

const bgOgg = {url: `${publicPath}sounds/bg.ogg`, name: "bgOgg"};
const boxhitOgg = {url: `${publicPath}sounds/boxhit.ogg`, name: "boxhitOgg"};
const boxhitemptyOgg = {url: `${publicPath}/sounds/boxhitempty.ogg`, name: "boxhitemptyOgg"};
const jumpOgg = {url: `${publicPath}sounds/jump.ogg`, name: "jumpOgg"};
const gameoverOgg = {url: `${publicPath}sounds/gameover.ogg`, name: "gameoverOgg"};
const countdownOgg = {url: `${publicPath}sounds/countdown.ogg`, name: "countdownOgg"};

const RESOURCES = [
    frame,
    menuBg,
    storySetting,
    finishBg,
    bgLeft,
    bgRight,

    cloudSmallLeft,
    cloudSmallRight,
    cloudLargeLeft,
    cloudLargeRight,

    mgForestLeft,
    mgForestRight,
    mgWaterLeft,
    mgWaterRight,
    mgCityLeft,
    mgCityRight,

    fgForestLeft,
    fgForestRight,
    fgWaterLeft,
    fgWaterRight,
    fgCityLeft,
    fgCityRight,

    grassLeft,
    grassRight,
    bridgeLeft,
    bridgeRight,
    roadLeft,
    roadRight,

    forestDegLeft,
    forestDegRight,
    waterDegLeft,
    waterDegRight,
    cityDegLeft,
    cityDegRight,

    dialogBg,
    girl22,
    girl33,
    bgFrame,
    iconsFrame,
    numFrame,
    barrierFrame,
    dialogFrame,
    otherFrame,
    logoFrame,
    hitFrame,

    bgOgg,
    boxhitOgg,
    boxhitemptyOgg,
    jumpOgg,
    gameoverOgg,
    countdownOgg
];

export default RESOURCES;
