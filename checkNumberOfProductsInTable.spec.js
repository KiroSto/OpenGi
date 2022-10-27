import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import BrandsScreen from "../../pageObject/BrandsScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();


describe("Check number of products in table", function () {
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
    
      afterEach(() => {
        socketServer.close();
      });
    it.only("checking the number of products in a table in the business line and products and brand screens", function () {
        initialStepAfterLogin();
        navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    businessLinesProductsScreen.getSelectProductsButton().click();
        businessLinesProductsScreen.getTableTogglesProduct(0,0);
        navigation.getBladeCloseButton().click();
        businessLinesProductsScreen.getSelectProductsButton().click();
        businessLinesProductsScreen.getTableTogglesProduct(1,0);
        navigation.getBladeCloseButton().click();
    businessLinesProductsScreen.getProductsTableNoRows().find(".table-row").should("have.length", 2);
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    fillAllInputs();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    brandsScreen.getSelectProductsButton().click();
    brandsScreen.getTableTogglesProduct(0,0);
    navigation.getBladeCloseButton().click();
    brandsScreen.getSelectProductsButton().click();
    brandsScreen.getTableTogglesProduct(1,0);
    navigation.getBladeCloseButton().click();
    businessLinesProductsScreen.getProductsTableNoRows().find(".table-row").should("have.length", 2);
});  
});