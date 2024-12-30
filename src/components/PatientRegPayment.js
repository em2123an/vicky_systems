import { useState } from "react";
import BookingPaymentCor from "./BookingPaymentCor";
import { Autocomplete, Stack, TextField, Typography, InputAdornment } from "@mui/material";

export default function PatientRegPayment({listSelectedServices}){
    const [discountPercent, setDiscountPercent] = useState(0)
    const [discounter, setDiscounter] = useState(null)
    const DISCOUNTERS = ['Dr. 111', 'Owner']
    return <>
        <BookingPaymentCor isDiscounterOn={true} discountPercent={discountPercent} listSelectedServices={listSelectedServices}/>
        <Stack direction={'row'}>
            <Typography variant="h4">Discounts</Typography>
            <Stack direction={'column'}>
                <Autocomplete
                    value={discounter}
                    onChange={(event,newvalue)=>{
                            setDiscounter(newvalue)
                        }}
                    id="discounters_choice"
                    options={DISCOUNTERS}
                    renderInput={(params)=><TextField {...params} label={'Discounted by:'}/>}
                />
                <TextField variant="outlined" label="Discount Percentage" name="discountpercent" size="small" sx={{width:'150px'}}
                    slotProps={{input:{endAdornment:<InputAdornment position="end">%</InputAdornment>}}}
                    value={discountPercent} onChange={(event)=>{setDiscountPercent(event.target.value)}} />
            </Stack>
        </Stack>

    </>
}