import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import { fillAllInputs } from "../../utils/fillOutAllFields";

describe("Adding company test", function () {
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

    it("saving company with all the mandatory fields", function () {
        initialStepAfterLogin();
       fillAllInputs();
        navigation.getNextButton().click();
    });  
});