import { Box, Button, IconButton, Toolbar,Backdrop, CircularProgress, Snackbar } from "@mui/material";
import PatientRegForm from "../registeration/PatientRegForm";
import {format, sub} from 'date-fns'
import axios from "axios"
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useMutation, useQueryClient} from "@tanstack/react-query"
import {useFormik} from 'formik'
import { array, number, object, string } from 'yup'
import { useEffect, useState } from "react";


export default function EditAppointmentCal ({initialValues, mutupdateappt, handleOnCloseEditAppt, 
    selInv, serviceList, curEvents, setCurEvents, visitId, patientId,
    getAppts}){
    
    const [openSnackBar, setOpenSnackBar] = useState(false)

    const queryClient = useQueryClient()
    //mutation call to cancel the status of the scan
    const mutcancelscanstatus = useMutation({
        mutationKey:['update_scan_status', visitId],
        mutationFn: (cancelscanstatus)=>(
            axios.post('http://localhost:8080/updatescanstatus',cancelscanstatus,
                {headers:{"Content-Type":"application/x-www-form-urlencoded"}})
            ),
        onSuccess: ()=>{  
            queryClient.invalidateQueries({queryKey:['patDetail', visitId]})
        }
    })
    
    //formik setup
    const formik = useFormik({
        initialValues :{...initialValues},
        validationSchema : object({
            firstname: string().required("Required"),
            lastname: string().required("Required"),
            sex: string().required("Required"),
            mobileno: string().matches(new RegExp('^[0-9]+$')).required("Required"),
            age_yrs: number().positive().integer().test((val, ctx)=>{
                var {age_dys, age_mns} = ctx.parent
                if(!(age_dys || age_mns)) return val!=null
                return true
            }),
            age_mns: number().positive().integer().test((val, ctx)=>{
                var {age_yrs, age_dys} = ctx.parent
                if(!(age_yrs || age_dys)) return val!=null
                return true
            }),
            age_dys: number().positive().integer().test((val, ctx)=>{
                var {age_yrs, age_mns} = ctx.parent
                if(!(age_yrs || age_mns)) return val!=null
                return true
            }),
            selservices : array().min(1)
        }),
        validateOnChange : true,
        onSubmit : (values)=>{
            //to get DOB
            const resultdate = sub(Date.now(),{
                years:formik.values.age_yrs,
                months:formik.values.age_mns,
                days:formik.values.age_dys
            })
            const updatedapptdata = {
                department : 'Radiology',
                firstname : formik.values.firstname,
                lastname : formik.values.lastname,
                sex: formik.values.sex,
                mobileno : formik.values.mobileno,
                dob : format(resultdate,'yyyy-MM-dd'),
                services: formik.values.selservices.map((service)=>service.serviceid),
                //services : listSelectedServices.map((ser)=>(ser.serviceid)),
                sched_start : curEvents.start?format(curEvents.start,'yyyy-MM-dd HH:mm:ss'):format(Date.now(),'yyyy-MM-dd HH:mm:ss'),
                sched_end : curEvents.end?format(curEvents.end,'yyyy-MM-dd HH:mm:ss'):null,
                visitid: visitId,
                patientid: patientId
            }
            mutupdateappt.mutate(updatedapptdata)
            //handleOnCloseEditAppt()
        }
        })

    useEffect(()=>{    
        if(mutcancelscanstatus.isSuccess || mutupdateappt.isSuccess){
            handleOnCloseEditAppt()
            mutcancelscanstatus.reset()
            mutupdateappt.reset()
        } else if ( mutcancelscanstatus.isError || mutupdateappt.isError){
            setOpenSnackBar(true)
        }
    },[mutcancelscanstatus.isSuccess,mutupdateappt.isSuccess, mutcancelscanstatus.isError, mutupdateappt.isError])
    
    function handleSnackBarClose(){
        setOpenSnackBar(false)
    }
    return <Box sx={{p:2}}>
        <Toolbar sx={{display:'flex', justifyContent:'end'}}>
            <IconButton sx={(theme) => ({zIndex: theme.zIndex.drawer + 4 })} aria-label={'close'} onClick={()=>{
                handleOnCloseEditAppt()
            }}>
                <CloseOutlinedIcon fontSize="large"/>
            </IconButton>
        </Toolbar>
        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-around', p:2}}>
            <Button variant="outlined" onClick={(event)=>{
                   formik.handleSubmit()
                }}>Update Appointment</Button>
            <Button color="error" variant="outlined" onClick={()=>{
                mutcancelscanstatus.mutate({
                    visitid: visitId,
                    scanstatus: 'scan_cancelled'
                  })
                //handleOnCloseEditAppt()
                }}>Cancel Appointment</Button>
        </Box>
        <PatientRegForm selInv={selInv} serviceList={serviceList} curEvents={curEvents}
         setCurEvents={setCurEvents} formik={formik} events={getAppts}/>
        <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={
                mutcancelscanstatus.isPending || mutupdateappt.isPending //cancel and update loading
            }
            onClick={() => { }}>
            <CircularProgress />
        </Backdrop>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={openSnackBar}
            autoHideDuration={5000}
            onClose={handleSnackBarClose}
            action={<IconButton size="small" color="inherit" onClick={handleSnackBarClose}>
                <CloseOutlinedIcon fontSize="small"/>
                </IconButton>}
            message={`Network Error: Failed to ${(mutcancelscanstatus.isError||mutupdateappt.isError)&&"Update"}`}
        />
    </Box>
}