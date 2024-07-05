public with sharing class PortalNewsController {
    @AuraEnabled(cacheable=true)
    public static List<PortalNews__c> getLatestNews() {
        return [SELECT Id, Title__c, Rich_Text_Content__c, CreatedDate, PortalNewsUrl__c, Category__c, Related_Case__c FROM PortalNews__c ORDER BY CreatedDate DESC];
    }
}

