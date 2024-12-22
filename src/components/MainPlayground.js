import React from "react"
import SchedulerFront from "./SchedulerFront"
import PatientRegForm from "./PatientRegForm"

export default function MainPlayground(){
    const [isRegistering, setIsRegistering] = React.useState(false)
    return (
        <div>
            {isRegistering ? <PatientRegForm isRegistering={isRegistering} setIsRegistering={setIsRegistering}/> : 
                <SchedulerFront isRegistering={isRegistering} setIsRegistering={setIsRegistering}/>}
        </div>
    )
}