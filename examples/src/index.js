import React, { Component } from 'react';
import { render } from 'react-dom';
import { Icon, Input, Upload } from 'antd';
import 'antd/dist/antd.css';
import MyComponent from '../../src';

const { Dragger } = Upload;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      filePath: '',
      waveSurfer: null,
    };
    this.beforeUpload = this.beforeUpload.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  beforeUpload(file) {
    console.log(file);
    console.log(window.URL.createObjectURL(file));
    this.setState({
      file,
      filePath: window.URL.createObjectURL(file),
    });
    return false;
  }

  handleSearch(value) {
    console.log(value);
    this.setState({
      file: value,
      filePath: value,
    });
  }

  render() {
    const myComponentProps = {
      file: this.state.file,
      isDownload: true,
      autoplay: true,
      onWaveSurferRef: ref => {
        this.setState({
          waveSurfer: ref,
        });
      },
    };
    return (
      <div>
        <div style={{ height: '150px' }}>
          <Dragger
            beforeUpload={this.beforeUpload}
            showUploadList={false}
            style={{ height: '200px' }}
          >
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          </Dragger>
        </div>
        <Input.Search placeholder="请输入远程音频地址" enterButton={<Icon type="enter" />} onSearch={this.handleSearch} />
        <MyComponent {...myComponentProps} />
        {/* <div>
          <audio controls>
            <source src='http://101.132.177.250:7777/周深 - 人是_.flac' />
          </audio>
        </div> */}
      </div>
    );
  }
}
render(<App />, document.getElementById('root'));
