import React, { Component } from 'react';
import WaveSurfer from 'wavesurfer.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min';
// import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min';
// import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min';
// import { message, Spin } from 'antd';
import message from 'antd/es/message';
import 'antd/es/message/style/css';
import Spin from 'antd/es/spin';
import 'antd/es/spin/style/css';
import { SoundTouch, SimpleFilter, getWebAudioNode } from 'soundtouchjs';
import ProgressBar from './progressbar';

export class WaveSufer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      waveSurfer: null,
      waveSurferLoading: false,
      loadingProgress: 0,
      file: null,
      // filePath: '',
      isPlay: false,
      rate: 0,
      totalTime: 0,
      nowTime: 0,
      volume: 0,
      speechRate: 1,
      speechRateOptions: [2, 1.5, 1.25, 1, 0.75, 0.5],
      autoplay: false,
      isFile: false,
    };
    this.shouldSTSync = false;
    this.resetAudio = this.resetAudio.bind(this);
    this.resetSoundTouch = this.resetSoundTouch.bind(this);
    this.initSoundTouch = this.initSoundTouch.bind(this);
    this.isFile = this.isFile.bind(this);
  }

  initSoundTouch() {
    if (!this.state.waveSurfer) {
      return;
    }
    const buffer = this.state.waveSurfer.backend.buffer;
    const bufferLength = buffer.length;
    const lChannel = buffer.getChannelData(0);
    const rChannel = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : lChannel;
    let seekingDiff = 0;
    const source = {
      extract: (target, numFrames, position) => {
        if (this.shouldSTSync) {
          // get the new diff
          seekingDiff =
            ~~(this.state.waveSurfer.backend.getPlayedPercents() * bufferLength) - position;
          this.shouldSTSync = false;
        }

        position += seekingDiff;

        for (let i = 0; i < numFrames; i++) {
          target[i * 2] = lChannel[i + position];
          target[i * 2 + 1] = rChannel[i + position];
        }

        return Math.min(numFrames, bufferLength - position);
      },
    };

    this.soundTouch = new SoundTouch(this.state.waveSurfer.backend.ac.sampleRate);
    this.soundTouchNode = getWebAudioNode(
      this.state.waveSurfer.backend.ac,
      new SimpleFilter(source, this.soundTouch)
    );
    this.state.waveSurfer.backend.setFilter(this.soundTouchNode);
  }

  resetAudio() {
    const me = this;
    const { waveSurfer } = me.state;
    if (waveSurfer) {
      waveSurfer.setPlaybackRate(1);
      me.setState(() => ({
        waveSurferLoading: false,
        speechRate: 1,
        isPlay: waveSurfer.isPlaying(),
        rate: waveSurfer.getCurrentTime(),
        volume: waveSurfer.getVolume(),
        mute: waveSurfer.getMute(),
        totalTime: waveSurfer.getDuration(),
        nowTime: waveSurfer.getCurrentTime(),
      }));
    }
    if (me.soundTouch) {
      me.resetSoundTouch();
    }
    if (this.props.autoplay) {
      setTimeout(async () => {
        const autoplay = await me.testAutoPlay(me.props.filePath);
        // console.log(autoplay);
        if (autoplay) {
          waveSurfer.play();
        } else {
          // message.warning('不支持自动播放')
        }
      }, 10);
    }
  }

  // static getDerivedStateFromProps(props, state) {
  //   if (props.filePath !== state.filePath) {
  //     if (state.waveSurfer !== null) {
  //       console.log('static load');
  //       state.waveSurfer.load(props.filePath);
  //     }
  //     return {
  //       filePath: props.filePath,
  //     };
  //   }
  //   return null;
  // }
  componentDidUpdate(preProps, preState) {
    if (
      !!this.props.filePath &&
      preProps.filePath !== this.props.filePath &&
      this.state.waveSurfer !== null
    ) {
      // console.log('filePathChange');
      this.isFile(this.props.filePath)
        ? this.state.waveSurfer.loadBlob(this.props.filePath)
        : this.state.waveSurfer.load(this.props.filePath);
      // this.setState(() => ({ filePath: this.props.filePath }));
    }
  }

  componentDidMount() {
    const me = this;

    const waveSurfer = WaveSurfer.create({
      container: document.getElementById('waveform'),
      // scrollParent: true,
      splitChannels: true,
      // barWidth: 1,
      // barRadius: 2,
      cursorWidth: 2,
      barHeight: 2,
      barMinHeight: 1,
      // barGap: 2,
      backgroundColor: '#000',
      height: 30,
      responsive: true,
      // backend: 'MediaElement',
      // mediaControls: true,
      cursorColor: '#a15748',
      splitChannelsOptions: {
        overlay: false,
        channelColors: {
          0: {
            progressColor: 'rgba(109, 137, 49, 1)',
            waveColor: 'rgba(109, 137, 49, .5)',
          },
          1: {
            progressColor: 'rgba(74, 136, 220, 1)',
            waveColor: 'rgba(74, 136, 220, .5)',
          },
        },
      },
      plugins: [
        // TimelinePlugin.create({
        //   container: '#waveform',
        // }),
        CursorPlugin.create({
          showTime: true, // 是否显示时间
          opacity: 1, // 光标及时间整个组件的透明度
          color: 'rgba(161, 131, 72, .5)',
          customShowTimeStyle: {
            // 时间展示的设置
            backgroundColor: '#000', // 时间展示块的背景色
            color: '#fff', // 时间展示文字的颜色
            padding: '2px', // 时间展示块的padding
            fontSize: '10px', // 时间展示文字的font-size
          },
          primaryColor: 'red',
        }),
      ],
    });

    /** 事件注册 */
    // 播放
    waveSurfer.on('play', () => {
      console.log('play');
      if (me.props.onPlay) {
        me.props.onPlay();
      }
      const speed = me.state.waveSurfer.getPlaybackRate();
      if (speed !== 1) {
        me.updateSpeed(speed);
      } else {
        me.resetSoundTouch();
      }
      me.setState(() => ({ isPlay: me.state.waveSurfer.isPlaying() }));
    });
    // 暂停
    waveSurfer.on('pause', () => {
      console.log('pause');
      if (me.props.onPause) {
        me.props.onPause();
      }
      me.resetSoundTouch();
      setTimeout(() => {
        me.setState(() => ({ isPlay: me.state.waveSurfer.isPlaying() }));
      }, 10);
    });
    // 播放完成
    waveSurfer.on('finish', () => {
      console.log('finish');
      if (me.props.onFinish) {
        me.props.onFinish();
      }
      me.resetSoundTouch();
      me.setState(() => ({ rate: 1 }));
    });
    // 进度(波形)
    waveSurfer.on('seek', e => {
      // console.log('seek', e);
      if (me.props.onSeek) {
        me.props.onSeek(e);
      }
      this.shouldSTSync = true;
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
    waveSurfer.on('ready', e => {
      console.log('ready', e);
      // me.setState(() => ({ waveSurferLoading: false }));
      me.resetAudio();
    });
    // 音频加载状态
    waveSurfer.on('loading', e => {
      // console.log('loading', e);
      if (!me.state.isFile) {
        me.setState(() => ({ loadingProgress: e }));
      }
    });
    // 错误监听
    waveSurfer.on('error', e => {
      console.log('error', e);
      if (e === 'Error decoding audiobuffer') {
        console.log('录音解码错误');
        message.error('录音解码错误');
      }
    });

    if (this.props.onWaveSurferRef) {
      this.props.onWaveSurferRef(waveSurfer);
    }

    const obj = {
      waveSurfer,
      waveSurferLoading: false,
      filePath: this.props.filePath,
    };
    // console.log('speechRate', obj.speechRate);
    // console.log(this.props.filePath);
    if (this.props.filePath) {
      this.isFile(this.props.filePath)
        ? waveSurfer.loadBlob(this.props.filePath)
        : waveSurfer.load(this.props.filePath);
      obj.waveSurferLoading = true;
    }
    // waveSurfer.load('/700001.wav');
    this.setState(() => obj);
  }
  componentWillUnmount() {
    /** 销毁 */
    if (this.state.waveSurfer) {
      // this.state.waveSurfer.unAll();
      this.state.waveSurfer.destroy();
    }
    this.resetSoundTouch();
  }
  updateSpeed(speed) {
    if (speed !== 1 && !this.soundTouch) {
      this.initSoundTouch();
    }
    if (this.soundTouch) {
      this.soundTouch.tempo = speed;
    }
    this.shouldSTSync = true;
  }
  resetSoundTouch() {
    if (this.soundTouch) {
      this.soundTouch.clear();
      this.soundTouch.tempo = 1;
    }
    if (this.soundTouchNode) {
      this.soundTouchNode.disconnect();
    }
    this.soundTouch = null;
    this.soundTouchNode = null;
    this.shouldSTSync = false;
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
  isFile(file) {
    this.setState(() => ({ isFile: file instanceof File }));
    console.log('loadFile');
    return file instanceof File;
  }

  render() {
    const me = this;
    const {
      isPlay,
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
    const { filePath, isDownload } = this.props;
    const progressBarProps = {
      isDownload,
      filePath,
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
        const nowTime = me.state.waveSurfer.getCurrentTime();
        const totalTime = me.state.waveSurfer.getDuration();
        me.setState(() => ({
          rate: nowTime / totalTime,
          nowTime,
          totalTime,
        }));
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
          <div id="waveform" />
          <ProgressBar {...progressBarProps} />
        </Spin>
      </div>
    );
  }
}

export default WaveSufer;
