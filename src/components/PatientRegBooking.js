import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import {useState} from "react";
import BookingPaymentCor from "./BookingPaymentCor";

export default function PatientRegBooking({listSelectedServices,setListSelectedServices}){
    //const [selectedService, setSelectedService] = useState(null)
    
    

    var MRISERVICEOPTIONS = [
        {title:'Cervical MRI', price:'7800', side: false},
        {title:'Thorasic MRI', price:'7800', side: false},
        {title:'Lumbar MRI', price:'7800', side: false},
        {title:'Brain MRI', price:'7800', side: false},
        {title:'Neck MRI', price:'7400', side: false},
        {title:'Pelvic MRI', price:'8800', side: false},
        {title:'Abdomen MRI', price:'8800', side: false},
        {title:'Abdominopelvic MRI', price:'11800', side: false},
        {title:'Hip MRI', price:'7300', side: true},
        {title:'Knee MRI', price:'7300', side: true},
        {title:'Thigh MRI', price:'7300', side: true},
        {title:'Ankle MRI', price:'7300', side: true},
        {title:'Leg MRI', price:'7300', side: true},
        {title:'Shoulder MRI', price:'7300', side: true},
        {title:'Elbow MRI', price:'7300', side: true},
        {title:'Wrist MRI', price:'7300', side: true},
    ]

    function optionGen(services,selectedToBeNotIncluded){
        var fullservices = services.flatMap((value)=>{
            if(value.side){
                return [{...value,title:`Right ${value.title}`},{...value,title:`Left ${value.title}`}]
                }
            return value
            })
        if(selectedToBeNotIncluded.length === 0){return fullservices}
        else{
            return fullservices.filter((service)=>{
                var filt = true
                selectedToBeNotIncluded.forEach(element => {
                    if(element.title === service.title){filt = false}
                });
                return filt
            })
        }
    }

    return (
        <Box sx={{display:'flex', flexDirection:'column', alignItems:'flex-start', width:'fit-content', padding:'24px', border:1, borderRadius:'8px'}}>
            <Typography variant="h5" textAlign={'start'} sx={{marginBottom:1}}>Booking Details</Typography>
                {listSelectedServices.length !==0 && <BookingPaymentCor isDiscounterOn={false} listSelectedServices={listSelectedServices}/>}
            <Autocomplete multiple id="select_service" sx={{marginY:1}}
                options={optionGen(MRISERVICEOPTIONS,listSelectedServices)}
                getOptionLabel={(option)=>option.title}
                value={listSelectedServices}
                onChange={(e,newValue,)=>{        
                    setListSelectedServices(()=>([...newValue]))
                        }}
                renderInput={(params)=>(
                                <TextField sx={{width:'500px'}} {...params} label="Select Service"/>
                        )}
                />
        </Box>        
    )
}