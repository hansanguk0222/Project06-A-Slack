/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import pool from '@/db';
import { Model } from '@/types';

interface createInfo {
  ownerId: number;
  name: string;
  channelType: number;
  isPublic: number;
  description: string;
  memberCount: number;
}

interface TopicInfo {
  channelId: number;
  topic: string;
}

export const channelModel: Model = {
  getChannels() {
    const sql = `SELECT channel_type as channelType, id, description, is_public as isPublic, 
    member_count as memeberCount, name, owner_id as ownerId, topic FROM channel WHERE is_deleted = 0 AND is_public=1`;
    return pool.query(sql);
  },
  getJoinChannels({ userId }: { userId: number }) {
    const sql = `SELECT channel_type as channelType, id, description, is_public as isPublic, 
    member_count as memeberCount, name, owner_id as ownerId, topic
    FROM channel 
    JOIN user_channel
    ON user_channel.user_id = ? AND user_channel.channel_id = channel.id
    WHERE channel.is_deleted = 0
    `;
    return pool.execute(sql, [userId]);
  },
  getChannelUser({ channelId }: { channelId: number }) {
    const sql = `SELECT user_channel.user_id as userId, 
    user.display_name as displayName, user.image as image
    FROM user
    JOIN user_channel
    ON user_channel.channel_id = ? and user_channel.user_id = user.id
    `;
    return pool.execute(sql, [channelId]);
  },
  getChannel({ channelId }: { channelId: number }) {
    const sql = `SELECT id, owner_id as ownerId, name, channel_type as channelType, is_public as isPublic, 
    is_deleted as isDeleted, member_count as memberCount, description, topic
    FROM channel
    WHERE channel.id = ?
    `;
    return pool.execute(sql, [channelId]);
  },
  createChannel({ ownerId, name, channelType, isPublic, description, memberCount }: createInfo) {
    const sql = `INSERT INTO channel (owner_id, name, channel_type, is_public, description, member_count) VALUES (?, ?, ?, ?, ?, ?)`;
    return pool.execute(sql, [ownerId, name, channelType, isPublic, description, memberCount]);
  },
  joinChannel({
    joinUsers,
    prevMemberCount,
    channelId,
  }: {
    joinUsers: [number[]];
    prevMemberCount: number;
    channelId: number;
  }) {
    const sql = `INSERT INTO user_channel (user_id, channel_id) VALUES ?;
    UPDATE channel SET member_count = ? WHERE id = ?`;
    return pool.query(sql, [joinUsers, joinUsers.length + prevMemberCount, channelId]);
  },
  modifyTopic({ channelId, topic }: TopicInfo) {
    const sql = 'UPDATE channel SET topic = ? WHERE id = ?';
    return pool.execute(sql, [topic, channelId]);
  },
  getNotJoinedChannels({ userId }: { userId: number }) {
    const sql = `SELECT * FROM channel
    WHERE channel.is_public = 1 AND channel.id NOT IN
    (SELECT channel.id FROM channel 
    JOIN user_channel 
    WHERE user_channel.user_id = ? AND channel.id = user_channel.channel_id)`;
    return pool.execute(sql, [userId]);
  },
};
