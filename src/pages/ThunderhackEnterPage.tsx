import {
  useState,
  useRef,
} from "react";
import { useHistory } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
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
          <Typography component={'span'} variant={'body2'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function ThunderhackEnterPage() {
  const history = useHistory();
  const [tabIndex, setTabIndex] = useState<number>(0); // producer - 0, customer - 1
  const innRef = useRef(null);
  const kppRef = useRef(null);

  const changeTabIndexHandler = (ev: any, newIndex: number) => {
    setTabIndex(newIndex);
  };
  const loginHandler = () => {
    // @ts-ignore
    if (!innRef.current.value || !kppRef.current.value) {
      return;
    }

    var type = tabIndex === 0 ? "producer" : "customer"
    // @ts-ignore
    history.push(`/thunderhack/${type}/${innRef.current.value}/${kppRef.current.value}`)
  };

  return (
    <Container maxWidth="sm">
      <div>
      <Tabs value={tabIndex} onChange={changeTabIndexHandler} aria-label="login tabs" centered style={{
        paddingTop: '48px',
        alignItems: 'center'
      }}>
        <Tab label="Поставщик" {...a11yProps(tabIndex)} />
        <Tab label="Закупщик" {...a11yProps(tabIndex)} />
      </Tabs>
      <TabPanel value={tabIndex} index={0}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
        }} style={{
          justifyContent: 'center'
        }}>
          <TextField id="inn-producer" label="ИНН" variant="outlined" style={{
            paddingRight: '16px',
          }} inputProps={{
            ref: innRef
          }} />
          <TextField id="kpp-producer" label="КПП" variant="outlined" inputProps={{
              ref: kppRef
            }} style={{
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
          <Button variant="contained" color="primary" size="large" onClick={loginHandler}>
            Войти
          </Button>
        </Box>
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <div>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
        }} style={{
          justifyContent: 'center'
        }}>
          <TextField id="inn-customer" label="ИНН" variant="outlined"
            style={{
              paddingRight: '16px',
            }}
            inputProps={{
              ref: innRef
            }}
          />
          <TextField id="kpp-customer" label="КПП" variant="outlined" inputProps={{
              ref: kppRef
            }} style={{
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
          <Button variant="contained" color="primary" size="large" onClick={loginHandler}>
            Войти
          </Button>
        </Box>
        </div>
      </TabPanel>
      </div>
    </Container>
  );
}

export default ThunderhackEnterPage;
