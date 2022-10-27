import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import { fillAllInputs } from "../../utils/fillOutAllFields";

describe("Mobius users test", function () {
  let socketServer;
  const baseUrl = "https://localhost:3000/";
  const navigation = new Navigation();

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
    });
    afterEach(() => {
        socketServer.close();
      });

    it("saving mobius user without the mandatory fields", function () {
        initialStepAfterLogin();
        navigation.getMobiusUsersButton().click();
        navigation.getAddRowButton().click();
        cy.get("#accessLevel").select("Administrator");
        fillAllInputs();
        navigation.getSaveButton().click();
        navigation.getEditRowButton().click();
        //cy.get("#mobiusUsers-table-edit-1").click();
        cy.get("#firstName").clear().type("test1");
        cy.get("#lastName").clear().type("test1");
        cy.get("#email").clear().type("test1@test1.com");
        cy.get("#accessLevel").select("Advisor");
        navigation.getSaveButton().click();

    });  
});