import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import BrandsScreen from "../../pageObject/BrandsScreen";
import IntroducersScreen from "../../pageObject/IntroducersScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";
import ContactsSection from "../../pageObject/ContactsSection";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();
const introducersScreen = new IntroducersScreen();


describe("Contacts bug scenario", function () {
 // let bls,
    //products = [],
    let socketServer;
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
        //bls = mockServer.setBLsLocalStorage();
        //products = mockServer.setProductsToLocalStorage();
      });
      afterEach(() => {
        socketServer.close();
      });
    it.only("checking the contacts", function () {
        initialStepAfterLogin();
        navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    //brandsScreen.getBrand().type("test");
    //brandsScreen.getEmail().type("test@test.com");
    fillAllInputs();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    contactsSection.getSelectContactsButton().click();   
    contactsSection.getAddContactsButton().click();
    fillAllInputs("#slideoutContainer");  
    contactsSection.getSaveButton().click();
    contactsSection.getAddContactsButton().click();
        cy.get("#contacts-name").type("test1");
        cy.get("#contacts-email").type("test1@test1.com");
        contactsSection.getSaveButton().click();
        contactsSection.getTableTogglesContacts(0,1);
        navigation.getBladeCloseButton().click();
        navigation.getSaveButton().click();
        navigation.getIntroducersButton().click();
        navigation.getAddRowButton().click();
        contactsSection.getSelectContactsButton().click(); 
        contactsSection.getSecondDeleteButton().click();
    //cy.get("#contacts-table-delete-2").click();
    navigation.getLeftButton().click();
    navigation.getBladeCloseButton().click();
});
});