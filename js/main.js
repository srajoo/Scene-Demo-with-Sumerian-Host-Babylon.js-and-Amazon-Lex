import { CreateScene } from './scene-room.js';
import { LexBot, LexBotEvents } from './lex-bot.js';
import { VirtualScreen } from './virtual-screen.js';

let canvas;
let engine;
let sceneObjects
let scene;
let scene1;
let scene_no;
let host;
let female;
let host2;
let host3;
let conversation;
let lex;
let messageContainerEl;
let transcriptTextEl;


// The function calls below define our app's start-up sequence.
configureAwsSdk();
init3dEngine();
await loadScene();
startScene1();


function configureAwsSdk() {
  AWS.config.region = 'us-east-1'; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:d9e72bd3-6a12-4494-a8bb-3115d6d87057',
});

  
}

function init3dEngine() {
  canvas = document.getElementById('renderCanvas');
  engine = new BABYLON.Engine(canvas, true, undefined, true);
  // Use our own button to enable audio
  BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;

  // Handle window resize
  window.addEventListener('resize', () => engine.resize());
}

async function loadScene(){

    sceneObjects = await CreateScene.create(engine);

    scene = sceneObjects.scene;
    scene1 = sceneObjects.scene1;
    host = sceneObjects.host;
    host2 = sceneObjects.host2;
    host3 = sceneObjects.host3;

    const lexClient = new AWS.LexRuntime();
    const botConfig = {
    botName: 'Questionnaire',
    botAlias: 'Dev',
  };

    lex = new LexBot(lexClient, botConfig);
    await lex.enableMicInput();


}

function startScene1()
{
 
  host.GestureFeature.playGesture('Gesture', 'Wave');
  host.TextToSpeechFeature.play(`Hello and welcome to training. Please press Begin Scene to Start.`); 
  const myTimeout = setTimeout(startScene2, 6000);

  //const myTimeout = setTimeout(startApp, 6000);

}

async function startScene2()
{
  
  host.TextToSpeechFeature.play("The scene will begin shortly. You are about to witness a conversation between a husband and wife. Once the scene is complete, press scene complete.");
  
  setTimeout(function() {

    host2.owner.rotate(BABYLON.Vector3.Up(), -Math.PI/2);
    host3.owner.rotate(BABYLON.Vector3.Up(), Math.PI/2);
    host2.AnimationFeature.playAnimation('Gesture', 'Idle');
    host3.AnimationFeature.playAnimation('Gesture', 'Idle');

  }, 10000);

  setTimeout(function()
    {
        host2.AnimationFeature.playAnimation('Gesture', 'Wave');
        host2.TextToSpeechFeature.play('Hi John. You are back early');
    }, 10500);

  setTimeout(function()
    {
        host2.AnimationFeature.playAnimation('Gesture', 'Idle');
        host3.TextToSpeechFeature.play('Yes I thought I would come home early. What did you do today');
        host3.AnimationFeature.playAnimation('Gesture', 'Talk');
    }, 13500);

  setTimeout(function()
    {
        host2.TextToSpeechFeature.play('Remember Max from that party we went to, I just spent the day with him');
        host3.AnimationFeature.playAnimation('Gesture', 'Idle');
        host2.AnimationFeature.playAnimation('Gesture', 'Talk');
    }, 18000);

  setTimeout(function()
    {
         host3.TextToSpeechFeature.play('Max who spent the entire time flirting with you? Why did you do that?');
    host3.AnimationFeature.playAnimation('Gesture', 'Talk');
    host2.AnimationFeature.playAnimation('Gesture', 'Idle');
    },21500 );

  setTimeout(function()
    {
        host2.TextToSpeechFeature.play('Oh that was just friendly talk! Dont take it so seriously.');
    host2.AnimationFeature.playAnimation('Gesture', 'Talk');
    host3.AnimationFeature.playAnimation('Gesture', 'Idle');
    }, 24500);

  setTimeout(function()
    {
        host3.TextToSpeechFeature.play('Dont take that tone with me. You are always doing this, never taking my feelings into consideration');
    host3.AnimationFeature.playAnimation('Gesture', 'Argue');
    host2.AnimationFeature.playAnimation('Gesture', 'Idle');
    }, 26500 );

  setTimeout(function()
    {
        host2.TextToSpeechFeature.play('Why are you getting angry about this? There is nothing going on here for you to be upset');
    host2.AnimationFeature.playAnimation('Gesture', 'Talk');
    host3.AnimationFeature.playAnimation('Gesture', 'Idle');

    }, 34500);

  setTimeout(function()
    {
        host3.AnimationFeature.playAnimation('Gesture', 'Walk');
        host2.AnimationFeature.playAnimation('Gesture', 'Idle');
    }, 38500);

  setTimeout(function()
    {
      host3.owner.position = new BABYLON.Vector3(-9, 0, 5);
      host3.AnimationFeature.playAnimation('Gesture', 'Idle');
      host3.TextToSpeechFeature.play("Listen to me. You are my wife, you live under my roof, you listen to what I say.");
    }, 39000);

  setTimeout(function()
    {
        host2.AnimationFeature.playAnimation('Gesture', 'Argue');
      host2.TextToSpeechFeature.play("Youre not the boss of me. You cant keep telling me what to do. I will do what I want");
      host3.AnimationFeature.playAnimation('Gesture', 'Idle');
    }, 43200);

  setTimeout(function()
    {
        host2.AnimationFeature.playAnimation('Gesture', 'Idle');
        host3.TextToSpeechFeature.play("Do you really think you can talk to me that way and get away with it?");
    }, 48200);

  setTimeout(function()
    {
        host2.TextToSpeechFeature.play("What? What will you do? Pout around all day?");
    }, 50200);

  setTimeout(function()
    {
        host3.TextToSpeechFeature.play("Dont push me");
    }, 51200);
  setTimeout(function()
    {
        host2.TextToSpeechFeature.play("You wont do anything. You are just an insecure little man");
        
    },52000 );

  setTimeout(function()
    {
      host3.TextToSpeechFeature.play("I SAID DONT PUSH ME");
      host3.AnimationFeature.playAnimation('Gesture', 'Attack');
        
    }, 53000);

  setTimeout(function()
    {
        host2.AnimationFeature.playAnimation('Gesture', 'Knocked');
    }, 54000);
  setTimeout(function()
    {
        host2.owner.position = new BABYLON.Vector3(-6.5, 0, 5);
        host2.owner.rotate(BABYLON.Vector3.Up(), -Math.PI);
        host3.AnimationFeature.playAnimation('Gesture', 'Idle');
        host2.AnimationFeature.playAnimation('Gesture', 'Up');
    }, 61600);
  setTimeout(function()
    {
      host2.AnimationFeature.playAnimation('Gesture', 'Cry');
      host.TextToSpeechFeature.play("The scene is complete. Please press Scene Complete");
   
    },64100 );

  setTimeout(function()
    { 
        startApp();  
    }, 70100);
}

function startApp()
{

 const screenMesh = scene.getMeshByName('DisplayScreen');
 const virtualScreen = new VirtualScreen(screenMesh, 275, 183);
 virtualScreen.loadUrl('content-screen-start.html');
 host.TextToSpeechFeature.play("Please give a response to the questions I am about to ask. Give a response on a 7 point scale with 1 being not at all agree to 7 being very much agree. If you ready, click the microphone icon and say Begin Questionnaire");
 const talkButton = document.getElementById('talkButton');
  talkButton.onmousedown = () => lex.beginVoiceRecording();
  talkButton.onmouseup = () => lex.endVoiceRecording();

  lex.listenTo(LexBotEvents.lexResponseReady, response =>
    handleLexResponse(response)
  ); 

  // Create convenience references to DOM elements.
  messageContainerEl = document.getElementById('userMessageContainer');
  transcriptTextEl = document.getElementById('transcriptText');
}

function handleLexResponse(response) {
 
  // Display the user's speech input transcript.
  displaySpeechInputTranscript(response.inputTranscript);

  // Have the host speak the response from Lex.
  host.TextToSpeechFeature.play(response.message);
}

function displaySpeechInputTranscript(text) {
  transcriptTextEl.innerText = `“${text}”`;
  messageContainerEl.classList.add('showingMessage');
}


