import { Injectable } from '@angular/core';
import { WorkerService } from './worker.service';

@Injectable()
export class RecordingService {
  private context: any;
  private jsAudioNode: any;
  private mediaStream: any;
  private audioInput: any;
  private bufferSize = 4096;
  private sampleRate = 44100;
  private recordingLength = 0;
  private blob: Blob;
  private isAudioProcessStarted = false;
  private audioChannel: any[] = [];
  private stream: any;
  // private treshold = 2;
  public isRecording = false;

  constructor(private workerService: WorkerService) {
    this.onAudioProcess = this.onAudioProcess.bind(this);
  }

  private onAudioProcess(event) {
    if (!this.isRecording) {
      return;
    }

    if (!this.isAudioProcessStarted) {
      this.isAudioProcessStarted = true;
    }

    const audioData = event.inputBuffer.getChannelData(0);
    this.audioChannel.push(new Float32Array(audioData));

    this.recordingLength += this.bufferSize;
  }

  private getAudioBuffer(config, callback) {
    function processAudioBuffer(config, cb) {
      function mergeBuffer(channelBuffer, rLength) {
        var result = new Float64Array(rLength);
        var offset = 0;
        var lng = channelBuffer.length;

        for (var i = 0; i < lng; i++) {
          var buffer = channelBuffer[i];
          result.set(buffer, offset);
          offset += buffer.length;
        }

        return result;
      }

      function writeUTFBytes(view, offset, string) {
        const lng = string.length;
        for (let i = 0; i < lng; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }

      let audioBuffer = config.audioBuffer.slice(0);

      audioBuffer = mergeBuffer(audioBuffer, config.internalInterleavedLength);
      const audioBufferLength = audioBuffer.length;
      // create wav file
      const resultingBufferLength = 44 + audioBufferLength * 2;
      const buffer = new ArrayBuffer(resultingBufferLength);
      const view = new DataView(buffer);
      const sampleRate = 44100;

      writeUTFBytes(view, 0, 'RIFF');
      view.setUint32(4, 44 + audioBufferLength * 2, true);
      writeUTFBytes(view, 8, 'WAVE');
      writeUTFBytes(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeUTFBytes(view, 36, 'data');
      view.setUint32(40, audioBufferLength * 2, true);

      // write the PCM samples
      var index = 44;
      const volume = 1;
      for (let i = 0; i < audioBufferLength; i++) {
        view.setInt16(index, audioBuffer[i] * (0x7FFF * volume), true);
        index += 2;
      }

      if (cb) {
        return cb({
          buffer: buffer,
          view: view
        });
      }

      this.postMessage({
        buffer: buffer,
        view: view
      });
    }

    const webWorker = this.workerService.execute(processAudioBuffer);

    webWorker.onmessage = function (event) {
      callback(event.data.buffer, event.data.view);

      // release memory
      URL.revokeObjectURL(webWorker.url);
    };

    webWorker.postMessage(config);
  }

  // private processInWebWorker(_function) {
  //   const blob = new Blob([_function.toString(),
  //   ';this.onmessage =  function (e) {' + _function.name + '(e.data);}'
  //   ], { type: 'application/javascript' });

  //   var workerURL = URL.createObjectURL(blob);

  //   var worker: any = new Worker(workerURL);
  //   worker.workerURL = workerURL;
  //   return worker;
  // }

  private stopRecording(callback) {
    this.isRecording = false;

    this.audioInput.disconnect();
    this.jsAudioNode.disconnect();

    const config = {
      sampleRate: this.sampleRate,
      internalInterleavedLength: this.recordingLength,
      audioBuffer: this.audioChannel
    };

    this.getAudioBuffer(config, (view) => {

      this.blob = new Blob([view], {
        type: 'audio/wav'
      });

      callback && callback(this.blob);

      this.isAudioProcessStarted = false;
    });
  }

  public start() {
    console.log('start recording');
    const AudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);
    this.context = new AudioContext();

    if (this.context.createJavaScriptNode) {
      this.jsAudioNode = this.context.createJavaScriptNode(this.bufferSize, 1, 1);
    } else if (this.context.createScriptProcessor) {
      this.jsAudioNode = this.context.createScriptProcessor(this.bufferSize, 1, 1);
    } else {
      console.error('WebAudio API has no support on this browser');
    }

    this.jsAudioNode.connect(this.context.destination);

    this.stream = navigator.mediaDevices.getUserMedia({ audio: true })
      .then((microphone) => {
        this.isRecording = true;
        this.mediaStream = microphone;

        this.audioInput = this.context.createMediaStreamSource(microphone);
        this.audioInput.connect(this.jsAudioNode);

        console.log('microphone captured');

        this.jsAudioNode.onaudioprocess = this.onAudioProcess;
      })
      .catch((err) => console.error(err));
  }

  public stop() {
    console.log('stop recording')
    this.mediaStream.getAudioTracks()[0].stop();
    this.stopRecording((blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const audio = document.querySelector('audio');
      audio.src = url;

      // this.analyzeAudioBlob(blob);
    });
  };

  // private analyzeAudioBlob(blob: Blob) {
  //   return new Promise((resolve => {
  //     let fileReader = new FileReader();
  //     fileReader.onload = () => { resolve(fileReader.result) };
  //     fileReader.readAsArrayBuffer(blob);
  //   }))
  //     .then(arrayBuffer => {
  //       return this.context.decodeAudioData(arrayBuffer);
  //     })
  //     .then(audioBuffer => {
  //       audioBuffer = new Uint8Array(audioBuffer.getChannelData(0).buffer);
  //       audioBuffer = audioBuffer.filter(x => x > 0);
  //       const bufferLength = audioBuffer.length;

  //       const shortBuffer = this.context.createBuffer(1, bufferLength, this.sampleRate);
  //       const sB = new Uint8Array(shortBuffer.getChannelData(0).buffer);

  //       // What to do?
  //     });
  // }
}