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

function ThunderhackPage() {
  const [inn, setInn] = useState<string | null>(null);
  const [kpp, setKpp] = useState<string | null>(null);
  const [orgType, setOrgType] = useState<string | null>(null);

  return <div>Hello Thunderhack!</div>
}

export default ThunderhackPage;
