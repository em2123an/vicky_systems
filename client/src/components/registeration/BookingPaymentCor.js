import { styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF, gridClasses } from "@mui/x-data-grid";
import { useState } from "react";

export default function BookingPaymentCor({isDiscounterOn, isTableMode=true,discountPercent=0, listSelectedServices}){
    const [checkedServiceList, setCheckedServiceList] = useState([])
    const baseColumnOptions = {
        sortable: false,
        pinnable: false,
        hideable: false
    }
    const hiddenFields = [GRID_CHECKBOX_SELECTION_COL_DEF.field]
    const getTogglableColumns = (columns)=>{
        console.log(GRID_CHECKBOX_SELECTION_COL_DEF.field)
        return columns
        .filter((column)=>!(hiddenFields.includes(column.field)))
        .map((column)=>column.field)
    }
    
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

    if(!(isTableMode)){
        return <>{listSelectedServices.length!==0 &&
            <DataGrid
                columns={[
                    {field:'servicename', 
                        headerName:'Service Lists', 
                        flex:2,
                        ...baseColumnOptions,
                        valueGetter : (value,row)=>{
                            if(row.serviceid==='subtotal' || row.serviceid==='discount' || row.serviceid==='total'){
                                return row.label
                            }
                            return value
                        },
                    },
                    {field:'price', 
                        headerName:'Price', 
                        flex:1,
                        ...baseColumnOptions,
                        valueGetter : (value,row)=>{
                            if(row.serviceid==='subtotal' || row.serviceid==='discount' || row.serviceid==='total'){
                                return row.value
                            }
                            return value
                        }
                    }
                ]}
                rows={[...listSelectedServices,
                    {serviceid:'subtotal', label:'Subtotal', value: invoiceSubTotal()},
                    {serviceid:'discount', label:'Discount', value: discounter(discountPercent)},
                    {serviceid:'total', label:'Total', value: invoiceTotal()}
                ]}
                getRowId={(service)=>(service.serviceid)}
                getCellClassName={(params)=>{
                    if(params.field==='servicename' && (params.value==='Subtotal'||params.value==='Discount'||params.value==='Total')){
                        return 'rightalign'
                    } return ''
                }}
                isRowSelectable={(params)=>!(params.row.serviceid==='subtotal'|| params.row.serviceid==='discount' || params.row.serviceid==='total')}
                checkboxSelection
                slotProps={{
                    columnsManagement:{getTogglableColumns,}
                }}
                hideFooter
                disableColumnFilter
                sx={isDiscounterOn ? 
                    {
                        width:'90%',
                        [`.${gridClasses.cell}.normalalign`]:{textAlign:'left'},
                        [`.${gridClasses.cell}.rightalign`]: {textAlign:'right'}
                    } :
                    {
                        [`.${gridClasses.cell}.normalalign`]:{textAlign:'left'},
                        [`.${gridClasses.cell}.rightalign`]: {textAlign:'right'}
                    }}
                autosizeOptions={{
                    columns:['servicename','price'],
                    includeHeaders: false,
                    includeOutliers: true
                }}
            />
        }
        </>
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
                            {listSelectedServices.map((value, index)=>{
                                return <TableRow key={value.servicename}>
                                    <TableCell colSpan={2}>{value.servicename}</TableCell>
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