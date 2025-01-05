import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

export default function BookingPaymentCor({isDiscounterOn, discountPercent=0, listSelectedServices}){
    
    function invoiceSubTotal(){
        return listSelectedServices.reduce((accumulater, curr)=>accumulater + parseFloat(curr.price),0)
    }

    function discounter(percent){
        return (invoiceSubTotal() * (percent/100))
    }

    function invoiceTotal(){
        if(!isDiscounterOn) return invoiceSubTotal()
        return invoiceSubTotal() - discounter(discountPercent)
    }


    return <>
        {listSelectedServices.length !==0 && <TableContainer sx={{marginY:1}}>
                    <Table sx={isDiscounterOn && {width:'90%'}} size={isDiscounterOn && 'small'}>
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={2}>List of Services</TableCell>
                                <TableCell>Price</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listSelectedServices.map((value)=>{
                                return <TableRow key={value.title}>
                                    <TableCell colSpan={2}>{value.title}</TableCell>
                                    <TableCell>{value.price}</TableCell>
                                </TableRow>
                            })}
                            {isDiscounterOn &&
                                <>
                                    <TableRow>
                                        <TableCell />
                                        <TableCell align="right">Subtotal</TableCell>
                                        <TableCell>{invoiceSubTotal()}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell />
                                        <TableCell align="right">Discount</TableCell>
                                        <TableCell>{discounter(discountPercent)}</TableCell>
                                    </TableRow>
                                </>
                            }
                            <TableRow>
                                <TableCell />
                                <TableCell align="right">Total</TableCell>
                                <TableCell>{invoiceTotal()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>}
    </>
}