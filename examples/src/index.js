import React, { Component } from 'react';
import { render } from 'react-dom';
import { Icon, Upload } from 'antd';
import 'antd/dist/antd.css';
import MyComponent from '../../src';

const { Dragger } = Upload;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      filePath: '',
      fileType: '',
      waveSurfer: null,
    };
    this.beforeUpload = this.beforeUpload.bind(this);
  }

  beforeUpload(file) {
    console.log(file);
    console.log(window.URL.createObjectURL(file));
    this.setState({
      file,
      filePath: window.URL.createObjectURL(file),
      fileType: file.type,
    });
    return false;
  }

  render() {
    const myComponentProps = {
      file: this.state.file,
      isDownload: true,
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
        <MyComponent {...myComponentProps} />
        <div>
          <audio controls>
            {this.state.filePath && this.state.fileType ? (
              <source src={this.state.filePath} type={this.state.fileType} />
            ) : null}
          </audio>
        </div>
      </div>
    );
  }
}
render(<App />, document.getElementById('root'));
