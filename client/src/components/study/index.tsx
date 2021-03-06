import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadChannelsRequest } from '@/store/channels';

const Home = () => {
  const dispatch = useDispatch();
  const { channelList, show } = useSelector((state: any) => ({
    channelList: state.channels.channelList,
    show: state.channels.show,
  }));

  const callAPI = useCallback(() => {
    dispatch(loadChannelsRequest());
  }, []);

  return (
    <div>
      <button onClick={callAPI}>제발 불러와줘</button>
      {show !== '' && <h1>{show}</h1>}
      {channelList !== [] &&
        channelList.map((channel: any) => (
          <div key={channel.id}>
            <div>생성자: {channel.ownerId}</div>
            <div>채널 이름: {channel.name}</div>
            <div>채널 타입: {channel.channelType}</div>
            <div>채널 공개 여부: {channel.isPublic}</div>
            <div>채널 멤버 수: {channel.memeberCount}</div>
            <div>채널 설명 : {channel.description}</div>
          </div>
        ))}
    </div>
  );
};

export default Home;
