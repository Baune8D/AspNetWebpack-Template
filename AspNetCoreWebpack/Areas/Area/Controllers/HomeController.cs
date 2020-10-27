using Microsoft.AspNetCore.Mvc;

namespace AspNetCoreWebpack.Areas.Area.Controllers
{
    [Area("Area")]
    public class HomeController: Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
