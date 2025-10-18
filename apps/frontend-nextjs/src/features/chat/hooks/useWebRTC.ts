import { useEffect, useRef, useState, useCallback } from 'react'
import SimplePeer from 'simple-peer'

export interface WebRTCOptions {
  video?: boolean
  audio?: boolean
}

export const useWebRTC = (
  chatId: string,
  userId: string,
  onSignal: (signal: SimplePeer.SignalData) => void,
  options: WebRTCOptions = { video: true, audio: true }
) => {
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // Initialize media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: options.video,
        audio: options.audio,
      })

      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      return stream
    } catch (err) {
      console.error('Failed to get user media:', err)
      setError('Не удалось получить доступ к камере/микрофону')
      throw err
    }
  }, [options.video, options.audio])

  // Start call as initiator
  const startCall = useCallback(async () => {
    try {
      const stream = await initializeMedia()

      const peerConnection = new SimplePeer({
        initiator: true,
        stream,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      })

      peerConnection.on('signal', (signal) => {
        console.log('Sending signal:', signal.type)
        onSignal(signal)
      })

      peerConnection.on('stream', (remoteStreamData) => {
        console.log('Received remote stream')
        setRemoteStream(remoteStreamData)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamData
        }
      })

      peerConnection.on('connect', () => {
        console.log('Peer connected')
        setIsCallActive(true)
      })

      peerConnection.on('error', (err) => {
        console.error('Peer error:', err)
        setError('Ошибка соединения')
      })

      peerConnection.on('close', () => {
        console.log('Peer connection closed')
        setIsCallActive(false)
      })

      setPeer(peerConnection)
    } catch (err) {
      console.error('Failed to start call:', err)
    }
  }, [initializeMedia, onSignal])

  // Answer call
  const answerCall = useCallback(async (signal: SimplePeer.SignalData) => {
    try {
      const stream = await initializeMedia()

      const peerConnection = new SimplePeer({
        initiator: false,
        stream,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      })

      peerConnection.on('signal', (responseSignal) => {
        console.log('Sending answer signal:', responseSignal.type)
        onSignal(responseSignal)
      })

      peerConnection.on('stream', (remoteStreamData) => {
        console.log('Received remote stream')
        setRemoteStream(remoteStreamData)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamData
        }
      })

      peerConnection.on('connect', () => {
        console.log('Peer connected')
        setIsCallActive(true)
      })

      peerConnection.on('error', (err) => {
        console.error('Peer error:', err)
        setError('Ошибка соединения')
      })

      peerConnection.on('close', () => {
        console.log('Peer connection closed')
        setIsCallActive(false)
      })

      // Signal the peer
      peerConnection.signal(signal)

      setPeer(peerConnection)
    } catch (err) {
      console.error('Failed to answer call:', err)
    }
  }, [initializeMedia, onSignal])

  // Handle incoming signal
  const handleSignal = useCallback((signal: SimplePeer.SignalData) => {
    if (peer) {
      console.log('Processing signal:', signal.type)
      peer.signal(signal)
    }
  }, [peer])

  // End call
  const endCall = useCallback(() => {
    if (peer) {
      peer.destroy()
      setPeer(null)
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop())
      setRemoteStream(null)
    }

    setIsCallActive(false)
  }, [peer, localStream, remoteStream])

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
      }
    }
    return false
  }, [localStream])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
      }
    }
    return false
  }, [localStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall()
    }
  }, [])

  return {
    peer,
    localStream,
    remoteStream,
    isCallActive,
    error,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    handleSignal,
    endCall,
    toggleVideo,
    toggleAudio,
  }
}

