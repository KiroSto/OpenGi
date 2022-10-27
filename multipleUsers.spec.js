import { SocketIO, Server } from "mock-socket";
import * as mockServer from "../fixtures/mock-server";
import CompanyInformationScreen from "../pageObject/CompanyInformationScreen";
import Navigation from "../pageObject/Navigation";
import HeaderMessagesScreen from "../pageObject/HeaderMessagesScreen";
import { datepickerLocks, dropdownLocks, fieldLocks, multistageLocks } from "../fixtures/mock-locks";
import BrandsScreen from "../pageObject/BrandsScreen";
import AccountsScreen from "../pageObject/AccountsScreen";
import { readyForSubmitBroker } from "../fixtures/mock-server";
import { mockUser } from "../utils/login";

const baseUrl = "https://localhost:3000/";
const companyInformationScreen = new CompanyInformationScreen();
const navigation = new Navigation();
const headerMessagesScreen = new HeaderMessagesScreen();
const brandsScreen = new BrandsScreen();
const accountsScreen = new AccountsScreen();

let bls = [];
let mockSocketServer, mockSocket;

describe(
  "Multiple users cases",
  {
    retries: {
      runMode: 5,
      openMode: 5,
    },
  },
  function () {
    beforeEach(() => {
      const fakeURL = "ws://localhost:3001/socket.io";
      mockSocketServer = new Server(fakeURL);

      mockSocketServer.on("connection", (socket) => {
        socket.on("mockUsersConnected", (users) => {
          socket.emit("userConnected", users);
        });

        socket.on("mockFormSubmitted", (id) => {
          socket.emit("brokerSubmitted", id);
        });

        socket.on("mockLocks", (locks) => {
          socket.emit("locksChanged", JSON.stringify(locks));
        });

        socket.on("mockBrokerUpdate", (broker) => {
          socket.emit("brokerUpdated", JSON.stringify(broker));
        });
      });

      cy.server();
      cy.route(mockServer.postBrokerDetailsDelayed);
      cy.route(mockServer.getEmptyBroker);
      cy.route(mockServer.putBroker).as("putBroker");
      cy.route(mockServer.getProductsList);
      cy.route(mockServer.getBusinessLinesList);
      cy.route(mockServer.getAccessLevelsList);
      cy.route(mockServer.getSingleConnectedUser);
      cy.clock(Date.now());

      bls = mockServer.setBLsLocalStorage();
      mockSocket = SocketIO(`ws://localhost:3001/socket.io`);
    });

    it("Should not render users connected header message", function () {
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.io = SocketIO;
          win.localStorage.setItem("firstLogin", JSON.stringify([mockUser.profile.sub]));
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {
          companyInformationScreen.getCompanyAddress();
          const connectedUsers = 1;
          mockSocket.emit("mockUsersConnected", connectedUsers);
          headerMessagesScreen.getUsersEditingMessage().should("not.exist");
        });
      });
    });

    it("Should render users connected header message", function () {
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.io = SocketIO;
          win.localStorage.setItem("firstLogin", JSON.stringify([mockUser.profile.sub]));
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {
          companyInformationScreen.getCompanyAddress();
          const connectedUsers = 15;
          mockSocket.emit("mockUsersConnected", connectedUsers);
          headerMessagesScreen.getUsersEditingMessage().contains(`${connectedUsers} users are currently editing`);
        });
      });
    });

    it("Should render users when a new user logs in", function () {
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.io = SocketIO;
          win.localStorage.setItem("firstLogin", JSON.stringify([mockUser.profile.sub]));
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {
          companyInformationScreen.getCompanyAddress();
          const connectedUsers = 15;
          const newUsers = 27;
          mockSocket.emit("mockUsersConnected", connectedUsers);
          headerMessagesScreen.getUsersEditingMessage().contains(`${connectedUsers} users are currently editing`);

          cy.get("#usersEditing", { timeout: 10000 }).then(() => {
            mockSocket.emit("mockUsersConnected", newUsers);
            headerMessagesScreen.getUsersEditingMessage().contains(`${newUsers} users are currently editing`);
          });
        });
      });
    });

    it("Should show no users warning on submit popup", function () {
      cy.route(mockServer.getReadyForSubmitBroker);
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.io = SocketIO;
          win.localStorage.setItem("firstLogin", JSON.stringify([mockUser.profile.sub]));
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {
          const connectedUsers = 1;
          mockSocket.emit("mockUsersConnected", connectedUsers);
          navigation.getMobiusUsersButton().click();
          cy.wait("@putBroker").then(() => {
            navigation.getSubmitButton().should("exist");
            navigation.getSubmitButton().click();
            navigation.getPopupParagraph().contains("other users").should("not.exist");
          });
        });
      });
    });

    it("Should show multiple users warning on submit popup", function () {
      cy.route(mockServer.getReadyForSubmitBroker);
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.io = SocketIO;
          win.localStorage.setItem("firstLogin", JSON.stringify([mockUser.profile.sub]));
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {
          navigation.getMobiusUsersButton().click();
          cy.wait("@putBroker").then(() => {
            const connectedUsers = 15;
            mockSocket.emit("mockUsersConnected", connectedUsers);
            cy.get("#usersEditing", { timeout: 10000 }).then(() => {
              navigation.getSubmitButton().should("exist");
              navigation.getSubmitButton().click();
              navigation.getPopupParagraph().contains("other users");
            });
          });
        });
      });
    });

    it("Should notify user if the form is submitted by someone else", function () {
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.io = SocketIO;
          win.localStorage.setItem("firstLogin", JSON.stringify([mockUser.profile.sub]));
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {
          mockSocket.emit("mockFormSubmitted", "123456");
          cy.get("#popup-header").then(() => {
            navigation.getPopupHeader().contains("Another user has successfully submitted the form");
          });
        });
      });
    });

    it("Should lock a field if another user is editing and tooltip with correct message should exist", function () {
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.io = SocketIO;
          win.localStorage.setItem("firstLogin", JSON.stringify([mockUser.profile.sub]));
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {
          companyInformationScreen.getCompanyAddress();
          mockSocket.emit("mockLocks", fieldLocks);
          companyInformationScreen.getCompanyAddress().should("be.disabled");
          companyInformationScreen.getCompanyAddress().should("have.attr", "title");
          companyInformationScreen.getCompanyPostCode().should("be.disabled");
          companyInformationScreen.getCompanyEmail().should("be.disabled");
        });
      });
    });

    it("Should lock a multistage if another user is editing", function () {
      cy.route(mockServer.getReadyForSubmitBroker);
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.io = SocketIO;
          win.localStorage.setItem("firstLogin", JSON.stringify([mockUser.profile.sub]));
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {
          navigation.getBrandsButton().click();
          cy.wait("@putBroker").then(() => {
            mockSocket.emit("mockLocks", multistageLocks);
          });
          navigation.getAddRowButton().should("be.enabled");
          brandsScreen.getEditBrand(1).should("be.disabled");
          brandsScreen.getDeleteBrand(1).should("be.disabled");
        });
      });
    });

    it("Should lock a dropdown if another user is editing", function () {
      cy.route(mockServer.getReadyForSubmitBroker);
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.io = SocketIO;
          win.localStorage.setItem("firstLogin", JSON.stringify([mockUser.profile.sub]));
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {
          navigation.getAccountsButton().click();
          cy.wait("@putBroker").then(() => {
            mockSocket.emit("mockLocks", dropdownLocks);
          });
          accountsScreen.getFinancialYear12().should("be.disabled");
        });
      });
    });

    it("Should lock a datepicker if another user is editing", function () {
      cy.route(mockServer.getReadyForSubmitBroker);
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.io = SocketIO;
          win.localStorage.setItem("firstLogin", JSON.stringify([mockUser.profile.sub]));
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {
          navigation.getAccountsButton().click();
          cy.wait("@putBroker").then(() => {
            mockSocket.emit("mockLocks", datepickerLocks);
          });
          accountsScreen.getStartDate().should("be.disabled");
        });
      });
    });

    it("Should update a broker if new data arrives", function () {
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.io = SocketIO;
          win.localStorage.setItem("firstLogin", JSON.stringify([mockUser.profile.sub]));
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {
          mockSocket.emit("mockBrokerUpdate", readyForSubmitBroker);
          navigation.getMobiusUsersButton().click();
          cy.wait("@putBroker").then(() => {
            navigation.getSubmitButton().should("be.enabled");
          });
        });
      });
    });

    afterEach(() => {
      mockSocketServer.stop();
    });
  }
);
