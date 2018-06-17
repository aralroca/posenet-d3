import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import * as posenet from '@tensorflow-models/posenet';

const MILLISECONDS = 50;
const imageScaleFactor = 0.5;
const outputStride = 16;
const flipHorizontal = true;
const weight = 0.5;
const initialPosition = 40;

export default class PoseNet extends Component {
  state = {
    poses: {},
    loading: true,
  }

  componentDidMount =  async () =>{
    this.net = await posenet.load(weight);
    this.initCapture();
  }

  isMobile = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    return isAndroid || isiOS;
  }

  loadVideo = async (videoElement) => {
    const video = await this.setupCamera(videoElement);

    video.play();
  
    return video;
  }

  setupCamera =  async (videoElement) => {
    videoElement.width = this.props.videoSize;
    videoElement.height = this.props.videoSize;
  
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const mobile = this.isMobile();
      const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
          facingMode: 'user',
          width: mobile ? undefined : this.props.videoSize,
          height: mobile ? undefined: this.props.videoSize}
      });
      videoElement.srcObject = stream;
  
      return new Promise(resolve => {
        videoElement.onloadedmetadata = () => {
          resolve(videoElement);
        };
      });
    } else {
      return Promise.reject('No compatible');
    }
  }

  setRef = async (videoElement) => {
    this.videoElement = videoElement;
  }

  initCapture = () => {
    this.timeout = setTimeout(this.capture, MILLISECONDS);
  }

  capture = async () => {
    let nose;
    if(!this.videoElement || !this.net){
      this.initCapture();
      return;
    }

    if(!this.video && this.videoElement){
      this.video = await this.loadVideo(this.videoElement);
    }

    const poses = await this.net
      .estimateSinglePose(this.video, imageScaleFactor, flipHorizontal, outputStride)

    if(poses.keypoints) this.setState({ 
      loading: false,
      poses: poses.keypoints
              .reduce((obj, point) => ({ ...obj, 
                [point.part]: point
              }), {}) 
    });
    this.initCapture();
  }

  render() {
    if(!this.props.children) {
      return null;
    }

    return (
      <div>
        <video className="video" playsInline ref={this.setRef} />
        {this.props.children(this.state)}
      </div>
    );
  }
}

PoseNet.propTypes = {
  videoSize: PropTypes.number,
};

PoseNet.defaultProps = {
  videoSize: 300,
};
