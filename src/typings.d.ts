/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
interface Window {
  AudioContext: any;
  webkitAudioContext: any;
  mozAudioContext: any;
  oAudioContext: any;
  msAudioContext: any;
}