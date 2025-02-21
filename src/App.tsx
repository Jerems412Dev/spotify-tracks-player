import { CirclePlus, LayoutList, Maximize2, MicVocal, MonitorSpeaker, Shuffle, Volume2, VolumeX } from 'lucide-react';
import './App.css';
import { useRef, useState } from 'react';
import Track from './Track';

function App() {
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [like, setLike] = useState(false);
  const [mic, setMic] = useState(false);
  const [device, setDevice] = useState(false);
  const [queue, setQueue] = useState(false);
  const [mute, setMute] = useState(false);
  const [miniPlayer, setMiniPlayer] = useState(false);
  const [maximize, setMaximize] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [prevTrack, setPrevTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const isDragging = useRef(false);
  const prevVolume = useRef(0);

  const rangeAudioRef = useRef<HTMLDivElement>(null);
  const rangeDivAudioRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const rangeVolumeRef = useRef<HTMLDivElement>(null);
  const rangeDivVolumeRef = useRef<HTMLDivElement>(null);

  const [tracks, setTracks] = useState<Track[]>([
    {
      title: "Didn't cha know",
      srcTrack: "./music/Didntchaknow.mp3",
      srcImg: "./img/Didntchaknow.jpeg",
      artist: "Erikah Badu",
      isLiked: false
    },
    {
      title: "RONDA",
      srcTrack: "./music/RONDA.mp3",
      srcImg: "./img/RONDA.jpg",
      artist: "FEEL",
      isLiked: false
    },
    {
      title: "Pink + White",
      srcTrack: "./music/Pink_+_White.mp3",
      srcImg: "./img/Pink_+_White.jpg",
      artist: "Frank Ocean",
      isLiked: false
    },
    {
      title: "Levitating",
      srcTrack: "./music/Levitating.mp3",
      srcImg: "./img/Levitating.jpg",
      artist: "Dua Lipa",
      isLiked: false
    },
    {
      title: "Is It a Crime",
      srcTrack: "./music/is_it_a_crime.mp3",
      srcImg: "./img/is_it_a_crime.jpeg",
      artist: "Sade",
      isLiked: false
    }
  ]);

  const [totalTime, setTotalTime] = useState(formatTotalTime(238));

  const handleRepeat = () => {
    if(repeat === 1) {
      setRepeat(2);
    } else if(repeat === 2) {
      setRepeat(3);
      (audioRef.current) ? audioRef.current.loop = true : null;
    } else {
      setRepeat(1);
      (audioRef.current) ? audioRef.current.loop = false : null;
    }
  };

  const handleShuffle = () => {
    if(shuffle) {
      setShuffle(false);
    } else {
      setShuffle(true);
      setPrevTrack(currentTrack);
    }
  };

  const handlePlayAudio = () => {
    if(playing === true) {
      audioRef.current?.pause();
      setPlaying(false);
    }else {
      audioRef.current?.play();
      setPlaying(true);
      seekUpdate();
    }
  };
  
  const handleNextTrack = () => {
    var val;
    if(shuffle && repeat === 1) {
      setPrevTrack(currentTrack);
      val = Math.floor(Math.random() * tracks.length-1);
      while(val === prevTrack) {
        val = Math.floor(Math.random() * tracks.length-1);
      }
    } else {
      setPrevTrack(currentTrack);
      val = currentTrack >= tracks.length-1 ? 0 : currentTrack + 1;
    }
    setCurrentTrack(val);
    audioRef.current?.load();
    setPlaying(true);
    audioRef.current?.addEventListener('canplay', () => {
      audioRef.current?.play().catch(error => console.error(error));
      setTotalTime(formatTotalTime(audioRef.current?.duration));
      seekUpdate();
    });
    setLike(tracks[val].isLiked);
  };

  const handlePreviousTrack = () => {
    if(audioRef.current && audioRef.current?.currentTime <= tracks.length-1) {
      var val;
      if(shuffle && repeat === 1) {
        val = prevTrack;
      } else {
        val = currentTrack <= 0 ? tracks.length-1 : currentTrack - 1;
      }
      setCurrentTrack(val);
      audioRef.current?.load();
      setPlaying(true);
      audioRef.current?.addEventListener('canplay', () => {
        audioRef.current?.play().catch(error => console.error(error));
      });
      setLike(tracks[val].isLiked);
    } else if(audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleLike = () => {
    if(like) {
      setLike(false);
    } else {
      setLike(true);
    }
    setTracks(prevTracks =>
      prevTracks.map((track, i) =>
        i === currentTrack ? { ...track, isLiked: !track.isLiked } : track
      )
    );
  };

  const isEnded = () => {
    if(audioRef.current && audioRef.current.ended && shuffle === true && repeat === 1) {
      setPrevTrack(currentTrack);
      var val = Math.floor(Math.random() * tracks.length-1);
      while(val === prevTrack) {
        val = Math.floor(Math.random() * tracks.length-1);
      }
      setCurrentTrack(val);
      audioRef.current?.load();
      setPlaying(true);
      audioRef.current?.addEventListener('canplay', () => {
        audioRef.current?.play().catch(error => console.error(error));
        setTotalTime(formatTotalTime(audioRef.current?.duration));
        seekUpdate();
      });
      setLike(tracks[val].isLiked);
    } else if(audioRef.current && audioRef.current.ended && repeat === 2) {
      handleNextTrack();
    }  else if(audioRef.current && audioRef.current.ended && repeat === 1 && shuffle === false) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  };

  //Audio range
  const handleRangeAudioRef = (e: React.MouseEvent<HTMLDivElement>) => {
    if(rangeAudioRef.current && rangeDivAudioRef.current && audioRef.current) {
      const rect = rangeAudioRef.current?.getBoundingClientRect();
      let offsetX = e.clientX - rect.left;
      let rectWidth = rect.width; 
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rectWidth) offsetX = rectWidth;
      rangeDivAudioRef.current.style.width = `${offsetX}px`;
      audioRef.current.currentTime = (offsetX / rectWidth) * audioRef.current.duration;
    } 
  };

  const mouseAudioMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    if(rangeAudioRef.current && rangeDivAudioRef.current && audioRef.current) {
      const rect = rangeAudioRef.current.getBoundingClientRect();
      let offsetX = e.clientX - rect.left;
      let rectWidth = rect.width;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rectWidth) offsetX = rectWidth;
      rangeDivAudioRef.current.style.width = `${offsetX}px`;
      audioRef.current.currentTime = (offsetX / rectWidth) * audioRef.current.duration;
    } 
  };

  const mouseAudioUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', mouseAudioMove);
    document.removeEventListener('mouseup', mouseAudioUp);
  };

  const mouseAudioDown = () => {
    isDragging.current = true;
    document.addEventListener('mousemove', mouseAudioMove);
    document.addEventListener('mouseup', mouseAudioUp);
  };

  //Volume Range
  const handleRangeVolumeRef = (e: React.MouseEvent<HTMLDivElement>) => {
    if(rangeVolumeRef.current && rangeDivVolumeRef.current && audioRef.current) {
      const rect = rangeVolumeRef.current?.getBoundingClientRect();
      let offsetX = e.clientX - rect.left;
      let rectWidth = rect.width; 
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rectWidth) offsetX = rectWidth;
      rangeDivVolumeRef.current.style.width = `${offsetX}px`;
      audioRef.current.volume = offsetX/100;
      setMute(false);
    } 
  };

  const mouseVolumeMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    if(rangeVolumeRef.current && rangeDivVolumeRef.current && audioRef.current) {
      const rect = rangeVolumeRef.current.getBoundingClientRect();
      let offsetX = e.clientX - rect.left;
      let rectWidth = rect.width;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rectWidth) offsetX = rectWidth;
      rangeDivVolumeRef.current.style.width = `${offsetX}px`;
      audioRef.current.volume = offsetX / 100;
    } 
  };

  const mouseVolumeUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', mouseVolumeMove);
    document.removeEventListener('mouseup', mouseVolumeUp);
  };

  const mouseVolumeDown = () => {
    isDragging.current = true;
    setMute(false);
    document.addEventListener('mousemove', mouseVolumeMove);
    document.addEventListener('mouseup', mouseVolumeUp);
  };

  const handleMute = () => {
    if(mute) {
      setMute(false);
      if(audioRef.current && rangeDivVolumeRef.current) {
        audioRef.current.volume = prevVolume.current.valueOf();
        rangeDivVolumeRef.current.style.width = (prevVolume.current.valueOf() * 100) + "px";
      }
    } else {
      setMute(true);
      if(audioRef.current && rangeDivVolumeRef.current) {
        prevVolume.current = audioRef.current.volume;
        audioRef.current.volume = 0;
        rangeDivVolumeRef.current.style.width = "0px";
      }
    }
  }

  function seekUpdate() {
    let intervalId = setInterval(() => {
      if (audioRef.current && rangeAudioRef.current && rangeDivAudioRef.current && !audioRef.current.paused) {
        setCurrentTime(formatTime(audioRef.current.currentTime));
        let val = (
          (audioRef.current.currentTime / audioRef.current.duration) *
          rangeAudioRef.current.getBoundingClientRect().width
        ).toString();
        rangeDivAudioRef.current.style.width = `${val}px`;
      }
    }, 1000);
  };

  return (
    <>
      <div 
        className="w-full h-screen flex flex-col items-center justify-end bg-[#121212]"
      >
        <div 
          className="flex flex-row items-center justify-between w-full h-[15vh] bg-black px-4 py-4" 
        >
          <div className="w-[30%] flex flex-row items-center justify-start gap-x-4">
            <img 
              src={tracks[currentTrack].srcImg} 
              alt="logo" 
              className="w-14 h-14 rounded-xs" 
            />
            <ul
              className="p-0 m-0  list-none"
            >
              <li className="whitespace-nowrap font-[400] text-white text-sm hover:underline underline-offset-1 cursor-pointer">{tracks[currentTrack].title}</li>
              <li className="whitespace-nowrap font-[400] text-[#bcbcbc] text-xs hover:underline hover:text-white underline-offset-1 cursor-pointer">{tracks[currentTrack].artist}</li>
            </ul>
            <button
              onClick={handleLike}
              className="flex flex-row items-center justify-center bg-transparent rounded-full outline-none cursor-pointer"
            >
              {like ? 
                <svg className="text-green-500 w-[1.2rem] hover:scale-[1.05]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM17.4571 9.45711L11 15.9142L6.79289 11.7071L8.20711 10.2929L11 13.0858L16.0429 8.04289L17.4571 9.45711Z"></path></svg>
                :
                <CirclePlus className="text-[#bcbcbc] w-[1.1rem] hover:text-white" />
              }
            </button>
          </div>
          <div className="flex flex-col w-[40%] gap-y-2">
            <div className="flex flex-row items-center justify-center gap-x-4">
              <button 
                onClick={handleShuffle}
                className="flex flex-col items-center justify-center gap-y-0 text-[#bcbcbc] hover:text-white outline-none cursor-pointer">
                <Shuffle className={shuffle ? "w-[1.2rem] text-green-500" : "w-[1.2rem] text-[#bcbcbc] hover:text-white"} />
                {shuffle && <span className="text-green-500 mt-7 text-[0.6rem] absolute">•</span>}
              </button>
              <button 
                onClick={handlePreviousTrack}
                className="flex flex-col items-center justify-center gap-y-0 text-[#bcbcbc] hover:text-white hover:opacity-90 hover:scale-[1.05] outline-none cursor-pointer">
                <svg className="w-[1.5rem]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 11.3333L18.2227 4.51823C18.4524 4.36506 18.7628 4.42714 18.916 4.65691C18.9708 4.73904 19 4.83555 19 4.93426V19.0657C19 19.3419 18.7761 19.5657 18.5 19.5657C18.4013 19.5657 18.3048 19.5365 18.2227 19.4818L8 12.6667V19C8 19.5523 7.55228 20 7 20C6.44772 20 6 19.5523 6 19V5C6 4.44772 6.44772 4 7 4C7.55228 4 8 4.44772 8 5V11.3333Z"></path></svg>
              </button>
              <button 
                onClick={handlePlayAudio}
                className="flex flex-col items-center justify-center text-black hover:opacity-90 hover:scale-[1.05] rounded-full bg-white p-[0.2rem] outline-none cursor-pointer">
                {!playing ? <svg className="w-[1.7rem]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.376 12.4161L8.77735 19.4818C8.54759 19.635 8.23715 19.5729 8.08397 19.3432C8.02922 19.261 8 19.1645 8 19.0658V4.93433C8 4.65818 8.22386 4.43433 8.5 4.43433C8.59871 4.43433 8.69522 4.46355 8.77735 4.5183L19.376 11.584C19.6057 11.7372 19.6678 12.0477 19.5146 12.2774C19.478 12.3323 19.4309 12.3795 19.376 12.4161Z"></path></svg>
                 : <svg className="w-[1.7rem]" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"><path fill="currentColor" d="M14 19V5h4v14zm-8 0V5h4v14z"/></svg>
                }
              </button>
              <button 
                onClick={handleNextTrack}
                className="flex flex-col items-center justify-center gap-y-0 text-[#bcbcbc] hover:text-white hover:opacity-90 hover:scale-[1.05] outline-none cursor-pointer">
                <svg className="w-[1.5rem]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12.6667L5.77735 19.4818C5.54759 19.6349 5.23715 19.5729 5.08397 19.3431C5.02922 19.261 5 19.1645 5 19.0657V4.93426C5 4.65812 5.22386 4.43426 5.5 4.43426C5.59871 4.43426 5.69522 4.46348 5.77735 4.51823L16 11.3333V5C16 4.44772 16.4477 4 17 4C17.5523 4 18 4.44772 18 5V19C18 19.5523 17.5523 20 17 20C16.4477 20 16 19.5523 16 19V12.6667Z"></path></svg>
              </button>
              <button 
                onClick={handleRepeat}
                className="flex flex-col items-center justify-center gap-y-0 outline-none cursor-pointer">
                {repeat == 1 ? 
                  <svg className="w-[1.2rem] text-[#bcbcbc]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 20V21.9324C8 22.2086 7.77614 22.4324 7.5 22.4324C7.38303 22.4324 7.26977 22.3914 7.17991 22.3165L3.06093 18.8841C2.84879 18.7073 2.82013 18.392 2.99691 18.1799C3.09191 18.0659 3.23264 18 3.38103 18L18 18C19.1046 18 20 17.1045 20 16V7.99997H22V16C22 18.2091 20.2091 20 18 20H8ZM16 3.99997V2.0675C16 1.79136 16.2239 1.5675 16.5 1.5675C16.617 1.5675 16.7302 1.60851 16.8201 1.68339L20.9391 5.11587C21.1512 5.29266 21.1799 5.60794 21.0031 5.82008C20.9081 5.93407 20.7674 5.99998 20.619 5.99998L6 5.99997C4.89543 5.99997 4 6.8954 4 7.99997V16H2V7.99997C2 5.79083 3.79086 3.99997 6 3.99997H16Z"></path></svg>
                  : repeat == 2 ?
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-[1.2rem] text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 20V21.9324C8 22.2086 7.77614 22.4324 7.5 22.4324C7.38303 22.4324 7.26977 22.3914 7.17991 22.3165L3.06093 18.8841C2.84879 18.7073 2.82013 18.392 2.99691 18.1799C3.09191 18.0659 3.23264 18 3.38103 18L18 18C19.1046 18 20 17.1045 20 16V7.99997H22V16C22 18.2091 20.2091 20 18 20H8ZM16 3.99997V2.0675C16 1.79136 16.2239 1.5675 16.5 1.5675C16.617 1.5675 16.7302 1.60851 16.8201 1.68339L20.9391 5.11587C21.1512 5.29266 21.1799 5.60794 21.0031 5.82008C20.9081 5.93407 20.7674 5.99998 20.619 5.99998L6 5.99997C4.89543 5.99997 4 6.8954 4 7.99997V16H2V7.99997C2 5.79083 3.79086 3.99997 6 3.99997H16Z"></path></svg>
                    <span className="text-green-500 mt-7 text-[0.6rem] absolute">•</span>
                  </div>
                  : 
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-[1.2rem] text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 20V21.9325C8 22.2086 7.77614 22.4325 7.5 22.4325C7.38303 22.4325 7.26977 22.3915 7.17991 22.3166L3.06093 18.8841C2.84879 18.7073 2.82013 18.392 2.99691 18.1799C3.09191 18.0659 3.23264 18 3.38103 18L18 18C19.1046 18 20 17.1046 20 16V8H22V16C22 18.2091 20.2091 20 18 20H8ZM16 2.0675C16 1.79136 16.2239 1.5675 16.5 1.5675C16.617 1.5675 16.7302 1.60851 16.8201 1.68339L20.9391 5.11587C21.1512 5.29266 21.1799 5.60794 21.0031 5.82008C20.9081 5.93407 20.7674 5.99998 20.619 5.99998L6 6C4.89543 6 4 6.89543 4 8V16H2V8C2 5.79086 3.79086 4 6 4H16V2.0675ZM11 8H13V16H11V10H9V9L11 8Z"></path></svg>
                    <span className="text-green-500 mt-7 text-[0.6rem] absolute">•</span>
                  </div>
                }
              </button>
            </div>
            <div className="w-full flex flex-row items-center justify-center gap-x-2">
                <audio 
                  ref={audioRef} 
                  src={tracks[currentTrack].srcTrack} 
                  onEnded={isEnded}
                >
                </audio>
                <span className="w-[5%] text-xs text-[#bcbcbc] font-[CircularStd]">{currentTime}</span>
                <div 
                  ref={rangeAudioRef}
                  onClick={handleRangeAudioRef}
                  className="w-[80%] h-1 flex flex-row bg-[#4d4d4d] rounded-xl cursor-pointer range-hover"
                >
                  <div 
                    ref={rangeDivAudioRef}
                    className="relative h-full flex flex-row items-center bg-white rounded-xl justify-end transition-discrete"
                  >
                    <button 
                      className="hidden absolute w-[0.8rem] h-[0.8rem] bg-white rounded-full outline-none cursor-pointer box-border"
                      onMouseDown={mouseAudioDown}
                    ></button>
                  </div>
                </div>
                <span className="w-[5%] text-xs text-[#bcbcbc] font-[CircularStd]">{totalTime}</span>
            </div>
          </div>
          <div className="w-[30%] flex flex-row items-center justify-end gap-x-3">
            <button 
              onClick={() => setMic(!mic)}
              className="flex flex-col items-center justify-center gap-y-0 text-[#bcbcbc] hover:text-white hover:opacity-90 hover:scale-[1.05] outline-none cursor-pointer">
              <MicVocal className={mic ? "w-[1.2rem] text-green-500" : "w-[1.2rem] text-[#bcbcbc] hover:text-white"} />
              {mic && <span className="text-green-500 mt-7 text-[0.6rem] absolute">•</span>}
            </button>
            <button 
              onClick={() => setQueue(!queue)}
              className="flex flex-col items-center justify-center gap-y-0 text-[#bcbcbc] hover:text-white hover:opacity-90 hover:scale-[1.05] outline-none cursor-pointer">
              <LayoutList className={queue ? "w-[1.2rem] text-green-500" : "w-[1.2rem] text-[#bcbcbc] hover:text-white"} />
              {queue && <span className="text-green-500 mt-7 text-[0.6rem] absolute">•</span>}
            </button>
            <button 
              onClick={() => setDevice(!device)}
              className="flex flex-col items-center justify-center gap-y-0 text-[#bcbcbc] hover:text-white hover:opacity-90 hover:scale-[1.05] outline-none cursor-pointer">
              <MonitorSpeaker className={device ? "w-[1.2rem] text-green-500" : "w-[1.2rem] text-[#bcbcbc] hover:text-white"} />
              {device && <span className="text-green-500 mt-7 text-[0.6rem] absolute">•</span>}
            </button>
            <button 
              onClick={handleMute}
              className="flex flex-col items-center justify-center gap-y-0 text-[#bcbcbc] hover:text-white hover:opacity-90 hover:scale-[1.05] outline-none cursor-pointer">
              {mute ?
                <VolumeX className="w-[1.2rem]" />
              :
                <Volume2 className="w-[1.2rem]" />
              }
            </button>
            <div 
              ref={rangeVolumeRef}
              onClick={handleRangeVolumeRef}
              className="w-[25%] h-1 flex flex-row bg-[#4d4d4d] rounded-xl cursor-pointer range-hover">
              <div 
                ref={rangeDivVolumeRef}
                className="relative w-[100%] h-full flex flex-row items-center bg-white rounded-xl justify-end">
                <button 
                  className="hidden absolute w-[0.8rem] h-[0.8rem] bg-white rounded-full outline-none cursor-pointer box-border"
                  onMouseDown={mouseVolumeDown}
                ></button>
              </div>
            </div>
            <button 
              onClick={() => setMiniPlayer(!miniPlayer)}
              className="flex flex-col items-center justify-center gap-y-0 text-[#bcbcbc] hover:text-white hover:opacity-90 hover:scale-[1.05] outline-none cursor-pointer"
            >
              <svg className={miniPlayer ? "w-[1.2rem] text-green-500" : "w-[1.2rem] text-[#bcbcbc] hover:text-white"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3C21.5523 3 22 3.44772 22 4V11H20V5H4V19H10V21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H21ZM21 13C21.5523 13 22 13.4477 22 14V20C22 20.5523 21.5523 21 21 21H13C12.4477 21 12 20.5523 12 20V14C12 13.4477 12.4477 13 13 13H21Z"></path></svg>
              {miniPlayer && <span className="text-green-500 mt-7 text-[0.6rem] absolute">•</span>}
            </button>
            <button 
              onClick={() => setMaximize(!maximize)}
              className="flex flex-col items-center justify-center gap-y-0 text-[#bcbcbc] hover:text-white hover:opacity-90 hover:scale-[1.05] outline-none cursor-pointer">
              <Maximize2 className={maximize ? "w-[1rem] text-green-500" : "w-[1rem] text-[#bcbcbc] hover:text-white"} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

//Helper

function padZero(num: any) {
  return num < 10 ? `0${num}` : num.toString();
}

function formatTime(time: any) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time - minutes * 60);
  return `${minutes}:${padZero(seconds)}`;
}

function formatTotalTime(time: any) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time - minutes * 60);
  return `${minutes}:${padZero(seconds)}`;
}

export default App
