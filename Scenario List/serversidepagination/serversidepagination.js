import { LightningElement, wire, track } from 'lwc';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name'
import ACCOUNT_RATING_FIELD from '@salesforce/schema/Account.Rating'
import ACCOUNT_INDUSTRY_FIELD from '@salesforce/schema/Account.Industry'
import ACCOUNT_PHONE_FIELD from '@salesforce/schema/Account.Phone'
import ACCOUNT_ANNUAL_REVENUE from '@salesforce/schema/Account.AnnualRevenue'
import getAccountBasedOnPageNumber from '@salesforce/apex/AccountBasicDatatableController.getAccountsBasedOnPageNumber'
const COLUMNS = [
    { label: 'Name', fieldName: ACCOUNT_NAME_FIELD.fieldApiName, type: 'text' },
    { label: 'Rating', fieldName: ACCOUNT_RATING_FIELD.fieldApiName, type: ' text' },
    { label: 'Industry', fieldName: ACCOUNT_INDUSTRY_FIELD.fieldApiName, type: 'text' },
    { label: 'Phone', fieldName: ACCOUNT_PHONE_FIELD.fieldApiName, type: 'phone' },
    { label: 'Annual Revenue', fieldName: ACCOUNT_ANNUAL_REVENUE.fieldApiName, type: 'currency' }
]

export default class Serversidepagination extends LightningElement {
    columns = COLUMNS;
    rowOffset = 0;
    data;

    // Pagination Variables
    pageNumber = 1;
    pageSize = 20;
    totalItemCount

    // New Track property for search key
    @track searchKey = '';

    @wire(getAccountBasedOnPageNumber, { pageSize: '$pageSize', pageNumber: '$pageNumber', searchKey: '$searchKey' })
    accountData(result) {
        if (result.data) {
            this.data = result.data.records;
            this.totalItemCount = result.data.totalItemCount;
        }
        else if (result.error) {
            console.log('error in wire : ', result.error)
        }
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.rowOffset = (this.pageNumber - 1) * this.pageSize;
    }

    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.rowOffset = (this.pageNumber - 1) * this.pageSize
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value;
    }
}
