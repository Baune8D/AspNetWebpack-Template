using Microsoft.AspNetCore.Mvc;

namespace AspNetWebpack.Template.Areas.Area.Controllers
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
