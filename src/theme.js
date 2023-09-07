export default {
  default: {
    config: {
      splitChannels: true,
      cursorWidth: 2,
      // barHeight: 2,
      // barMinHeight: 1,
      backgroundColor: '#000',
      height: 30,
      responsive: true,
      cursorColor: '#a15748',
      backend: 'MediaElement',
      // mediaControls: true,
      // mediaType: 'video',
      // backend: 'WebAudio',
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
      xhr: {
        // mode: 'no-cors', // no-cors, cors, *same-origin
        // responseType: 'file',
      },
    },
    plugins: {
      cursor: {
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
      },
    },
  },
};
