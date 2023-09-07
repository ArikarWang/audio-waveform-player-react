import React, { Component } from 'react';
import WaveSurfer from 'wavesurfer.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min';
import ElanPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.elan.min';
import MarkersPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.markers.min';
import MediaSessionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.mediasession.min';
import MicrophonesPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.min';
import MinimapPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.minimap.min';
import PlayHeadPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.playhead.min';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.spectrogram.min';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min';
import message from 'antd/es/message';
import 'antd/es/message/style/css';
import Spin from 'antd/es/spin';
import 'antd/es/spin/style/css';
import ProgressBar from './progressbar';
import themeConfig from './theme';

export class AudioWaveformPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      waveSurfer: null, // wavesurfer实例
      waveSurferLoading: false, // wavesurfer加载中
      loadingProgress: 0, // 加载进度
      file: null, // 文件
      isPlay: false, // 是否播放
      rate: 0, // 播放进度
      totalTime: 0, // 总时长
      nowTime: 0, // 当前播放时长
      volume: 0, // 音量
      speechRate: '1', // 语速
      speechRateOptions: ['2', '1.5', '1.25', '1', '0.75', '0.5'], // 语速选项
      autoplay: false, // 是否自动播放
      isFile: false, // 是否是文件
    };

    this.initWaveSurfer = this.initWaveSurfer.bind(this);
    this.onAudioReady = this.onAudioReady.bind(this);
    this.checkIsFile = this.checkIsFile.bind(this);
    this.testAutoPlay = this.testAutoPlay.bind(this);
  }

  /**
   * 获取插件
   */
  getPlugins(propPlugins) {
    const pluginCreators = {
      cursor: CursorPlugin.create,
      elan: ElanPlugin.create,
      markers: MarkersPlugin.create,
      mediasession: MediaSessionPlugin.create,
      microphone: MicrophonesPlugin.create,
      minimap: MinimapPlugin.create,
      playhead: PlayHeadPlugin.create,
      regions: RegionsPlugin.create,
      spectrogram: SpectrogramPlugin.create,
      timeline: TimelinePlugin.create,
    };

    if (!propPlugins || Object.keys(propPlugins).length === 0) {
      return [];
    }

    return Object.entries(propPlugins)
      .filter(([key]) => key in pluginCreators)
      .map(([key, value]) => pluginCreators[key](value));
  }

  /**
   * 初始化wavesurfer
   */
  initWaveSurfer() {
    const { config = {}, theme = 'default', plugins = {} } = this.props;
    // if (!this.props.container) return;
    const me = this;

    if (this.state.waveSurfer) {
      this.state.waveSurfer.destroy();
    }

    // const waveSurferConfig = {};

    // if (this.props.config) {
    //   Object.assign(waveSurferConfig, this.props.config);
    // } else if (this.props.theme && theme[this.props.theme]) {
    //   Object.assign(waveSurferConfig, theme[this.props.theme].config);
    // } else {
    //   Object.assign(waveSurferConfig, theme.default.config);
    // }

    // let plugins = [];
    // if (this.props.plugins && Object.keys(this.props.plugins).length > 0) {
    //   plugins = getPlugins(this.props.plugins);
    // } else if (this.props.theme && theme[this.props.theme]) {
    //   plugins = getPlugins(theme[this.props.theme].plugins);
    // } else {
    //   plugins = getPlugins(theme.default.plugins);
    // }

    // Object.assign(waveSurferConfig, { plugins });

    // Object.assign(waveSurferConfig, { container: document.getElementById('waveform') });

    // const themeConfig = theme && theme[this.props.theme] ? theme[this.props.theme] : theme.default;
    const pluginsConfig =
      plugins && Object.keys(plugins).length > 0
        ? plugins
        : theme && themeConfig[theme]
        ? themeConfig[theme].plugins
        : themeConfig.default.plugins;

    const waveSurferConfig = Object.assign(
      {},
      config && Object.keys(config).length > 0
        ? config
        : theme && themeConfig[theme]
        ? themeConfig[theme].config
        : themeConfig.default.config,
      { plugins: this.getPlugins(pluginsConfig) },
      { container: document.getElementById('waveform') }
    );

    // console.log('waveSurferConfig', waveSurferConfig);

    const waveSurfer = WaveSurfer.create(waveSurferConfig);

    /** 事件注册 */
    // 播放
    waveSurfer.on('play', () => {
      // console.log('play');
      if (me.props.onPlay) {
        me.props.onPlay();
      }
      me.setState(() => ({ isPlay: me.state.waveSurfer.isPlaying() }));
    });
    // 暂停
    waveSurfer.on('pause', () => {
      // console.log('pause');
      if (me.props.onPause) {
        me.props.onPause();
      }
      setTimeout(() => {
        me.setState(() => ({ isPlay: me.state.waveSurfer.isPlaying() }));
      }, 10);
    });
    // 播放完成
    waveSurfer.on('finish', () => {
      // console.log('finish');
      if (me.props.onFinish) {
        me.props.onFinish();
      }
      me.setState(() => ({ rate: 1 }));
    });
    // 进度(波形)
    waveSurfer.on('seek', e => {
      // console.log('seek', e);
      if (me.props.onSeek) {
        me.props.onSeek(e);
      }
      me.setState(() => ({
        totalTime: me.state.waveSurfer.getDuration(),
        nowTime: me.state.waveSurfer.getCurrentTime(),
        rate: e,
      }));
    });
    // 进度(进度条)
    waveSurfer.on('audioprocess', e => {
      // console.log('audioprocess', e);
      if (me.props.onAudioprocess) {
        me.props.onAudioprocess(e);
      }
      me.setState(() => ({
        totalTime: me.state.waveSurfer.getDuration(),
        nowTime: e,
        rate: e / me.state.waveSurfer.getDuration(),
      }));
    });
    // 音频加载完成
    waveSurfer.on('waveform-ready', () => {
      // console.log('ready');
      if (me.props.onReady) {
        me.props.onReady();
      }
      // me.setState(() => ({ waveSurferLoading: false }));
      me.onAudioReady();
    });
    // 音频加载完成
    // waveSurfer.on('ready', () => {
    //   // console.log('ready');
    //   if (me.props.onReady) {
    //     me.props.onReady();
    //   }
    //   // me.setState(() => ({ waveSurferLoading: false }));
    //   me.onAudioReady();
    // });
    // 音频加载状态
    waveSurfer.on('loading', e => {
      // console.log('loading', e);
      if (me.props.onLoading) {
        me.props.onLoading(e);
      }
      me.setState(() => ({ loadingProgress: e }));
    });
    // 错误监听
    waveSurfer.on('error', e => {
      console.log('error', e);
      try {
        if (me.props.onError) {
          me.state.waveSurfer.empty();
          me.setState(() => ({ waveSurferLoading: false }));
          me.props.onError(e);
          return;
        } else if (e === 'Error decoding audiobuffer') {
          console.log('音频解码错误');
          message.error('音频解码错误');
        } else if (e.toString().includes('TypeError: Failed to fetch')) {
          console.log('音频文件加载失败');
          message.error('音频文件加载失败');
        }
        me.state.waveSurfer.empty();
        me.setState(() => ({ waveSurferLoading: false }));
      } catch (error) {
        me.state.waveSurfer.empty();
        me.setState(() => ({ waveSurferLoading: false }));
      }
    });

    // 暴露wavesurfer实例
    if (this.props.onWaveSurferRef) {
      this.props.onWaveSurferRef(waveSurfer);
    }

    const newState = {
      waveSurfer,
      waveSurferLoading: false,
    };

    if (this.props.file) {
      this.checkIsFile(this.props.file)
        ? waveSurfer.loadBlob(this.props.file)
        : waveSurfer.load(this.props.file);
      newState.waveSurferLoading = true;
    }

    this.setState(() => newState);
  }

  /**
   * 音频加载完成时调用
   */
  onAudioReady() {
    const { waveSurfer, isFile } = this.state;
    if (waveSurfer) {
      waveSurfer.setPlaybackRate('1');
      this.setState(() => ({
        waveSurferLoading: false,
        speechRate: '1',
        isPlay: waveSurfer.isPlaying(),
        rate: waveSurfer.getCurrentTime(),
        volume: waveSurfer.getVolume(),
        mute: waveSurfer.getMute(),
        totalTime: waveSurfer.getDuration(),
        nowTime: waveSurfer.getCurrentTime(),
      }));
    }
    if (this.props.autoplay) {
      const path = isFile ? window.URL.createObjectURL(this.props.file) : this.props.file;
      this.testAutoPlay(path).then(autoplay => {
        if (autoplay) {
          waveSurfer.play();
        } else {
          // message.warning('不支持自动播放')
        }
      });
    }
  }

  // static getDerivedStateFromProps(props, state) {
  //   if (props.file !== state.file) {
  //     if (state.waveSurfer !== null) {
  //       console.log('static load');
  //       state.waveSurfer.load(props.file);
  //     }
  //     return {
  //       file: props.file,
  //     };
  //   }
  //   return null;
  // }

  componentDidUpdate(preProps, preState) {
    if (!!this.props.file && preProps.file !== this.props.file && this.state.waveSurfer !== null) {
      if (this.state.waveSurfer) {
        console.log('file', this.props.file);
        if (this.checkIsFile(this.props.file)) {
          const file = window.URL.createObjectURL(this.props.file)
          this.state.waveSurfer.load(file);
          // this.state.waveSurfer.loadBlob(this.props.file);
        } else {
          this.state.waveSurfer.load(this.props.file);
        }
        // this.state.waveSurfer.load(this.props.file);
        this.setState(() => ({ waveSurferLoading: true }));
        return;
      }
      this.initWaveSurfer();
    }
  }

  componentDidMount() {
    this.initWaveSurfer();
  }
  componentWillUnmount() {
    /** 销毁 */
    if (this.state.waveSurfer) {
      // this.state.waveSurfer.unAll();
      this.state.waveSurfer.destroy();
    }
  }
  /**
   * 音频自动播放测试
   * @param {*} path 音频路径
   * @returns true 可以自动播放 false 不支持自动播放
   */
  testAutoPlay(path) {
    // 返回一个promise以告诉调用者检测结果
    return new Promise(resolve => {
      let audio = document.createElement('audio');
      audio.src = path;
      // 循环播放，如果不需要可注释
      // audio.loop = 'loop';
      document.body.appendChild(audio);
      let autoplay = true;
      // play返回的是一个promise
      audio
        .play()
        .then(() => {
          // 支持自动播放
          autoplay = true;
          // console.log('自动播放');
          audio.pause();
        })
        .catch(err => {
          // 不支持自动播放
          // console.log('不支持自动播放');
          autoplay = false;
          audio.pause();
        })
        .finally(e => {
          setTimeout(() => {
            document.body.removeChild(audio);
          }, 10);
          resolve(autoplay);
        });
    });
  }

  /**
   * 判断是文件地址还是文件对象
   * @param {*} file
   * @returns true 文件对象 false 文件地址
   */
  checkIsFile(file) {
    this.setState(() => ({ isFile: file instanceof File || file instanceof Blob }));
    // console.log('loadFile');
    return file instanceof File || file instanceof Blob;
  }

  render() {
    const me = this;
    const {
      isPlay,
      isFile,
      rate,
      volume,
      mute,
      speechRate,
      totalTime,
      nowTime,
      speechRateOptions,
      waveSurferLoading,
      loadingProgress,
    } = this.state;
    const { file, isDownload } = this.props;
    const progressBarProps = {
      isDownload,
      file,
      isFile,
      isPlay,
      rate,
      volume,
      mute,
      speechRate,
      totalTime,
      nowTime,
      speechRateOptions,
      play() {
        // console.log('play');
        me.state.waveSurfer.play();
      },
      pause() {
        // console.log('pause');
        me.state.waveSurfer.pause();
      },
      seek(val) {
        // console.log('seek');
        me.state.waveSurfer.seekTo(val);
        // const nowTime = me.state.waveSurfer.getCurrentTime();
        // const totalTime = me.state.waveSurfer.getDuration();
        // me.setState(() => ({
        //   rate: nowTime / totalTime,
        //   nowTime,
        //   totalTime,
        // }));
      },
      speechRateChange({ key }) {
        // console.log(key);
        // console.log('speechRateChange');
        if (me.state.waveSurfer.isPlaying()) {
          me.state.waveSurfer.pause();
          me.state.waveSurfer.setPlaybackRate(key);
          me.state.waveSurfer.play();
        } else {
          me.state.waveSurfer.setPlaybackRate(key);
        }
        me.setState(() => ({ speechRate: key }));
      },
      volumeChange(val) {
        me.state.waveSurfer.setVolume(val);
        me.setState(() => ({ volume: val }));
      },
      changeMute(flag) {
        me.state.waveSurfer.setMute(flag);
        me.setState(() => ({ mute: flag }));
      },
    };
    return (
      <div>
        <Spin spinning={waveSurferLoading} tip={`${loadingProgress}%`}>
          <div id={'waveform'} />
          <ProgressBar {...progressBarProps} />
        </Spin>
      </div>
    );
  }
}

export default AudioWaveformPlayer;
