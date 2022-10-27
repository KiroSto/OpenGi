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


describe("Successfully deactivating product", function () {
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
    it.only("deactivating product by deleting all of the previous dependencies", function () {
        initialStepAfterLogin();
        navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
    navigation.getBladeCloseButton().click();
    businessLinesProductsScreen.getSelectProductsButton().click();
    businessLinesProductsScreen.getTableTogglesProduct(0,0);
    navigation.getBladeCloseButton().click();
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    fillAllInputs();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    brandsScreen.getSelectProductsButton().click();
    brandsScreen.getTableTogglesProduct(0,0);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    brandsScreen.deleteBrand(1);
        //cy.get("#brands-table-delete-1").click();
        navigation.getPopupTitle().should('have.text',"Are you sure you want to delete this Brand?");
        navigation
    .getPopupParagraph().should('have.text',"WARNING: If you click yes, this Brand's details will be lost.");
    navigation.getRightButton().click();
    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectProductsButton().click();
    businessLinesProductsScreen.getTableTogglesProduct(0,0);
    navigation.getBladeCloseButton().click();
    });  
});