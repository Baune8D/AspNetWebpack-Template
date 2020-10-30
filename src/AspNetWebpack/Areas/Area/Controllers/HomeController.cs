using Microsoft.AspNetCore.Mvc;

namespace AspNetWebpack.Areas.Area.Controllers
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
