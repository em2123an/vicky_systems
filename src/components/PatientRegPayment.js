import { useState } from "react";
import BookingPaymentCor from "./BookingPaymentCor";

export default function PatientRegPayment({listSelectedServices}){
    const [discountPercent, setDiscountPercent] = useState(0)
    return <>
        <BookingPaymentCor isDiscounterOn={true} discountPercent={discountPercent} listSelectedServices={listSelectedServices}/>
    </>
}