$('[data-toggle="tooltip"]').tooltip({
        // placement: 'right'
        container: 'body'
    });
    
$('#welcome-modal').modal();

var camera, scene, renderer, mesh, controls, stats, url, band, centralBoundingBox, octant, centralMirror, innerBand, decorativeBand, disc, center;

var places = [];
const scale_const = 20;
var baseModel = new THREE.Group();
var motifs = new THREE.Group();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.z = 1000;
    scene.add(camera);
    scene.name = "tlvmirror";

    //LIGHTS
    var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
    scene.add(light);

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    ambientLight.color.setHSL(0.1, 1, 0.95);
    //ambientLight.position.set(0,0,100)
    scene.add(ambientLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    // dirLight.position.z = 1;
    // dirLight.position.x = -1000;
    dirLight.position.set(-700, 0, 500);
    scene.add(dirLight);

    var dirLight2 = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight2.position.set(700, 0, 500);
    scene.add(dirLight2);

    //LIGHT HELPERS FOR DEVELOPMENT ONLY
   // hemisphereLightHelper = new THREE.HemisphereLightHelper(light, 100);
    //directionalLightHelper = new THREE.PointLightHelper(dirLight, 100);
    //directionalLightHelper2 = new THREE.PointLightHelper(dirLight2, 100)
    //scene.add( directionalLightHelper );
   //scene.add( directionalLightHelper2 );
    //scene.add(hemisphereLightHelper);

    //AXES HELPER
    var axesHelper = new THREE.AxesHelper(750);
    scene.add(axesHelper);

    //MATERIAL
    var textureLoader = new THREE.TextureLoader();
    var map = textureLoader.load('assets/bronze_h05C.JPG');
    var material = new THREE.MeshPhongMaterial({
        map: map
        // normalMap: map,
        // normalMapType: THREE.ObjectSpaceNormalMap,
        // aoMapIntensity: 0.5
        // normalScale: Vector2(0.01, 0.01)
    });

    //STL Loader
    var loader = new THREE.STLLoader();

    //CENTRAL MIRROR
    loader.load('assets/central.stl', function(geometry) {

        var mesh = new THREE.Mesh(geometry, material);
        mesh.traverse(function(node) {
            if (node.isMesh) node.material = material;
        });
        mesh.rotation.x = Math.PI / 2;

        //Create bounding box
        var box3 = new THREE.Box3();
        centralSize = new THREE.Vector3();
        centralBoundingBox = new THREE.BoxHelper(mesh, 0xffff00);
        //scene.add(centralBoundingBox);
        box3.setFromObject(centralBoundingBox);
        center = box3.getCenter(centralBoundingBox.position);
        box3.getSize(centralSize);
        //console.log("central size: ", centralSize);
        quadrant = new THREE.Vector3(centralSize.x / 2, centralSize.y / 2, centralSize.z / 2);
        octant = new THREE.Vector3(centralSize.x / 4, centralSize.y / 4, centralSize.z / 4);

        mesh.geometry.center();
        mesh.position.z = scale_const*2;
        mesh.scale.set(scale_const, scale_const, scale_const);
        

        centralBoundingBox.update();
        centralMirror = mesh;
        baseModel.add(centralMirror);
        //scene.add(mesh);
        //console.log("scene: ", scene);

    });

    //INSCRIPTION BAND LOADED
    loader.load('assets/plaindisc.stl', function(geometry) {

        var mesh = new THREE.Mesh(geometry, material);
        mesh.traverse(function(node) {
            if (node.isMesh) node.material = material;
        });

        //Create bounding box
        var box3 = new THREE.Box3();
        discSize = new THREE.Vector3();
        var boundingBox = new THREE.BoxHelper(mesh, 0xffff00);
        //scene.add( boundingBox );
        box3.setFromObject(boundingBox);
        discCenter = box3.getCenter(boundingBox.position);
        box3.getSize(discSize);
        //console.log('disc center: ', discCenter, "disc size: ", discSize);

        mesh.geometry.center();
        mesh.scale.set(0.8, 0.8, 0.8);

        boundingBox.update();
        disc = mesh;
        baseModel.add(disc);
        //scene.add(mesh);

    });

    //INNER BAND LOADER
    loader.load('assets/decorativebandinner.stl', function(geometry) {

        var mesh = new THREE.Mesh(geometry, material);
        mesh.traverse(function(node) {
            if (node.isMesh) node.material = material;
        });
        mesh.rotation.x = Math.PI / 2;

        //Create bounding box
        var box3 = new THREE.Box3();
        var innerSize = new THREE.Vector3();
        var boundingBox = new THREE.BoxHelper(mesh, 0xffff00);
        //scene.add( boundingBox );
        box3.setFromObject(boundingBox);
        box3.getCenter(boundingBox.position);
        box3.getSize(innerSize);

        mesh.geometry.center();
        mesh.position.z = 5;

        boundingBox.update();
        innerBand = mesh;
        baseModel.add(innerBand);
        //scene.add(mesh);
    });

    scene.add(baseModel);

    //MOTIFS ADDED TO MIRROR
    $(".majmot, .minmot").on("click", function() {

        var motif = this.id;
        //console.log(motif);
        var motifClass = this.className;

        $('#motif-modal').modal();
        $('input[value="ne"]').prop('checked', true);

        //displays an image of the motif in four rotations for selection    
        i = 1;
        while (i < 5) {
            id = this.id + i;
            const rot = "rotate(" + (i * 90 - 90) + "deg)";

            $("#rotation").append('<label><input type="radio" name="rotation" value="' + rot + '"/><img src="assets/icons/' + this.id + '-2D.png" width="80" id="' + id + '" class="majmot-placed"></label>');


            $('#' + id + '').css({
                "-webkit-transform": rot,
                "-moz-transform": rot,
                "-o-transform": rot,
                "-ms-transform": rot,
                "transform": rot
            });
            i++;

        }

        $("#direction").append('<label><input type="radio" name="direction" value="not-flipped" /><img src="assets/icons/' + this.id + '-2D.png" width="80" id="dir-' + this.id + '"></label>');

        $("#direction").append('<label><input type="radio" name="direction" value="flipped" /><img src="assets/icons/' + this.id + '-2D.png" width="80" id="dir-' + this.id + '-flipped"></label>');

        //Flip the second image
        $('#dir-' + this.id + '-flipped').css({
            "-moz-transform": "scaleX(-1)",
            "-o-transform": "scaleX(-1)",
            "-webkit-transform": "scaleX(-1)",
            "transform": "scaleX(-1)",
            "filter": "FlipH",
            "-ms-filter": "FlipH"
        });

        $('input[value="not-flipped"]').prop('checked', true);
        $('input[value="rotate(0deg)"]').prop('checked', true);

        //on selection of direction, log that direction

        $(".majmotplaced").on("click", function(e) {
            e.preventdefault();
            //send this orientation to the model
        });

        $('#submit').off().on("click", function() {
            var placeValue = $('#place input:checked').val();
            var rotValue = $('#rotation input:checked').val();
            var dirValue = $('#direction input:checked').val();

           // console.log(placeValue, rotValue, dirValue);

            $('#motif-modal').modal('hide');

            //Create a list of places to check if motif already in selected position
            place = motifClass.toString() + placeValue.toString();
            motifChecker(place);
            if (places.indexOf(place) === -1) {
                places.push(place);
            }
            depth = 1;

            //Set the motif placement coordinates according to selection
            if (motifClass == "minmot") {
                if (placeValue == "ne") {
                    pos = new THREE.Vector3(octant.x * scale_const * 0.75, octant.y * scale_const * 1.5, scale_const);
                } else if (placeValue == "se") {
                    pos = new THREE.Vector3(octant.x * scale_const * 1.5, -octant.y * scale_const * 0.75, scale_const);
                } else if (placeValue == "sw") {
                    pos = new THREE.Vector3(-octant.x * scale_const * 0.75, -octant.y * scale_const * 1.5, scale_const);
                } else if (placeValue == "nw") {
                    pos = new THREE.Vector3(-octant.x * scale_const * 1.5, octant.y * scale_const * 0.75, scale_const);
                }
            }

            if (motifClass == "majmot") {
                depth = 2.5;
                if (placeValue == "ne") {
                    pos = new THREE.Vector3(octant.x * scale_const * 1.5, octant.y * scale_const * 0.75, scale_const);
                    place = motifClass.toString() + placeValue.toString();
                } else if (placeValue == "se") {
                    pos = new THREE.Vector3(octant.x * scale_const * 0.75, -octant.y * scale_const * 1.5, scale_const);
                    place = motifClass.toString() + placeValue.toString();
                } else if (placeValue == "sw") {
                    pos = new THREE.Vector3(-octant.x * scale_const * 1.5, -octant.y * scale_const * 0.75, scale_const);
                    place = motifClass.toString() + placeValue.toString();
                } else if (placeValue == "nw") {
                    pos = new THREE.Vector3(-octant.x * scale_const * 0.75, octant.y * scale_const * 1.5, scale_const);
                    place = motifClass.toString() + placeValue.toString();
                }
            }

            //Corrects for models not in correct rotation
            neg_90 = ["redbird", "animalmotif1", "immortal1"];
            pos_180 = ["animalmotif2", "immortal2"];
            neg_180 = ["whitetiger"];

            if (neg_90.includes(motif)) {
                correction = -Math.PI / 2;
            } else if (pos_180.includes(motif)) {
                correction = Math.PI;
            } else if (neg_180.includes(motif)) {
                correction = -Math.PI;
            } else correction = 0;

            //Set the motif rotation according to selection
            if (rotValue == "rotate(0deg)") {
                rotation = correction + 0;
            } else if (rotValue == "rotate(90deg)") {
                rotation = correction + -Math.PI / 2;
            } else if (rotValue == "rotate(180deg)") {
                rotation = correction + Math.PI;
            } else if (rotValue == "rotate(270deg)") {
                rotation = correction + Math.PI / 2;
            }

            //Set the motif direction according to selection
            if (dirValue == "not-flipped") {
                dir = 0;
            } else if (dirValue == "flipped") {
                dir = Math.PI;
            }

            //Load the model
            loader.load('assets/' + motif + '.stl', function(geometry) {

                mesh = new THREE.Mesh(geometry, material);
                mesh.traverse(function(node) {
                    if (node.isMesh) node.material = material;
                });
                mesh.rotation.x = Math.PI / 2;
                mesh.name = place;
                place = "";
                mesh.position.copy(pos);
                mesh.position.z = 16;

                //Create bounding box
                var box3 = new THREE.Box3();
                var motifBoundingBox = new THREE.BoxHelper(mesh, 0xffff00);
                //scene.add(motifBoundingBox);
                box3.setFromObject(motifBoundingBox);
                center = box3.getCenter(centralBoundingBox.position);
                //console.log("motif center: ", center);

                mesh.geometry.center();

                //Calculate size
                var size = new THREE.Vector3();
                box3.getSize(size);
                // console.log("motif size: ", size);

                //This must appear below position setting or it will replace octant with the ratio sizes        
                var ratio = new THREE.Vector3();
                ratio.copy(octant);
                ratio.divide(size);
                var min = Math.min(ratio.x, ratio.y);

                mesh.scale.set(scale_const * min * 0.5, scale_const * min * depth, scale_const * min * 0.5);

                mesh.rotation.y = rotation;
                mesh.rotation.z = dir;

                motifBoundingBox.update();
                // var meshAxis = new THREE.AxesHelper(5000);
                //mesh.add(meshAxis);
                motif = mesh;
                motifs.add(motif);
                //scene.add(mesh);
            }); 

            scene.add(motifs);

            //Clears content from these sections when modal is submitted
            $("#motif-modal #rotation").html("");
            $("#motif-modal #direction").html("");
            $('input[name="place"]').prop('checked', false);

        });


        //Clears content from these sections when closed
        $('#motif-modal').on("hidden.bs.modal", function() {
            $("#motif-modal #rotation").html("");
            $("#motif-modal #direction").html("");
            $('input[name="place"]').prop('checked', false);

        });
    });

    //OUTER BANDS

    $(".bands a img").on("click", function() {
        //console.log(this.id);

        var existing = scene.getObjectByName("band");
        scene.remove(existing);

        var bandID = this.id;
        loader.load(
            'assets/' + bandID + '.stl',
            function(geometry) {

                var mesh = new THREE.Mesh(geometry, material);
                mesh.traverse(function(node) {
                    if (node.isMesh) node.material = material;
                });
                mesh.rotation.x = Math.PI / 2;

                //Create bounding box
                var box3 = new THREE.Box3();
                var bandSize = new THREE.Vector3();
                var boundingBox = new THREE.BoxHelper(mesh, 0xffff00);
                //scene.add(boundingBox);
                box3.setFromObject(boundingBox);
                //console.log("band size: ", box3)
                var bandCenter = box3.getCenter(boundingBox.position);
                box3.getSize(bandSize);
                //console.log(" band center: ", bandCenter);
                //console.log("center: ", center)

                mesh.geometry.center();

                //Must come after position or it will change the value of centralSize
                var ratio = new THREE.Vector3();
                ratio.copy(discSize);
                ratio.divide(bandCenter);
                //console.log("disc to band ratio: ", ratio.x, ratio.y, ratio.z)
                const bandScale = ratio.x / 2.35;
                mesh.scale.set(bandScale, bandScale, bandScale);

                boundingBox.update();
                band = mesh;
                mesh.name = "band";
                decorativeBand = mesh;
                scene.add(mesh);
            });
    });

    renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    document.body.appendChild(stats.domElement);
    $('div').last().addClass('stats');
    $('.stats canvas').css('left', 500);

    //Mouse controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 5.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.staticMoving = true;
    controls.keys = [65, 83, 68];

    $("#reset").on("click", function() {
        controls.reset();
    });

    $("#help").on("click", function() {

    });

    //Exports the scene as an object file.
    $("#download").click(function() {

        function saveSTL(scene, name) {
            var exporter = new THREE.STLExporter();
            var stlString = exporter.parse(scene);

            var blob = new Blob([stlString], {
                type: 'text/plain'
            });

            saveAs(blob, name + '.stl');
        }
        saveSTL(scene, scene.name);


        window.URL.revokeObjectURL(url);

    });

    animate();

}
init();

//RESPONSIVE RESIZING
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//INSCRIPTION ARC
var fontLoader = new THREE.FontLoader();
fontLoader.load('fonts/FZXiaoZhuanTi-S13T_Regular.json', function(font) {

    $(".inscript").on("mousedown", function(event) {
        var children_to_remove = [];
        scene.traverse(function(child) {
            if (child.name == "inscriptArc") {
                children_to_remove.push(child);
            }
        });
        children_to_remove.forEach(function(child) {
            scene.remove(child);
        });

        inscript = event.target.innerHTML;

        var numRadsPerChar = 2 * Math.PI / inscript.length;

        for (var i = 0; i < inscript.length; i++) {
            var char = inscript[i];
            var geometry = new THREE.TextBufferGeometry(char, {
                font: font,
                size: 30,
                height: 10,
                curveSegments: 20
                // bevelEnabled: true,
                // bevelThickness: 1,
                // bevelSize: 8,
                // bevelSegments: 5
            });

            var textureLoader = new THREE.TextureLoader();
            var map = textureLoader.load('assets/bronze_h05C.JPG');
            var materials = [
                new THREE.MeshPhongMaterial({
                    map: map 
                }),
                new THREE.MeshBasicMaterial({
                    color: '#4d4e4f',
                    overdraw: 0.5
                })
            ];

            var mesh = new THREE.Mesh(geometry, materials);
            mesh.position.x = 350 * Math.sin(i * numRadsPerChar);
            mesh.position.y = 350 * Math.cos(i * numRadsPerChar);
            mesh.rotation.z = Math.PI / 2 - (i * numRadsPerChar);
            group = new THREE.Group();
            group.rotation.z = -Math.PI/4;
            group.add(mesh);
            group.name = "inscriptArc";
            scene.add(group);
        }

    });
});


function animate() {
    //Calls the function repetitively
    stats.begin();

    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    stats.end();
}

var rotateMirror = function() {
    raf = requestAnimationFrame(rotateMirror);
    baseModel.rotation.z += 0.005;
    if (typeof decorativeBand !== 'undefined'){
        decorativeBand.rotation.y += 0.005;
    }
    motifs.rotation.z += 0.005;

    var characters = [];
    scene.traverse(function(child) {
        if (child.name == "inscriptArc") {
            characters.push(child);
        }
    });
    characters.forEach(function(child) {
        child.rotation.z += 0.005;
    });
};

$("#play").click(function() {
    controls.reset();
    rotateMirror();
});

$("#stop").click(function() {
    cancelAnimationFrame(raf);
});

function motifChecker() {
    var existing = scene.getObjectByName(place);
    if (places.includes(place)) {
        motifs.remove(existing);
        scene.remove(existing);

    }
}