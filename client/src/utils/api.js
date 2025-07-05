import axios from 'axios'
import {store} from './store'

const access_token = store.getState().currentUser.accesstoken
const api = axios.create({
    baseURL:"http://localhost:8080",
    withCredentials: true
})
api.interceptors.request.use((config)=>{
    if(access_token){
        config.headers.Authorization = `Bearer ${access_token}`
    }
    return config
})

export const loginuser = (cred)=>api.post('/user/loginuser',cred,{headers:{"Content-Type":"application/x-www-form-urlencoded"}})
export const adduser = (cred)=>api.post('/user/adduser',cred)
export const removeuser = (cred)=>api.post('/user/removeuser',cred)

