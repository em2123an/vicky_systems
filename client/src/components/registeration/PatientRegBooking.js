import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import BookingPaymentCor from "./BookingPaymentCor";

export default function PatientRegBooking({serviceList, listSelectedServices,setListSelectedServices}){
    //const [selectedService, setSelectedService] = useState(null)    
    
    
    function optionGen(fullservices,selectedToBeNotIncluded){
        if(selectedToBeNotIncluded.length === 0){return fullservices}
        else{
            return fullservices.filter((service)=>{
                var filt = true
                selectedToBeNotIncluded.forEach(element => {
                    if(element.servicename === service.servicename){filt = false}
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
                options={optionGen(serviceList,listSelectedServices)}
                getOptionLabel={(option)=>option.servicename}
                value={listSelectedServices}
                onChange={(e,newValue,)=>{        
                    setListSelectedServices(()=>([...newValue]))
                        }}
                renderInput={(params)=>(
                                <TextField {...params} sx={{width:'500px'}} label="Select Service"/>
                        )}
                />
        </Box>        
    )
}