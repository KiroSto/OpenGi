import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import BrandsScreen from "../../pageObject/BrandsScreen";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();


describe("Navigation buttons", function () {
  let socketServer;
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
    
    it.only("checking the navigation buttons", function () {
        initialStepAfterLogin();
        navigation.getBusinessLinesProductsButton().click();
        navigation.getBrandsButton().click();
        navigation.getAgentsButton().click();
        navigation.getIntroducersButton().click();
        navigation.getPaymentPlansButton().click();
        navigation.getAccountsButton().click();
        navigation.getMobiusUsersButton().click({ force: true });
        navigation.getSubmitButton().should("be.disabled");;
        //cy.get(".css-11rpvt3-Table > .css-5endx-SubmitButton > span > #submitButton").should("be.disabled");
        cy.get("[data-id=sidepanel-0-invalid]").should("exist");
        cy.get("[data-id=sidepanel-1-invalid]").should("exist");
        cy.get("[data-id=sidepanel-2-invalid]").should("exist");
        cy.get("[data-id=sidepanel-6-invalid]").should("exist");
    });
});