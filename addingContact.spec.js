import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import { fillAllInputs } from "../../utils/fillOutAllFields";
import Navigation from "../../pageObject/Navigation";
import ContactsSection from "../../pageObject/ContactsSection";

describe("Adding contact test", function () {
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

    it("saving contact with the mandatory fields", function () {
        initialStepAfterLogin();
        navigation.getBrandsButton().click();
        navigation.getAddRowButton().click();
        contactsSection.getSelectContactsButton().click();   
        contactsSection.getAddContactsButton().click();
        fillAllInputs("#slideoutContainer");  
        contactsSection.getSaveButton().click();
        contactsSection.getTableTogglesContacts(0,0);
        navigation.getBladeCloseButton().click();
    });  
});