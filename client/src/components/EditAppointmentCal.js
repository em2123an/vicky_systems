import { Box, Button } from "@mui/material";
import PatientRegForm from "./registeration/PatientRegForm";
import {useFormik} from 'formik'
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query'
import {format, sub} from 'date-fns'

export default function EditAppointmentCal ({mutupdateappt, initialValues, handleOnCancelEditAppt, selInv, serviceList, curEvents, setCurEvents, getAppts, listSelectedServices,setListSelectedServices}){
    
    //to call when registeration ends and resetting the forms and values
    function resetForEnd(){
        formik.handleReset()
    }
    function handleEventSaveExit(){
        isSaveExit.current = false //reset isSaveExit ref
        setIsSaving(true)
        //to get DOB
        const resultdate = sub(Date.now(),{
            years:formik.values.age_yrs,
            months:formik.values.age_mns,
            days:formik.values.age_dys
        })
        //for setting curEvent (registering values) into whole events
        axios.post('http://localhost:8080/updateappointment',{
            department : 'Radiology',
            firstname : formik.values.firstname,
            lastname : formik.values.lastname,
            sex: formik.values.sex,
            mobileno : formik.values.mobileno,
            dob : format(resultdate,'yyyy-MM-dd'),
            services : listSelectedServices.map((ser)=>(ser.serviceid)),
            sched_start : curEvents.start?format(curEvents.start,'yyyy-MM-dd HH:mm:ss'):null,
            sched_end : curEvents.end?format(curEvents.end,'yyyy-MM-dd HH:mm:ss'):null,
        },{headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(async (res)=>{
            if(res.status===200){
                setIsSaving(false)
                resetForEnd()
            }else if(res.status===505){
                setIsSaving(false)
                setSnackHandle((prev)=>({...prev, snackopen:true, snackmessage:'Connection Error! Failed to Save'}))
            }
            else{
                throw new Error()
            }
        }).catch((err)=>{
            setIsSaving(false)
            setSnackHandle((prev)=>({...prev, snackopen:true, snackmessage:'Failed to Save'}))
        })
    }
    // initialValues :{
    //     firstname:'',
    //     lastname:'',
    //     sex:'',
    //     mobileno:'',
    //     age_yrs:'',
    //     age_mns:'',
    //     age_dys:'',
    //     selservices : []
    // },
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
            updatedapptdata = {
                department : 'Radiology',
                firstname : formik.values.firstname,
                lastname : formik.values.lastname,
                sex: formik.values.sex,
                mobileno : formik.values.mobileno,
                dob : format(resultdate,'yyyy-MM-dd'),
                services : listSelectedServices.map((ser)=>(ser.serviceid)),
                sched_start : curEvents.start?format(curEvents.start,'yyyy-MM-dd HH:mm:ss'):null,
                sched_end : curEvents.end?format(curEvents.end,'yyyy-MM-dd HH:mm:ss'):null,
            }
            mutupdateappt.mutate(updatedapptdata)
        }
    })
    return <Box>
        <PatientRegForm selInv={selInv} serviceList={serviceList} curEvents={curEvents} setCurEvents={setCurEvents} 
                    formik={formik} isRegistering={isRegistering} setIsRegistering={setIsRegistering} 
                    events={getAppts} 
                    listSelectedServices={listSelectedServices} setListSelectedServices={setListSelectedServices}/>
        <Box>
            <Button onClick={(event)=>{
                formik.handleSubmit(event)   
            }}>Update Appointment</Button>
            <Button color="error" variant="outlined" onClick={()=>{
                handleOnCancelEditAppt()
            }}>Cancel</Button>
        </Box>
    </Box>
}