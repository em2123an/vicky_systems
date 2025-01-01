import {useState} from "react"
import SchedulerFront from "./SchedulerFront"
import PatientRegForm from "./registeration/PatientRegForm"
import {Step, StepLabel, Stepper, Button, Stack} from "@mui/material"
import PatientRegUploader from "./registeration/PatientRegUploader"
import PatientRegPayment from "./registeration/PatientRegPayment"
import { purple, blue } from '@mui/material/colors'
import {useFormik} from 'formik'
import { number, object, string } from 'yup'

export default function MainPlayground(){
    const [isRegistering, setIsRegistering] = useState(false)
    const [isDetailViewing, setIsDetailViewing] = useState(false)
    const [events, setEvents] = useState([])
    const [activeStep, setActiveStep] = useState(0)
    const [listSelectedServices, setListSelectedServices] = useState([])
    const [curEvents, setCurEvents] = useState()
    
    const steps =['Booking Information', 'Necessary Documents', 'Payment Details']
    
    function handleEventSaveExit(){
        //for setting curEvent (registering values) into whole events
        setEvents((prev)=>([...prev,{...curEvents, editable:false, backgroundColor: blue[800], borderColor:blue[800]}]))
    }

    const formik = useFormik({
        initialValues :{
            firstname:'',
            lastname:'',
            mobileno:'',
            age_yrs:'',
            age_mns:'',
            age_dys:'',
        },
        validationSchema : object({
            firstname: string().required("Required"),
            lastname: string().required("Required"),
            mobileno: string().matches(new RegExp('^[0-9]+$')).required("Required"),
            age_yrs: number().positive().integer(),
            age_mns: number().positive().integer(),
            age_dys: number().positive().integer(),
        }),
        // validate : (values)=>{
        //     const errors = {}
        //     if(!values.firstname){
        //         errors.firstname = "Required"
        //     }
        //     if(!values.lastname){
        //         errors.lastname = "Required"
        //     }
        //     if(!values.mobileno){
        //         errors.mobileno = "Required"
        //     }
        //     return errors
        // },
        validateOnChange : true,
        onSubmit : (values)=>{
            setActiveStep((prev)=>(prev+1))
        }
    })


    return (
        <div>
            {isRegistering ? 
                <>
                    {/* View when registering patients as isRegistering = true */}
                    <Stepper activeStep={activeStep} sx={{m:1, p:1, marginBottom:2}}>
                        {steps.map((value, index)=>{
                            return (<Step key={value}>
                                        <StepLabel>{value}</StepLabel>
                                    </Step>)
                        })}
                    </Stepper>
                    {activeStep===0 ? 
                            <PatientRegForm curEvents={curEvents} setCurEvents={setCurEvents} formik={formik} isRegistering={isRegistering} setIsRegistering={setIsRegistering} 
                                events={events} setEvents={setEvents} 
                                listSelectedServices={listSelectedServices} setListSelectedServices={setListSelectedServices}/>
                        : activeStep ===1 ?
                            <PatientRegUploader/>
                        : <PatientRegPayment listSelectedServices={listSelectedServices} />
                    }
                    <Stack direction={'row-reverse'} spacing={3} p={2} sx={{justifyContent:'center'}}>
                        <Button variant='contained' onClick={(event)=>{
                            if(activeStep===0){
                                formik.handleSubmit(event)
                            }else{
                                setActiveStep((prev)=>(prev+1))
                            }
                            if((activeStep+1)===steps.length){
                                handleEventSaveExit()
                            }
                        }}>{(activeStep+1)===steps.length ? "Finish" : "Next"}</Button>
                        
                        <Button variant="contained" onClick={(event)=>{
                            //figure out to save events
                            //also to keep information for the back button
                        }}>{"Save & Exit"}</Button>

                        <Button variant='contained' onClick={()=>{
                                if(activeStep===0){
                                    setIsRegistering(false)
                                    setListSelectedServices([])
                                    return
                                }else{
                                    setActiveStep((prev)=>(prev-1))
                                }
                            }}>Back</Button>
                    </Stack>
                </> :
                isDetailViewing ?
                <>
                    {/* for Detail Viewing */}
                </>:
                <SchedulerFront events={events} setIsRegistering={setIsRegistering} setCurEvents={setCurEvents}/>}
        </div>
    )
}