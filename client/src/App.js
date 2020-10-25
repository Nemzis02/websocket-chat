/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import dayjs from 'dayjs';
import useChatService from './useChatService';
import { HOST_URL } from './constants';

const getDate = (date) => {
  return dayjs(date).format('DD MMMM YYYY, HH:mm:ss');
};

const post = (data) =>
  fetch(`${HOST_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  }).then((res) => res.json());

const useAppStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '200px',
    '& label': {
      display: 'flex',
      flexDirection: 'column',
      marginTop: '15px',
    },
    '& button': {
      marginTop: '15px',
    },
  },
  invalidField: {
    color: 'red',
  },
  chat: {
    display: 'flex',
    flexDirection: 'column',
    width: '500px',
    height: '100vh',
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  messagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '80%',
    overflow: 'auto',
    marginTop: '20px',
    marginBottom: '20px',
  },
  messageForm: {
    display: 'flex',
    '& input': {
      flex: 1,
      marginRight: '10px',
    },
  },
  messageUser: {
    color: 'grey',
    fontSize: '12px',
  },
});

const initialFormValues = {
  name: '',
  password: '',
  rePassword: '',
};

const App = () => {
  const classes = useAppStyles();
  const chatContainerRef = useRef();
  const inputRef = useRef();
  const [isSignUpView, setSignUpView] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { isConnected, messages, sendMessage, error } = useChatService(
    currentUser
  );
  const [formValues, setFormValues] = useState(initialFormValues);
  const { name, password, rePassword } = formValues;

  const isPasswordNotMatch = password && rePassword && password !== rePassword;
  const isFormValid =
    Object.values(formValues).every((value) => value) && !isPasswordNotMatch;
  const isDisplayChat = currentUser && isConnected && messages;
  const isConnectionClosed = !isSignUpView && (!isConnected || error);

  useEffect(() => {
    const { current: input } = inputRef;

    if (input) {
      input.focus();
    }
  }, [isDisplayChat]);

  useEffect(() => {
    const { current: chatContainer } = chatContainerRef;

    if (chatContainer) {
      chatContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [messages]);

  const onFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues((formValues) => ({ ...formValues, [name]: value }));
  }, []);

  const onSignUpFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const user = await post({ name, password });
      setCurrentUser(user);
      setSignUpView(false);
    },
    [name, password]
  );

  const onSendMessage = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.target;
      const { value: message } = form.message;

      if (message) {
        sendMessage(message);
        form.reset();
      }
    },
    [sendMessage]
  );

  const getForm = useCallback(
    () => (
      <form
        className={classes.form}
        onChange={onFormChange}
        onSubmit={onSignUpFormSubmit}
      >
        <h1>Create a chat user</h1>
        <label>
          Name
          <input name='name' type='text' />
        </label>
        <label>
          Password
          <input name='password' type='password' />
        </label>
        <label>
          Confirm password
          <input name='rePassword' type='password' />
        </label>
        {isPasswordNotMatch && (
          <span className={classes.invalidField}>Passwords don't match</span>
        )}
        <button disabled={!isFormValid} type='submit'>
          Sign up
        </button>
      </form>
    ),
    [isFormValid, isPasswordNotMatch]
  );

  let content;

  if (isSignUpView) {
    content = getForm();
  }

  if (isDisplayChat) {
    const messageList = messages.map((msg) => {
      const { id, message, user, date } = msg;
      return (
        <div
          ref={chatContainerRef}
          key={id}
          className={classes.messageContainer}
        >
          <span className={classes.messageUser}>{`${user.name}, ${getDate(
            date
          )}`}</span>
          <span>{message}</span>
        </div>
      );
    });
    content = (
      <div className={classes.chat}>
        <h1>{`Chat: ${currentUser.name}`}</h1>
        <div className={classes.messagesContainer}>{messageList}</div>
        <form className={classes.messageForm} onSubmit={onSendMessage}>
          <input ref={inputRef} name='message' type='text' />
          <button type='submit'>Send</button>
        </form>
      </div>
    );
  }

  if (isConnectionClosed) {
    content = <h1>Connected has been closed</h1>;
  }

  return <div className={classes.container}>{content}</div>;
};

export default App;
