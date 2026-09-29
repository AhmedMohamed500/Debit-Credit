import type {Words} from '@/lib/campaign/model';

type SupplierLine={id:'desks'|'chairs';description:Words;quantity:number;unitPrice:number};

/** Introductory net-amount case. VAT and freight are not charged on this source file. */
export const supplierInvoiceWork={
 supplier:'Alpha Supplies',
 invoiceNumber:'INV-1048',purchaseOrderNumber:'PO-771',goodsReceiptNumber:'GRN-771',
 date:'12 Mar 2024',paymentDays:30,vatAmount:0,freightAmount:0,
 lines:[
  {id:'desks',description:{en:'Office desks',ar:'مكاتب إدارية'},quantity:3,unitPrice:30000},
  {id:'chairs',description:{en:'Office chairs',ar:'كراسي مكتبية'},quantity:5,unitPrice:2000},
 ] satisfies SupplierLine[],
 received:{desks:3,chairs:5},
} as const;

export const supplierSubtotal=()=>supplierInvoiceWork.lines.reduce((sum,line)=>sum+line.quantity*line.unitPrice,0);
export const supplierTotal=()=>supplierSubtotal()+supplierInvoiceWork.vatAmount+supplierInvoiceWork.freightAmount;
export const supplierQuantityMatched=()=>supplierInvoiceWork.lines.every(line=>supplierInvoiceWork.received[line.id]===line.quantity);
export const supplierInvoiceValid=()=>supplierSubtotal()===100000&&supplierTotal()===100000&&supplierQuantityMatched();
