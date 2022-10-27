using System.Collections.Generic;
using System.Linq;
using System.Threading;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Base;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.Rate_Pages;
using TicPortalV2SeleniumFramework.Pages.Scheme_Pages;

namespace TicPortalV2SeleniumTests.Tests
{
	[TestClass]
	public class ChromeRateTests : TestSetUp
	{
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateASimpleIndexRate()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndexForPermissions(rateName);
				Assert.AreEqual("NUMBER", createRatePage.CheckIfIndex1AddedCorrectly(), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				Assert.AreEqual(rateName, rateDetailsPage.CheckNameHeaderText(), "Rate name is not correct or sth wrong with rate name header. Please investigate.");
				Assert.IsTrue(rateDetailsPage.CheckTheIndex3().Contains("3"), "Index of the table is wrong or doesn't exist. Please investigate.");
				Assert.AreEqual("This can be deleted", rateDetailsPage.CheckTheDescription(), "There is sth wrong with side rate description. Please investigate.");
				rateDetailsPage.GoToRateVersionsTab();
				Assert.AreEqual("1", rateDetailsPage.CheckIfVersion1(), "Version 1 doesn't exist or is different than 1. Please investigate.");
				RatesPage ratesPage2 = rateDetailsPage.GoToMainRatesPage();
				ratesPage2.SearchForRate(rateName);
				Assert.AreEqual("READY", ratesPage2.CheckTemporaryRateStatus(), "Sth wrong with rate status or given rate was not found. Please investigate.");
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateASimpleWithAllDataTypes()
		{
			UITest(() =>
			{
				var rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				var dataTypes = new Dictionary<string, string>()
				{
					{"TableID","String" },
					{"EffectiveDateFrom", "DateTime"},
					{"EffectiveDateTo", "DateTime"},
					{"AdminFee", "Double"},
					{"IsInsured", "Boolean"},
					{"Number", "Integer"}
				};


				loginPage.LoginToPortalAdmin()
				.GoToMainRatesPage()
				.GoToCreateRatePage()
				.CreateARate(rateName, "typeTest.csv")
				.SelectDatTypes(dataTypes)
				.SelectSpecificIndex("TableID")
				.ConfirnIndexWasAddedCorrectly("TableID")
				.GoToRateVersionTab()
				.ClickCreateRate()
				.ValidateAndConfirmAlertMessage("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.");
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				Assert.AreEqual(rateName, rateDetailsPage.CheckNameHeaderText(), "Rate name is not correct or sth wrong with rate name header. Please investigate.");
				Assert.AreEqual("This can be deleted", rateDetailsPage.CheckTheDescription(), "There is sth wrong with side rate description. Please investigate.");
				rateDetailsPage.GoToRateVersionsTab();
				Assert.AreEqual("1", rateDetailsPage.CheckIfVersion1(), "Version 1 doesn't exist or is different than 1. Please investigate.");
				RatesPage ratesPage2 = rateDetailsPage.GoToMainRatesPage();
				ratesPage2.SearchForRate(rateName);
				Assert.AreEqual("READY", ratesPage2.CheckTemporaryRateStatus(), "Sth wrong with rate status or given rate was not found. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void TypesShouldBeKeptAfterEditRate()
		{
			UITest(() =>
			{
				var rateName = RandomString();
				var testName = "NO NOT REMOVE";
				var schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				var schemeCode = "RateTypeScheme.txt";
				var dataTypes = new Dictionary<string, string>()
				
				{
					{"TableID","String" },
					{"EffectiveDateFrom", "DateTime"},
					{"EffectiveDateTo", "DateTime"},
					{"AdminFee", "Double"},
					{"IsInsured", "Boolean"},
					{"Number", "Integer"}
				};
				var values = new Dictionary<string, string>()
				{
					{"TableID","ADM001" },
					{"EffectiveDateFrom", "2009-01-06T18:30:42Z"},
					{"EffectiveDateTo", "2009-01-02T18:30:42Z"},
					{"AdminFee", "0.96"},
					{"IsInsured", "true"},
					{"Number", "654"}
				};

				loginPage.LoginToPortalAdmin()
				.GoToMainRatesPage()
				.GoToCreateRatePage()
				.CreateARate(rateName, "typeTest.csv")
				.SelectDatTypes(dataTypes)
				.SelectSpecificIndex("TableID")
				.ConfirnIndexWasAddedCorrectly("TableID")
				.GoToRateVersionTab()
				.CreateRateAndConfirmSuccess()
				.WaitForRateToBeReady();
				loginPage.GoToMainRatesPage()
				.SearchForRate(rateName)
				.GoToEditRatePage(rateName)
				.EditRateTable(11,values);
				QuoteDetail quoteDetail = loginPage.GoToMainSchemesPage()
				.GoToCreateSchemePage()
				.CreateAsyncScheme(schemeName)
				.GoToEditSchemePage()
				.SchemeFromFiles(schemeCode, rateName)
				.ValidateAndTest()
				.SearchForTestCase("NO NOT REMOVE")
				.AddGroup()
				.RunTest()
				.OpenResults(testName)
				.GetQuoteDetailFromTest();

				quoteDetail.OtherOutputs.Length.Should().Be(6);
				var tableID = quoteDetail.OtherOutputs.FirstOrDefault(x => x.Name == "TableID");
				var effectiveDateFrom = quoteDetail.OtherOutputs.FirstOrDefault(x => x.Name == "EffectiveDateFrom");
				var effectiveDateTo = quoteDetail.OtherOutputs.FirstOrDefault(x => x.Name == "EffectiveDateTo");
				var adminFee = quoteDetail.OtherOutputs.FirstOrDefault(x => x.Name == "AdminFee");
				var osInsured = quoteDetail.OtherOutputs.FirstOrDefault(x => x.Name == "IsInsured");
				var number = quoteDetail.OtherOutputs.FirstOrDefault(x => x.Name == "Number");
				tableID.Value.Should().Be("ADM001");
				effectiveDateFrom.Value.Should().Be("1/6/2009 6:30:42 PM");
				effectiveDateTo.Value.Should().Be("1/2/2009 6:30:42 PM");
				adminFee.Value.Should().Be("0.96");
				osInsured.Value.Should().Be("True");
				number.Value.Should().Be("654");





			});
			
		}

				[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldUserCreateARateWithNameContainingSpecialCharacters()
		{
			UITest(() =>
			{
				string rateName = "R-S.A_P" + RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndexForPermissions(rateName);
				Assert.AreEqual("NUMBER", createRatePage.CheckIfIndex1AddedCorrectly(), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				Assert.AreEqual(rateName, rateDetailsPage.CheckNameHeaderText(), "Rate name is not correct or sth wrong with rate name header. Please investigate.");
				Assert.IsTrue(rateDetailsPage.CheckTheIndex3().Contains("3"), "Index of the table is wrong or doesn't exist. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldNotUserCreateARateWithoutAName()
		{
			UITest(() =>
			{
				string rateName = "R-S.A_P" + RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithoutAName();
				Assert.AreEqual("Please enter a rate name", createRatePage.GetAlertMessageString(), "Validation when user wants to create a rate without a name is missing or user can create a rate without a name which in both cases needs investigation.");
				createRatePage.ConfirmAlertOnce();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldNotUserCreateARateWithoutARateFile()
		{
			UITest(() =>
			{
				string rateName = "R-S.A_P" + RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithoutARateFile(rateName);
				Assert.AreEqual("Please select a rate file", createRatePage.GetAlertMessageString(), "Validation when user wants to create a rate without a rate file is missing or is wrong or user can create a rate without a name and each case needs investigation.");
				createRatePage.ConfirmAlertOnce();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldNotUserCreateADuplicateRate()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.AreEqual("NUMBER", createRatePage.CheckIfIndex1AddedCorrectly(), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);

				rateDetailsPage.GoToRateVersionsTab();
				Assert.AreEqual("1", rateDetailsPage.CheckIfVersion1(), "Version 1 doesn't exist or is different than 1. Please investigate.");
				RatesPage ratesPage2 = rateDetailsPage.GoToMainRatesPage();
				CreateRatePage createRatePage2 = ratesPage2.GoToCreateRatePage();

				createRatePage2.CreateARateWithSimpleIndex(rateName);
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.IsTrue(createRatePage2.GetAlertMessageString().Contains("already exists"), "Duplicate rate is added or wrong validation message. Please investigate.");
				createRatePage2.ConfirmAlertOnce();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateARateWithCustomIndex()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.AreEqual("NUMBER", createRatePage.CheckIfIndex1AddedCorrectly(), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(this.Driver);
				rateDetailsPage.WaitForRateToBeReady();
				rateDetailsPage.GoToRateVersionsTab();
				Assert.AreEqual("1", rateDetailsPage.CheckIfVersion1(), "Version 1 doesn't exist or is different than 1. Please investigate.");
				RatesPage ratesPage2 = rateDetailsPage.GoToMainRatesPage();
				CreateRatePage createRatePage2 = ratesPage2.GoToCreateRatePage();

				createRatePage2.CreateARateWithSimpleIndex(rateName);
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.IsTrue(createRatePage2.GetAlertMessageString().Contains("already exists"), "Duplicate rate is added or wrong validation message. Please investigate.");
				createRatePage2.ConfirmAlertOnce();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserRemoveARateThoroughly()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();

				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				RatesPage ratesPage2 = rateDetailsPage.GoToMainRatesPage();
				ratesPage2.SearchForRate(rateName);
				Assert.AreEqual("READY", ratesPage2.CheckRateStatus(rateName), "Sth wrong with rate status or given rate was not found. Please investigate.");
				ratesPage2.RefreshThePortal();
				ratesPage2.GoToMainRatesPage();
				ratesPage2.RemoveRateSoftly(rateName);
				Assert.AreEqual("There are no items to display", ratesPage2.EmptyListTextOnRates(), "Rate was not removed softly or there was some issue while removing a rate. Please investigate.");
				ratesPage2.GoToRemovedRatesTab();
				ratesPage2.DeleteRate(rateName);
				Assert.AreEqual("There are no items to display", ratesPage2.EmptyRemovedListTextOnRates(), "Rate was not deleted or there was some issue while deleting a rate. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserUploadANewRateVersion()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();

				RatesPage ratesPage2 = rateDetailsPage.GoToMainRatesPage();
				ratesPage2.SearchForRate(rateName);
				//Assert.AreEqual("Ready", ratesPage2.CheckRateStatus(rateName), "Sth wrong with rate status or given rate was not found. Please investigate.");
				RateDetailsPage rateDetailsPage2 = ratesPage2.ViewRate(rateName);
				UploadNewRateVersionPage uploadNewRateVersionPage = rateDetailsPage2.ClickOnUploadNewRateVersionBtn();
				uploadNewRateVersionPage.UploadRateOnly();
				uploadNewRateVersionPage.DoTheRestUploadRateConfiguration();
				uploadNewRateVersionPage.GoToRateVersionTab();
				uploadNewRateVersionPage.ClickCreateRate();

				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage3 = new RateDetailsPage(Driver);

				Assert.AreEqual("CLICK", rateDetailsPage3.CheckEditedFieldInRate(), "Uploaded rate is wrong or there is sth wrong with a table view. Please investigate.");
				rateDetailsPage2.GoToRateVersionsTab();
				Assert.IsTrue(rateDetailsPage2.CheckIfVersion2() == "2", "Version 2 was not created or it is not visible. Please investigate");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserPromoteNewTestRateVersionAfterUploadingIt()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				UploadNewRateVersionPage uploadNewRateVersionPage = rateDetailsPage.ClickOnUploadNewRateVersionBtn();
				uploadNewRateVersionPage.UploadRateOnly();
				uploadNewRateVersionPage.DoTheRestUploadRateConfiguration();
				uploadNewRateVersionPage.GoToRateVersionTabWithIndex();
				uploadNewRateVersionPage.CreateANewTestRateVersion();
				uploadNewRateVersionPage.ConfirmAlertOnce();
				var rateDetailsPage2 = new RateDetailsPage(Driver);
				rateDetailsPage2.WaitForRateToBeReady();
				rateDetailsPage2.SelectRateTestVersion();
				Assert.AreEqual("CLICK", rateDetailsPage2.CheckEditedFieldInRate(), "Uploaded rate is wrong or there is sth wrong with a table view. Please investigate.");
				rateDetailsPage2.GoToRateVersionsTab();
				Assert.IsTrue(rateDetailsPage2.CheckIfTestVersionExists().Contains("Test Version"), "Test Version was not created or it is not visible. Please investigate");
				rateDetailsPage2.PromoteTestRate();
				rateDetailsPage2.ConfirmPromotePositiveButtonOnce();
				Assert.IsTrue(rateDetailsPage2.CheckIfVersion2().Contains("2"), "Test rate version was not promote correctly it is not visible. Please investigate");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserPromoteNewTestRateVersion()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.CreateANewTestRateVersion();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				rateDetailsPage.SelectRateTestVersion();
				Assert.AreEqual("TIC", rateDetailsPage.CheckEditedFieldInRate(), "Created rate is wrong or there is sth wrong with a table view. Please investigate.");
				rateDetailsPage.GoToRateVersionsTab();
				Assert.IsTrue(rateDetailsPage.CheckIfTestVersionExists().Contains("Test Version"), "Test Version was not created or it is not visible. Please investigate");
				rateDetailsPage.PromoteTestRate();
				rateDetailsPage.ConfirmPromotePositiveButtonOnce();
				Assert.IsTrue(rateDetailsPage.CheckIfVersion1().Contains("1"), "Test rate version was not promote correctly it is not visible. Please investigate. Download rate also recommended to check.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldNotUserCreateRateWithFutureDate()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();

				createRatePage.CreateARateWithFutureDate(rateName, CheckBrowser);

				createRatePage.ClickCreateRate();

				Assert.AreEqual("Start date cannot be in the future", createRatePage.GetAlertMessageString(), "User can create a rate with future date or alert message is wrong. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserOverwriteRateVersionWhenUploading()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				UploadNewRateVersionPage uploadNewRateVersionPage = rateDetailsPage.ClickOnUploadNewRateVersionBtn();
				uploadNewRateVersionPage.UploadRateOnly();
				uploadNewRateVersionPage.DoTheRestUploadRateConfiguration();
				uploadNewRateVersionPage.GoToRateVersionTab();
				uploadNewRateVersionPage.UploadAndOverwriteRateVersion();
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage2 = new RateDetailsPage(Driver);
				rateDetailsPage2.WaitForRateToBeReady();
				rateDetailsPage2.CheckIfRateWasOverridenCorrectly();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldUserCancelTestRateWithFutureDate()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				UploadNewRateVersionPage uploadNewRateVersionPage = rateDetailsPage.ClickOnUploadNewRateVersionBtn();
				uploadNewRateVersionPage.UploadRateOnly(rateName);
				uploadNewRateVersionPage.DoTheRestUploadRateConfiguration();
				uploadNewRateVersionPage.GoToRateVersionTab();
				uploadNewRateVersionPage.CreateANewTestRateVersion();

				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage2 = new RateDetailsPage(Driver);
				rateDetailsPage2.WaitForRateToBeReady();
				rateDetailsPage2.SelectRateTestVersion();
				Assert.AreEqual("CLICK", rateDetailsPage2.CheckEditedFieldInRate(), "Uploaded rate is wrong or there is sth wrong with a table view. Please investigate.");
				rateDetailsPage2.GoToRateVersionsTab();
				Assert.IsTrue(rateDetailsPage2.CheckIfTestVersionExists().Contains("Test Version"), "Test Version was not created or it is not visible. Please investigate");
				rateDetailsPage2.PromoteTestRateWithFutureDate(CheckBrowser);
				rateDetailsPage2.ConfirmPromotePositiveButtonOnce();

				Assert.IsTrue(rateDetailsPage2.CheckIfVersion2().Contains("2"), "Test rate version was not promote correctly it is not visible. Please investigate");

				rateDetailsPage2.CancelRateVersion();
				rateDetailsPage2.ConfirmAlertTwice();
				Assert.IsTrue(rateDetailsPage2.CheckIfVersion2Exists(), "Test rate version was not cancelled or is still visible. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldNotUserCreateRateWithoutIndex()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();

				createRatePage.TryToCreateARateWithoutIndex(rateName);
				Assert.AreEqual("Please select at least one index", createRatePage.GetAlertMessageString(), "Rate can be created without an index or error message is wrong. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				createRatePage.GoToMainRatesPage();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldNotUserCreateRateWithDuplicatedIndexes()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();

				createRatePage.TryToCreateARateWithDuplicateIndexes(rateName);
				var ifIndex2Added = createRatePage.GivenElementExists(createRatePage.Index2Added);
				Assert.AreEqual(false, ifIndex2Added, "Index of the table is wrong or doesn't exist. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToDeleteAddedIndex()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.AreEqual("NUMBER", createRatePage.CheckIfIndex1AddedCorrectly(), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.DeleteIndex(rateName);
				Assert.AreEqual(false, createRatePage.GivenElementExists(createRatePage.Index1Added), "Index can't be deleted or there is wrong assertion. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldUserCreateRateWithStartDateInThePast()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();

				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithPastStartDate(rateName);
				createRatePage.GoToRateVersionTab();
				createRatePage.SetRateStartPastDate(CheckBrowser);
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString());
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				rateDetailsPage.GoToRateVersionsTab();
				Assert.AreEqual("1", rateDetailsPage.CheckIfVersion1(), "Version 1 doesn't exist or is different than 1. Please investigate.");
				Assert.IsTrue(rateDetailsPage.CheckVersion1StartDate().Contains("29/11/2016"), "Start date is not in the past or is incorrect. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserRollbackRateVersion()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.AreEqual("NUMBER", createRatePage.CheckIfIndex1AddedCorrectly(), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				Assert.AreEqual(rateName, rateDetailsPage.CheckNameHeaderText(), "Rate name is not correct or sth wrong with rate name header. Please investigate.");
				Assert.IsTrue(rateDetailsPage.CheckTheIndex3().Contains("3"), "Index of the table is wrong or doesn't exist. Please investigate.");
				Assert.AreEqual("This can be deleted", rateDetailsPage.CheckTheDescription(), "There is sth wrong with side rate description. Please investigate.");
				rateDetailsPage.GoToRateVersionsTab();
				Assert.AreEqual("1", rateDetailsPage.CheckIfVersion1(), "Version 1 doesn't exist or is different than 1. Please investigate.");

				UploadNewRateVersionPage uploadNewRateVersionPage = rateDetailsPage.ClickOnUploadNewRateVersionBtn();
				uploadNewRateVersionPage.UploadRateOnly();
				uploadNewRateVersionPage.DoTheRestUploadRateConfiguration();
				uploadNewRateVersionPage.GoToRateVersionTab();
				uploadNewRateVersionPage.ClickCreateRate();

				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage2 = new RateDetailsPage(Driver);
				rateDetailsPage2.GoToRateVersionsTab();
				rateDetailsPage2.WaitForRateToBeReady();
				rateDetailsPage.RollBackRateVersion();
				rateDetailsPage.ConfirmAlertOnce();
				Assert.AreEqual("Version 2 and all versions after has been rolled back.", rateDetailsPage.GetAlertMessageString(), "Version 2 was not rolled back or the message is different than it should be. Please investigate.");
				rateDetailsPage.ConfirmAlertOnce();
				Assert.IsTrue(rateDetailsPage.CheckIfVersion2Exists(), "Version 2 of rate was not rolled back or is still visible. Please investigate.");
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBackdateRateVersion()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.AreEqual("NUMBER", createRatePage.CheckIfIndex1AddedCorrectly(), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				Assert.AreEqual(rateName, rateDetailsPage.CheckNameHeaderText(), "Rate name is not correct or sth wrong with rate name header. Please investigate.");
				Assert.IsTrue(rateDetailsPage.CheckTheIndex3().Contains("3"), "Index of the table is wrong or doesn't exist. Please investigate.");
				Assert.AreEqual("This can be deleted", rateDetailsPage.CheckTheDescription(), "There is sth wrong with side rate description. Please investigate.");
				rateDetailsPage.GoToRateVersionsTab();
				Assert.AreEqual("1", rateDetailsPage.CheckIfVersion1(), "Version 1 doesn't exist or is different than 1. Please investigate.");

				UploadNewRateVersionPage uploadNewRateVersionPage = rateDetailsPage.ClickOnUploadNewRateVersionBtn();
				uploadNewRateVersionPage.UploadRateOnly();
				uploadNewRateVersionPage.DoTheRestUploadRateConfiguration();
				uploadNewRateVersionPage.GoToRateVersionTab();
				uploadNewRateVersionPage.ClickCreateRate();

				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage2 = new RateDetailsPage(Driver);
				rateDetailsPage2.GoToRateVersionsTab();
				rateDetailsPage2.WaitForRateToBeReady();
				rateDetailsPage2.BackdateRateVersion();
				Assert.IsTrue(rateDetailsPage.CheckIfVersion1Exists(), "Version 2 of rate was not rolled back or is still visible. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserOverwriteRateVersionWhenEditing()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();

				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				RatesPage ratesPage2 = rateDetailsPage.GoToMainRatesPage();
				ratesPage2.SearchForRate(rateName);
				Assert.AreEqual("READY", ratesPage2.CheckRateStatus(rateName), "Sth wrong with rate status or given rate was not found. Please investigate.");
				EditRatePage editRatePage = ratesPage2.GoToEditRatePage(rateName);
				editRatePage.EditRateTableAndOverwrite();
				Assert.AreEqual("Rate published successfully", editRatePage.GetAlertMessageString(), "Publishing rate message is wrong or rate was not published. Please investigate.");
				editRatePage.ConfirmAlertOnce();
				editRatePage.WaitForElementToHaveGivenText(editRatePage.ReadyState, "Ready", 30);
				editRatePage.GoToNextPage2();

				Assert.AreEqual("23", editRatePage.CheckEditedData(), "Rate edited data is not in place or it is different. Please investigate");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserEditRateAndPublishItAsStandardVersion()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();

				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				RatesPage ratesPage2 = rateDetailsPage.GoToMainRatesPage();
				ratesPage2.SearchForRate(rateName);
				Assert.AreEqual("READY", ratesPage2.CheckRateStatus(rateName), "Sth wrong with rate status or given rate was not found. Please investigate.");
				EditRatePage editRatePage = ratesPage2.GoToEditRatePage(rateName);
				editRatePage.EditRateTable();
				Assert.AreEqual("Rate published successfully", editRatePage.GetAlertMessageString(), "Publishing rate message is wrong or rate was not published. Please investigate.");
				editRatePage.ConfirmAlertOnce();
				editRatePage.WaitForElementToHaveGivenText(editRatePage.ReadyState, "Ready", 30);
				editRatePage.GoToNextPage2();
				Assert.AreEqual("23", editRatePage.CheckEditedData(), "Rate edited data is not in place or it is different. Please investigate");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateASchemeWithRateAndCheckReferences()
		{
			UITest(() =>

			{
				string schemeName = RandomString();
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();

				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"));
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(this.Driver);
				rateDetailsPage.WaitForRateToBeReady();
				SchemesPage schemesPage = rateDetailsPage.GoToMainSchemesPage();

				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateAsyncScheme(schemeName);
				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				editSchemePage.AddRateToScheme(rateName);
				editSchemePage.ValidateScheme();
				editSchemePage.ConfirmContinueAlertOnce();
				editSchemePage.PublishScheme("This can be deleted");
				Assert.IsTrue(editSchemePage.GetAlertMessageString().Contains("success"), "Scheme was not published correctly when it should. Please investigate");
				editSchemePage.GoToSchemeDetailsFromPublishSubpage();
				editSchemePage.GoToRatesSubPage();
				Assert.IsTrue(editSchemePage.CheckIfRateIsAdded().Contains(rateName));
				RatesPage ratesPage2 = editSchemePage.GoToMainRatesPage();
				ratesPage2.SearchForRate(rateName);
				RateDetailsPage detailsPage = ratesPage2.ClickOnViewBtn();
				detailsPage.TabSchemes2.Click();
				Assert.AreEqual(schemeName, detailsPage.CheckItemDetailsRate(), "No references set, something went wrong");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldRateReferencesChangeWithSchemeVersion()
		{
			UITest(() =>

			{
				string schemeName = RandomString();
				string rateName = RandomString();
				string rateName2 = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				// Create first rate
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"));
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				// Create second rate
				RatesPage ratesPage2 = rateDetailsPage.GoToMainRatesPage();
				CreateRatePage createRatePage2 = ratesPage2.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName2);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"));
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage2 = new RateDetailsPage(Driver);
				rateDetailsPage2.WaitForRateToBeReady();
				//Create Scheme
				SchemesPage schemesPage = rateDetailsPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateAsyncScheme(schemeName);
				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				//Add first rate
				editSchemePage.AddRateToScheme(rateName);
				editSchemePage.ValidateScheme();
				editSchemePage.ConfirmContinueAlertOnce();
				editSchemePage.PublishScheme("This can be deleted");
				Assert.IsTrue(editSchemePage.GetAlertMessageString().Contains("success"), "Scheme was not published correctly when it should. Please investigate");
				editSchemePage.ConfirmAlertOnce();
				editSchemePage.ConfirmManageRateModal();

				editSchemePage.GoToRatesSubPage();
				Assert.IsTrue(editSchemePage.CheckDynamicRateReference().Contains(rateName));
				var schemeDetail = new SchemeDetailsPage(Driver);
				EditSchemePage editSchemePage2 = schemeDetail.ClickOnEditSchemeCodeButton();
				//Add second rate
				editSchemePage2.AddRateToSchemeOverPreviousRate(rateName2);
				editSchemePage2.ValidateScheme();
				editSchemePage2.ConfirmContinueAlertOnce();
				editSchemePage2.PublishScheme("This can be deleted");
				Assert.IsTrue(editSchemePage.GetAlertMessageString().Contains("success"), "Scheme was not published correctly when it should. Please investigate");
				editSchemePage.ConfirmAlertOnce();
				editSchemePage.CancelManageRateModal();
				editSchemePage2.GoToRatesSubPage();
				Assert.IsTrue(editSchemePage2.CheckDynamicRateReference().Contains(rateName2));
				RatesPage ratesPage3 = editSchemePage2.GoToMainRatesPage();
				ratesPage3.SearchForRate(rateName);
				RateDetailsPage detailsPage = ratesPage3.ClickOnViewBtn();
				detailsPage.TabSchemes2.Click();
				Assert.AreEqual(schemeName, detailsPage.CheckItemDetailsRate(), "No references set, something went wrong");
				detailsPage.GoToMainRatesPage();
				RatesPage ratesPage4 = detailsPage.GoToMainRatesPage();
				ratesPage4.SearchForRate(rateName2);
				RateDetailsPage detailsPage2 = ratesPage4.ClickOnViewBtn();
				detailsPage2.TabSchemes2.Click();
				Assert.AreEqual(schemeName, detailsPage2.CheckItemDetailsRate(), "No references set, something went wrong");
				detailsPage2.ItemDetailsRate2.Click();
				var schemeDetail2 = new SchemeDetailsPage(Driver);
				//Check rates by version
				schemeDetail2.GoToSchemeRates();
				Assert.AreEqual(rateName2, schemeDetail2.CheckDynamicRateReference(), "Wrong Scheme rate or no scheme rates connected.");
				schemeDetail2.SelectIndexForVersion(1);
				Thread.Sleep(1000);
				Assert.AreEqual(rateName, schemeDetail2.CheckDynamicRateReference(), "Wrong Scheme rate or no scheme rates connected.");
			});
		}


		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserAddNewRowByUpsert()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				var fileName = "upsertRateRow.csv";
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				UploadNewRateVersionPage uploadNewRateVersionPage = rateDetailsPage.ClickOnUploadNewRateVersionBtn();
				uploadNewRateVersionPage.UploadRateUpsert(fileName);
				uploadNewRateVersionPage.DoTheRestUploadRateConfiguration();
				uploadNewRateVersionPage.GoToRateVersionTab();
				uploadNewRateVersionPage.CompleteUpsert();
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage2 = new RateDetailsPage(Driver);
				rateDetailsPage2.WaitForRateToBeReady();
				rateDetailsPage2.GoToNextRatePage();
				rateDetailsPage2.CheckIfRateWasUpsertCorrectly();

			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserChangeRowByUpsert()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				var fileName = "upsertChangeRow.csv";
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				UploadNewRateVersionPage uploadNewRateVersionPage = rateDetailsPage.ClickOnUploadNewRateVersionBtn();
				uploadNewRateVersionPage.UploadRateUpsert(fileName);
				uploadNewRateVersionPage.DoTheRestUploadRateConfiguration();
				uploadNewRateVersionPage.GoToRateVersionTab();
				uploadNewRateVersionPage.CompleteUpsert();
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage2 = new RateDetailsPage(Driver);
				rateDetailsPage2.WaitForRateToBeReady();
				rateDetailsPage2.CheckIfRateWasOverridenCorrectly();

			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserChangeRowByUpsertAndKeepVersion()
		{
			UITest(() =>
			{
				string rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				var fileName = "upsertChangeRow.csv";
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();
				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"), "Index as not added correctly or assertion is wrong. Please investigate.");
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);
				rateDetailsPage.WaitForRateToBeReady();
				UploadNewRateVersionPage uploadNewRateVersionPage = rateDetailsPage.ClickOnUploadNewRateVersionBtn();
				uploadNewRateVersionPage.UploadRateUpsert(fileName);
				uploadNewRateVersionPage.DoTheRestUploadRateConfiguration();
				uploadNewRateVersionPage.GoToRateVersionTab();
				uploadNewRateVersionPage.CompleteUpsertOverride();
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage2 = new RateDetailsPage(Driver);
				rateDetailsPage2.WaitForRateToBeReady();
				rateDetailsPage2.CheckIfRateWasOverridenCorrectly();
				Assert.IsTrue(rateDetailsPage2.CheckIfVersion2Exists(), "Version 2 of rate was not rolled back or is still visible. Please investigate.");

			});
		}
	}
}