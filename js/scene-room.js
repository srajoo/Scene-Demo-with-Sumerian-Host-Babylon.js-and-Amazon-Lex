import { SumerianHostUtils } from './dist/sumerian-host-utils.js';
import { SumerianHostObject } from './lib/sumerian-host-utils.js';


const cameraControlEl = document.getElementById('renderCanvas');
let lex;
let host;
let host2;
let host3;

const characterId_1 = 'Fiona';
const characterId_2 = 'Jane';
const characterId_3 = 'John';

async function create(engine) {

  //***************************** 1st Scene *****************************************//
  
  const scene = new BABYLON.Scene(engine);
  scene.useRightHandedSystem = true;
  const modelUrl = './assets/3d-assets/environments/room_model/room_model.gltf';
  const sceneAssets = await BABYLON.SceneLoader.LoadAssetContainerAsync(modelUrl);
  sceneAssets.addAllToScene();

  addCamera(scene);

  const pollyConfig_1 = {pollyVoice: 'Kendra', pollyEngine: 'neural'};

   // Instantiate the host.
   const characterConfig_1 = SumerianHostUtils.getCharacterConfig(characterId_1);
   host = await SumerianHostUtils.createHost(scene, characterConfig_1, pollyConfig_1);
   //console.log(host.owner.position);
   host.owner.position = new BABYLON.Vector3(0.4, 0, 0);
   const camera = scene.cameras[0];
   host.PointOfInterestFeature.setTarget(camera);
   

  //***************************** 2nd Scene *****************************************//


  const scene1 = new BABYLON.Scene(engine);
  scene1.useRightHandedSystem = true;

  var VRHelper = scene1.createDefaultVRExperience();
    
  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene1);
  light.intensity = 0.6;
  light.specular = BABYLON.Color3.Black();

  var light2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene1);
  light2.position = new BABYLON.Vector3(0, 5, 5);

  BABYLON.SceneLoader.Append("https://www.babylonjs.com/Scenes/Espilit/","Espilit.babylon", scene1, async function () 
    {
      var xr = await scene1.createDefaultXRExperienceAsync({floorMeshes: [scene1.getMeshByName("Sols")]});
    });

  addCamera(scene1);

  const pollyConfig_2 = {pollyVoice: 'Joanna', pollyEngine: 'neural'};

  const characterConfig_2 = SumerianHostObject.getCharacterConfig(characterId_2);
  host2 = await SumerianHostObject.createHost(scene1, characterConfig_2, pollyConfig_2);

  const pollyConfig_3 = {pollyVoice: 'Joey', pollyEngine: 'neural'};

  const characterConfig_3 = SumerianHostObject.getCharacterConfig(characterId_3);

  host3 = await SumerianHostObject.createHost(scene1, characterConfig_3, pollyConfig_3);

    host2.owner.position = new BABYLON.Vector3(-8, 0, 5);
    host3.owner.position = new BABYLON.Vector3(-10, 0, 5);



  var clicks = 0; 
  var showScene = 0;
  var advancedTexture;

  var createGUI = function(scene, showScene)
  {

        switch (showScene) 
        {
            case 0:            
                advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
                var button = BABYLON.GUI.Button.CreateSimpleButton("but", "Begin Scene");
            break
            case 1:            
                advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene1);
                 var button = BABYLON.GUI.Button.CreateSimpleButton("but", "Scene Complete");
            break
        }
        button.width = "200px";
        button.height = "100px";
        button.fontSize = "20px";
        button.fontWeight = "bold";
        button.color = "white";
        button.background = "black";
        //button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
        advancedTexture.addControl(button);

    
        button.onPointerUpObservable.add(function () {    
            clicks++;  

        });
   }

   createGUI(scene, showScene);
 
    setInterval(function() {
                
                showScene = clicks % 2;          
                switch (showScene) {
                    case 0:                    
                        advancedTexture.dispose();
                        createGUI(scene, showScene);
                        engine.runRenderLoop(scene.render.bind(scene));
                    break
                    case 1:
                        advancedTexture.dispose();
                        createGUI(scene1, showScene);
                        engine.runRenderLoop(scene1.render.bind(scene1));
                    break
                }

    }, 500);

    
    return {scene, host, scene1, host2, host3}

}

function addCamera(scene) {
  const position = new BABYLON.Vector3(0.2, 1.5, 1.5);
  const aimTarget = new BABYLON.Vector3(-0.2, 1.5, 0);
  const camera = new BABYLON.UniversalCamera('flyCam', position, scene);
  camera.speed = 0.02;
  camera.minZ = 0.05;
  camera.maxZ = 1000;
  camera.fov = 0.6;

  // Set the key bindings that will control camera movement.
  const keyCodes = { w: 87, a: 65, s: 83, d: 68, q: 81, e: 69 };
  camera.keysLeft = [keyCodes.a];
  camera.keysRight = [keyCodes.d];
  camera.keysUp = [keyCodes.w];
  camera.keysDown = [keyCodes.s];
  camera.keysUpward = [keyCodes.e];
  camera.keysDownward = [keyCodes.q];

  camera.setTarget(aimTarget);

  const camera1 = scene.cameras[0];
  camera1.attachControl(cameraControlEl, true);
}

export const CreateScene = { create };


