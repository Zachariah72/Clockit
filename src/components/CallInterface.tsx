import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, RotateCcw, Minimize } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import ringingSound from '@/assets/classic-phone-ringtone-439034.mp3';

interface CallInterfaceProps {
  remoteUserId: string;
  callType: 'audio' | 'video';
  callId?: string;
  onEndCall: () => void;
  onMinimize: () => void;
  isIncoming?: boolean;
  callerName?: string;
  onAccept?: () => void;
  onReject?: () => void;
}

export const CallInterface = ({
  remoteUserId,
  callType,
  callId,
  onEndCall,
  onMinimize,
  isIncoming = false,
  callerName = 'Unknown',
  onAccept,
  onReject,
}: CallInterfaceProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const ringingAudioRef = useRef<HTMLAudioElement>(null);

  const {
    localStream,
    remoteStream,
    isConnected,
    isMuted,
    isVideoOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
  } = useWebRTC({
    remoteUserId,
    isCaller: !isIncoming,
    callType,
    callId,
  });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Start the call when component mounts (for outgoing calls)
  useEffect(() => {
    if (!isIncoming && !isConnected) {
      startCall();
    }
  }, [isIncoming, isConnected, startCall]);

  // Handle ringing sound for incoming calls
  useEffect(() => {
    if (isIncoming && ringingAudioRef.current) {
      ringingAudioRef.current.loop = true;
      ringingAudioRef.current.play().catch(console.error);
    } else if (ringingAudioRef.current) {
      ringingAudioRef.current.pause();
      ringingAudioRef.current.currentTime = 0;
    }

    return () => {
      if (ringingAudioRef.current) {
        ringingAudioRef.current.pause();
        ringingAudioRef.current.currentTime = 0;
      }
    };
  }, [isIncoming]);

  const handleAccept = () => {
    console.log('Accept button clicked');
    if (ringingAudioRef.current) {
      ringingAudioRef.current.pause();
      ringingAudioRef.current.currentTime = 0;
    }
    console.log('Calling acceptCall from useWebRTC');
    acceptCall();
    console.log('Calling onAccept callback');
    onAccept?.();
  };

  const handleReject = () => {
    console.log('Reject button clicked');
    if (ringingAudioRef.current) {
      ringingAudioRef.current.pause();
      ringingAudioRef.current.currentTime = 0;
    }
    console.log('Calling rejectCall from useWebRTC');
    rejectCall();
    console.log('Calling onReject callback');
    onReject?.();
  };

  const handleEnd = () => {
    endCall();
    onEndCall();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    onMinimize();
  };

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 bg-black bg-opacity-80 rounded-lg p-2 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <span className="text-white text-sm">In call</span>
          <Button size="sm" variant="ghost" onClick={() => setIsMinimized(false)}>
            <Minimize className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isIncoming ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">{callerName} is calling...</h2>
            <div className="flex space-x-4">
              <Button onClick={handleAccept} className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button onClick={handleReject} variant="destructive" className="flex-1">
                <PhoneOff className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Remote video */}
          <div className="flex-1 relative">
            {callType === 'video' && remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <div className="text-white text-2xl">{callerName}</div>
              </div>
            )}

            {/* Local video (picture-in-picture) */}
            {callType === 'video' && localStream && (
              <div className="absolute top-4 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-gray-900 p-4 flex items-center justify-center space-x-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            {callType === 'video' && (
              <>
                <Button
                  variant={isVideoOff ? "destructive" : "secondary"}
                  size="lg"
                  onClick={toggleVideo}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </Button>

                <Button variant="secondary" size="lg" onClick={switchCamera}>
                  <RotateCcw className="w-6 h-6" />
                </Button>
              </>
            )}

            <Button variant="secondary" size="lg" onClick={handleMinimize}>
              <Minimize className="w-6 h-6" />
            </Button>

            <Button variant="destructive" size="lg" onClick={handleEnd}>
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Hidden audio element for ringing sound */}
      <audio ref={ringingAudioRef} src={ringingSound} preload="auto" />
    </>
  );
};