import React, { Component, createRef } from 'react';
import cx from 'classnames';
import './progressbar.less';
// import { Dropdown, Icon, Menu } from 'antd';
import Dropdown from 'antd/es/dropdown';
import 'antd/es/dropdown/style/css';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style/css';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style/css';
import { isNaN } from 'lodash';

export class ProgressBar extends Component {
  constructor(props) {
    super(props);

    // 获取开始按钮
    this.playbtn = createRef();
    // 获取初始事件
    this.playCur = createRef();
    // 进度条
    this.slide = createRef();
    // 圆点
    this.slideBtn = createRef();

    this.proWrap = createRef();

    this.volumeWrap = createRef();

    this.volumeSlide = createRef();

    this.volumeSlideBtn = createRef();

    this.state = {
      filePath: '',
      volumeVisible: false,
      volume: 0,
      // tag: true, // 播放状态
      // totalTime: 0, // 总时长
      // nowTime: 0, // 当前时间
      // rate: 0, // 百分比进度
      rateVal: 0,
      soundStatus: true, // 音频启用状态
    };

    this.changeRate = this.changeRate.bind(this);
    this.padTime = this.padTime.bind(this);
    this.progressBarOnResize = this.progressBarOnResize.bind(this);
    this.speechRateChange = this.speechRateChange.bind(this);
    this.changeVolumeRate = this.changeVolumeRate.bind(this);
    this.volumeVisibleChange = this.volumeVisibleChange.bind(this);
    this.handleVolumeVisibleChange = this.handleVolumeVisibleChange.bind(this);
    this.changeMute = this.changeMute.bind(this);
    this.moreMenuChange = this.moreMenuChange.bind(this);
  }
  // 前导0
  toTwo(value) {
    return value < 10 ? '0' + value : value;
  }
  padTime(value) {
    // console.log(value);
    // 转换小时、分钟、秒
    let hours = this.toTwo(parseInt(value / 3600));
    let mis = this.toTwo(parseInt((value % 3600) / 60));
    let sec = this.toTwo(parseInt(value % 60));
    // 00:00:00
    let str = hours + ':' + mis + ':' + sec;

    return str;
  }
  static getDerivedStateFromProps(props, state) {
    if (
      (!isNaN(Number(props.volume)) &&
        !isNaN(Number(state.volume)) &&
        props.volume !== state.volume) ||
      props.filePath !== state.filePath
    ) {
      // const progressBar = new ProgressBar(props);
      // console.log(props.rate);
      // progressBar.changeRate(props.rate);
      const obj = {
        volume: props.volume,
        filePath: props.filePath,
      };
      Object.assign(state, obj);
      return state;
    }
    return null;
  }
  // componentDidUpdate(preProps, preState) {
  //   if (preProps.volume !== this.props.volume) {
  //     console.log(this.props.volume);
  //   }
  // }
  changeRate(val) {
    if (this.proWrap.current) {
      let detal = this.proWrap.current.clientWidth * val;
      return detal;
    }
    return 0;
  }
  progressBarOnResize() {
    if (this.proWrap.current && !this.props.isPlay) {
      let detal = this.proWrap.current.clientWidth * this.props.rate;
      this.slideBtn.current.style.left = detal + 'px';
      this.slide.current.style.width = detal + 2 + 'px';
      this.props.seek(detal / this.proWrap.current.clientWidth);
    }
    // if (this.volumeWrap.current && !this.props.isPlay) {
    //   let detal = this.volumeWrap.current.clientHeight * this.props.volume;
    //   this.slideBtn.current.style.bottom = detal + 'px';
    //   this.slide.current.style.height = detal + 2 + 'px';
    //   this.props.volumeChange(detal / this.volumeWrap.current.clientHeight);
    // }
  }
  changeVolumeRate(val, mute) {
    if (this.volumeWrap.current && !mute) {
      let detal = this.volumeWrap.current.clientHeight * val;
      // console.log('detal', detal);
      return detal;
    }
    return 0;
  }
  volumeVisibleChange(v) {
    // console.log('volumeWrap', this.volumeWrap);
    if (this.volumeWrap) {
      // 点击音量进度条
      this.volumeWrap.current.onclick = ev => {
        ev = window.event || ev;
        const progressleft = this.volumeWrap.current.getBoundingClientRect();
        let detal = ev.clientY - parseFloat(progressleft.bottom);
        // console.log(videoleft.offsetLeft);
        this.slideBtn.current.style.bottom = detal + 'px';
        this.slide.current.style.height = detal + 2 + 'px';
        this.props.volumeChange(detal / this.volumeWrap.current.clientWidth);
      };
    }
  }
  handleVolumeVisibleChange(val) {
    this.setState(() => ({ volumeVisible: val }));
  }
  componentDidMount() {
    // 监听浏览器窗口变化
    window.addEventListener('resize', this.progressBarOnResize);
    // 播放按钮点击
    this.playbtn.current.onclick = () => {
      if (!this.props.isPlay) {
        this.playbtn.current.className = 'begin stop';
        // this.setState(() => ({ tag: false }));
        this.props.play();
      } else {
        this.playbtn.current.className = 'begin';
        // this.setState(() => ({ tag: true }));
        this.props.pause();
      }
    };
    // 播放进度条的事件
    this.slideBtn.current.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
    };
    // 拖拽slidebtn
    this.slideBtn.current.onmousedown = event => {
      event = event || window.event;
      let deltaX = event.clientX - this.slideBtn.current.offsetLeft;
      document.onmousemove = event => {
        event = event || window.event;
        let nowleft = event.clientX - deltaX;
        if (nowleft < 0) nowleft = 0;
        if (nowleft > this.proWrap.current.clientWidth) nowleft = this.proWrap.current.clientWidth;
        // 滑块
        this.slideBtn.current.style.left = nowleft + 'px';
        this.slide.current.style.width = nowleft + 2 + 'px';
        this.props.seek(nowleft / this.proWrap.current.clientWidth);

        // 取消默认事件，不选中文字
        return false;
      };

      document.onmouseup = () => {
        document.onmousemove = null;
      };
    };

    // 点击进度条
    this.proWrap.current.onclick = ev => {
      ev = window.event || ev;
      const progressleft = this.proWrap.current.getBoundingClientRect();
      let detal = ev.clientX - parseFloat(progressleft.left);
      // console.log(videoleft.offsetLeft);
      this.slideBtn.current.style.left = detal + 'px';
      this.slide.current.style.width = detal + 2 + 'px';
      this.props.seek(detal / this.proWrap.current.clientWidth);
    };

    // 点击音量进度条
    this.volumeWrap.current.onclick = ev => {
      ev = window.event || ev;
      const progressClientRect = this.volumeWrap.current.getBoundingClientRect();
      let detal = progressClientRect.height - (ev.clientY - parseFloat(progressClientRect.top));
      // this.volumeSlide.current.style.height = detal + 'px';
      this.setState(() => ({ volume: detal }));
      this.props.volumeChange(detal / progressClientRect.height);
    };
    // 音量进度条的事件
    this.volumeSlideBtn.current.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
    };
    // 拖拽volumeSlideBtn
    this.volumeSlideBtn.current.onmousedown = event => {
      event = event || window.event;
      const progressClientRect = this.volumeWrap.current.getBoundingClientRect();
      let deltaY = event.clientY - this.volumeSlideBtn.current.offsetTop - 16;
      document.onmousemove = event => {
        event = event || window.event;
        let nowBotom = progressClientRect.height - (event.clientY - deltaY);
        // console.log('onmousedown', event);
        // console.log('onmousemove', event);
        // console.log('progressClientRect', progressClientRect);
        // console.log('clientHeight', this.volumeSlideBtn.current.clientHeight);
        // console.log('onmousemove nowBotom', nowBotom);
        if (nowBotom < 0) nowBotom = 0;
        if (nowBotom > progressClientRect.height) nowBotom = progressClientRect.height;
        // 滑块
        // this.volumeSlideBtn.current.style.bottom = nowBotom + 'px';
        // this.volumeSlide.current.style.height = nowBotom + 'px';
        this.setState(() => ({ volume: nowBotom }));
        this.props.volumeChange(nowBotom / progressClientRect.height);

        // 取消默认事件，不选中文字
        return false;
      };

      document.onmouseup = () => {
        document.onmousemove = null;
      };
    };
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.progressBarOnResize);
  }
  speechRateChange(event) {
    event.domEvent.stopPropagation();
    this.props.speechRateChange(event);
  }
  changeMute(flag) {
    this.props.changeMute(flag);
  }
  moreMenuChange(menuEvent) {
    const { key } = menuEvent;
    switch (key) {
      case 'download':
        if (this.props.filePath) {
          const el = document.createElement('a');
          el.href = this.props.filePath;
          el.hidden = true;
          document.body.appendChild(el);
          el.click();
          document.body.removeChild(el);
        }
        break;
      default:
        break;
    }
  }
  render() {
    const { isPlay, rate, mute, totalTime, nowTime, speechRate, speechRateOptions } = this.props;
    const { volume } = this.state;
    const soundVolumeClassNames = cx('sound-volume', {
      'sound-volume-disabled': mute,
    });
    const speechRateContent = () => {
      return (
        <Menu onClick={this.speechRateChange}>
          {speechRateOptions.map(e => (
            <Menu.Item key={e}>{e}x</Menu.Item>
          ))}
        </Menu>
      );
    };
    const moreMenuContent = () => {
      return (
        <Menu onClick={this.moreMenuChange}>
          <Menu.Item key="download">
            下载
            <Icon type="download" />
          </Menu.Item>
        </Menu>
      );
    };
    return (
      <div className="progress_bar_container">
        <div className="video-play">
          <div className="video-left">
            <div className="control-wrap">
              <div title="播放/暂停" ref={this.playbtn} className="begin">
                {isPlay ? (
                  <Icon type="pause-circle" theme="filled" style={{ display: 'inline-block' }} />
                ) : (
                  <Icon type="play-circle" theme="filled" style={{ display: 'inline-block' }} />
                )}
                {/* <img src="./image/offcn_icnolh04.png" alt="" /> */}
              </div>
              <div ref={this.playCur} className="time1">
                {this.padTime(nowTime)}
              </div>
              <div ref={this.proWrap} className="progress-wrap">
                <div
                  ref={this.slideBtn}
                  style={{
                    left: this.changeRate(rate),
                  }}
                  className="circle"
                >
                  <div className="circle-center" />
                </div>
                <div className="progress-bg" />
                <div
                  ref={this.slide}
                  style={{
                    width: this.changeRate(rate) + 2,
                  }}
                  className="slide"
                />
              </div>
              <div className="time2">{this.padTime(totalTime)}</div>
              <div title="音量" className={soundVolumeClassNames}>
                {!mute ? (
                  <Icon
                    type="sound"
                    onClick={() => this.changeMute(true)}
                    className="sound-volume-icon sound"
                  />
                ) : (
                  <Icon
                    type="stop"
                    onClick={() => this.changeMute(false)}
                    className="sound-volume-icon stop"
                  />
                )}
                <div className="volume-progress-container">
                  <div ref={this.volumeWrap} className="volume-progress-wrap">
                    <div className="volume-progress-bg" />
                    <div
                      ref={this.volumeSlideBtn}
                      style={{
                        bottom: this.changeVolumeRate(volume, mute),
                      }}
                      className="volume-circle"
                    />
                    <div
                      ref={this.volumeSlide}
                      style={{
                        height: this.changeVolumeRate(volume, mute),
                      }}
                      className="volume-slide"
                    />
                  </div>
                  <span>{mute ? 0 : parseInt(volume * 100)}</span>
                </div>
              </div>
              <div title="语速" className="speech-rate">
                <Dropdown overlay={speechRateContent} trigger={['click']}>
                  <a className="speech-rate-text" onClick={e => e.preventDefault()}>
                    语速：{speechRate}x
                  </a>
                </Dropdown>
              </div>
              {this.props.isDownload ? (
                <div className="more-menu">
                  <Dropdown overlay={moreMenuContent} trigger={['click']} placement="topCenter">
                    <Icon type="menu" />
                  </Dropdown>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProgressBar;
