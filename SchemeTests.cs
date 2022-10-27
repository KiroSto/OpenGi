using System;
using System.Collections.Generic;
using System.Threading;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2Framework.Pages.Test_Pages;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.Scheme_Pages;
using TicPortalV2SeleniumFramework.Pages.Test_Pages;

namespace TicPortalV2SeleniumTests.Tests
{
	[TestClass]
	public class SchemesTests : TestSetUp
	{

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateAsyncScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.CheckIfSchemeExists(schemeName);
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUseAddFlexibleEnrichmentToScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.AddFlexibleEnrichment()
						.CheckIfEnrichmentAdded()
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.CheckIfSchemeExists(schemeName);
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldNotCreateAsyncSchemeWithForbiddenMethods()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.ViewScheme(schemeName)
						.ClickOnEditSchemeCodeButton()
						.AddForbiddenMethodToSchemeCode()
						.ValidateSchemeFailed()
						.CancelEditingAsyncSchemePage()
						.CheckSchemeNameHeader().Should().Be(schemeName);
			});
		}



		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateAvivaEngineScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAvivaEngineScheme(schemeName)
						.GoToAvivaSchemeDetailsPage()
						.ConfirmAvivaEnvironment();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox")]
		public void ShouldUserCreatePolarisEngineScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreatePolarisEngineScheme(schemeName)
						.GoToSchemeDetailsPage()
						.ConfirmPolarisEnvironment();

			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserRemoveScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();

				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.RemoveSchemeSoftly(schemeName)
						.ConfirmSoftRemoval()
						.GoToRemovedSchemesTab()
						.RemoveSchemeFromRemovedSchemesTab(schemeName)
						.ConfirmNoShemesOnRemovedPage();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserRestoreScheme()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.RemoveSchemeSoftly(schemeName)
						.ConfirmSoftRemoval()
						.GoToRemovedSchemesTab()
						.RestoreScheme(schemeName)
						.ConfirmNoShemesOnRemovedPage()
						.GoToSchemes()
						.CheckIfSchemeExists(schemeName);


			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserGoToEditSchemePage()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.EditScheme(schemeName)
						.CheckIfValidateButtonExists().Should().BeTrue();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserEditSchemeAndSaveIt()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.EditScheme(schemeName)
						.AddDeclineToSchemeCode()
						.SaveScheme();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserEditSchemeAndValidateIt()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.EditScheme(schemeName)
						.AddDeclineToSchemeCode()
						.ValidateScheme()
						.CancelEditingSchemePage()
						.CheckSchemeNameHeader().Should().Be(schemeName);
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserEditSchemeAndPublishIt()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.ViewScheme(schemeName)
						.ClickOnEditSchemeCodeButton()
						.AddDeclineToSchemeCode()
						.PublishScheme("This can be deleted")
						.GoToSchemeDetailsFromPublishSubpage()
						.CheckSideVersion("1.0.0")
						.GoToSchemeVersions()
						.CheckIfProperSchemeVersion1Text("1.0.0")
						.CheckVersionDescription("This can be deleted");
			});
		}
	

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBackdateAScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				dashboardPage.GoToMainSchemesPage()
								.GoToCreateSchemePage()
								.CreateAsyncScheme(schemeName)
								.GoToEditSchemePage()
								.PublishScheme("Version 1")
								.GoToSchemeDetailsFromPublishSubpage()
								.ClickOnEditSchemeCodeButton()
								.PublishScheme("Version 2")
								.GoToSchemeDetailsFromPublishSubpage()
								.GoToSchemeVersions()
								.BackdateScheme()
								.ConfirmSchemeWasBackdated();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserPublishTestSchemePromoteItAndRollBack()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				dashboardPage.GoToMainSchemesPage().GoToCreateSchemePage()
								.CreateAsyncScheme(schemeName)
								.GoToEditSchemePage()
								.PublishScheme("You can delete this scheme")
								.GoToSchemeDetailsFromPublishSubpage()

								.CheckAllSchemeDetailsAreCorrect()
								.ClickOnEditTestSchemeCodeButton()
								.PublishTestScheme("Description for test scheme version")
								.GoToSchemeDetailsFromPublishSubpage()
								.GoToSchemeVersions()
								.CheckSchemeTestVersionDescription("Description for test scheme version")
								.PromoteTestScheme()
								.ConfirmSchemeWasPromoted()
								.RollBackSchemeVersion()
								.ConfirmSchemeWasRolledBack();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserRollBackSimpleScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.PublishScheme("This can be deleted")
						.GoToSchemeDetailsFromPublishSubpage()
						.ClickOnEditSchemeCodeButton()
						.PublishScheme()
						.GoToSchemeDetailsFromPublishSubpage()
						.GoToSchemeVersions()
						.RollBackSchemeVersion()
						.CheckIfSecondSchemeVersionExists().Should().BeFalse();

			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldUserRollBackSimpleSchemeWithCheckingSchemeCodes()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.AddDeclineToSchemeCode()
						.PublishScheme("This can be deleted")
						.GoToSchemeDetailsFromPublishSubpage()
						.ClickOnEditSchemeCodeButton()
						.CheckIfDeclineWasAdded()
						.AddSchemeFromFile("AgeasFluxScoreNew(PrivateMotor).txt")
						.PublishScheme("This can be deleted")
						.GoToSchemeDetailsFromPublishSubpage()
						.GoToSchemeVersions()
						.RollBackSchemeVersion()
						.CheckIfSchemeWasRolledBack()
						.ClickOnEditSchemeCodeButton()
						.CheckIfDeclineWasAdded();

			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserBeAbleToCompareSchemeVersions()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
				.GoToMainSchemesPage()
				.GoToCreateSchemePage()
				.CreateAsyncScheme(schemeName)
				.GoToEditSchemePage()
				.PublishScheme("Scheme version 1.0.0")
				.GoToSchemeDetailsFromPublishSubpage()
				.ClickOnEditSchemeCodeButton()
				.AddDeclineToSchemeCode()
				.PublishScheme("Scheme version 1.0.1")
				.GoToSchemeDetailsFromPublishSubpage()
				.GoToMainSchemesPage()
				.SearchForTheScheme(schemeName)
				.EditScheme(schemeName)
				.CompareSchemeVersions()
				.GoToNextDifference()
				.CheckIfAnyVersionDifference().Should().BeGreaterThan(0);
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldUserRunTestWhenValidatingScheme()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var testCaseName = RandomString();

				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName)
						.SaveTest()
						.NavigateToTestsPage()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.AddNetPremiumToSchemeCode()
						.ValidateScheme()
						.RunTests()
						.RunTestCaseForScheme(testCaseName)
						.ChackCalculatedPremium(testCaseName, "100")
						.ViewTestResults()
						.CheckIfNetPremium(100)
						.ClickOkButtonOnTestResultDetailScreen();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldUserRunTestWhenValidatingAsyncScheme()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var testCaseName = RandomString();

				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName)
						.SaveTest()
						.NavigateToTestsPage()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.AddNetPremiumToAsyncSchemeCode()
						.ValidateScheme()
						.RunTests()
						.RunTestCaseForScheme(testCaseName)
						.ChackCalculatedPremium(testCaseName, "100")
						.ViewTestResults()
						.CheckIfNetPremium(100)
						.ClickOkButtonOnTestResultDetailScreen();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldNotCreateAsyncMTASchemeWithForbiddenMethods()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var testCaseName = RandomString();

				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateMTAScheme(schemeName)
						.AddForbiddenMethodToMTASchemeCode()
						.ValidateSchemeFailed()
						.CancelEditingAsyncSchemePage()
						.CheckSchemeNameHeader().Should().Be(schemeName);
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldNotCreateAsyncRenewalSchemeWithForbiddenMethods()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var testCaseName = RandomString();

				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateRenewalScheme(schemeName)
						.AddForbiddenMethodToSchemeCode()
						.ValidateSchemeFailed()
						.CancelEditingAsyncSchemePage()
						.CheckSchemeNameHeader().Should().Be(schemeName);
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserPublishSchemeInTheFutureAndCancelIt()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.PublishScheme("Scheme - version 1")
						.GoToSchemeDetailsFromPublishSubpage()
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.ViewScheme(schemeName)
						.ClickOnEditSchemeCodeButton()
						.AddDeclineToSchemeCode()
						.PublishSchemeInTheFuture("Scheme version 2, but the future version", CheckBrowser)
						.GoToSchemeDetailsFromPublishSubpage()
						.CheckSideVersion("1.0.0")
						.GoToSchemeVersions()
						.CheckIfProperSchemeVersion1Text("1.0.0")
						.CheckIfProperFutureSchemeVersion2Text("1.0.1")
						.CancelFutureSchemeVersion()
						.CheckIfProperFutureSchemeVersion2Exists()
						.CheckIfProperSchemeVersion1Text("1.0.0");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("ie")]
		public void ChangeSchemeTypeToDefaultAfterChangingEngine()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateThirdPartyScheme(schemeName)
						.GoToSchemeSummary()
						.CheckIfQuoteengineNameIsKitsuneEngine().Should().Be("KitsuneEngine");
				SchemesPage schemePage = new SchemesPage(this.Driver);
				schemePage.GoToMainSchemesPage()
				.SearchForTheScheme(schemeName)
				.CheckIfSchemeExists(schemeName)
				.CheckSchemeType().Should().Be("NEW BUSINESS");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreatePolarisEngineSchemeWithFileSet()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreatePolarisEngineScheme(schemeName)
						.GoToSchemeDetailsPage()
						.GoToPolarisSchemeVersionPage()
						.SelectSchemeSetAndVariant("ApiPolarisPM", "1")
						.CreateNewPolarisSchemeVersion()
						.AlertMessage2.Text.Should().Be("Scheme published successfully");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateCustomPolarisEngineSchemeWithFileSet()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateCustomPolarisEngineScheme(schemeName)
						.GoToSchemeDetailsPage()
						.GoToCustomPolarisSchemeVersionPage()
						.SelectSchemeSetAndVariantbyIndex(1, "1")
						.CreateNewPolarisSchemeVersion()
						.AlertMessage2.Text.Should().Be("Scheme published successfully");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]

		public void ShouldUserValidateAComplicatedScheme()
		{
			UITest(() =>
			{
				List<String> files = new List<String>
				{
								  "AgeasFluxScoreNew(PrivateMotor).txt"
				};

				List<String> filesCV = new List<String>
				{
								  "ERSShortPeriod(CV).txt"
				};

				string schemeName = RandomString();
				string schemeName2 = RandomString();

				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateAsyncScheme(schemeName);

				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				files.ForEach(delegate (String file)
				{
					editSchemePage.SchemeFromFiles(file);
					String Error = "Error while validating" + file + ", please investigate";
					editSchemePage.WaitForAlertMessage("", 5);
					Assert.IsTrue(editSchemePage.GetAlertMessageString().Contains("Scheme compiled successfully"), Error);
					editSchemePage.GoBackToEdit2.Click();
					//editSchemePage.WaitForSchemesTab();
					Thread.Sleep(500);
				});

				SchemesPage schemesPage2 = editSchemePage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage2 = schemesPage2.GoToCreateSchemePage();
				createSchemePage2.CreateAsyncScheme(schemeName2, "Commercial Vehicle");
				EditSchemePage editSchemePage2 = createSchemePage2.GoToEditSchemePage();
				filesCV.ForEach(delegate (String file)
				{
					editSchemePage2.SchemeFromFiles(file);
					String Error = "Error while validating" + file + ", please investigate";
					Assert.IsTrue(editSchemePage.GetAlertMessageString().Contains("Scheme compiled successfully"), Error);
					editSchemePage2.GoBackToEdit2.Click();
				});
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateAKitsuneScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateKitsuneEngineScheme(schemeName)
						.GoToSchemeSummary()
						.CheckIfQuoteengineNameIsKitsuneEngine().Should().Be("KitsuneEngine");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToAddLobReferenceToMTAScheme()
		{
			UITest(() =>
			{
				var filename = "MTAScheme.txt";
				var schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateMTAScheme(schemeName)
						.AddSchemeReference("CV")
						.SchemeFromFiles(filename)
						.GetAlertMessageString().Should().Contain("success");
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldReferenceConfirmationWorkProperly()
		{
			UITest(() =>
			{
				var filename = "ReferenceTest.txt";
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.AddSchemeReference("TLM")
						.AddSecondSchemeReference("Helpers")
						.SchemeFromFile(filename)
						.PublishScheme("This can be deleted")
						.GoToSchemeDetailsFromPublishSubpage()
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.EditScheme(schemeName)
						.PublishScheme("This can be deleted")
						.GetAlertMessageString().Should().Contain("success");
			});
		}


		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateAJsonIHPScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateJsonIhpEngineScheme(schemeName)
						.GoToSchemeSummary()
						.CheckIfJsonIHPEngineCheckIsOk()
						.CheckIfQuoteengineNameIsJsonIHPEngine();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateABatchedJsonIHPScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateBatchedJsonIhpEngineScheme(schemeName)
						.GoToSchemeSummary()
						.CheckIfJsonIHPEngineCheckIsOk()
						.CheckIfQuoteEngineNameIsBatchedJsonIHPEngine();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateALAndGScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateLAndGScheme(schemeName)
						.GoToSchemeSummary()
						.CheckQuoteEngine("LegalAndGeneralEngine")
						.CheckReference("1");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateAZurichScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateZurichEngineScheme(schemeName);
				SchemeDetailsPage schemeDetails = createSchemePage.GoToSchemeSummary();

				Assert.AreEqual("ZurichEngine", schemeDetails.CheckIfQuoteengineNameIsZurichEngine(), "Quote Engine type on scheme details is not ZurichEngine.Please investigate.");
				Assert.AreEqual("CoreMotor.ZUB0", schemeDetails.CheckIfZurichSchemeCodeIsOK(), "Zurich scheme Code on scheme detils is not CoreMotor.ZUB0.Please investigate.");
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateAAxaUkScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateAxaUKEngineScheme(schemeName);
				SchemeDetailsPage schemeDetails = createSchemePage.GoToSchemeSummary();

				Assert.AreEqual("AxaUkEngine", schemeDetails.CheckIfQuoteengineNameIsZurichEngine(), "Quote Engine type on scheme details is not AxaUKEngine.Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateARadarScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateRadarEngineScheme(schemeName);
				SchemeDetailsPage schemeDetails = createSchemePage.GoToSchemeSummary();

				Assert.AreEqual("RadarEngine", schemeDetails.GetPropertyValueFromSchemePage("Quote Engine"), "Quote Engine type on scheme detils is not ZurichEngine.Please investigate.");
				Assert.AreEqual("ModalKey", schemeDetails.GetPropertyValueFromSchemePage("Radar Model Key"), "Radar Modal Code on scheme detils is not set.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateACdlScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateCdlEngineScheme(schemeName);
				SchemeDetailsPage schemeDetails = createSchemePage.GoToCDLSchemeSummary();

				Assert.AreEqual("CdlEngine", schemeDetails.CheckIfquoteEngineNameIsCdlEngine(), "Quote Engine type on scheme detils is not CdlEngine.Please investigate.");
				Assert.AreEqual("ATRV", schemeDetails.CheckIfCDLSchemeRefrenceIsOK(), "Scheme Reference on scheme detils is not correct.Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox")]
		public void ShouldUserCreateCustomPolarisEngineScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateCustomPolarisEngineScheme(schemeName)
						.GoToSchemeDetailsPage()
						.ConfirmCustomPolarisEnvironment();

			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateMarkerstudyScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateMarkerStudyScheme(schemeName)
						.GoToSchemeSummary()
						.CheckQuoteEngine("MarkerstudyEngine")
						.CheckReference("1")
						.CheckVariant("2");
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldSchemeBeSavedProperly()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string RandomChange = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.SchemeFromString(RandomChange)
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.ViewScheme(schemeName)
						.ClickOnEditSchemeCodeButton()
						.CheckIfSchemeCodeContainsString(RandomChange);
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldTestSchemeVersionSaveProperly()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string RandomChange = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.ViewScheme(schemeName)
						.ClickOnEditTestSchemeCodeButton()
						.SchemeFromString(RandomChange)
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.ViewScheme(schemeName)
						.ClickOnEditTestSchemeCodeButton()
						.CheckIfSchemeCodeContainsString(RandomChange);
			});
		}


		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateAnMtaFexiblePolarisScheme()
		{
			UITest(() =>
			{
				string polarisName = RandomString();
				string mtaName = RandomString();
				string flexibleName = RandomString();
				string RandomChange = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateMTAScheme(mtaName)
						.PublishScheme()
						.GoToSchemeDetailsFromPublishSubpage()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreatePolarisEngineScheme(polarisName, "Household")
						.GoToSchemeDetailsPage()
						.GoToPolarisSchemeVersionPage()
						.SelectSchemeSetAndVariant("ApiPolarisHouse", "1")
						.CreateNewCustomPolarisSchemeVersion()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateFlexiblePolarisScheme(flexibleName, "MTA", mtaName, polarisName, lineOfBussines: "Household")
						.ConfirmFlexiblePolarisSchemeDetails(flexibleName, "Household", mtaName, polarisName);


			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateARenewalFexiblePolarisScheme()
		{
			UITest(() =>
			{
				string polarisName = RandomString();
				string renewalName = RandomString();
				string flexibleName = RandomString();
				string RandomChange = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateRenewalScheme(renewalName, "Household")
						.PublishScheme()
						.GoToSchemeDetailsFromPublishSubpage()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreatePolarisEngineScheme(polarisName, "Household")
						.GoToSchemeDetailsPage()
						.GoToPolarisSchemeVersionPage()
						.SelectSchemeSetAndVariant("ApiPolarisHouse", "1")
						.CreateNewCustomPolarisSchemeVersion()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateFlexiblePolarisScheme(flexibleName, "Renewal", renewalName, polarisName, lineOfBussines:"Household")
						.ConfirmFlexiblePolarisSchemeDetails(flexibleName, "Household", renewalName, polarisName);


			});
		}


	}
}