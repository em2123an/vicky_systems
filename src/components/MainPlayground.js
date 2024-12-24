import {useState} from "react"
import SchedulerFront from "./SchedulerFront"
import PatientRegForm from "./PatientRegForm"
import {Step, StepLabel, Stepper, Button, Stack} from "@mui/material"
import PatientRegUploader from "./PatientRegUploader"

export default function MainPlayground(){
    const [isRegistering, setIsRegistering] = useState(null)
    const [events, setEvents] = useState([])
    const [activeStep, setActiveStep] = useState(0)
    const steps =['Booking Information', 'Necessary Documents', 'Payment Details']
    
    
    return (
        <div>
            {isRegistering ? 
                <>
                    <Stepper activeStep={activeStep}>
                        {steps.map((value, index)=>{
                            return (<Step key={value}>
                                        <StepLabel>{value}</StepLabel>
                                    </Step>)
                        })}
                    </Stepper>
                    {activeStep===0 ? 
                        <PatientRegForm isRegistering={isRegistering} setIsRegistering={setIsRegistering} events={events} setEvents={setEvents}/>
                        : activeStep ===1 ?
                        <Stack><PatientRegUploader/></Stack>
                        : <Stack><Button>Payment</Button></Stack>
                    }
                    <Stack direction={'row'} spacing={3} p={2}>
                        <Button variant='contained' disabled={activeStep===0} onClick={()=>{
                                setActiveStep((prev)=>(prev-1))
                            }}>Back</Button>
                        <Button variant='contained' onClick={()=>{
                                setActiveStep((prev)=>(prev+1))
                            }}>{(activeStep+1)===steps.length ? "Finish" : "Next"}</Button>
                    </Stack>
                </> : 
                <SchedulerFront events={events} setEvents={setEvents} isRegistering={isRegistering} setIsRegistering={setIsRegistering}/>}
        </div>
    )
}