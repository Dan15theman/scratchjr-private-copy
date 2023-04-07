import ScratchJr from '../ScratchJr';
import OS from '../../tablet/OS';
import IO from '../../tablet/IO';
import MediaLib from '../../tablet/MediaLib';
import Paint from '../../painteditor/Paint';
import Events from '../../utils/Events';
import Localization from '../../utils/Localization';
import ScratchAudio from '../../utils/ScratchAudio';
import {gn, newHTML, scaleMultiplier,
    getDocumentWidth, getDocumentHeight, setProps, newCanvas, frame} from '../../utils/lib';
import AR from 'js-aruco';

let selectedOne;
let nativeJr = true;
let clickThumb;
let shaking;
let type;
let timeoutEvent;
let scanFrame;
let currentShape = void 0;
let target = void 0;
let view = 'front';

export default class Scan {
    static init () {
        scanFrame = document.getElementById('scanframe');
        scanFrame.style.minHeight = `${Math.max(getDocumentHeight(), frame.offsetHeight)}px`;
        // const topbar = newHTML('div', 'topbar', scanFrame);
        // topbar.setAttribute('id', 'topbar');
        // const actions = newHTML('div', 'actions', topbar);
        // actions.setAttribute('id', 'scanactions');
        // const ascontainer = newHTML('div', 'assetname-container', topbar);
        // const as = newHTML('div', 'assetname', ascontainer);
        // const myname = newHTML('p', void 0, as);
        // myname.setAttribute('id', 'assetname');
        // Scan.layoutHeader();
    }

    static open () {
        frame.style.display = 'none';
        scanFrame.className = 'scanframe appear';
        scanFrame.focus();
        window.ontouchstart = void 0;
        window.ontouchend = void 0;
        window.onmousedown = void 0;
        window.onmouseup = void 0;
        document.ontouchmove = void 0;
        document.onmousemove = void 0;
        window.onresize = void 0;
        Scan.startFeed(currentShape);

        const c = newHTML('canvas', 'scanimage', gn('scanframe'));
        c.setAttribute('id', 'scanimage');
        c.width = window.screen.availWidth;
        c.height = window.screen.availHeight;

        // Set the back button callback
        ScratchJr.onBackButtonCallback.push(() => {
            const e = document.createEvent('TouchEvent');
            e.initTouchEvent();
            Scan.cancelPick(e);
        });
        console.log(this.script);
    }

    static setScript(scr) {
        this.script = scr;
    }

    static layoutHeader () {
        const buttons = newHTML('div', 'bkgbuttons', scanFrame);
        const cancelbut = newHTML('div', 'scancancelicon', buttons);
        cancelbut.onclick = Scan.cancelPick;
        console.log('layoutheader');
    }

    static cancelPick (e, spr) {
        ScratchJr.onHold = true;
        Scan.close(e);
        setTimeout(() => {
            ScratchJr.onHold = false;
        }, 1000);
        console.log('cancel');
    }

    static close (e) {
        console.log('scanclose');
        e.preventDefault();
        e.stopPropagation();
        // Scan.script.recreateStrip([['onflag',null, 500, 100], ['say', 'hello',100,20], ['endstack', null, 69, 69]]);
        console.log(this.script);
        ScratchAudio.sndFX('tap.wav');
        ScratchJr.blur();
        OS.stopfeed();
        scanFrame.className = 'scanframe disappear';
        document.body.scrollTop = 0;
        frame.style.display = 'block';
        ScratchJr.editorEvents();
        ScratchJr.onBackButtonCallback.pop();
        const cnv = gn('scanimage');
        const ctx = cnv.getContext('2d');
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        Scan.cameraToolsOff();
        console.log('close');
    }


    // static closeCameraMode (evt) {
    //     evt.preventDefault();
    //     evt.stopPropagation();
    //     ScratchAudio.sndFX('exittap.wav');
    //     Camera.close();
    // }

    static startFeed (feedTarget) {
        ScratchAudio.sndFX('entertap.wav');
        // if (!Paint.canvasFits()) {
        //     Paint.scaleToFit();
        // }
        // target = feedTarget;
        // Camera.active = true;
        // const devicePixelRatio = window.devicePixelRatio;
        // let viewbox = SVGTools.getBox(target).rounded();
        // const box = new Rectangle(0, 0, 482, 384);
        // viewbox = viewbox.expandBy(20);
        // viewbox.crop(box);
        // const mask = Scan.getLayerMask(target);
        const data = new Object();
        // const x = Math.floor(((viewbox.x + (viewbox.width / 2))) - (viewbox.width / 2));
        // const y = Math.floor(((viewbox.y + (viewbox.height / 2))) - (viewbox.height / 2));
        data.x = 315.892
        data.y = 205.919
        data.width = 480;
        data.height = 360;
        // 1.684
        data.scale = 1.684;
        data.devicePixelRatio = 2;
        data.mx = 316;
        data.my = 206;
        data.mw = 480;
        data.mh = 360;
        data.image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeAAAAFoCAYAAACPNyggAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAB4KADAAQAAAABAAABaAAAAAAHwbojAAAOlElEQVR4Ae3V0QnAIBAFQU3ldiZ2FtKE+5G5Bh4MBzv3OWs4AgQIECBA4K6AAN/1tkaAAAECBL72PhgIECBAgACB+wICfN/cIgECBAgQGALsCQgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAgIcoJskQIAAAQIC7AcIECBAgEAgIMABukkCBAgQICDAfoAAAQIECAQCAhygmyRAgAABAgLsBwgQIECAQCAgwAG6SQIECBAgIMB+gAABAgQIBAICHKCbJECAAAECAuwHCBAgQIBAICDAAbpJAgQIECAgwH6AAAECBAgEAnOfs4JdkwQIECBA4NcCLy1dDdEnnrChAAAAAElFTkSuQmCC";
        OS.startfeed(data, OS.trace);
        // console.log('pre cam tools on');
        // console.log(this.script);
        Scan.cameraToolsOn();
        // console.log('post cam tools on');
        // console.log(this.script);
    }

    static cameraToolsOn () {
        scanFrame.setAttribute('class', 'modal-backdrop fade dark');
        setProps(scanFrame.style, {
            display: 'block'
        });
        const topbar = newHTML('div', 'phototopbar', scanFrame);
        topbar.setAttribute('id', 'photocontrols');
        // var actions = newHTML("div",'actions', topbar);
        // var buttons = newHTML('div', 'photobuttons', actions);
        // const fc = newHTML('div', 'flipcamera', topbar);
        // fc.setAttribute('id', 'cameraflip');
        // fc.setAttribute('key', 'cameraflip');
        // if (isAndroid && !AndroidInterface.scratchjr_has_multiple_cameras()) {
        //     fc.style.display = 'none';
        // }
        // fc.ontouchstart = Paint.setMode;
        // fc.onmousedown = Paint.setMode;
        const fc = newHTML('div', 'flipcamera', topbar);
        fc.setAttribute('id', 'cameraflip');
        fc.setAttribute('key', 'cameraflip');
        // if (isAndroid && !AndroidInterface.scratchjr_has_multiple_cameras()) {
        //     fc.style.display = 'none';
        // }
        fc.ontouchstart = Scan.camFlip;
        fc.onmousedown = Scan.camFlip;
        console.log('got here');
        const captureContainer = newHTML('div', 'snapshot-container', scanFrame);
        captureContainer.setAttribute('id', 'capture-container');
        const capture = newHTML('div', 'snapshot', captureContainer);
        capture.setAttribute('id', 'capture');
        capture.setAttribute('key', 'camerasnap');
        capture.ontouchstart = Scan.captureSnapshot;
        capture.onmousedown = Scan.captureSnapshot;
        const cc = newHTML('div', 'cameraclose', topbar);
        cc.setAttribute('id', 'cameraclose');
        cc.ontouchstart = Scan.close;
        cc.onmousedown = Scan.close;
        console.log('cam tools on finish');
        console.log(this.script);
    }

    static captureSnapshot (e) {
        e.stopPropagation();
        e.preventDefault();
        OS.captureimage('Scan.processimage');
    }

    static camFlip(e) {
        e.preventDefault();
        ScratchAudio.sndFX('tap.wav');
        view = (view === 'front') ? 'back' : 'front';
        OS.choosecamera(view, Camera.flip);
    }

    static cameraToolsOff () {
        scanFrame.setAttribute('class', 'modal-backdrop fade');
        setProps(scanFrame.style, {
            display: 'none'
        });
        if (gn('photocontrols')) {
            gn('photocontrols').parentNode.removeChild(gn('photocontrols'));
        }
        if (gn('capture')) {
            const captureContainer = gn('capture').parentNode;
            const captureContainerParent = captureContainer.parentNode;
            captureContainer.removeChild(gn('capture'));
            captureContainerParent.removeChild(gn('capture-container'));
        }
    }

    static processimage (str) {
        OS.stopfeed();
        console.log('scan.processimage');
        // console.log(str);
        // if (!target) {
        //     return;
        // }
        if (str !== 'error getting a still') {
            // SVGImage.addCameraFill(target, str);
            const img = document.createElement('img');
            img.src = `data:image/png;base64,${str}`;
            // const c = newHTML('canvas', 'scanimage', gn('scanframe'));
            // ctx = c.getContext('2d');
            // c.width = window.innerWidth;
            // c.height = window.innerHeight;
            // ctx.drawImage(x,0,0);
            // img.onload = function () {
            //     ctx.drawImage(img, 0, 0);
            // } 
            img.addEventListener('load', e => {
                
                img.crossOrigin = "Anonymous";
                console.log(img.height);
                console.log(img.width);
                console.log('before ctx');
                const ctx = gn('scanimage').getContext('2d');
                console.log('after ctx');
                // c.width = window.innerWidth;
                // c.height = window.innerHeight;
                const dx = 316/2
                const dy = 206/2
                const dw = 480*1.684
                const dh = 360*1.684
                ctx.drawImage(img, 0, 0, 480, 360, dx, dy, dw, dh);
                console.log(img.width);
                const imageData = ctx.getImageData(dx, dy, dw, dh);
                console.log(imageData);
                console.log(img);
                
                var AR = require('js-aruco').AR;
                AR.DICTIONARIES['ARUCO_4X4_1000'] = {
                    nBits: 16,
                    tau: null,
                    codeList: [[181,50],[15,154],[51,45],[153,70],[84,158],[121,205],[158,46],[196,242],[254,218],[207,86],[249,145],[17,167],[14,183],[42,15],[36,177],[38,62],[70,101],[102,0],[108,94],[118,175],[134,139],[176,43],[204,213],[221,130],[254,71],[148,113],[172,228],[165,84],[33,35],[52,111],[68,21],[87,178],[158,207],[240,203],[8,174],[9,41],[24,117],[4,255],[13,246],[28,90],[23,24],[42,40],[50,140],[56,178],[36,232],[46,235],[45,63],[75,100],[80,46],[80,19],[81,148],[85,104],[93,65],[95,151],[104,1],[104,103],[97,36],[97,233],[107,18],[111,229],[103,223],[126,27],[128,160],[131,68],[139,162],[147,122],[132,108],[133,42],[133,156],[156,137],[159,161],[187,124],[188,4],[182,91],[191,200],[183,171],[202,31],[201,98],[217,88],[211,213],[204,152],[199,160],[197,55],[233,93],[249,37],[251,187],[238,42],[247,77],[53,117],[138,173],[118,23],[10,207],[6,75],[45,193],[73,216],[67,244],[79,54],[79,211],[105,228],[112,199],[122,110],[180,234],[237,79],[252,231],[254,166],[0,37],[0,67],[10,136],[10,134],[2,111],[0,28],[0,151],[8,55],[10,49],[9,198],[11,1],[9,251],[11,88],[16,130],[24,45],[16,120],[16,115],[18,116],[18,177],[26,249],[19,6],[12,14],[12,241],[4,51],[12,159],[14,242],[14,253],[7,76],[15,164],[7,47],[5,181],[15,145],[7,219],[30,228],[20,57],[29,128],[21,200],[31,139],[21,186],[29,177],[32,128],[40,233],[34,162],[40,83],[42,240],[34,247],[41,64],[33,70],[41,185],[43,156],[43,178],[56,202],[56,46],[48,7],[56,231],[58,73],[58,101],[50,93],[59,136],[57,29],[59,211],[38,71],[39,128],[47,170],[45,20],[37,222],[37,83],[47,119],[52,72],[60,168],[60,65],[52,13],[52,251],[54,154],[61,224],[53,106],[61,9],[61,237],[63,196],[63,108],[55,206],[61,92],[61,118],[55,176],[63,23],[63,255],[72,229],[66,104],[74,45],[65,96],[73,81],[65,221],[75,223],[88,79],[90,72],[88,22],[80,93],[90,250],[90,181],[81,35],[91,138],[89,25],[81,53],[76,105],[70,193],[78,11],[68,95],[78,89],[77,131],[77,125],[71,216],[71,115],[92,133],[94,68],[86,43],[92,187],[85,195],[95,110],[95,235],[93,18],[85,94],[98,112],[98,21],[97,194],[107,32],[99,69],[107,92],[107,91],[120,12],[122,207],[120,127],[121,128],[113,229],[113,116],[121,182],[113,211],[123,51],[100,106],[102,168],[110,167],[110,145],[101,34],[109,203],[103,141],[109,49],[126,128],[126,226],[126,141],[116,210],[124,50],[126,53],[117,171],[119,5],[127,43],[125,218],[127,146],[128,117],[128,243],[129,166],[137,237],[129,252],[152,166],[154,32],[145,67],[153,249],[145,147],[155,212],[132,9],[132,107],[134,196],[142,100],[134,26],[133,78],[141,203],[133,103],[133,175],[133,215],[135,179],[156,225],[156,242],[148,23],[149,0],[149,162],[157,35],[159,98],[157,82],[149,218],[160,197],[170,205],[162,216],[162,87],[169,61],[169,87],[171,82],[163,54],[163,89],[176,244],[184,18],[176,191],[178,157],[187,237],[185,114],[185,150],[164,195],[172,210],[174,177],[165,130],[175,101],[165,123],[175,250],[180,100],[188,98],[180,129],[182,160],[190,238],[190,13],[188,217],[190,248],[181,40],[183,9],[183,210],[192,234],[192,25],[192,253],[200,211],[202,90],[193,77],[201,180],[193,87],[195,152],[195,29],[216,128],[216,239],[218,43],[208,30],[209,5],[211,173],[219,167],[196,201],[204,120],[205,69],[197,11],[207,207],[220,172],[212,2],[220,99],[212,39],[212,245],[214,120],[222,184],[221,230],[213,93],[221,189],[223,29],[226,202],[234,107],[224,180],[226,56],[226,212],[227,34],[225,216],[240,3],[242,204],[248,246],[241,73],[243,234],[241,156],[249,245],[241,59],[236,141],[238,201],[230,15],[228,247],[231,96],[239,232],[237,178],[229,21],[239,209],[244,134],[252,1],[246,195],[244,124],[252,147],[245,66],[253,152],[245,61],[2,189],[0,225],[2,226],[2,174],[8,120],[0,116],[8,158],[8,209],[8,125],[10,50],[10,222],[2,81],[1,162],[3,128],[11,131],[11,75],[11,39],[11,239],[9,182],[9,89],[9,147],[11,248],[3,217],[3,241],[16,196],[24,171],[26,160],[26,4],[26,108],[26,174],[18,137],[16,23],[26,243],[25,64],[17,2],[17,43],[17,207],[27,34],[19,46],[17,21],[19,187],[12,32],[12,201],[12,220],[12,54],[6,20],[6,114],[13,97],[5,13],[13,143],[15,224],[15,73],[7,133],[5,144],[13,51],[15,150],[15,118],[20,96],[28,141],[20,218],[28,115],[30,148],[30,186],[22,217],[30,61],[22,251],[29,233],[29,254],[31,159],[40,139],[32,175],[34,14],[34,169],[42,141],[42,163],[42,239],[40,144],[40,59],[42,88],[34,51],[33,160],[33,2],[33,165],[33,199],[43,3],[35,103],[41,48],[41,210],[43,25],[43,155],[43,151],[56,40],[56,165],[58,134],[50,1],[56,159],[50,210],[58,153],[58,213],[57,232],[59,193],[51,67],[59,231],[49,154],[51,144],[59,158],[36,196],[44,74],[44,173],[44,207],[44,103],[38,234],[46,229],[44,112],[46,18],[46,209],[46,57],[37,100],[37,231],[47,204],[45,188],[45,113],[37,213],[37,155],[39,16],[47,124],[39,242],[39,58],[47,182],[39,211],[47,179],[39,31],[60,75],[54,192],[54,238],[62,233],[52,184],[60,20],[60,82],[52,114],[52,126],[52,191],[62,113],[62,83],[61,140],[53,162],[53,46],[53,45],[55,172],[53,112],[55,250],[63,241],[63,219],[72,196],[72,233],[74,194],[74,65],[66,235],[72,19],[74,216],[66,253],[74,23],[73,99],[67,110],[65,58],[73,177],[65,61],[75,146],[75,155],[67,63],[88,34],[80,170],[88,39],[82,200],[82,132],[82,10],[90,15],[88,152],[88,92],[80,219],[80,247],[90,244],[81,236],[81,66],[81,13],[91,3],[83,235],[81,118],[89,113],[81,147],[83,249],[91,179],[83,151],[76,76],[68,75],[76,35],[70,140],[78,39],[70,144],[78,212],[69,206],[69,229],[69,39],[79,193],[71,5],[69,52],[69,114],[92,200],[92,14],[84,235],[86,137],[86,67],[94,231],[92,112],[84,178],[94,121],[86,243],[93,163],[93,242],[85,29],[93,157],[87,252],[87,210],[95,115],[104,45],[104,195],[104,135],[106,74],[98,105],[96,185],[104,255],[106,220],[106,218],[106,62],[106,81],[106,49],[98,215],[97,204],[107,130],[107,227],[105,58],[97,158],[97,149],[97,117],[105,95],[105,55],[99,218],[112,2],[120,99],[112,79],[114,202],[122,173],[112,123],[122,20],[122,249],[122,211],[122,187],[121,226],[113,41],[123,103],[113,208],[121,57],[115,48],[115,185],[115,83],[115,255],[108,136],[100,9],[108,67],[102,6],[102,131],[100,176],[100,218],[110,159],[103,200],[111,238],[109,59],[111,210],[116,128],[124,171],[126,104],[126,2],[124,156],[116,54],[124,17],[126,222],[126,182],[118,219],[125,196],[125,138],[117,109],[119,136],[119,32],[119,65],[117,56],[117,190],[125,155],[119,87],[136,40],[128,172],[136,13],[136,103],[130,78],[138,161],[130,43],[128,24],[136,249],[128,157],[138,156],[130,49],[138,117],[130,151],[129,9],[129,235],[129,7],[139,40],[139,172],[131,46],[131,229],[129,80],[137,50],[139,122],[139,150],[131,125],[144,135],[154,252],[146,245],[145,170],[147,65],[147,37],[155,235],[153,52],[145,247],[155,218],[147,86],[132,66],[140,129],[140,79],[134,72],[134,166],[142,3],[134,227],[134,111],[142,175],[132,94],[132,119],[134,250],[142,30],[142,55],[135,10],[143,138],[143,38],[135,33],[135,13],[133,114],[135,62],[156,67],[158,97],[148,88],[148,248],[156,50],[148,118],[148,177],[148,221],[148,155],[156,219],[158,156],[158,210],[150,25],[158,177],[149,105],[159,109],[151,43],[149,182],[149,185],[157,61],[157,87],[168,236],[168,37],[162,172],[162,2],[170,102],[170,143],[170,231],[168,48],[168,122],[168,246],[168,147],[162,20],[170,52],[162,114],[170,242],[162,241],[161,64],[169,10],[161,38],[169,197],[169,207],[161,52],[169,18],[161,250],[171,152],[163,247],[176,6],[176,69],[184,141],[178,132],[184,240],[184,85],[178,118],[186,145],[178,113],[185,192],[185,66],[185,42],[179,140],[179,202],[187,102],[179,15],[177,218],[187,20],[187,246],[179,19],[164,104],[172,44],[172,161],[172,235],[172,199],[164,103],[166,192],[174,224],[166,35],[173,232],[165,204],[167,236],[173,124],[165,26],[165,145],[173,25],[165,151],[180,109],[190,203],[188,58],[188,245],[190,189],[190,243],[181,37],[181,143],[183,104],[191,228],[189,254],[189,157],[181,245],[181,243],[191,176],[183,90],[191,62],[183,57],[191,213],[183,29],[191,53],[183,127],[200,1],[192,165],[194,130],[200,189],[194,252],[202,145],[194,91],[201,68],[193,42],[195,192],[201,122],[193,185],[201,117],[193,247],[203,177],[208,108],[216,135],[208,175],[218,196],[210,12],[218,9],[208,48],[216,148],[208,58],[208,182],[208,117],[210,118],[218,93],[218,53],[210,23],[217,2],[211,232],[211,229],[209,154],[209,246],[209,81],[219,20],[211,62],[211,211],[196,96],[204,167],[198,66],[198,71],[206,231],[196,92],[204,29],[204,53],[198,188],[205,168],[197,12],[197,228],[197,194],[205,45],[205,89],[205,149],[197,147],[199,95],[212,197],[222,136],[214,36],[222,236],[214,226],[222,198],[222,35],[220,220],[220,26],[212,17],[222,84],[214,148],[222,157],[221,129],[213,165],[215,172],[215,102],[223,169],[213,220],[221,31],[223,240],[226,72],[226,232],[226,7],[224,93],[234,245],[235,38],[235,237],[225,82],[225,126],[233,219],[248,6],[240,238],[248,161],[250,0],[250,194],[240,155],[250,244],[250,60],[242,252],[242,189],[242,147],[241,96],[249,236],[241,70],[249,225],[243,72],[243,174],[243,193],[243,139],[243,167],[241,115],[241,151],[243,244],[251,50],[228,7],[230,77],[236,85],[237,192],[237,133],[239,162],[231,78],[229,213],[239,80],[244,34],[244,137],[244,41],[246,106],[254,11],[254,111],[244,149],[244,53],[244,31],[246,176],[245,232],[245,197],[253,35],[255,192],[247,204],[247,233],[245,188],[253,246],[245,217],[253,151],[253,63],[255,156],[255,90],[247,254],[255,17],[247,191]]
                  };
                var detector = new AR.Detector({
                    dictionaryName: 'ARUCO_4X4_1000'
                  });

                const markers = detector.detect(imageData);
                console.log('markers');
                console.log(markers);

                const arucoDict = {0: 'back', 1: 'forward', 2: 'up', 3: 'down', 4: 'right',
                5: 'left', 6: 'hop', 7: 'home', 8: 'onmessage', 9: 'onflag', 10: 'onbump', 
                11: 'message', 12: 'ontouch', 13: 'playsnd', 14: 'playusersnd', 
                15: 'say', 16: 'grow', 17: 'shrink', 18: 'same', 19: 'hide', 
                20: 'show', 21: 'wait', 22: 'stopmine', 23: 'setspeed' , 
                24: 'setspeed', 25: 'setspeed', 26: 'repeat', 27: 'forever', 
                28: 'gotopage', 29: 'endstack'}

                console.log(markers[0]);
                var stripArray = [];
                var id = null;
                var loc = null;

                for (let i = 0; i < markers.length; i++) {
                    id = markers[i].id;
                    console.log(markers[i].corners);
                    console.log(markers[i].corners[0]);
                    loc = markers[i].corners[0].x;
                    stripArray.push([id,loc]);
                }
                
                function compareFn(a, b) {
                    if (a[1] < b[1]) {
                      return -1;
                    }
                    if (a[1] > b[1]) {
                      return 1;
                    }
                    // a must be equal to b
                    return 0;
                  }

                console.log(stripArray);
                stripArray.sort(compareFn);
                console.log(stripArray);

                var strip = []
                var old_ids = []
                for (let i = 0; i < stripArray.length; i++) {
                    const id = stripArray[i][0];
                    if (!old_ids.includes(id)) {
                        var p = null
                        if (id < 6) {
                            p = 1;
                        }
                        if (id == 6 || id == 16 || id == 17 || id == 21 || id == 26) {
                            p = 2;
                        }
                        if (id == 15) {
                            p = 'hello'
                        }
                        strip.push([arucoDict[id], p, 500, 100]);
                        old_ids.push(id);
                    }
                    
                }

                if (strip[strip.length-1][0] != 'endstack') {
                    strip.push(['endstack', null, 500, 100]);
                }


                Scan.script.recreateStrip(strip);
                
              })     
        }
    }
}

// 315.892, 205.919

// ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0,
//     img.width * this.scale * window.devicePixelRatio,
//     img.height * this.scale * window.devicePixelRatio)

// Exposing the Scan for the tablet callback in OS.snapShot
window.Scan = Scan;