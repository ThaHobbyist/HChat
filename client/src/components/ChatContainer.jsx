// eslint-disable-next-line
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import axios from "axios";
import { getMessageRoute, sendMessageRoute } from "../utils/APIRoutes";
import { v4 as uuidv4 } from "uuid";

const Status = ({ user, users }) => {
  console.log(users);
  console.log(user._id);
  console.log(users[user._id]);
  const [online, setOnline] = useState();

  useEffect(() => {
    setOnline(!!users[user._id]);
  }, [users, user]);

  return (
    <>
      <div className="status">{online == true ? "Online" : "Offline"}</div>
    </>
  );
};

function ChatContainer({ currentChat, currentUser, users, socket }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMsg, setArrivalMsg] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchChat = async () => {
      const response = await axios.post(getMessageRoute, {
        from: currentUser._id,
        to: currentChat._id,
      });
      setMessages(response.data);
    };

    if (currentChat) fetchChat();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });

    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMsg({
          fromSelf: false,
          message: msg,
        });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMsg && setMessages((prev) => [...prev, arrivalMsg]);
  }, [arrivalMsg]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behaviour: "smooth",
    });
  }, [messages]);

  return (
    <>
      {currentChat && messages && (
        <Container>
          <div className="chat-header">
            <div className="user-details">
              <div className="avatar">
                <img
                  src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                  alt="avatar"
                />
              </div>
              <div className="username">
                <h3> {currentChat.username} </h3>
              </div>
            </div>
            <Status user={currentChat} users={users} />
            {/* <Logout /> */}
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => {
              return (
                <div ref={scrollRef} key={uuidv4()}>
                  <div
                    className={`message ${
                      message.fromSelf ? "sent" : "recieved"
                    }`}
                  >
                    <div className="content">
                      <p>{message.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <ChatInput handleSendMsg={handleSendMsg} />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10.3% 74.8% 15.2%;
  gap: 0.1rem;
  overflow: hidden;
  background-color: white;
  border-radius: 0 1.9rem 1.9rem 0;
  /* @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 17% 15%;
  } */

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    padding-top: 1rem;
    background-color: #ff6262;
    border-bottom: 0.2rem solid black;

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;

      .avatar {
        img {
          height: 3rem;
          border: 0.15rem solid black;
          border-radius: 50%;
        }
      }

      .username {
        h3 {
          color: black;
        }
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    background-color: #5b65ff;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: center;

      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #000000;
        border: 0.2rem solid black;
      }
    }

    .sent {
      justify-content: flex-end;
      .content {
        background-color: #a1f88b;
      }
    }

    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #ffffff;
      }
    }
  }
`;

export default ChatContainer;
