import './App.css';
import LoginFormmaker from './components/LoginFormmaker'
import MainPlayground from './components/MainPlayground';
import {} from '@mui/material'
import React from 'react';

function App() {
  const [islogin, setislogin] = React.useState(false)
  return (
    <div className="App">
      {islogin && <LoginFormmaker />}
      <MainPlayground/>
    </div>
  );
}

export default App;
