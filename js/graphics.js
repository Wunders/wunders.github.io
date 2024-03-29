var camera, scene, renderer;
var font1 = undefined;
var letterGeo;
var letterLines;
var defaultPos;
var randomVars;
var word = "Brett";
var transitioning = false;

var mousex = 0;
var mousey = 0;

init();

function init() {

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set( 0, 0, 100);
    camera.lookAt(0,0,0);

	scene = new THREE.Scene();

    // Load the font
    var loader = new THREE.FontLoader();

    loader.load( '../fonts/helvetiker_regular.typeface.json', function ( response ) {
        font1 = response;
        drawScene();
    } );
}

function drawScene() {
    letterGeo = [];
    letterLines = [];
    defaultPos = [];
    randomVars = [];

    // initialize the text geometry for each letter
    for (var i = 0; i < word.length; i++) {
        letter = word.charAt(i);
        textGeometry = new THREE.TextGeometry( letter, {
            font: font1,
            size: 12,
            height: 1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 5
        } );
        textGeometry.computeBoundingBox();
        letterGeo.push(textGeometry);
    }


    // calculate boundingbox width to center text
    var totalBoundingBoxSize = 0;
    for (var i = 0; i < letterGeo.length; i++) {
        totalBoundingBoxSize = totalBoundingBoxSize + letterGeo[i].boundingBox.max.x - letterGeo[i].boundingBox.min.x;
    }
    var startPos = - 0.5 * totalBoundingBoxSize;
    var countTotal = startPos;

    // apply letter geometry to a wireframe
    for (var i = 0; i < letterGeo.length; i++) {
        textWireframe = new THREE.WireframeGeometry( letterGeo[i] );
        var material = new THREE.LineBasicMaterial( { color: 0x808080, linewidth: 5 } );
        textLines = new THREE.LineSegments( textWireframe, material );
        textLines.material.depthTest = false;
        textLines.material.opacity = 0.6;
        textLines.material.transparent = true;
        // set x position
        textLines.position.x = countTotal;
        countTotal = countTotal + letterGeo[i].boundingBox.max.x - letterGeo[i].boundingBox.min.x + 1
        letterLines.push(textLines);
        defaultPos.push(textLines.position.x);
        randomVars.push(Math.random() - 0.5);
        randomVars.push(Math.random() - 0.5);
        randomVars.push(Math.random() - 0.5);
    }

    // add the text to scene
    for (var i = 0; i < letterLines.length; i++) {
        scene.add ( letterLines[i] );
    }

    var canvas = document.getElementById("canvasID");
	renderer = new THREE.WebGLRenderer({
	    canvas: canvas,
	    alpha: true
	});
	renderer.setClearColor( 0xffffff, 0);
    renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

    // Init mousemove
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    animate();
}

function onDocumentMouseMove ( event ) {
    if (transitioning) {
        return;
    }
    event.preventDefault();

    mousex = ( event.clientX / window.innerWidth ) * 2 - 1;
    mousey = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function animate() {

    requestAnimationFrame( animate );
    // position and rotate individual letters
    for (var i = 0; i < letterLines.length; i++) {
        letterLines[i].position.x = defaultPos[i] + randomVars[i*3] * 0.1 * Math.pow((mousey*40), 2) - 0.1 - randomVars[i];
        letterLines[i].position.y = randomVars[i*3+1] * 0.1 * Math.pow((mousey*40), 2) - 0.1 - randomVars[i];
        letterLines[i].position.z = randomVars[i*3+2] * 0.1 * Math.pow((mousey*40), 2) - 0.1 - randomVars[i];
        letterLines[i].rotation.x = mousey * randomVars[i*3] * 10;
        letterLines[i].rotation.y = mousex * randomVars[i*3+1]* 10;
    }

	renderer.render( scene, camera );

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function transitionOut() {
    // Set some document variables
    var canvasID = document.getElementById("canvasID");
    var clickbox = document.getElementById("clickbox");
    var topinfo = document.getElementById("topinfo");
    var bottominfo = document.getElementById("bottominfo");
    var aboutTitle  = document.getElementById("aboutTitle");
    var aboutInfo  = document.getElementById("aboutInfo");
    var brettPic  = document.getElementById("brettPic");
    var blogLink = document.getElementById("blogLink");
    var mouseoffsetx = mousex;
    var mouseoffsety = mousey;
    transitioning = true;
    
    // Remove the clickbox and the mouse listener
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    clickbox.style.display = "none";

    // fade text
    var start = Date.now();
    var transitionTime = 1000;
    while (Date.now() - start < transitionTime) {
        percentTransition = (Date.now() - start) / transitionTime;
        mousex = percentTransition + mouseoffsetx;
        mousey = percentTransition + mouseoffsety;
        topinfo.style.opacity  = 1 - percentTransition;
        bottominfo.style.opacity  = 1 - percentTransition;
        await sleep(10);
    }

    // fade canvas
    start = Date.now();
    transitionTime = 1000;
    while (Date.now() - start < transitionTime) {
        percentTransition = (Date.now() - start) / transitionTime;
        mousex = percentTransition + mouseoffsetx + 1;
        mousey = percentTransition + mouseoffsety + 1;
        canvasID.style.opacity  = 1 - percentTransition;
        await sleep(10);
    }

    // Remove elements after transition
    canvasID.style.display = "none";
    topinfo.style.display = "none";
    bottominfo.style.display = "none";

    // Introduce elements after transition
    aboutTitle.style.opacity = 0;
    aboutInfo.style.opacity = 0;
    brettPic.style.opacity = 0;
    blogLink.style.opacity = 0;
    aboutTitle.style.display = "block";
    aboutInfo.style.display = "block";
    brettPic.style.display = "block";
    blogLink.style.display = "block";
    // Take a power nap
    await sleep(250);

    // Transition in the about page
    start = Date.now();
    transitionTime = 1500;
    while (Date.now() - start < transitionTime) {
        percentTransition = (Date.now() - start) / transitionTime;
        aboutTitle.style.opacity = percentTransition;
        aboutInfo.style.opacity = percentTransition;
        brettPic.style.opacity = percentTransition;
        blogLink.style.opacity = percentTransition;
        await sleep(10);
    }
}
