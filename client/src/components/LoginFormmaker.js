import { Button, TextField, Stack, Divider, Avatar, Snackbar } from '@mui/material'
import {useFormik} from 'formik'
import { object, string } from 'yup'
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query'
import {loginuser as loginuserapi} from '../utils/api'
import {loginuser as loginuseraction} from '../utils/currentUserSlice'
import {useDispatch} from 'react-redux'
import { useState } from 'react'

export default function LoginFormMaker(){
    const [errMsg,setErrMsg] = useState({status:false,msg:''})

    const mutloginuser = useMutation({
        mutationKey:['loginuser'],
        mutationFn: (cred)=>{loginuserapi(cred)},
        onSuccess: (data)=>{
            if(data.status == 401) {
                setErrMsg({status:true, msg:"Username or password incorrect"})
                return
            }
            if(data.status == 200){
                useDispatch(loginuseraction(data.data))
            }
        },
        onError: ()=>{
            setErrMsg({status:true, msg:"Connection Problem"})
        }
    })

    const formik = useFormik({
        initialValues :{
            username:'',
            password:''
        },
        validationSchema : object({
            username: string().required("Required"),
            password: string().required("Required")
        }),
        validateOnChange : true,
        onSubmit : (values)=>{
            //handle a login logic here
            mutloginuser.mutate({values})
        }
    })

    return <Stack useFlexGap spacing={2} direction={'column'} sx={{width:350, borderRadius:1, border:'2px black solid',paddingX:4, paddingY:4, margin:'auto', marginTop:10}}>
        <Stack spacing={4} direction={'row'} sx={{justifyContent: "center", alignItems:'baseline'}}>
            <Avatar>V</Avatar>
            <h2>Viki Systems</h2>
        </Stack>
        <TextField required onBlur={formik.handleBlur}
            error={formik.touched.username && formik.errors.username}
            value={formik.values.username} onChange={formik.handleChange}
            variant="outlined" name="username" label='Username'
            slotProps={{ inputLabel: { shrink: true, }, }} 
        />
        <TextField required onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password}
            value={formik.values.password} onChange={formik.handleChange}
            variant="outlined" name="password" label='Password'
            slotProps={{ inputLabel: { shrink: true, }, }} 
        />
        <Divider variant='middle' orientation="horizontal" flexItem/>
        <Button variant='contained' size='large' sx={{margin:["auto", "auto"]}} 
            disabled={mutloginuser.isPending}
            onClick={(event)=>{
                formik.handleSubmit(event)
            }}>Login</Button>
        
        <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={
                mutloginuser.isPending
            }
            onClick={() => {}}>
            <CircularProgress />
        </Backdrop>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={errMsg.status}
            autoHideDuration={5000}
            onClose={()=>{setErrMsg({status:false,msg:''})}}
            message={errMsg.msg}
        />
    </Stack>
}