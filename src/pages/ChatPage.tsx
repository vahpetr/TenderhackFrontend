import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
  MouseEvent,
  KeyboardEvent,
} from "react";
import {
  HttpTransportType,
  HubConnectionBuilder,
  IHttpConnectionOptions,
  LogLevel,
} from "@microsoft/signalr";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import { v4 as uuidv4 } from "uuid";
import { useSignalr } from "../react-signalr";
import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Grid from "@material-ui/core/Grid/Grid";
import Avatar from "@material-ui/core/Avatar/Avatar";
import ListItemAvatar from "@material-ui/core/ListItemAvatar/ListItemAvatar";
import { md5 } from "hash-wasm";

enum Opcode {
  SendMessage = "0",
  SetPosition = "1",
}
type User = {
  id: string;
  name: string;
};
type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  ts: number;
};
type MessageMeta = {
  hash: string;
};

const createName = () =>
  new Array(6)
    .fill(null)
    .map((p) => String.fromCharCode(97 + Math.floor(Math.random() * 26)))
    .join("");

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listItem: {
      backgroundColor: theme.palette.background.paper,
      margin: `8px 0`,
    },
    listItemTextContainer: {
      margin: `0`,
    },
    listItemText: {
      fontFamily: "inherit",
      margin: `0`,
    },
    listItemSenderName: {
      fontSize: `0.8rem`,
    },
    inline: {
      display: "inline",
    },
    input: {
      backgroundColor: theme.palette.background.paper,
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  })
);

const chatHubUrl = "https://hub.balkon.dev/chat";
const connectionOptions: IHttpConnectionOptions = {
  logMessageContent: true,
  logger: LogLevel.Trace,
  transport: HttpTransportType.WebSockets,
};
const hubBuilder = (builder: HubConnectionBuilder) =>
  builder.configureLogging(LogLevel.Trace).withAutomaticReconnect();

function useFocus(): [
  React.RefObject<HTMLInputElement>,
  () => void | undefined
] {
  const ref = useRef<HTMLInputElement>(null);
  const setFocus = () => ref.current?.focus();
  return [ref, setFocus];
}

const getAvatar = (
  meta: MessageMeta | undefined,
  style = "monsterid",
  size = 80
) => {
  if (meta) {
    return `https://www.gravatar.com/avatar/${meta.hash}?d=${style}&s=${size}`;
  }
  return ``;
};

const defaultUser = {
  id: uuidv4(),
  name: createName(),
};

const MAX_MESSAGE = 100;

function ChatPage() {
  const classes = useStyles();

  const [user] = useState<User>(defaultUser);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meta, setMeta] = useState<Map<string, MessageMeta>>(new Map());
  const [inputRef, setFocus] = useFocus();

  const { send, on } = useSignalr(chatHubUrl, connectionOptions, hubBuilder);

  useEffect(() => {
    const sub = on<Message>(Opcode.SendMessage).subscribe((message) => {
      messages.unshift(message);

      if (messages.length > MAX_MESSAGE) {
        messages.length = MAX_MESSAGE;
      }

      setMessages([...messages]);
    });
    return () => sub.unsubscribe();
  }, [messages, on]);

  useLayoutEffect(() => {
    async function rebuildHash() {
      let changed = false;
      for (let i = 0, l = messages.length; i < l; i++) {
        const message = messages[i];
        if (meta.has(message.id)) continue;
        const hash = await md5(message.senderName.trim().toLowerCase());
        meta.set(message.id, {
          hash,
        });
        changed = true;
      }

      if (changed) {
        setMeta((prev) => new Map(prev));
      }
    }
    rebuildHash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const sendMessage = useCallback(
    (message: Message) => send(Opcode.SendMessage, message),
    [send]
  );

  const sendMessageHandler = async (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const button = e.target as HTMLInputElement;
    if (button.disabled || !inputRef.current?.value) return;

    button.disabled = true;

    const message: Message = {
      id: uuidv4(),
      senderId: user.id,
      senderName: user.name,
      text: inputRef.current.value,
      ts: Date.now(),
    };

    inputRef.current.value = "";

    await sendMessage(message);

    button.disabled = false;

    setFocus();
  };

  const pressEnterHandler = async (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.code === "Enter") {
      if (!e.shiftKey) {
        // @ts-ignore
        await sendMessageHandler(e);
      }
    }
  };

  return (
    <Container>
      <Typography component="div">
        <div>
          You name: <b>@{user.name}</b>
        </div>
        <form noValidate autoComplete="off">
          <div>
            <FormControl fullWidth>
              <TextField
                inputRef={inputRef}
                className={classes.input}
                id="message"
                label="Message"
                multiline
                variant="outlined"
                onKeyDown={pressEnterHandler}
                required
                autoFocus
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={sendMessageHandler}>
                      <SendIcon />
                    </IconButton>
                  ),
                }}
              />
            </FormControl>
          </div>
        </form>
        <List>
          {messages.map((p) => (
            <ListItem
              key={p.id}
              className={classes.listItem}
              alignItems="flex-start"
            >
              <Grid container>
                <Grid item>
                  <ListItemAvatar>
                    <Avatar
                      alt={`@${p.senderName}`}
                      src={getAvatar(meta.get(p.id))}
                    />
                  </ListItemAvatar>
                </Grid>
                <Grid item className={classes.listItemTextContainer}>
                  <ListItemText>
                    <b className={classes.listItemSenderName}>
                      @{p.senderName}
                    </b>
                  </ListItemText>
                  <ListItemText
                    primary={
                      <pre className={classes.listItemText}>{p.text}</pre>
                    }
                  ></ListItemText>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      </Typography>
    </Container>
  );
}

export default ChatPage;
