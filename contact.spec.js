import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import ContactsSection from "../../pageObject/ContactsSection";

const baseUrl = "https://localhost:3000/";

// eslint-disable-next-line no-unused-vars
let bls = [], socketServer;
const navigation = new Navigation();
const contactsSection = new ContactsSection();

describe("Contacts", function () {
  let bls,
    products = [],
    socketServer;
    const baseUrl = "https://localhost:3000/";
    const navigation = new Navigation();
    const contactsSection = new ContactsSection();
  beforeEach(() => {
    cy.server();

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

  it("saving contact without the mandatory fields", function () {
      initialStepAfterLogin();
      navigation.getBrandsButton().click();
      navigation.getAddRowButton().click();
      contactsSection.getSelectContactsButton().click();
      contactsSection.getAddContactsButton().click();
      contactsSection.getSaveButton().click();
      navigation.getBladeError().should('have.text',"Save cannot be performed. There are one or more invalid inputs. Please check the inputs");
      cy.get("#contacts-name-error").should('have.text',"Please enter the Contact name");
      cy.get("#contacts-email-error").should('have.text',"Please enter the Contact email");
      contactsSection.getCancelButton().click();
      navigation.getBladeCloseButton().click();
    });  
});