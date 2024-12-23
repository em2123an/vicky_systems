import React from "react"
import SchedulerFront from "./SchedulerFront"
import PatientRegForm from "./PatientRegForm"

export default function MainPlayground(){
    const [isRegistering, setIsRegistering] = React.useState(null)
    const [events, setEvents] = React.useState([])
    return (
        <div>
            {isRegistering ? <PatientRegForm isRegistering={isRegistering} setIsRegistering={setIsRegistering} events={events} setEvents={setEvents}/> : 
                <SchedulerFront events={events} setEvents={setEvents} isRegistering={isRegistering} setIsRegistering={setIsRegistering}/>}
        </div>
    )
}