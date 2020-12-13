import { all, fork, takeEvery, call, put, takeLatest } from 'redux-saga/effects';
import { channelService } from '@/services';
import { Channel, JoinedUser, User } from '@/types';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  loadChannelsRequest,
  loadChannelsSuccess,
  loadChannelsFailure,
  loadMyChannelsRequest,
  loadMyChannelsSuccess,
  loadMyChannelsFailure,
  loadChannelRequest,
  loadChannelSuccess,
  loadChannelFailure,
  createChannelRequest,
  createChannelSuccess,
  createChannelFailure,
  joinChannelRequset,
  joinChannelSuccess,
  joinChannelFailure,
  joinChannelRequsetPayload,
} from '@/store/modules/channel.slice';
import { setRedirect } from '@/store/modules/redirect.slice';
import { setLastChannel } from '@/store/modules/user.slice';

function* loadChannels() {
  try {
    const { data, status } = yield call(channelService.getChannels);
    if (status === 200) {
      yield put(loadChannelsSuccess({ channelList: data.channelList }));
    }
  } catch (err) {
    yield put(loadChannelsFailure(err));
  }
}

function* loadMyChannels(action: PayloadAction<{ userId: number }>) {
  const { userId } = action.payload;
  try {
    const { data, status } = yield call(channelService.getJoinChannels, { userId });
    if (status === 200) {
      yield put(loadMyChannelsSuccess({ myChannelList: data.channelList }));
    }
  } catch (err) {
    yield put(loadMyChannelsFailure(err));
  }
}

function* loadChannel(action: PayloadAction<{ channelId: number; userId: number }>) {
  const { channelId, userId } = action.payload;
  try {
    const { data, status } = yield call(channelService.getChannel, {
      channelId,
    });

    if (status === 200) {
      yield put(loadChannelSuccess({ channel: data.channel, users: data.users }));
    }

    const { status: resStatus } = yield call(channelService.modifyLastChannel, {
      lastChannelId: channelId,
      userId,
    });

    if (resStatus === 200) {
      yield put(setLastChannel({ channelId }));
    }
  } catch (err) {
    yield put(loadChannelFailure(err));
  }
}

function* createChannel(action: any) {
  try {
    const { ownerId, channelType, isPublic, name, description, users } = action.payload;
    const { data, status } = yield call(channelService.createChannel, {
      ownerId,
      channelType,
      isPublic,
      name,
      description,
      memberCount: users.length,
    });

    if (status === 201) {
      const channel: Channel = {
        id: data.channel.insertId,
        channelType,
        description,
        isPublic,
        name,
        topic: '',
        ownerId,
        memberCount: users.length,
      };

      const joinedUser: JoinedUser = {
        userId: ownerId,
        displayName: users[0].id,
        image: users[0].image,
      };

      yield put(createChannelSuccess({ channel, joinedListUser: [joinedUser] }));
      const { status: joinStatus } = yield call(channelService.joinChannel, {
        users,
        channelId: data.channel.insertId,
      });

      const members = users.map((user: User) => {
        const { id, displayName, image } = user;
        return { userId: id, displayName, image };
      });

      if (joinStatus === 200) {
        yield put(joinChannelSuccess({ users: members }));
        yield put(setRedirect({ url: `/client/1/${data.channel.insertId}` }));
      }
    }
  } catch (err) {
    yield put(createChannelFailure(err));
  }
}

function* joinChannel({ payload: { users, channelId } }: PayloadAction<joinChannelRequsetPayload>) {
  try {
    yield call(channelService.joinChannel, { users, channelId });
    const { data, status } = yield call(channelService.getChannel, { channelId });
    if (status === 200) {
      yield put(joinChannelSuccess({ users: data.users }));
    }
  } catch (err) {
    yield put(joinChannelFailure(err));
  }
}

function* watchLoadChannels() {
  yield takeEvery(loadChannelsRequest, loadChannels);
}

function* watchLoadMyChannels() {
  yield takeEvery(loadMyChannelsRequest, loadMyChannels);
}

function* watchLoadChannel() {
  yield takeEvery(loadChannelRequest, loadChannel);
}

function* watchCreateChannel() {
  yield takeLatest(createChannelRequest, createChannel);
}

function* watchJoinChannel() {
  yield takeLatest(joinChannelRequset, joinChannel);
}

export default function* channelSaga() {
  yield all([
    fork(watchLoadChannels),
    fork(watchLoadMyChannels),
    fork(watchCreateChannel),
    fork(watchLoadChannel),
    fork(watchJoinChannel),
  ]);
}
