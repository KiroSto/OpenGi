using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.QuoteManipulation_Pages;

namespace TicPortalV2SeleniumTests.Tests
{
	[TestClass]
	public class QuoteManipulationTests : TestSetUp
	{
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldNotUserCreateQUoteManipulationProfileWithNoFields()
		{
			UITest(() =>
			{
				var loginPage = new LoginPage(this.Driver);
				string domainProfileName = RandomString();
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				QuoteManipulationPage quoteManipulationPage = dashboardPage.GoToQuoteManipulationPage();
				ProfileBuilderPage profileBuilderPage = quoteManipulationPage.GoToCreateProfile();
				profileBuilderPage.CreatePrivateMotorProfileWithNoFields(domainProfileName);
				Assert.IsTrue(profileBuilderPage.GetAlertMessageString().Contains("No identifier fields has been selected"), "Profile was created successfully");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldNotUserAssignFraudDetectionTtoObjectProperties()
		{
			UITest(() =>
			{
				var loginPage = new LoginPage(this.Driver);
				string domainProfileName = RandomString();
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				QuoteManipulationPage quoteManipulationPage = dashboardPage.GoToQuoteManipulationPage();
				ProfileBuilderPage profileBuilderPage = quoteManipulationPage.GoToCreateProfile();
				profileBuilderPage.CreatePrivateMotorProfileObject(domainProfileName);
				Assert.IsTrue(profileBuilderPage.GetAlertMessageString().Contains("You cannot assign fraud detection to object type properties"), "Profile was created successfully");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserCreateQUoteManipulationProfile()
		{
			UITest(() =>
			{
				string domainProfileName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				QuoteManipulationPage quoteManipulationPage = dashboardPage.GoToQuoteManipulationPage();
				ProfileBuilderPage profileBuilderPage = quoteManipulationPage.GoToCreateProfile();
				QuoteManipulationPage quoteManipulationPage2 = profileBuilderPage.CreatePrivateMotorProfile(domainProfileName);
				QuoteManipulationDetailsPage quoteManipulationDetails = quoteManipulationPage2.GoToCurrentDetailsPage(domainProfileName);
				Assert.IsTrue(quoteManipulationDetails.CheckIfFieldExists("IntermediaryReference"), "Field is not visible or something went wrong. Please investigate");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserEditQUoteManipulationProfile()
		{
			UITest(() =>
			{
				string domainProfileName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				QuoteManipulationPage quoteManipulationPage = dashboardPage.GoToQuoteManipulationPage();
				ProfileBuilderPage profileBuilderPage = quoteManipulationPage.GoToCreateProfile();
				QuoteManipulationPage quoteManipulationPage2 = profileBuilderPage.CreatePrivateMotorProfile(domainProfileName);
				ProfileBuilderPage profileBuilderPage2 = quoteManipulationPage2.GoToEditDetailsPage(domainProfileName);
				QuoteManipulationDetailsPage quoteManipulationDetailsPage2 = profileBuilderPage2.EditPrivateMotorProfile(domainProfileName);
				Assert.IsTrue(quoteManipulationDetailsPage2.CheckIfFieldExists("PolicyDetailsId"), "Field is not visible or something went wrong. Please investigate");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserDeleteQUoteManipulationProfile()
		{
			UITest(() =>
			{
				string domainProfileName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				QuoteManipulationPage quoteManipulationPage = dashboardPage.GoToQuoteManipulationPage();
				ProfileBuilderPage profileBuilderPage = quoteManipulationPage.GoToCreateProfile();
				QuoteManipulationPage quoteManipulationPage2 = profileBuilderPage.CreatePrivateMotorProfile(domainProfileName);
				quoteManipulationPage2.DeleteProfile(domainProfileName);
			});
		}
	}
}