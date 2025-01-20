import { LightningElement, track, wire } from 'lwc';
import retrieveContactData from '@salesforce/apex/lwcAppExampleApex.retrieveContactData';
import updateContactData from '@salesforce/apex/lwcAppExampleApex.updateContactData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';

const actions = [
    { label: 'View', name: 'view' }
];

const columns = [
    { label: 'First Name', fieldName: 'FirstName', editable: true },
    { label: 'Last Name', fieldName: 'LastName', editable: true },
    { label: 'Email', fieldName: 'Email', type: 'email', editable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
    { label: 'Account Name', fieldName: 'Account.Name', editable: true },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class Dt_AccContact_with_inline extends NavigationMixin(LightningElement) {
    columns = columns;
    @track currentAccountName;
    @track searchAccountName;
    @track records;
    @track dataNotFound;
    @track draftValues = [];

    wiredContactsResult;

    handleChangeAccName(event) {
        this.currentAccountName = event.target.value;
    }

    handleAccountSearch() {
        this.searchAccountName = this.currentAccountName;
    }

    @wire(retrieveContactData, { keySearch: '$searchAccountName' })
    wireRecord(result) {
        this.wiredContactsResult = result;
        const { data, error } = result;
        if (data) {
            this.records = data;
            this.error = undefined;
            this.dataNotFound = '';

            if (this.records.length === 0) {
                this.dataNotFound = 'There is no Contact found related to Account name';
            }
        } else {
            this.error = error;
            this.data = undefined;
        }
    }

    handleSave() {
        const updatedFields = this.draftValues;

        // Call Apex method to update the records in Salesforce
        updateContactData({ contacts: updatedFields })
            .then(() => {
                this.showToast('Success', 'Contacts updated successfully', 'success');

                // Clear draft values
                this.draftValues = [];

                // Refresh the datatable
                return refreshApex(this.wiredContactsResult);
            })
            .catch(error => {
                this.showToast('Error updating or refreshing records', error.body.message, 'error');
            });
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'Contact',
                        actionName: 'view'
                    },
                });
                break;
            default:
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}
