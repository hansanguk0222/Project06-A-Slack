/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { flex } from '@/styles/mixin';
import styled from 'styled-components';
import { createChannelRequest } from '@/store/modules/channel';
import { useAuth, useUser } from '@/hooks';
import { useDispatch } from 'react-redux';

interface Props {
  secret?: boolean;
  name?: string;
}

const ModalBackground = styled.div`
  width: 100%;
  height: 100%;
  ${flex()};
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
`;

const Container = styled.div`
  border-radius: 10px;
  padding: ${(props) => props.theme.size.xxl};
  background: ${(props) => props.theme.color.white};
  width: 500px;
  height: 500px;
  box-shadow: ${(props) => props.theme.boxShadow.darkgray};
`;

const Header = styled.div`
  ${flex('center', 'space-between')};
  margin-bottom: 20px;
  font-size: ${(props) => props.theme.size.xxxl};
  color: ${(props) => props.theme.color.black1};
`;

const CloseButton = styled.button`
  background: none;
  color: ${(props) => props.theme.color.gray2};
  font-size: ${(props) => props.theme.size.xxxl};
  &:hover {
    transition: 0.3s;
    background: ${(props) => props.theme.color.gray5};
  }
`;

const HeaderContent = styled.div`
  font-size: ${(props) => props.theme.size.xxxl};
  font-weight: 700;
`;

const Explain = styled.div`
  font-size: ${(props) => props.theme.size.s};
  color: ${(props) => props.theme.color.gray2};
`;

const Form = styled.form``;

const LabelContent = styled.div`
  font-size: ${(props) => props.theme.size.m};
  margin-right: 10px;
`;
const NameInput = styled.input`
  display: block;
  width: 100%;
  font-size: ${(props) => props.theme.size.l};
  border: 1px ${(props) => props.theme.color.gray4} solid;
  border-radius: 3px;
  width: 100%;
  height: 50px;
  padding: 0 35px;
  &:focus {
    transition: 0.3s;
    box-shadow: ${(props) => props.theme.boxShadow.skyblue};
  }
`;

const DescriptionInput = styled.input`
  display: block;
  width: 100%;
  font-size: ${(props) => props.theme.size.l};
  border: 1px ${(props) => props.theme.color.gray4} solid;
  border-radius: 3px;
  width: 100%;
  height: 50px;
  padding: 0 5px;
  &:focus {
    transition: 0.3s;
    box-shadow: ${(props) => props.theme.boxShadow.skyblue};
  }
`;

const InputBox = styled.div<Props>`
  position: relative;
  &::before {
    position: absolute;
    content: '${(props) => (props.secret ? 'O' : '#')}';
    top: 15px;
    left: 10px;
    color: ${(props) => props.theme.color.gray2};
  }
`;

const Label = styled.label`
  margin: 25px 0;
  display: ${flex('center', 'flex-start', 'column')};
`;

const LabelBox = styled.div`
  ${flex(undefined, 'flex-start')}
  margin-bottom: 10px;
`;

const NameAlert = styled.div`
  font-size: ${(props) => props.theme.size.xs};
  color: ${(props) => props.theme.color.yellow};
`;

const Description = styled.div`
  font-size: ${(props) => props.theme.size.xs};
  color: ${(props) => props.theme.color.gray3};
`;

const Bottom = styled.div`
  width: 100%;
  margin-bottom: 25px;
`;

const Bottomheader = styled.div`
  font-size: ${(props) => props.theme.size.m};
`;

const BottomContent = styled.label`
  width: 100%;
  ${flex('center', 'space-between')};
`;

const BottomExplain = styled.div`
  width: 300px;
  word-wrap: break-word;
  color: ${(props) => props.theme.color.gray2};
  font-size: ${(props) => props.theme.size.xs};
`;

const PrivateButton = styled.button<Props>`
  width: 60px;
  height: 30px;
  border-radius: 15px;
  padding: 2px;
  border: 1px ${(props) => props.theme.color.gray2} solid;
  ${(props) => (props.secret ? flex(undefined, 'flex-end') : flex(undefined, 'flex-start'))};
  &:focus {
    transition: 0.3s;
    box-shadow: ${(props) => props.theme.boxShadow.skyblue};
  }
  ${(props) =>
    props.secret
      ? `background: ${props.theme.color.green1}`
      : `background: ${props.theme.color.white}`}
`;

const Circle = styled.div<Props>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: ${(props) => props.theme.color.gray2};
  ${(props) =>
    props.secret
      ? `background: ${props.theme.color.white}`
      : `background: ${props.theme.color.gray2}`}
`;

const CreateButtonBox = styled.div`
  ${flex('center', 'flex-end')}
`;
const CreateButton = styled.button<Props>`
  border: 1px ${(props) => props.theme.color.gray6} solid;
  border-radius: 5px;
  color: ${(props) => props.theme.color.white};
  padding: 10px;
  ${(props) =>
    props.name !== ''
      ? ` background:  ${props.theme.color.green1};
    &:hover {
      transition: 0.3s;
      background: ${props.theme.color.green2};
    }`
      : `background: ${props.theme.color.gray3}
      `}
`;

const CreateChannelModal = ({
  setCreateChannelModalVisible,
}: {
  setCreateChannelModalVisible: Function;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [secret, setSecret] = useState(false);
  const { userId } = useAuth();
  const { userInfo } = useUser();

  const dispatch = useDispatch();

  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const changeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const closeAddChannelModal = () => {
    setCreateChannelModalVisible(false);
  };

  const toggleSecret = () => {
    setSecret((state) => !state);
  };

  const createChannel = async () => {
    const isPublic = secret ? 0 : 1;
    dispatch(
      createChannelRequest({
        ownerId: userId,
        channelType: 1,
        isPublic,
        name,
        description,
        displayName: userInfo?.displayName,
      }),
    );
  };

  return (
    <ModalBackground>
      <Container>
        <Header>
          <HeaderContent>{secret ? 'Create a private channel' : 'Create a channel'}</HeaderContent>
          <CloseButton onClick={closeAddChannelModal}>X</CloseButton>
        </Header>
        <Explain>
          Channels are where your team communicates. They’re best when organized around a topic —
          #marketing, for example.
        </Explain>
        <Form>
          <Label>
            <LabelBox>
              <LabelContent>Name</LabelContent>
              {name === '' && <NameAlert>Don't forget to name your channel.</NameAlert>}
            </LabelBox>
            <InputBox secret={secret}>
              <NameInput
                onChange={changeName}
                value={name}
                required
                placeholder="e.g. plan-budget"
              />
            </InputBox>
          </Label>
          <Label>
            <LabelBox>
              <LabelContent>Description</LabelContent>
              <Description>(optional)</Description>
            </LabelBox>
            <DescriptionInput onChange={changeDescription} value={description} />
            <Description>What's this channel about?</Description>
          </Label>
        </Form>
        <Bottom>
          <Bottomheader>Make private</Bottomheader>
          <BottomContent>
            <BottomExplain>
              {secret
                ? `This can’t be undone. A private channel cannot be made public later on.`
                : `When a channel is set to private, it can only be viewed or joined by invitation.`}
            </BottomExplain>
            <PrivateButton secret={secret} onClick={toggleSecret}>
              <Circle secret={secret} />
            </PrivateButton>
          </BottomContent>
        </Bottom>
        <CreateButtonBox>
          <CreateButton type="submit" name={name} onClick={createChannel} disabled={name === ''}>
            Create
          </CreateButton>
        </CreateButtonBox>
      </Container>
    </ModalBackground>
  );
};

export default CreateChannelModal;
