let isTextToSpeechInitialized = false;

async function createHost(scene, characterConfig, pollyConfig) {
  await initTextToSpeech(pollyConfig.pollyClient,pollyConfig.pollyPresigner);
  const assets = await loadAssets(scene, characterConfig);
  console.log(assets); 
  const host = assembleHost(assets, scene);
  addTextToSpeech(host, scene, pollyConfig.pollyVoice, pollyConfig.pollyEngine);
  //console.log(host);
 
  //this.addPointOfInterestTracking(host, scene, assets.poiConfig);

  return host;
}

async function initTextToSpeech() {
  // Ensure services get initialized only once per session.
  if (isTextToSpeechInitialized) return;
  isTextToSpeechInitialized = true;

  // Enable Polly service functionality.
  const polly = new AWS.Polly();
  const presigner = new AWS.Polly.Presigner();
  await HOST.aws.TextToSpeechFeature.initializeService(polly, presigner, AWS.VERSION);
}


async function loadAssets(scene, {modelUrl ,animGestureUrl}, ) 
{
 
  // Load character model
  const characterAsset = await BABYLON.SceneLoader.LoadAssetContainerAsync(modelUrl);
  const characterMesh = characterAsset.meshes[0];
  const characterAnim = characterAsset.animationGroups;
  //console.log(characterAsset.animationGroups[0]);

  // Make the offset pose additive
  /*if (characterAnim) {
    BABYLON.AnimationGroup.MakeAnimationAdditive(characterAnim);
  }*/

  characterAsset.addAllToScene();

  const childMeshes = characterMesh.getDescendants(false);

  const animationLoadingPromises = [
    loadAnimation(scene, childMeshes, animGestureUrl, 'gestureClips'),
    
  ];


  const animLoadingResults = await Promise.all(animationLoadingPromises);

  //console.log(animLoadingResults);

  const animClips = {};
  animLoadingResults.forEach((result) => {
    animClips[result.clipGroupId] = result.clips;
  });


  // Load the gesture config file. This file contains options for splitting up
  // each animation in gestures.glb into 3 sub-animations and initializing them
  // as a QueueState animation.
  //const gestureConfig = await loadJson(gestureConfigUrl);

  // Read the point of interest config file. This file contains options for
  // creating Blend2dStates from look pose clips and initializing look layers
  // on the PointOfInterestFeature.
  //const poiConfig = await loadJson(pointOfInterestConfigUrl);

  return { characterMesh, animClips, characterAnim/*, gestureConfig, poiConfig*/ };
}

/**
 * Loads animations into the provided scene.
 *
 * @param {BABYLON.Scene} scene
 * @param {BABYLON.Mesh[]} childMeshes
 * @param {string} url
 *   URL of a 3D file containing animations (.gltf or .glb)
 * @param {string} clipGroupId
 *   An ID of your choosing for labeling the group.
 * @returns {Promise}
 *   A promise that resolves to an object with this shape:
 * { clipGroupId: string, clips: BABYLON.AnimationGroup[] }
 */
async function loadAnimation(scene, childMeshes, url, clipGroupId) {
  const promise = BABYLON.SceneLoader.LoadAssetContainerAsync(url)
    .then(
      (container) => {
        const startingIndex = scene.animatables.length;
        const firstIndex = scene.animationGroups.length;

        // Apply animation to character
        container.mergeAnimationsTo(
          scene,
          scene.animatables.slice(startingIndex),
          (target) => childMeshes.find((mesh) => mesh.name === target.name) || null,
        );

        // Find the new animations and destroy the container
        const clips = scene.animationGroups.slice(firstIndex);
        container.dispose();
        scene.onAnimationFileImportedObservable.notifyObservers(scene);

        return { clipGroupId, clips };
      },
    );

  return promise; 
}



function assembleHost(assets, scene) {
  const characterMesh = assets.characterMesh;


  // Add the host to the render loop
  const host = new HOST.HostObject({ owner: assets.characterMesh});
  console.log("initial", host);
  scene.onBeforeAnimationsObservable.add(() => {
    host.update();
  });

  // Set up animation
  host.addFeature(HOST.anim.AnimationFeature);

  const {gestureClips} = assets.animClips;

  // Gesture animations
  host.AnimationFeature.addLayer('Gesture', {
    /*transitionTime: 1.5,
    blendMode: HOST.anim.LayerBlendModes.Additive,*/
  });

  
  gestureClips.forEach((clip) => {
    const { name } = clip;
    //const config = assets.gestureConfig[name];
    //BABYLON.AnimationGroup.MakeAnimationAdditive(clip);
    host.AnimationFeature.addAnimation(
        'Gesture',
        name,
        HOST.anim.AnimationTypes.single,
        { clip },
      );

    /*if (config !== undefined) {
      // Add the clip to each queueOption so it can be split up
      config.queueOptions.forEach((option) => {
        option.clip = clip;
        option.to /= 30.0;
        option.from /= 30.0;
      });
      host.AnimationFeature.addAnimation(
        'Gesture',
        name,
        HOST.anim.AnimationTypes.queue,
        config,
      );
    } else {
      host.AnimationFeature.addAnimation(
        'Gesture',
        name,
        HOST.anim.AnimationTypes.single,

        { clip },
      );
    }*/
  });
 
  //host.AnimationFeature.playAnimation('Gesture', 'Wave');



  // Apply bindPoseOffset clip if it exists
  const bindPoseOffset = assets.bindPoseOffset;
  if (bindPoseOffset !== undefined) {
    host.AnimationFeature.addLayer('BindPoseOffset', { blendMode: HOST.anim.LayerBlendModes.Additive });
    host.AnimationFeature.addAnimation(
      'BindPoseOffset',
      bindPoseOffset.name,
      HOST.anim.AnimationTypes.single,

      {
        clip: bindPoseOffset,
        from: 1 / 30,
        to: 2 / 30,
      },
    );
    host.AnimationFeature.playAnimation(
      'BindPoseOffset',
      bindPoseOffset.name,
    );
  }

  // Set up Lipsync
  const visemeOptions = {
    layers: [{
      name: 'Viseme',
      animation: 'visemes',
    }],
  };
  const talkingOptions = {
    layers: [{
      name: 'Talk',
      animation: 'stand_talk',
      blendTime: 0.75,
      easingFn: HOST.anim.Easing.Quadratic.InOut,
    }],
  };
  host.addFeature(
    HOST.LipsyncFeature,
    false,
    visemeOptions,
    talkingOptions,
  );

  // Set up Gestures
  host.addFeature(HOST.GestureFeature, false, {
    layers: {
      Gesture: { minimumInterval: 3 },
      Emote: {
        blendTime: 0.5,
        easingFn: HOST.anim.Easing.Quadratic.InOut,
      },
    },
  });
  const gestureOptions = {
    holdTime: 1.5, // how long the gesture should last
  };
  //host.GestureFeature.playGesture('Gesture', 'Idle', gestureOptions);

  return host;
}

function addTextToSpeech(host, scene, voice, engine, audioJointName = 'mixamorig2:Neck') {
  const joints = host.owner.getDescendants(false);

  const audioJoint = joints.find((joint) => joint.name === audioJointName);
  

  host.addFeature(
    HOST.aws.TextToSpeechFeature,
    false,
    { scene, attachTo: audioJoint, voice, engine },
  );
}

/*
  function addPointOfInterestTracking(host, scene, poiConfig, lookJointName = 'char:jx_c_look') {  
  const joints = host.owner.getDescendants(false);
  const lookJoint = joints.find((joint) => joint.name === lookJointName);

  host.addFeature(
    HOST.PointOfInterestFeature,
    false,
    { lookTracker: lookJoint, scene },
    { layers: poiConfig },
    { layers: [{ name: 'Blink' }] },
  );
}

async function loadJson(url) {
  const response = await fetch(url);
  const json = await response.json();
  return json;
}*/

// Map host IDs to a character type (either "adult_female" or "adult_male").
const characterTypeMap = new Map();
// Female characters
characterTypeMap.set('Cristine', 'adult_female');
characterTypeMap.set('Fiona', 'adult_female');
characterTypeMap.set('Grace', 'adult_female');
characterTypeMap.set('Maya', 'adult_female');
characterTypeMap.set('Jane', 'adult_female');
characterTypeMap.set('Sophie', 'adult_female');
// Male characters
characterTypeMap.set('Jay', 'adult_male');
characterTypeMap.set('Luke', 'adult_male');
characterTypeMap.set('Preston', 'adult_male');
characterTypeMap.set('Wes', 'adult_male');
characterTypeMap.set('John', 'adult_male');

const characterConfigs = new Map();

characterTypeMap.forEach((characterType, characterId) => {
    const characterConfig = {
      modelUrl: `assets/3d-assets/characters/${characterType}/${characterId}/${characterId}.gltf`,
      animGestureUrl: `assets/3d-assets/animations/${characterType}/custom/gestures.glb`,
     
    };

  characterConfigs.set(characterId, characterConfig);
});

/**
 * Returns a config object describing the assets needed to build one of the
 * eight built-in Sumerian Host characters.
 *
 * Available character IDs are:
 * - "Cristine"
 * - "Fiona"
 * - "Grace"
 * - "Maya"
 * - "Jay"
 * - "Luke"
 * - "Preston"
 * - "Wes"
 *
 * The shape of the returned config object is:
 * {
 *   modelUrl: String,
 *   gestureConfigUrl: String,
 *   pointOfInterestConfigUrl: String,
 *   animStandIdleUrl: String,
 *   animLipSyncUrl: String,
 *   animGestureUrl: String,
 *   animEmoteUrl: String,
 *   animFaceIdleUrl: String,
 *   animBlinkUrl: String,
 *   animPointOfInterestUrl: String,
 * }
 */
function getCharacterConfig(characterId) {
  return characterConfigs.get(characterId); 
}

export const SumerianHostObject = {
  createHost,
  getCharacterConfig,
};
