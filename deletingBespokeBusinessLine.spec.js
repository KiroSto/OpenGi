import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import Navigation from "../../pageObject/Navigation";
import BrandsScreen from "../../pageObject/BrandsScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";

const baseUrl = "https://localhost:3000/";
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();
const navigation = new Navigation();

let socketServer;
describe("Deleting bespoke business line", function () {
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

  it.only("deleting bespoke business line without deleting the other dependencies", function () {
    initialStepAfterLogin();
    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    businessLinesProductsScreen.getSelectBespokeBusinessLinesButton().click();
    //businessLinesProductsScreen.getCreateBespokeBLName().type("test");
    fillAllInputs();
    businessLinesProductsScreen.saveBespokeBusinessLine();
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    fillAllInputs();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
        cy.get("#bl-filter-table").select("Bespoke Business Lines");
        businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
        businessLinesProductsScreen.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.deleteBespoke(1);
    //cy.get("#bespokeBusinessLines-table-delete-1").click();
    navigation.getPopupTitle().should('have.text',"This Bespoke Business Line cannot be deleted");
    navigation
        .getPopupParagraph().should('have.text',"WARNING: This Bespoke Business Line is being used by one or more Brands. Please make sure no Brands use this Bespoke Business Line before deleting");
        navigation.getLeftButton().click();
});
});