import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
    userid: undefined,
    username: undefined,
    firstname: undefined,
    lastname: undefined,
    role: undefined,
    permissions: undefined,
    status: 'inactive',
    accesstoken: undefined
}

export const currentUserSlice = createSlice({
    name:'currentuser',
    initialState,
    reducers:{
        logout:(state,action)=>{
            state = {...initialState}
        },
        loginuser:(state,action)=>{
            state = {...action.payload}
            state.status = 'active'
        }
    },
    extraReducers: builder => {
        builder.addCase(login.pending,(state)=>{
            //while on loading state
            state.status = 'loading'
        })
        builder.addCase(login.fulfilled,(state,action)=>{
            //sucessfully enter
            state.status = 'active'
            //action.payload to get other datas
        })
        builder.addCase(login.rejected,(state,action)=>{
            //not success
            state = {...initialState}
            //username or password error
            //network error
        })
    }
})

export const login = createAsyncThunk(
    'currentuser/login',
    async (username, password)=>{
        const res = await axios.post('http://localhost:8080/loginuser',{
            department : 'Radiology',
            username : username,
            password : password, //hast it; use other defences
            location : ''
        },{headers:{"Content-Type":"application/x-www-form-urlencoded"}})
        return res.data
    }
)

export const {logout,loginuser} = currentUserSlice.actions

export default currentUserSlice.reducer