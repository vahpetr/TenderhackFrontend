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
import { Box, Button, Tab, Tabs } from "@material-ui/core";

function a11yProps(index: number) {
  return {
    id: `login-tab-${index}`,
    'aria-controls': `login-tabpanel-${index}`,
  };
}

interface TabPanelProps {
  children: any;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`login-tabpanel-${index}`}
      aria-labelledby={`login-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function ThunderhackPage() {
  const [inn, setInn] = useState<string | null>(null);
  const [kpp, setKpp] = useState<string | null>(null);
  const [orgType, setOrgType] = useState<number>(0);
  const inputInnCustomerRef = useRef(null);
  const inputKppCustomerRef = useRef(null);
  const inputInnProviderRef = useRef(null);
  const inputKppProviderRef = useRef(null);
  const view = useState<string>("login"); // login, purchase, sale
  // inputRef.current.value

  const setOrgTypeHandler = (event: any, newValue: number) => {
    setOrgType(newValue);
  };

  const setInnHandler = (event: any, newValue: string) => {
    setInn(newValue);
  };

  const setKppHandler = (event: any, newValue: string) => {
    setKpp(newValue);
  };


  return (
    <Container maxWidth="sm">
      <div>
      <Tabs value={orgType} onChange={setOrgTypeHandler} aria-label="login tabs" centered style={{
        paddingTop: '48px',
        alignItems: 'center'
      }}>
        <Tab label="Поставщик" {...a11yProps(orgType)} />
        <Tab label="Закупщик" {...a11yProps(orgType)} />
      </Tabs>
      <TabPanel value={orgType} index={0}>
        <div>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
        }} style={{
          justifyContent: 'center'
        }}>
          <TextField id="inn-customer" label="ИНН" variant="outlined" style={{
            paddingRight: '16px',
          }} innerRef={inputInnCustomerRef} />
          <TextField id="kpp-customer" label="КПП" variant="outlined" innerRef={inputKppCustomerRef} style={{
            paddingRight: '16px',
          }} />
        </Box>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: '24px'
        }} style={{
          justifyContent: 'center'
        }}>
          <Button variant="contained" color="primary" size="large">
            Войти
          </Button>
        </Box>
        </div>
      </TabPanel>
      <TabPanel value={orgType} index={1}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
        }} style={{
          justifyContent: 'center'
        }}>
          <TextField id="inn-provider" label="ИНН" variant="outlined" style={{
            paddingRight: '16px',
          }} innerRef={inputInnProviderRef} />
          <TextField id="kpp-provider" label="КПП" variant="outlined" innerRef={inputKppProviderRef} style={{
            paddingRight: '16px',
          }} />
        </Box>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: '24px'
        }} style={{
          justifyContent: 'center'
        }}>
          <Button variant="contained" color="primary" size="large">
            Войти
          </Button>
        </Box>
      </TabPanel>
      </div>
    </Container>
  );
}

export default ThunderhackPage;
