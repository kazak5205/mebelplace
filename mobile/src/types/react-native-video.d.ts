declare module 'react-native-video' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface VideoProperties extends ViewProps {
    source: { uri: string } | number;
    paused?: boolean;
    muted?: boolean;
    volume?: number;
    rate?: number;
    seek?: number;
    repeat?: boolean;
    resizeMode?: 'none' | 'contain' | 'cover' | 'stretch';
    onLoad?: (data: any) => void;
    onProgress?: (data: any) => void;
    onBuffer?: (data: any) => void;
    onError?: (error: any) => void;
    onEnd?: () => void;
    style?: any;
  }

  export default class Video extends Component<VideoProperties> {}
}

