var camera, scene, renderer;
var font1 = undefined;
var letterGeo;
var letterLines;
var defaultPos;
var randomVars;
var geometry, geometry2, textGeometry, material, line1, line2;
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

    // Set the geometry for the 2 lines
    geometry1 = new THREE.Geometry()
    geometry2 = new THREE.Geometry()
    geometry1.vertices.push(new THREE.Vector3( -10, 0, 0) );
    geometry1.vertices.push(new THREE.Vector3( 0, 10, 0) );
    geometry2.vertices.push(new THREE.Vector3( 0, 10, 0) );
    geometry2.vertices.push(new THREE.Vector3( 10, 0, 0) );


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
        textLines = new THREE.LineSegments( textWireframe );
        textLines.material.depthTest = false;
        textLines.material.opacity = 0.5;
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

	material = new THREE.LineBasicMaterial( {color: 0xFFFFFF } );

    // make some lines
    line1 = new THREE.Line( geometry1, material );
    line2 = new THREE.Line( geometry2, material );
    scene.add( line1 );
    scene.add( line2 );

    // add the text to scene
    for (var i = 0; i < letterLines.length; i++) {
        scene.add ( letterLines[i] );
    }

    var canvas = document.getElementById("canvasID");
	renderer = new THREE.WebGLRenderer( { canvas: canvas } );
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
        line1.position.x = - Math.pow(mousex*10, 2);
        line2.position.x = Math.pow(mousex*10, 2);

        if (mousey > 0) {
            line1.position.y = Math.pow(mousey*10, 2);
            line2.position.y = - Math.pow(mousey*10, 2); 
        }
        else {
            line1.position.y = - Math.pow(mousey*10, 2);
            line2.position.y = Math.pow(mousey*10, 2); 
        }
    
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
    var reloadpage = document.getElementById("reloadpage");
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
    reloadpage.style.opacity = 0;
    aboutTitle.style.display = "block";
    aboutInfo.style.display = "block";
    brettPic.style.display = "block";
    reloadpage.style.display = "block";
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
        reloadpage.style.opacity = percentTransition;
        await sleep(10);
    }
}
