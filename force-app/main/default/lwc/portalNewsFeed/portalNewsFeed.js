import { LightningElement, wire, track } from 'lwc';
import getLatestNews from '@salesforce/apex/PortalNewsController.getLatestNews';
import portalNewsLogo from '@salesforce/resourceUrl/PortalNewsLogo';
import legalNewsIcon from '@salesforce/resourceUrl/LegalNewsIcon';

export default class PortalNewsFeed extends LightningElement {
    @track newsItems; // Holds the fetched news items
    @track error; // Holds any errors that occur during data fetching
    @track noNewsItems = false; // Indicates whether there are no news items
    portalNewsLogo = portalNewsLogo; // Logo for the portal news
    legalNewsIcon = legalNewsIcon; // Icon for legal news
    currentDate; // Current date to be displayed in the header

    // Lifecycle hook that runs when the component is inserted into the DOM
    connectedCallback() {
        this.currentDate = this.formatDate(new Date());
    }

    // Wire method to fetch the latest news items from the Apex controller
    @wire(getLatestNews)
    wiredNews({ error, data }) {
        if (data) {
            if (data.length === 0) {
                this.noNewsItems = true;
            } else {
                this.newsItems = data.map(item => {
                    return {
                        ...item,
                        timeAgo: this.calculateTimeAgo(new Date(item.CreatedDate))
                    };
                });
                this.noNewsItems = false;
            }
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.newsItems = undefined;
            this.noNewsItems = false;
        }
    }

    // Lifecycle hook that runs when the component has rendered
    renderedCallback() {
        // Populate rich text content
        if (this.newsItems && this.newsItems.length > 0) {
            this.newsItems.forEach(item => {
                const element = this.template.querySelector(`.rich-text-content[data-id="${item.Id}"]`);
                if (element) {
                    element.innerHTML = item.Rich_Text_Content__c;
                }
            });
        }
    }

    // Method to format the date in a readable format
    formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Method to calculate how long ago a date was
    calculateTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) {
            return interval + ' years ago';
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + ' months ago';
        }
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval + (interval === 1 ? ' day ago' : ' days ago');
        }
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval + (interval === 1 ? ' hour ago' : ' hours ago');
        }
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval + (interval === 1 ? ' minute ago' : ' minutes ago');
        }
        return Math.floor(seconds) + ' seconds ago';
    }

    // Event handler for "See Case" button
    handleGoToCase(event) {
        const caseId = event.target.dataset.caseId;
        if (caseId) {
            window.open(`/lightning/r/Case/${caseId}/view`, '_blank');
        }
    }
}

