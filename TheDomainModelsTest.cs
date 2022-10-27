using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.Domain_Model_Pages;
using TicPortalV2SeleniumFramework.Pages.Product_Pages;
using TicPortalV2SeleniumFramework.Pages.Scheme_Pages;

namespace TicPortalV2SeleniumTests.Tests
{
	[TestClass]
	public class TheDomainModelsTest : TestSetUp
	{
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserCreateALobAndCreateAProductWithIt()
		{
			UITest(() =>
			{
				string productName = RandomNumber();
				string domainModelName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				
				loginPage.LoginToPortalAdmin()
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateAndPublishLineOfBusiness(domainModelName)
						.CheckIfDomainModelNameIsCorrect(domainModelName)
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName, domainModelName)
						.GoToEditSchemePage()
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName, schemeName, domainModelName)
						.GoToProductDetailsPage()
						.CheckIfProductDataIsCorrect("This can be deleted", productName, domainModelName);
				});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserCreateASchemeHelperAndAddItAsReference()
		{
			UITest(() =>
			{
				string domainModelName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateSchemeHelper(domainModelName)
						.CheckIfDomainModelNameIsCorrect(domainModelName)
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.AddSchemeReference(domainModelName)
						.AddReferenceAndPropertyToSchemeCode(domainModelName)
						.ValidateScheme()
						.ValidateAndConfirmAlertMessage("Scheme compiled successfully");
				
			});
		}

		

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserEditALobAndUsePropertiesFromIt()
		{
			UITest(() =>
			{
				string productName = RandomNumber();
				string domainModelName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateAndPublishLineOfBusiness(domainModelName)
						.CheckIfDomainModelNameIsCorrect(domainModelName)
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName, domainModelName)
						.GoToEditSchemePage()
						.AddClassObjectAnddPropertyToSchemeCode("RootObject", "PropertyName", "BlaBla")
						.SaveSchemeAndConfirm()
						.ValidateSchemeWithoutWaitingForSuccess()
						.ValidateAndConfirmAlertMessage("Scheme compiled successfully")
						.GoToDomainModels()
						.EditDomainModel(domainModelName)
						.AddNewPropertyToExistingClass()
						.ValidateAndConfirmAlertMessage("Created successfully")
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.EditScheme(schemeName)
						.AddNewPropertyToSchemeCodeAfterEditingLob("RootObject", "PropertyNameTwo", "Lala")
						.SaveSchemeAndConfirm()
						.ValidateScheme()
						.ValidateAndConfirmAlertMessage("Scheme compiled successfully");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateADomainModelByUploadingAFile()
		{
			UITest(() =>
			{
				string productName = RandomNumber();
				string domainModelName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateLineOfBusinessByUploadingAFile(CheckBrowser, domainModelName)
						.TryToPublishLob()
						.ConfirmLobCreation()
						.CheckIfDomainModelNameIsCorrect(domainModelName)		
						.GoToCreateDomainModelsPageByEditingIt()
						.CheckIfUploadedLobIsFine()
						.CancelEditingDomainModel()
						.UploadNewVersionOfDomainModel(CheckBrowser)
						.CheckIfUploadedNewVersionOfLobIsFine();
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldRootClassBeCorrectAfterUploadingAFile()
		{
			UITest(() =>
			{
				string productName = RandomNumber();
				string domainModelName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateLineOfBusinessByUploadingAFile(CheckBrowser, domainModelName, "MyRootClass", "ADDONClass.cs", "MyRootClass.cs")
						.TryToPublishLob()
						.ConfirmLobCreation()
						.CheckIfDomainModelNameIsCorrect(domainModelName)
						.CheckIfRootObjectIsCorrect("MyRootClass");
						
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserRemoveADomainModel()
		{
			UITest(() =>
			{
				string productName = RandomNumber();
				string domainModelName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateLineOfBusinessByUploadingAFile(CheckBrowser, domainModelName)
						.TryToPublishLob()
						.ConfirmLobCreation()
						.CheckIfDomainModelNameIsCorrect(domainModelName)
						.GoToDomainModels()
						.RemoveDomainModel(domainModelName)
						.ConfirmDomainModelWasRemoved(domainModelName);

			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldUserCreateUploadAnonymizedProperty()
		{
			UITest(() =>
			{
				string productName = RandomNumber();
				string domainModelName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateLineOfBusinessByUploadingAFileWithAnonymizedProperty("chrome", domainModelName)
						.TryToPublishLob()
						.ConfirmLobCreation()
						.CheckIfDomainModelNameIsCorrect(domainModelName)
						.GoToCreateDomainModelsPageByEditingIt()
						.ConfirmAnnonymizedPropertyExists();

			});
		}
		
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldNotUserAddDuplicateRerferenceToScheme()
		{
			UITest(() =>
			{
				string schemeHelperName = RandomString();
				string domainModelName = RandomString();
				string schemeName = RandomString();
				string schemeReferenceHelperName = $"CloudRatingEngine.Domain.{schemeHelperName}";
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateSchemeHelper(schemeHelperName)
						.CheckIfDomainModelNameIsCorrect(schemeHelperName)
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateAndPublishLineOfBusinessWithSchemeHelper(domainModelName, schemeReferenceHelperName)
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName, domainModelName)
						.GoToEditSchemePage()
						.CheckForSchemeReferenceDuplication(schemeReferenceHelperName);
			});
		}

	}
}