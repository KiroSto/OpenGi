import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import { fillAllInputs } from "../../utils/fillOutAllFields";
import Navigation from "../../pageObject/Navigation";
import ContactsSection from "../../pageObject/ContactsSection";

describe("Deleting contact test", function () {
  let bls,
  products = [],
  socketServer;
  const baseUrl = "https://localhost:3000/";
  const navigation = new Navigation();
  const contactsSection = new ContactsSection();

    beforeEach(() => {
        cy.server();
        
        cy.route(mockServer.postBrokerDetailsDelayed);
        cy.route(mockServer.getEmptyBroker);
        cy.route(mockServer.putBroker);
        cy.route(mockServer.getProductsList);
        cy.route(mockServer.getBusinessLinesList);
        cy.route(mockServer.getAccessLevelsList);
        cy.route(mockServer.getSingleConnectedUser);
        cy.route(mockServer.getSocketPolling);
    
        cy.visit(baseUrl, {
            onBeforeLoad(win) {
              cy.stub(win, "WebSocket", (url) => {
                return (socketServer = new MockSocket.WebSocket(url));
              });
            },
          });
        bls = mockServer.setBLsLocalStorage();
        products = mockServer.setProductsToLocalStorage();
    });
    afterEach(() => {
        socketServer.close();
      });

    it("deleting contact", function () {
        initialStepAfterLogin();
        navigation.getBrandsButton().click();
        navigation.getAddRowButton().click();
        contactsSection.getSelectContactsButton().click();   
        contactsSection.getAddContactsButton().click();
        fillAllInputs("#slideoutContainer");  
        contactsSection.getSaveButton().click();
        contactsSection.getFirstDeleteButton().click();
        //cy.get("#contacts-table-delete-1").click();
        navigation.getPopupTitle().should('have.text',"Are you sure you want to delete this Contact?");
        navigation
      .getPopupParagraph().should('have.text',"WARNING: If you click yes, this Contact will be deleted for any brand, agent or introducer it might be assigned to");
      navigation.getRightButton().click();
      navigation.getBladeCloseButton().click();
    });  
});