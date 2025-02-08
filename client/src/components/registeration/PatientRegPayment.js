import { useState } from "react";
import BookingPaymentCor from "./BookingPaymentCor";
import { Table, Box, Autocomplete, Stack, TextField, Typography, InputAdornment, Button, Dialog, DialogTitle, DialogActions, DialogContent, FormControl, Radio, FormLabel, RadioGroup, FormControlLabel, TableContainer, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

export default function PatientRegPayment({listSelectedServices, discounters=[],
        setDiscountRecords=()=>{},discountRecords=[],setPaymentRecords=()=>{},paymentRecords=[]}){
    const [discounter, setDiscounter] = useState(null)
    const [discountPercent, setDiscountPercent] = useState(0)
    const [openPaymentDialog,setOpenPaymentDialog] = useState(false)
    const [paymentOption, setPaymentOption] = useState('CASH')
    const [remark, setRemark] = useState()
    const [amount, setAmount] = useState(null)
    const [checkedServiceList, setCheckedServiceList] = useState([])
    
    
    function handleClosePaymentDialog(){
        setOpenPaymentDialog(false)
        setAmount(null)
        setRemark(null)
        setPaymentOption(null)
    }

    function handleSavePayment(){
        setPaymentRecords((prev)=>([...prev,{
            paymenttype : paymentOption,
            paymentamount : amount,
            paymentremark : remark
        }]))
        handleClosePaymentDialog()
    }

    return <Stack direction={'column'}>
        <Stack direction={'column'} paddingX={2}>
            <Typography variant="h6" textAlign={'start'}>Charge Details</Typography>
            <BookingPaymentCor isMiniTable={false} listSelectedServices={listSelectedServices} discountRecords={discountRecords} checkedServiceList={checkedServiceList} setCheckedServiceList={setCheckedServiceList}/>
        </Stack>
        <Stack direction={'column'} p={2}>
            <Typography variant="h6" textAlign={'start'}>Discounts</Typography>
            <Stack direction={'row'} spacing={2} p={2}>
                <Autocomplete
                    value={discounter}
                    onChange={(event,newvalue)=>{
                            setDiscounter(newvalue)
                        }}
                    id="discounters_choice"
                    options={discounters}
                    getOptionLabel={(discounter)=>(`${discounter.firstname} ${discounter.lastname}`)}
                    renderInput={(params)=><TextField {...params} label={'Discounted by:'} sx={{minWidth:'200px'}} slotProps={{inputLabel:{shrink:true},}}/>}
                />
                <TextField variant="outlined" label="Discount Percentage" name="discountpercent" sx={{width:'150px'}}
                    slotProps={{inputLabel:{shrink:true}, input:{endAdornment:<InputAdornment position="end">%</InputAdornment>}}}
                    disabled = {discounter === null }
                    value={discountPercent} onChange={(event)=>{
                        var reg = new RegExp('^[0-9]*$')
                        var value = event.target.value
                        if(reg.test(value)){
                            if(value<=100){
                                return setDiscountPercent(value)
                            }
                        }}} />
                <Button variant="outlined" disabled={discounter==null || !Boolean(checkedServiceList)} 
                    onClick={()=>{
                        var newRecord =[]
                        var oldRecord = [...discountRecords]
                        checkedServiceList.forEach((checkedService)=>{
                            var recordExcCur = oldRecord.filter((oldRecord)=>!(oldRecord.service.serviceid===checkedService.serviceid))
                            newRecord = [...recordExcCur, {
                                discounter: discounter,
                                discountPercent: discountPercent,
                                service: checkedService
                            }]
                            oldRecord = [...newRecord]
                        })
                        setDiscountRecords([...newRecord])
                    }                           
                }>Add Discount</Button>
            </Stack>
            {/* lists all discounts */}
            {discountRecords.length!==0 && <TableContainer>
                <Table size="small" sx={{width:'90%'}}>
                    <TableHead>
                        <TableRow>
                            <TableCell/>
                            <TableCell>Discounter</TableCell>
                            <TableCell>Discount Percent</TableCell>
                            <TableCell>Discounted Service</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {discountRecords.map((disc,index)=>(
                            <TableRow>
                                <TableCell>{index+1}</TableCell>
                                <TableCell>{`${disc.discounter.firstname} ${disc.discounter.lastname}`}</TableCell>
                                <TableCell>{disc.discountPercent}</TableCell>
                                <TableCell>{disc.service.servicename}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>}
        </Stack>
        {/* Create payment dialog for saving a payment */}
        <Button variant="contained" sx={{alignSelf:'center'}} onClick={()=>{setOpenPaymentDialog(true)}}>Create Payment</Button>
        {paymentRecords.length !== 0 && 
            <Box p={2}> 
                <Typography variant="h6" textAlign={'start'}>Payment Details</Typography>
                <TableContainer>
                    <Table sx={{width:'90%'}}>
                        <TableHead>
                            <TableRow>
                                <TableCell/>
                                <TableCell>Amount</TableCell>
                                <TableCell>Recorded by</TableCell>
                                <TableCell>Remark</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paymentRecords.map((payment,index)=>{
                                return <TableRow key={index}>
                                    <TableCell>{index+1}</TableCell>
                                    <TableCell>{`${payment.paymenttype} - ${payment.paymentamount}`}</TableCell>
                                    <TableCell/>
                                    <TableCell>{payment.paymentremark}</TableCell>
                                </TableRow>
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        }
        <Dialog
            open={openPaymentDialog}
            onClose={handleClosePaymentDialog}
        >
            <DialogTitle>Payment Information</DialogTitle>
            <DialogContent>
                <Stack direction={'column'} spacing={2}>
                    <FormControl>
                        <FormLabel>Select Payment Option</FormLabel>
                        <RadioGroup
                            name="paymentoption"
                            row
                            value={paymentOption}
                            onChange={(event)=>{setPaymentOption(event.target.value)}}
                        >
                            <FormControlLabel label='Cash' value='CASH' control={<Radio/>}/>
                            <FormControlLabel label='Credit' value='CREDIT' control={<Radio/>}/>
                            <FormControlLabel label='Mobile Banking' value='MOBILEBANKING' control={<Radio/>}/>
                            <FormControlLabel label='Card (POS)' value='CARD' control={<Radio/>}/>
                        </RadioGroup>
                    </FormControl>
                    <Stack direction={'row'} spacing={2}>
                        <TextField label="Amount"  variant="outlined" value={amount} onBeforeInput={(event)=>{
                            var reg = new RegExp('^[0-9]*$')
                            if(reg.test(event.target.value)){
                                return setAmount(event.target.value)
                            }
                        }} onChange={(event)=>{
                            var reg = new RegExp('^[0-9]*$')
                            if(reg.test(event.target.value)){
                                return setAmount(event.target.value)
                            }}} />
                        <TextField label="Remark" variant="outlined" value={remark} onChange={(event)=>{setRemark(event.target.value)}}/>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleSavePayment}>Save</Button>
                <Button variant="contained" onClick={handleClosePaymentDialog}>Cancel</Button>
            </DialogActions>
        </Dialog>
    </Stack>
}