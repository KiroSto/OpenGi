using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.Scheme_Pages;

namespace TicPortalV2SeleniumTests.Tests
{
	[TestClass]
	public class NegativeSchemeTests : TestSetUp
	{
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldNotUserCreateSchemeWithEmptyName()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateSchemeWithoutAName()
						.GetAlertMessageString().Should().Be("Scheme name cannot be empty");
			});
		}

		//
		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldNotUserCreateADuplicateScheme()
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
						.GoToCreateSchemePage()
						.CreateSchemeWithTheSameName(schemeName)
						.GetAlertMessageString().Should().Contain("already exists");
				
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox")]
		public void ShouldNotUserPublishASchemeWithRateThatDoesntExist()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var rateName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.AddRateToScheme(rateName)
						.PublishSchemeWithoutWaitingForSuccess("You can delete this scheme")
						.GetAlertMessageString().Should().Contain("Rate '" + rateName + "' does not exist. Did you forget to upload it?");
						
				
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox")]
		public void ShouldNotUserEditNameOfSchemeToStartFromNumber()
		{
			UITest(() =>
			{
				var schemeName = RandomString();
				var newSchemeName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.PublishScheme("You can delete this scheme")
						.GoToSchemeDetailsFromPublishSubpage()
						.ChangeSchemeName(newSchemeName).GetAlertMessageString().Should().Contain("Scheme name can only contain letters, numbers and spaces, and must start with a letter");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox")]
		public void ShouldNotUserCreateNewPolarisVersionWithoutSchemeId()
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
						.CreateNewPolarisSchemeVersionWithoutFilesAndVariant()
						.GetAlertMessageString().Should().Contain("File Set is required when creating polaris scheme");
			});
		}

        [TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox")]
        public void ShouldNotUserCreateNewCustomPolarisVersionWithoutSchemeId()
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
                        .CreateNewPolarisSchemeVersionWithoutFilesAndVariant()
                        .GetAlertMessageString().Should().Contain("File Set is required when creating polaris scheme");
            });
        }

    }
}