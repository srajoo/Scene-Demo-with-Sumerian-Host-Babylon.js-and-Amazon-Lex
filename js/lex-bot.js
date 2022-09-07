import { LexUtils } from './LexUtils.js';

export const LexBotEvents = {
  lexResponseReady: 'lexResponseReady',
  micReady: 'micReady',
  recordBegin: 'recordBegin',
  recordEnd: 'recordEnd',
}

export class LexBot 
{

  constructor(lexRuntime, options = {botName: undefined, botAlias: undefined, userId: undefined,})
  {
    //super();

    if (!lexRuntime) {
      throw Error('Cannot initialize Lex feature. LexRuntime must be defined');
    }

    if (lexRuntime.config) {
      lexRuntime.config.customUserAgent = addCoreUserAgentComponent(
        lexRuntime.config.customUserAgent
      );
      lexRuntime.config.customUserAgent = addStringOnlyOnce(
        lexRuntime.config.customUserAgent,
        this.getEngineUserAgentString()
      );
    }

    this._lexRuntime = lexRuntime;
    this._botName = options.botName;
    //console.log( this._botName);
    this._botAlias = options.botAlias;
    this._userId = options.userId ? options.userId : createId();
    this.messageBus = new HOST.Messenger(options.botName);
    
    this._micReady = false;
    this._recording = false;
    this._recLength = 0;
    this._recBuffer = [];
    this._setupAudioContext();

  }

  _setupAudioContext() {
    this._audioContext = new AudioContext();
  }

  _processWithAudio(inputAudio, sourceSampleRate, config = {}) {
    const audio = this._prepareAudio(inputAudio, sourceSampleRate);
    return this._process('audio/x-l16; rate=16000', audio, config);
  }

  _process(contentType, inputStream, config) {
    const settings = this._validateConfig(config);
    const lexSettings = {
      botName: settings.botName,
      botAlias: settings.botAlias,
      contentType,
      inputStream,
      userId: settings.userId,
    };
    return new Promise((resolve, reject) => {
      this._lexRuntime.postContent(lexSettings, (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(data);
      });
    })
      .then(data => {
        this.messageBus.emit(this.constructor.EVENTS.lexResponseReady, data);
        return data;
      })
      .catch(error => {
        const errorMessage = `Error happened during voice recording: ${error}. Please check whether your speech is more than 15s.`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      });
  }

  _validateConfig(config) {
    const settings = {};

    settings.botName = config.botName ? config.botName : this._botName;
    settings.botAlias = config.botAlias ? config.botAlias : this._botAlias;
    settings.userId = config.userId ? config.userId : this._userId;

    if (!settings.botName || !settings.botAlias || !settings.userId) {
      throw new Error(
        'Cannot process lex request. All arguments must be defined.'
      );
    }

    return settings;
  }

  _prepareAudio(audioBuffer, sourceSampleRate) {
    const downsampledAudio = LexUtils.downsampleAudio(
      audioBuffer,
      sourceSampleRate,
      this.constructor.LEX_DEFAULTS.SampleRate
    );
    const encodedAudio = LexUtils.encodeWAV(
      downsampledAudio,
      this.constructor.LEX_DEFAULTS.SampleRate
    );

    return new Blob([encodedAudio], {type: 'application/octet-stream'});
  }

  async enableMicInput() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const source = this._audioContext.createMediaStreamSource(stream);
    //TODO: createScriptProcessor is deprecated which should be replaced
    const node = this._audioContext.createScriptProcessor(4096, 1, 1);

    node.onaudioprocess = e => {
      if (!this._recording) return;

      const buffer = e.inputBuffer.getChannelData(0);
      this._recBuffer.push(new Float32Array(buffer));
      this._recLength += buffer.length;
    };

    source.connect(node);
    node.connect(this._audioContext.destination);

    this.messageBus.emit(this.constructor.EVENTS.micReady);
    this._micReady = true;
  }

  beginVoiceRecording() {
    if (!this._micReady) {
      return;
    }

    if (
      this._audioContext.state === 'suspended' ||
      this._audioContext.state === 'interrupted'
    ) {
      this._audioContext.resume();
    }
    this._recLength = 0;
    this._recBuffer = [];
    this._recording = true;

    this.messageBus.emit(this.constructor.EVENTS.recordBegin);
  }
  endVoiceRecording() {
    if (!this._recording) {
      return Promise.resolve();
    }

    this._recording = false;

    const result = new Float32Array(this._recLength);
    let offset = 0;
    for (let i = 0; i < this._recBuffer.length; i++) {
      result.set(this._recBuffer[i], offset);
      offset += this._recBuffer[i].length;
    }

    this.messageBus.emit(this.constructor.EVENTS.recordEnd);
    return this._processWithAudio(result, this._audioContext.sampleRate);
  }
  listenTo(message, callback) {
    this.messageBus.listenTo(message, callback);
  }


  getEngineUserAgentString() {
    return 'UnknownEngine';
  }
}

Object.defineProperties(LexBot, {
  LEX_DEFAULTS: {
    value: {
      SampleRate: '16000',
    },
    writable: false,
  },
  EVENTS: {
    value: {
      ...Object.getPrototypeOf(LexBot).EVENTS,
      lexResponseReady: 'lexResponseReady',
      micReady: 'micReady',
      recordBegin: 'recordBegin',
      recordEnd: 'recordEnd',
    },
  },
});

function createId() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const randomNumber = Math.floor((Date.now() + Math.random() * 16) % 16);
      if (c === 'x') {
        return randomNumber.toString(16);
      }
      // Set bit 6 and 7 to 0 and 1
      return ((randomNumber & 0x3) | 0x8).toString(16);
    });
  }

function addStringOnlyOnce(stringToManipulate, stringToAdd) {
    if (stringToManipulate == null) {
      return stringToAdd;
    }

    if (stringToManipulate.indexOf(stringToAdd) !== -1) {
      return stringToManipulate;
    }

    return stringToManipulate.concat(' ', stringToAdd);
  }

function addCoreUserAgentComponent(currentUserAgent) {
    const sumerianHostsUserAgent = `SumerianHosts-development babylonjs@4.2.2`;
    return addStringOnlyOnce(currentUserAgent, sumerianHostsUserAgent);
  }
