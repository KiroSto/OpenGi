import 'cypress-localstorage-commands'
import { CreatePolicy } from '../../../helpers/create-policy'
import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { callAmendDates } from '../call-amend-dates'
import { paymentSummaryRenewals } from '../payment-summary'
import { checkDiaryVisibilityCounter } from '../record-summary'
import {
  correspondenceTabsAndBack,
  viewPolicyHistoryAndBack,
  fromRecordSummaryToViewClientTabsAndBack
} from '../back-navigation'
import {
  checkTotalActiveGWP,
  checkTotalOutstandingBalance
} from '../view-client'
require('cypress-xpath')
describe('Renewal Premium Invited', () => {
  let sessionToken
  let riskDataGlobal
  let balanceTransactions

  before(() => {
    setupSeeder('quoted').then(({ token, brandName, riskData }) => {
      sessionToken = token
      riskDataGlobal = riskData
    })
  })

  // after(() => {
  //   tearDownSeeder()
  // })
  it('should be able to create and search for the policy, and then renew it', () => {
    // create policy with API
    // TODO: Uncomment the for cycle and change in between the brackets to "temporaryMTA(riskDataArray[i])" when we have schemes for all lobs
    // for (let i = 0; i < riskDataArray.length; i++) {
      renewalsPI(riskDataGlobal)
    // }
  })
    const renewalsPI = (riskData) => {
      // create policy with API
      CreatePolicy(sessionToken, riskData, 1, false, ({
        res
      }) => {
        const policyDetailsId = res.body.PolicyDetailsId
        // search and view created policy
        cy.visit("/");
        cy.get("[id=client-search-txt]").clear()
          .type(res.body.PolicyNumber)
          .type("{enter}");
        cy.get("#name-row-0").click();
        cy.get("#policy-start-date-row-0").click();
        cy.get("#ViewPolicy").click();
        //Initialize Renewal
        cy.get("#renewalActionMenuId").click({
          force: true,
        });
        cy.waitForSpinnerToDisappear();
        cy.get("#inviteRenewalId").click({ force: true });
        const user = JSON.parse(sessionStorage.getItem("USER"));
        callAmendDates({
          accessToken: user.access_token,
          policyDetailsId,
          interval: "month",
          period: -11,
          includeClientData: true,
        });
        cy.waitForSpinnerToDisappear();
        //Accept renewal
        cy.get("#continue-renewal-invite").click({ force: true });
        cy.get("#AcceptPremiumInvited").click();
        cy.get('[id="continue-btn"]').click({ force: true });
        paymentSummaryRenewals(false);
        fromRecordSummaryToViewClientTabsAndBack();
        checkDiaryVisibilityCounter();

        //fromRecordSummaryToViewClientAddClientConnectionGoToClientAndBack()
     // viewPolicyHistoryAndBack()
     // correspondenceTabsAndBack()
      // Navigate to Transactions -> Summary and get the Total Outstanding Balance

        //viewPolicyHistoryAndBack()
        //viewOtherTabsInMoreDetailsAndBack()
        //transactionTabsAndBack()
        //correspondenceTabsAndBack()
        //viewPolicyTabsAndBack()
        //Navigate to Transactions -> Summary and get the Total Outstanding Balance
        cy.get("#transactionsActionMenuId").click({ force: true });
        cy.waitForSpinnerToDisappear();
        cy.get("#summaryId").click({ force: true });
        cy.waitForSpinnerToDisappear();
        cy.get('[id="total-outstanding-balance"]')
          .should("be.visible")
          .then(($text) => {
            balanceTransactions = $text.text();
            cy.log(balanceTransactions);
          });
        
        //Search policy and open SCV
        cy.get("[id=client-search-txt]").type("{enter}");
        //cy.get(".datatable-body-row").click();
        cy.get("#ViewClient", { timeout: 40000 }).should("be.visible").click();
        checkTotalActiveGWP()
        checkTotalOutstandingBalance()
        //Get Total Outstanding Balance value in SCV and compare it with Transactions Summary total outstanding balance
        cy.get(
          "#containerID > div > div > app-single-client-view > div > div.col-md-12.ng-star-inserted > summary > div.col-md-3.col-sm-3.col-xs-3.ng-star-inserted > ui-panel:nth-child(1) > div > div > div > div:nth-child(3) > div:nth-child(1) > h2"
        )
          .invoke("text")
          .should((text) => expect(text).to.eq(balanceTransactions));
        //Validate that there is Policy and Renewal Pending statuses
        cy.contains(' Renewal Pending ')
        cy.contains(' Policy ')
      });
    };
  });
