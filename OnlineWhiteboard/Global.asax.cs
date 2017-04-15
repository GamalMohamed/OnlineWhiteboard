using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using OnlineWhiteBoard;

namespace OnlineWhiteboard
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            ValueProviderFactories.Factories.Add(new JsonValueProviderFactory());
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        protected void Session_Start(object sender, EventArgs e)
        {
            HttpContext.Current.Session.Add("__MyAppSession", string.Empty);

            if (!AuthManager.IsSessionInitialized(Session.SessionID))
            {
                AuthManager.InitializeSession(Session.SessionID);
            }
        }
    }
}
