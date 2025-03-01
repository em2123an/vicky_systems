import { Box, Button, Stack } from "@mui/material";
import PatientRegForm from "./registeration/PatientRegForm";
import {format, sub} from 'date-fns'
import axios from "axios"


export default function EditAppointmentCal ({mutupdateappt, formik, handleOnCloseEditAppt, 
    selInv, serviceList, curEvents, setCurEvents, visitId, patientId,
    getAppts, listSelectedServices,setListSelectedServices}){
    
    return <Box>
        <PatientRegForm selInv={selInv} serviceList={serviceList} curEvents={curEvents} setCurEvents={setCurEvents} 
                    formik={formik} events={getAppts} 
                    listSelectedServices={listSelectedServices} setListSelectedServices={setListSelectedServices}/>
        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-around', m:4, width:'70%'}}>
            <Button variant="outlined" onClick={(event)=>{
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
                    services : listSelectedServices.map((ser)=>(ser.serviceid)),
                    sched_start : curEvents.start?format(curEvents.start,'yyyy-MM-dd HH:mm:ss'):null,
                    sched_end : curEvents.end?format(curEvents.end,'yyyy-MM-dd HH:mm:ss'):null,
                    visitid: visitId,
                    patientid: patientId
                }
                console.log(updatedapptdata)
                mutupdateappt.mutate(updatedapptdata)
                handleOnCloseEditAppt()   
                }}>Update Appointment</Button>
            <Button color="error" variant="outlined" onClick={()=>{
                handleOnCloseEditAppt()
                }}>Cancel</Button>
        </Box>
        
    </Box>
}