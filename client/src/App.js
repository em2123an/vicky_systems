import './App.css';
import LoginFormmaker from './components/LoginFormmaker'
import MainPlayground from './components/MainPlayground';
import React from 'react';
import {QueryClientProvider, QueryClient} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'


const queryClient = new QueryClient()
function App() {
  const [islogin, setislogin] = React.useState(false)
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        {islogin && <LoginFormmaker />}
        <MainPlayground/>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
