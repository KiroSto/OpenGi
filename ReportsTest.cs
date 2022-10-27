using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.Reports_Pages;

namespace TicPortalV2SeleniumTests.Tests
{
	[TestClass]
	public class ReportsTests : TestSetUp
	{
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserNavigatesToAllKindOfReports()
		{
			UITest(() =>
			{
				string productName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);
				;
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RefersPage refersPage = dashboardPage.GoToRefersTab();
				refersPage.CheckIfGetReportExists();
				DeclinesPage declinesPage = refersPage.GoToDeclinesTab();
				declinesPage.CheckIfGetReportExists();
				SchemeErrorsPage schemeErrorsPage = declinesPage.GoToSchemeErrorsTab();
				schemeErrorsPage.CheckIfGetReportExists();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserCanSeeIhpStatsPage()
		{
			UITest(() =>
			{
				string productName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				IhpStatsPage ihpStats = dashboardPage.GoToIhpStatsTab();
				ihpStats.CheckIfTimePeriodExists();

			});
		}
	}
}