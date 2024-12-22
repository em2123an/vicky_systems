import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
//import bootstrap5Plugin from '@fullcalendar/bootstrap5'
//import bootstrapPlugin from '@fullcalendar/bootstrap'
//import 'bootstrap/dist/css/bootstrap.css';
//import 'bootstrap-icons/font/bootstrap-icons.css';
//import 'bootstrap/dist/css/bootstrap.css';
//import '@fortawesome/fontawesome-free/css/all.css';
import React from 'react'
import PatientRegForm from './PatientRegForm'

export default function ScheduleCal({isRegistering, setIsRegistering}){
    const [events, setEvents] = React.useState([])
    
    function handleClick(info, title){
        setEvents((prev)=>([...prev,{
            start: info.startStr,
            end : info.endStr,
            title : `Appointment: ${title}`
        }]))
        setIsRegistering(true)
    }

    return <FullCalendar height={'100vh'}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin, listPlugin]}
        initialView='Day'
        //themeSystem='bootstrap'
        //themeSystem='bootstrap5'
        allDaySlot={false}
        weekends = {true}
        views={{
            Day : {
                type : 'timeGrid',
                slotDuration : {
                    minutes : 20
                }
            },
        }}
        buttonText={{
            'today':'Today',
            'week' : 'Week',
            'list': 'Show All'
        }}
        headerToolbar = {{
            left : 'list',
            //center : 'title',
            right : 'Day,timeGridWeek,today,prev,next'
        }}
        events = {events}
        selectable = {true}
        select={(info)=>{
            var title = prompt('Give me a title')
            if (title != null){
                handleClick(info, title)
            }
        }}
    />
}